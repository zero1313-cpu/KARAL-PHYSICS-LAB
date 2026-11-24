import type { ContentPack } from '@/content/types';
import {
  db,
  defaultSettings,
  type BookmarkRecord,
  type NoteRecord,
  type PackRecord,
  type ProgressRecord,
  type QuizAttempt,
  type RecentRecord,
  type Settings,
  type SimPreference,
} from './db';

export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupData {
  settings: Settings;
  bookmarks: BookmarkRecord[];
  progress: ProgressRecord[];
  notes: NoteRecord[];
  quizAttempts: QuizAttempt[];
  recent: RecentRecord[];
  simPreferences: SimPreference[];
  packs: PackRecord[];
}

export interface BackupFile {
  app: 'karal-physics-lab';
  schemaVersion: number;
  exportedAt: string;
  data: BackupData;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asObject(value: unknown, label: string): Record<string, unknown> {
  if (!isObject(value)) throw new Error(`Invalid ${label} entry in backup`);
  return value;
}

function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`Backup field ${label} must be an array`);
  return value;
}

function asString(value: unknown, label: string): string {
  if (typeof value !== 'string') throw new Error(`Invalid ${label} in backup`);
  return value;
}

function asNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Invalid ${label} in backup`);
  return value;
}

function asBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`Invalid ${label} in backup`);
  return value;
}

export async function exportBackup(): Promise<BackupFile> {
  const [settings, bookmarks, progress, notes, quizAttempts, recent, simPreferences, packs] = await Promise.all([
    db.preferences.toArray(),
    db.bookmarks.toArray(),
    db.progress.toArray(),
    db.notes.toArray(),
    db.quizAttempts.toArray(),
    db.recent.toArray(),
    db.simPreferences.toArray(),
    db.packs.toArray(),
  ]);
  return {
    app: 'karal-physics-lab',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      settings: settings[0] ?? defaultSettings,
      bookmarks,
      progress,
      notes,
      quizAttempts,
      recent,
      simPreferences,
      packs,
    },
  };
}

/** Validates a parsed JSON value and returns a fully typed backup. */
export function validateBackup(input: unknown): BackupFile {
  if (!isObject(input)) throw new Error('Backup must be a JSON object');
  if (input.app !== 'karal-physics-lab') throw new Error('Not a KARAL PHYSICS LAB backup');
  if (input.schemaVersion !== BACKUP_SCHEMA_VERSION) throw new Error(`Unsupported backup schema: ${String(input.schemaVersion)}`);
  if (!isObject(input.data)) throw new Error('Backup data is missing');
  const data = input.data;

  const rawSettings = asObject(data.settings, 'settings');
  const language = rawSettings.language === 'hi' ? 'hi' : rawSettings.language === 'en' ? 'en' : defaultSettings.language;
  const theme = (['light', 'dark', 'system'] as const).includes(rawSettings.theme as Settings['theme'])
    ? (rawSettings.theme as Settings['theme'])
    : defaultSettings.theme;
  const textSize = (['small', 'medium', 'large'] as const).includes(rawSettings.textSize as Settings['textSize'])
    ? (rawSettings.textSize as Settings['textSize'])
    : defaultSettings.textSize;
  const animationQuality = (['high', 'balanced', 'low'] as const).includes(rawSettings.animationQuality as Settings['animationQuality'])
    ? (rawSettings.animationQuality as Settings['animationQuality'])
    : defaultSettings.animationQuality;
  const settings: Settings = {
    ...defaultSettings,
    id: 'settings',
    language,
    theme,
    textSize,
    animationQuality,
    educationLevel: typeof rawSettings.educationLevel === 'string' ? rawSettings.educationLevel : defaultSettings.educationLevel,
    reduceMotion: typeof rawSettings.reduceMotion === 'boolean' ? rawSettings.reduceMotion : defaultSettings.reduceMotion,
  };

  const bookmarkTypes: BookmarkRecord['type'][] = ['lesson', 'formula', 'experiment', 'simulation'];
  const bookmarks = asArray(data.bookmarks, 'bookmarks').map((raw, index) => {
    const item = asObject(raw, 'bookmark');
    if (!bookmarkTypes.includes(item.type as BookmarkRecord['type'])) throw new Error(`Invalid bookmark type at index ${index}`);
    return {
      key: asString(item.key, 'bookmark key'),
      type: item.type as BookmarkRecord['type'],
      itemId: asString(item.itemId, 'bookmark itemId'),
      createdAt: asNumber(item.createdAt, 'bookmark createdAt'),
    };
  });

  const progress = asArray(data.progress, 'progress').map((raw) => {
    const item = asObject(raw, 'progress');
    return {
      lessonId: asString(item.lessonId, 'progress lessonId'),
      completed: asBoolean(item.completed, 'progress completed'),
      updatedAt: asNumber(item.updatedAt, 'progress updatedAt'),
      secondsStudied: asNumber(item.secondsStudied, 'progress secondsStudied'),
    };
  });

  const notes = asArray(data.notes, 'notes').map((raw) => {
    const item = asObject(raw, 'note');
    return {
      id: asString(item.id, 'note id'),
      lessonId: asString(item.lessonId, 'note lessonId'),
      text: asString(item.text, 'note text'),
      updatedAt: asNumber(item.updatedAt, 'note updatedAt'),
    };
  });

  const quizAttempts = asArray(data.quizAttempts, 'quizAttempts').map((raw) => {
    const item = asObject(raw, 'quiz attempt');
    if (!Array.isArray(item.correctIds) || !Array.isArray(item.wrongIds)) throw new Error('Invalid quiz attempt answer lists in backup');
    return {
      id: asString(item.id, 'quiz attempt id'),
      quizId: asString(item.quizId, 'quiz attempt quizId'),
      chapterId: asString(item.chapterId, 'quiz attempt chapterId'),
      topic: asString(item.topic, 'quiz attempt topic'),
      score: asNumber(item.score, 'quiz attempt score'),
      total: asNumber(item.total, 'quiz attempt total'),
      correctIds: item.correctIds.map((value) => asString(value, 'quiz attempt correctId')),
      wrongIds: item.wrongIds.map((value) => asString(value, 'quiz attempt wrongId')),
      durationSeconds: asNumber(item.durationSeconds, 'quiz attempt durationSeconds'),
      createdAt: asNumber(item.createdAt, 'quiz attempt createdAt'),
    };
  });

  const recentTypes: RecentRecord['type'][] = ['lesson', 'simulation', 'experiment', 'chapter'];
  const recent = asArray(data.recent, 'recent').map((raw, index) => {
    const item = asObject(raw, 'recent');
    if (!recentTypes.includes(item.type as RecentRecord['type'])) throw new Error(`Invalid recent type at index ${index}`);
    return {
      id: asString(item.id, 'recent id'),
      type: item.type as RecentRecord['type'],
      title: asString(item.title, 'recent title'),
      visitedAt: asNumber(item.visitedAt, 'recent visitedAt'),
    };
  });

  const simPreferences = asArray(data.simPreferences, 'simPreferences').map((raw) => {
    const item = asObject(raw, 'sim preference');
    const params = asObject(item.params, 'sim preference params');
    const validatedParams: Record<string, number> = {};
    for (const [key, value] of Object.entries(params)) validatedParams[key] = asNumber(value, `sim parameter ${key}`);
    return { id: asString(item.id, 'sim preference id'), params: validatedParams };
  });

  const packs = asArray(data.packs, 'packs').map((raw) => {
    const item = asObject(raw, 'pack');
    return {
      id: asString(item.id, 'pack id'),
      pack: asObject(item.pack, 'pack content') as unknown as ContentPack,
      installedAt: asNumber(item.installedAt, 'pack installedAt'),
    };
  });

  return {
    app: 'karal-physics-lab',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: typeof input.exportedAt === 'string' ? input.exportedAt : new Date().toISOString(),
    data: { settings, bookmarks, progress, notes, quizAttempts, recent, simPreferences, packs },
  };
}

/** Restores a backup by replacing local learning data atomically. */
export async function importBackup(input: unknown): Promise<BackupFile> {
  const backup = validateBackup(input);
  const data = backup.data;
  await db.transaction('rw', [db.preferences, db.bookmarks, db.progress, db.notes, db.quizAttempts, db.recent, db.simPreferences, db.packs], async () => {
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
    await db.preferences.put(data.settings);
    await db.bookmarks.bulkPut(data.bookmarks);
    await db.progress.bulkPut(data.progress);
    await db.notes.bulkPut(data.notes);
    await db.quizAttempts.bulkPut(data.quizAttempts);
    await db.recent.bulkPut(data.recent);
    await db.simPreferences.bulkPut(data.simPreferences);
    await db.packs.bulkPut(data.packs);
  });
  return backup;
}
