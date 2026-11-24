import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { buildContent, type AppContent } from '@/content';
import { db, defaultSettings, getInstalledPacks, getSettings, installPack as installPackRecord, saveSettings, toggleBookmark, type BookmarkRecord, type Settings } from '@/database/db';
import { localize, translate, type TranslationKey } from '@/localization/i18n';
import type { ContentPack, Lang, Localized } from '@/content/types';

export type RouteParts = string[];

interface AppContextValue {
  settings: Settings;
  content: AppContent;
  bookmarks: BookmarkRecord[];
  route: RouteParts;
  online: boolean;
  ready: boolean;
  t: (key: TranslationKey) => string;
  loc: (value: Localized | undefined) => string;
  lang: Lang;
  navigate: (path: string, replace?: boolean) => void;
  goBack: () => void;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  toggleItemBookmark: (type: BookmarkRecord['type'], itemId: string) => Promise<boolean>;
  refreshPacks: () => Promise<void>;
  installPack: (pack: ContentPack) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function parseHash(): RouteParts {
  const raw = window.location.hash.replace(/^#\/?/, '');
  return raw.split('/').filter(Boolean).map(decodeURIComponent);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [content, setContent] = useState<AppContent>(() => buildContent());
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [route, setRoute] = useState<RouteParts>(() => (parseHash().length ? parseHash() : ['home']));
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getSettings(), getInstalledPacks()])
      .then(([savedSettings, packs]) => {
        if (!active) return;
        setSettings(savedSettings);
        setContent(buildContent(packs));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    void db.bookmarks.toArray().then((items) => setBookmarks(items)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash().length ? parseHash() : ['home']);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const navigate = useCallback((path: string, replace = false) => {
    const next = `#/${path.replace(/^\/+/, '')}`;
    if (replace) window.history.replaceState(null, '', next);
    else window.location.hash = next;
    setRoute(parseHash().length ? parseHash() : ['home']);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const goBack = useCallback(() => {
    if (window.history.length > 1) window.history.back();
    else navigate('home');
  }, [navigate]);

  useEffect(() => {
    let remove: (() => void) | undefined;
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else navigate('home', true);
    })
      .then((handle) => { remove = () => { void handle.remove(); }; })
      .catch(() => undefined);
    return () => remove?.();
  }, [navigate]);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark.matches);
      root.classList.toggle('dark', dark);
      root.lang = settings.language;
      root.dataset.textSize = settings.textSize;
      root.dataset.reduceMotion = String(settings.reduceMotion);
    };
    apply();
    systemDark.addEventListener('change', apply);
    return () => systemDark.removeEventListener('change', apply);
  }, [settings]);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    const next = await saveSettings(partial);
    setSettings(next);
  }, []);

  const toggleItemBookmark = useCallback(async (type: BookmarkRecord['type'], itemId: string) => {
    const saved = await toggleBookmark(type, itemId);
    setBookmarks((current) => {
      if (saved) return [...current, { key: `${type}:${itemId}`, type, itemId, createdAt: Date.now() }];
      return current.filter((item) => item.key !== `${type}:${itemId}`);
    });
    return saved;
  }, []);

  const refreshPacks = useCallback(async () => {
    const packs = await getInstalledPacks();
    setContent(buildContent(packs));
  }, []);

  const installPack = useCallback(async (pack: ContentPack) => {
    await installPackRecord(pack);
    await refreshPacks();
  }, [refreshPacks]);

  const value = useMemo<AppContextValue>(() => ({
    settings,
    content,
    bookmarks,
    route,
    online,
    ready,
    lang: settings.language,
    t: (key) => translate(settings.language, key),
    loc: (item) => localize(settings.language, item),
    navigate,
    goBack,
    updateSettings,
    toggleItemBookmark,
    refreshPacks,
    installPack,
  }), [settings, content, bookmarks, route, online, ready, navigate, goBack, updateSettings, toggleItemBookmark, refreshPacks, installPack]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
