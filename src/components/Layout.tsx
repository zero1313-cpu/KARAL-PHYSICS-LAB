import { useState, type ReactNode } from 'react';
import {
  BarChart3, Beaker, BookOpen, Bookmark, Calculator, ClipboardCheck, FlaskConical,
  GraduationCap, Home, Languages, ListOrdered, Menu, Moon, Search, Settings, Sigma, Sun, WifiOff, X,
} from 'lucide-react';
import { useApp } from '@/app/AppContext';
import type { TranslationKey } from '@/localization/i18n';

interface NavItem { path: string; key: TranslationKey; icon: typeof Home; group?: string }

const primaryNav: NavItem[] = [
  { path: 'home', key: 'home', icon: Home },
  { path: 'courses', key: 'courses', icon: GraduationCap },
  { path: 'lab', key: 'physicsLab', icon: FlaskConical },
  { path: 'numericals', key: 'numericals', icon: ListOrdered },
  { path: 'formulas', key: 'formulaBook', icon: Sigma },
  { path: 'experiments', key: 'practicals', icon: Beaker },
  { path: 'quizzes', key: 'quizzes', icon: ClipboardCheck },
  { path: 'bookmarks', key: 'bookmarks', icon: Bookmark },
  { path: 'progress', key: 'progress', icon: BarChart3 },
  { path: 'settings', key: 'settings', icon: Settings },
];

const extraNav: NavItem[] = [
  { path: 'search', key: 'search', icon: Search },
  { path: 'calculator', key: 'calculator', icon: Calculator },
  { path: 'laws', key: 'lawLibrary', icon: BookOpen },
];

function isActive(route: string[], path: string): boolean {
  return route[0] === path || (path === 'courses' && ['lesson', 'course', 'laws'].includes(route[0] ?? '')) || (path === 'lab' && ['lab', 'sim', 'three'].includes(route[0] ?? ''));
}

export function Layout({ children }: { children: ReactNode }) {
  const { t, settings, updateSettings, navigate, route, online } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const activeTheme = settings.theme === 'system' ? 'system' : settings.theme;
  const ThemeIcon = activeTheme === 'light' ? Sun : Moon;
  const cycleTheme = () => {
    const next = activeTheme === 'system' ? 'light' : activeTheme === 'light' ? 'dark' : 'system';
    void updateSettings({ theme: next });
  };

  const navButton = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <button
        key={item.path}
        onClick={() => { navigate(item.path); setMoreOpen(false); }}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive(route, item.path) ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300' : 'opacity-75 hover:bg-slate-500/10 hover:opacity-100'}`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span>{t(item.key)}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
      <aside className="safe-top sticky top-0 hidden h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)] p-3 lg:flex">
        <button className="mb-5 flex items-center gap-2 px-2 text-left" onClick={() => navigate('home')}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-teal-400 font-black text-white dark:text-slate-900">K</span>
          <span>
            <span className="block text-sm font-black leading-tight">KARAL</span>
            <span className="block text-[10px] font-bold tracking-[0.18em] opacity-60">PHYSICS LAB</span>
          </span>
        </button>
        <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto">
          {primaryNav.map(navButton)}
          <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest opacity-45">Tools</p>
          {extraNav.map(navButton)}
        </nav>
        <p className="px-3 pt-3 text-[10px] leading-relaxed opacity-50">Offline-first · Local data only<br />v1.0.0 · schema v1</p>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="safe-top sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg)]/95 px-3 py-2 backdrop-blur sm:px-5">
          <button className="flex items-center gap-2 lg:hidden" onClick={() => navigate('home')} aria-label={t('home')}>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-teal-400 font-black text-white dark:text-slate-900">K</span>
            <span className="text-xs font-black">KARAL PHYSICS LAB</span>
          </button>
          <div className="hidden text-sm font-semibold opacity-60 lg:block">{t('tagline')}</div>
          <div className="ml-auto flex items-center gap-1.5">
            {!online && <span className="chip hidden sm:inline-flex"><WifiOff className="h-3 w-3" /> {t('offlineReady')}</span>}
            <button className="btn h-9 w-9 p-0" onClick={() => navigate('search')} aria-label={t('search')}><Search className="h-4 w-4" /></button>
            <button
              className="btn h-9 px-2 text-xs font-bold"
              onClick={() => { void updateSettings({ language: settings.language === 'en' ? 'hi' : 'en' }); }}
              aria-label={t('language')}
            >
              <Languages className="h-4 w-4" /> <span>{settings.language === 'en' ? 'HI' : 'EN'}</span>
            </button>
            <button className="btn h-9 w-9 p-0" onClick={cycleTheme} aria-label={t('theme')}>
              <ThemeIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-5 sm:py-7 pb-28 lg:pb-10">{children}</main>
      </div>

      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--surface)]/98 px-1 pt-1 backdrop-blur lg:hidden">
        {[primaryNav[0], primaryNav[1], primaryNav[2], primaryNav[3]].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold ${isActive(route, item.path) ? 'text-violet-600 dark:text-violet-300' : 'opacity-65'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{t(item.key).split(' ')[0]}</span>
            </button>
          );
        })}
        <button onClick={() => setMoreOpen((open) => !open)} className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold ${moreOpen ? 'text-violet-600 dark:text-violet-300' : 'opacity-65'}`}>
          {moreOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="safe-bottom absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-[var(--surface)] p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-400/50" />
            <div className="grid grid-cols-2 gap-2">
              {[...primaryNav.slice(4), ...extraNav].map(navButton)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
