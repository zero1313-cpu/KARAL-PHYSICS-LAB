import { useEffect, useState } from 'react';
import { Download, FileJson, HardDrive, Package, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Notice, PageHeader, SectionTitle } from '@/components/UI';
import { educationLevels } from '@/content';
import { validateContentPack } from '@/content/packs';
import type { ContentPack } from '@/content/types';
import { BACKUP_SCHEMA_VERSION, exportBackup, importBackup } from '@/database/backup';
import { clearAllData, getInstalledPacks, removePack, type ThemePreference } from '@/database/db';

function formatBytes(bytes?: number): string {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SettingsPage() {
  const { t, loc, settings, updateSettings, content, installPack, refreshPacks } = useApp();
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [storage, setStorage] = useState<{ usage?: number; quota?: number } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    void getInstalledPacks().then(setPacks).catch(() => undefined);
    if (navigator.storage?.estimate) void navigator.storage.estimate().then((estimate) => setStorage({ usage: estimate.usage, quota: estimate.quota })).catch(() => undefined);
  }, [version]);

  const doExport = async () => {
    try {
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `karal-physics-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus({ text: t('exportTip') });
    } catch (error) {
      setStatus({ text: error instanceof Error ? error.message : t('importFailure'), error: true });
    }
  };

  const doImportBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      await importBackup(parsed);
      setStatus({ text: t('importSuccess') });
      window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setStatus({ text: t('importFailure'), error: true });
      console.error('Backup import failed', error);
    }
  };

  const doImportPack = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const pack = validateContentPack(parsed);
      await installPack(pack);
      setVersion((value) => value + 1);
      setStatus({ text: t('packLoaded') });
    } catch (error) {
      setStatus({ text: t('packFailed'), error: true });
      console.error('Pack import failed', error);
    }
  };

  const clear = () => {
    if (!window.confirm(t('clearConfirm'))) return;
    void clearAllData().then(() => window.location.reload());
  };

  return (
    <div className="space-y-5">
      <PageHeader title={t('settings')} subtitle={`${t('version')} 1.0.0 · ${t('dataSchema')} v${BACKUP_SCHEMA_VERSION}`} />
      {status && <Notice tone={status.error ? 'warn' : 'success'}>{status.text}</Notice>}

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('preferences')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">{t('language')}</span>
            <select className="select" value={settings.language} onChange={(event) => { void updateSettings({ language: event.target.value as 'en' | 'hi' }); }}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">{t('theme')}</span>
            <select className="select" value={settings.theme} onChange={(event) => { void updateSettings({ theme: event.target.value as ThemePreference }); }}>
              <option value="system">{t('system')}</option>
              <option value="light">{t('light')}</option>
              <option value="dark">{t('dark')}</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">{t('educationLevel')}</span>
            <select className="select" value={settings.educationLevel} onChange={(event) => { void updateSettings({ educationLevel: event.target.value }); }}>
              {educationLevels.map((level) => <option key={level.id} value={level.id}>{loc(level.name)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">{t('textSize')}</span>
            <select className="select" value={settings.textSize} onChange={(event) => { void updateSettings({ textSize: event.target.value as 'small' | 'medium' | 'large' }); }}>
              <option value="small">{t('small')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="large">{t('large')}</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">{t('animationQuality')}</span>
            <select className="select" value={settings.animationQuality} onChange={(event) => { void updateSettings({ animationQuality: event.target.value as 'high' | 'balanced' | 'low' }); }}>
              <option value="low">{t('low')}</option>
              <option value="balanced">{t('balanced')}</option>
              <option value="high">{t('high')}</option>
            </select>
          </label>
          <label className="flex items-center gap-3 self-end rounded-xl border border-[var(--border)] p-3 text-sm">
            <input type="checkbox" checked={settings.reduceMotion} onChange={(event) => { void updateSettings({ reduceMotion: event.target.checked }); }} />
            {t('reduceMotion')}
          </label>
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('backupRestore')} action={<FileJson className="h-4 w-4 opacity-50" />} />
        <p className="mb-4 text-xs opacity-65">{t('exportTip')}</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={() => { void doExport(); }}><Download className="h-4 w-4" /> {t('exportData')}</button>
          <label className="btn cursor-pointer">
            <Upload className="h-4 w-4" /> {t('importData')}
            <input type="file" accept="application/json,.json" className="hidden" onChange={(event) => { void doImportBackup(event.target.files?.[0]); event.target.value = ''; }} />
          </label>
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('contentPack')} action={<Package className="h-4 w-4 opacity-50" />} />
        <p className="mb-3 text-xs opacity-65">{t('moreSoon')}</p>
        <label className="btn cursor-pointer">
          <Upload className="h-4 w-4" /> {t('loadPack')}
          <input type="file" accept="application/json,.json" className="hidden" onChange={(event) => { void doImportPack(event.target.files?.[0]); event.target.value = ''; }} />
        </label>
        {packs.length > 0 && (
          <ul className="mt-4 space-y-2">
            {packs.map((pack) => (
              <li key={pack.id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{loc(pack.name)}</p>
                  <p className="text-xs opacity-60">{pack.id} · {pack.schemaVersion}</p>
                </div>
                <button className="btn h-9 w-9 p-0 text-red-500" onClick={() => { void removePack(pack.id).then(refreshPacks).then(() => setVersion((value) => value + 1)); }} aria-label={t('delete')}><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] opacity-50">{content.packs.length} active · {content.lessons.length} lessons · {content.formulas.length} formulas</p>
      </section>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('storage')} action={<HardDrive className="h-4 w-4 opacity-50" />} />
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <p>{t('storageEstimate')}: <strong>{formatBytes(storage?.usage)}</strong></p>
          <p>Quota: <strong>{formatBytes(storage?.quota)}</strong></p>
          <p>{t('dataSchema')}: <strong>v{BACKUP_SCHEMA_VERSION}</strong></p>
          <p>{t('unlocked')}: <strong>{content.chapters.length + content.lessons.length + content.formulas.length}</strong></p>
        </div>
        <button className="btn mt-4 border-red-500 text-red-500" onClick={clear}><Trash2 className="h-4 w-4" /> {t('clearAll')}</button>
      </section>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('about')} />
        <p className="text-sm opacity-80">{t('aboutText')}</p>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
          <p className="text-xs opacity-80">{t('privacy')}: {t('privacyText')}</p>
        </div>
      </section>
    </div>
  );
}
