import Dexie, { type Table } from 'dexie';
import type { ContentPack, Lang } from '@/content/types';

export type ThemePreference = 'light' | 'dark' | 'system';
export type TextSize = 'small' | 'medium' | 'large';
export type AnimationQuality = 'high' | 'balanced' | 'low';

export interface Settings {
  id: 'settings';
  language: Lang;
  theme: ThemePreference;
  educationLevel: string;
  textSize: TextSize;
  animationQuality: AnimationQuality;
  reduceMotion: boolean;
}

export interface BookmarkRecord {
  key: string;
  type: 'lesson' | 'formula' | 'experiment' | 'simulation';
  itemId: string;
  createdAt: number;
}

export interface ProgressRecord {
  lessonId: string;
  completed: boolean;
  updatedAt: number;
  secondsStudied: number;
}

export interface NoteRecord {
  id: string;
  lessonId: string;
  text: string;
  updatedAt: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  chapterId: string;
  topic: string;
  score: number;
  total: number;
  correctIds: string[];
  wrongIds: string[];
  durationSeconds: number;
  createdAt: number;
}

export interface RecentRecord {
  id: string;
  type: 'lesson' | 'simulation' | 'experiment' | 'chapter';
  title: string;
  visitedAt: number;
}

export interface SimPreference {
  id: string;
  params: Record<string, number>;
}

export interface PackRecord {
  id: string;
  pack: ContentPack;
  installedAt: number;
}

export const defaultSettings: Settings = {
  id: 'settings',
  language: 'en',
  theme: 'system',
  educationLevel: 'class-11',
  textSize: 'medium',
  animationQuality: 'balanced',
  reduceMotion: false,
};

export class KaralDatabase extends Dexie {
  preferences!: Table<Settings, string>;
  bookmarks!: Table<BookmarkRecord, string>;
  progress!: Table<ProgressRecord, string>;
  notes!: Table<NoteRecord, string>;
  quizAttempts!: Table<QuizAttempt, string>;
  recent!: Table<RecentRecord, string>;
  simPreferences!: Table<SimPreference, string>;
  packs!: Table<PackRecord, string>;

  constructor(name = 'karal-physics-lab') {
    super(name);
    this.version(1).stores({
      preferences: 'id',
      bookmarks: 'key, type, itemId, createdAt',
      progress: 'lessonId, completed, updatedAt',
      notes: 'id, lessonId, updatedAt',
      quizAttempts: 'id, quizId, chapterId, topic, createdAt',
      recent: 'id, visitedAt',
      simPreferences: 'id',
      packs: 'id',
    });
  }
}

export const db = new KaralDatabase();

export async function getSettings(): Promise<Settings> {
  const saved = await db.preferences.get('settings');
  return saved ? { ...defaultSettings, ...saved } : defaultSettings;
}

export async function saveSettings(settings: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...settings, id: 'settings' as const };
  await db.preferences.put(next);
  return next;
}

export async function toggleBookmark(type: BookmarkRecord['type'], itemId: string): Promise<boolean> {
  const key = `${type}:${itemId}`;
  const existing = await db.bookmarks.get(key);
  if (existing) {
    await db.bookmarks.delete(key);
    return false;
  }
  await db.bookmarks.put({ key, type, itemId, createdAt: Date.now() });
  return true;
}

export async function isBookmarked(type: BookmarkRecord['type'], itemId: string): Promise<boolean> {
  return Boolean(await db.bookmarks.get(`${type}:${itemId}`));
}

export async function setLessonComplete(lessonId: string, completed: boolean): Promise<void> {
  const existing = await db.progress.get(lessonId);
  await db.progress.put({
    lessonId,
    completed,
    updatedAt: Date.now(),
    secondsStudied: existing?.secondsStudied ?? 0,
  });
}

export async function addStudySeconds(lessonId: string, seconds: number): Promise<void> {
  const existing = await db.progress.get(lessonId);
  await db.progress.put({
    lessonId,
    completed: existing?.completed ?? false,
    updatedAt: Date.now(),
    secondsStudied: (existing?.secondsStudied ?? 0) + Math.max(0, seconds),
  });
}

export async function saveNote(lessonId: string, text: string): Promise<void> {
  const id = `note:${lessonId}`;
  await db.notes.put({ id, lessonId, text, updatedAt: Date.now() });
}

export async function visitItem(type: RecentRecord['type'], id: string, title: string): Promise<void> {
  await db.recent.put({ id: `${type}:${id}`, type, title, visitedAt: Date.now() });
}

export async function saveSimParams(simId: string, params: Record<string, number>): Promise<void> {
  await db.simPreferences.put({ id: simId, params });
}

export async function getSimParams(simId: string): Promise<Record<string, number> | undefined> {
  return (await db.simPreferences.get(simId))?.params;
}

export async function saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'createdAt'>): Promise<QuizAttempt> {
  const record: QuizAttempt = { ...attempt, id: crypto.randomUUID(), createdAt: Date.now() };
  await db.quizAttempts.put(record);
  return record;
}

export async function installPack(pack: ContentPack): Promise<void> {
  await db.packs.put({ id: pack.id, pack, installedAt: Date.now() });
}

export async function removePack(id: string): Promise<void> {
  await db.packs.delete(id);
}

export async function getInstalledPacks(): Promise<ContentPack[]> {
  return (await db.packs.toArray()).map((r) => r.pack);
}

export async function clearAllData(): Promise<void> {
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
  });
}
