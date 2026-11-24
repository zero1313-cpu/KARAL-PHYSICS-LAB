import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { ContentPack } from '@/content/types';
import { BACKUP_SCHEMA_VERSION, exportBackup, importBackup, validateBackup } from './backup';
import {
  addStudySeconds,
  db,
  defaultSettings,
  getInstalledPacks,
  getSettings,
  getSimParams,
  installPack,
  isBookmarked,
  removePack,
  saveNote,
  saveQuizAttempt,
  saveSettings,
  saveSimParams,
  setLessonComplete,
  toggleBookmark,
  visitItem,
} from './db';

const pack: ContentPack = {
  schemaVersion: 1,
  id: 'unit-test-pack',
  name: { en: 'Unit test pack', hi: 'यूनिट परीक्षण पैक' },
  description: { en: 'Local persistence test', hi: 'स्थानीय संग्रहण परीक्षण' },
  builtIn: false,
};

async function clearDatabase(): Promise<void> {
  await Promise.all([
    db.preferences.clear(),
    db.bookmarks.clear(),
    db.progress.clear(),
    db.notes.clear(),
    db.quizAttempts.clear(),
    db.recent.clear(),
    db.simPreferences.clear(),
    db.packs.clear(),
  ]);
}

beforeEach(async () => {
  await db.open();
  await clearDatabase();
});

afterAll(() => {
  db.close();
});

describe('IndexedDB persistence', () => {
  it('stores and merges user preferences', async () => {
    expect(await getSettings()).toEqual(defaultSettings);
    const saved = await saveSettings({ language: 'hi', theme: 'dark', textSize: 'large', reduceMotion: true });
    expect(saved.language).toBe('hi');
    const reloaded = await getSettings();
    expect(reloaded.language).toBe('hi');
    expect(reloaded.theme).toBe('dark');
    expect(reloaded.textSize).toBe('large');
    expect(reloaded.reduceMotion).toBe(true);
    expect(reloaded.educationLevel).toBe(defaultSettings.educationLevel);
  });

  it('toggles bookmarks without duplicate keys', async () => {
    expect(await isBookmarked('lesson', 'newton-second-law')).toBe(false);
    expect(await toggleBookmark('lesson', 'newton-second-law')).toBe(true);
    expect(await isBookmarked('lesson', 'newton-second-law')).toBe(true);
    expect(await toggleBookmark('lesson', 'newton-second-law')).toBe(false);
    expect(await db.bookmarks.count()).toBe(0);
  });

  it('tracks lesson completion and accumulated study time', async () => {
    await setLessonComplete('newton-second-law', true);
    await addStudySeconds('newton-second-law', 90);
    await addStudySeconds('newton-second-law', 30);
    const record = await db.progress.get('newton-second-law');
    expect(record?.completed).toBe(true);
    expect(record?.secondsStudied).toBe(120);
  });

  it('persists notes, recents, simulation settings, quiz scores and packs', async () => {
    await saveNote('newton-second-law', 'F = ma');
    expect((await db.notes.get('note:newton-second-law'))?.text).toBe('F = ma');

    await visitItem('simulation', 'projectile-motion', 'Projectile motion');
    expect(await db.recent.count()).toBe(1);

    await saveSimParams('projectile-motion', { v0: 30, angle: 60 });
    expect(await getSimParams('projectile-motion')).toEqual({ v0: 30, angle: 60 });

    const attempt = await saveQuizAttempt({
      quizId: 'quiz-1',
      chapterId: 'class-9-10-newtons-laws',
      topic: 'Newton laws',
      score: 4,
      total: 5,
      correctIds: ['q1'],
      wrongIds: ['q2'],
      durationSeconds: 120,
    });
    expect(attempt.id.length).toBeGreaterThan(0);
    expect((await db.quizAttempts.get(attempt.id))?.score).toBe(4);

    await installPack(pack);
    expect(await getInstalledPacks()).toEqual([pack]);
    await removePack(pack.id);
    expect(await getInstalledPacks()).toEqual([]);
  });
});

describe('local backup and restore', () => {
  it('exports current local data with a versioned schema', async () => {
    await saveSettings({ language: 'hi', theme: 'light' });
    await toggleBookmark('formula', 'f=ma');
    const backup = await exportBackup();
    expect(backup.app).toBe('karal-physics-lab');
    expect(backup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(backup.data.settings.language).toBe('hi');
    expect(backup.data.bookmarks).toHaveLength(1);
    expect(validateBackup(JSON.parse(JSON.stringify(backup)) as unknown).data.settings.language).toBe('hi');
  });

  it('restores learning data atomically after local data is cleared', async () => {
    await saveSettings({ language: 'hi', theme: 'dark' });
    await toggleBookmark('lesson', 'newton-first-law');
    await setLessonComplete('newton-first-law', true);
    await saveNote('newton-first-law', 'Inertia');
    await installPack(pack);
    const backup = await exportBackup();

    await clearDatabase();
    expect(await getSettings()).toEqual(defaultSettings);
    expect(await db.bookmarks.count()).toBe(0);

    await importBackup(JSON.parse(JSON.stringify(backup)) as unknown);
    expect((await getSettings()).language).toBe('hi');
    expect(await isBookmarked('lesson', 'newton-first-law')).toBe(true);
    expect((await db.progress.get('newton-first-law'))?.completed).toBe(true);
    expect((await db.notes.get('note:newton-first-law'))?.text).toBe('Inertia');
    expect(await getInstalledPacks()).toEqual([pack]);
  });

  it('rejects invalid backups without modifying local data', async () => {
    await saveSettings({ language: 'hi' });
    const backup = JSON.parse(JSON.stringify(await exportBackup())) as Record<string, unknown>;
    const data = backup.data as Record<string, unknown>;
    data.bookmarks = 'not-an-array';
    await expect(importBackup(backup)).rejects.toThrow(/bookmarks/i);
    expect((await getSettings()).language).toBe('hi');
    await expect(importBackup({ ...backup, app: 'other-app' })).rejects.toThrow(/not a/i);
    await expect(importBackup({ ...backup, schemaVersion: 999 })).rejects.toThrow(/schema/i);
    await expect(importBackup(null)).rejects.toThrow(/object/i);
  });
});
