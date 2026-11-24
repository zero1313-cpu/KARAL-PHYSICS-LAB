import { useEffect, useState } from 'react';
import { Beaker, FlaskConical, Save, Search } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Diagram } from '@/components/Diagram';
import { BulletList, Card, EmptyState, Notice, PageHeader, Section, SectionTitle } from '@/components/UI';
import { db, saveNote, visitItem } from '@/database/db';
import type { Experiment } from '@/content/types';

export function ExperimentsPage() {
  const { t, loc, content, navigate, settings } = useApp();
  const [query, setQuery] = useState('');
  const filtered = content.experiments.filter((item) => !query || loc(item.title).toLowerCase().includes(query.toLowerCase()) || item.chapterId.includes(query.toLowerCase()));
  const levelExperiments = content.experiments.filter((item) => item.level === settings.educationLevel);

  return (
    <div>
      <PageHeader title={t('practicals')} subtitle="Record your own readings — no invented observations" />
      <div className="panel mb-5 p-4">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchLessons')} />
        </label>
        <p className="mt-3 text-xs opacity-60">{t('byLevel')}: {levelExperiments.length} · {t('all')}: {content.experiments.length}</p>
      </div>
      {filtered.length === 0 ? <EmptyState title={t('noResults')} /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((experiment) => (
            <Card key={experiment.id} onClick={() => navigate(`experiment/${experiment.id}`)}>
              <div className="flex items-start gap-2">
                <Beaker className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                <div>
                  <p className="font-bold">{loc(experiment.title)}</p>
                  <p className="mt-1 line-clamp-2 text-xs opacity-65">{loc(experiment.aim)}</p>
                  {experiment.simulationId && <span className="chip mt-2">{t('openLab')}</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-5"><Notice>{t('moreSoon')}</Notice></div>
    </div>
  );
}

export function ExperimentDetailPage({ experiment }: { experiment: Experiment }) {
  const { t, loc, navigate } = useApp();
  const [observations, setObservations] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void visitItem('experiment', experiment.id, loc(experiment.title));
    void db.notes.get(`experiment:${experiment.id}`).then((record) => setObservations(record?.text ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment.id]);

  return (
    <div className="space-y-5">
      <PageHeader title={loc(experiment.title)} subtitle={loc(experiment.aim)} />
      <div className="flex flex-wrap gap-2">
        <BookmarkButton type="experiment" itemId={experiment.id} />
        {experiment.simulationId && <button className="btn btn-primary" onClick={() => navigate(`sim/${experiment.simulationId}`)}><FlaskConical className="h-4 w-4" /> {t('openLab')}</button>}
      </div>

      <div className="panel p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold">{t('diagram')}</h2>
        <Diagram spec={experiment.diagram} />
      </div>

      <Section title={t('aim')}><p>{loc(experiment.aim)}</p></Section>
      <Section title={t('apparatus')}><BulletList items={experiment.apparatus.map(loc)} /></Section>
      <Section title={t('theory')}><p>{loc(experiment.theory)}</p></Section>
      <Section title={t('procedure')}>
        <ol className="list-decimal space-y-1 pl-5">{experiment.procedure.map((step, index) => <li key={index}>{loc(step)}</li>)}</ol>
      </Section>
      <Section title={t('observations')}><BulletList items={experiment.observations.map(loc)} /></Section>
      <Section title={t('calculationNote')}><p>{loc(experiment.calculation)}</p></Section>
      <Section title={t('result')}><p>{loc(experiment.result)}</p></Section>
      <Section title={t('precautions')}><BulletList items={experiment.precautions.map(loc)} /></Section>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('viva')} />
        <dl className="space-y-3 text-sm">
          {experiment.viva.map((item, index) => (
            <div key={index}>
              <dt className="font-semibold">Q{index + 1}. {loc(item.q)}</dt>
              <dd className="mt-1 opacity-75">A: {loc(item.a)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel border-teal-400/40 p-4 sm:p-5">
        <h2 className="mb-2 flex items-center gap-2 text-base font-bold"><Save className="h-4 w-4" /> {t('observations')} — {t('notesTitle')}</h2>
        <p className="mb-2 text-xs opacity-65">{t('observations')}: {loc(experiment.observations[0] ?? { en: '', hi: '' })}</p>
        <textarea
          className="input min-h-[150px]"
          value={observations}
          onChange={(event) => { setObservations(event.target.value); setSaved(false); }}
          placeholder={t('notesEmpty')}
        />
        <button className="btn btn-primary mt-2 text-xs" onClick={() => { void saveNote(`experiment:${experiment.id}`, observations).then(() => setSaved(true)); }}>{t('saveNotes')}</button>
        {saved && <span className="ml-3 text-xs text-emerald-500">{t('notesSaved')}</span>}
      </section>
      <Notice>{t('scienceNote')}</Notice>
    </div>
  );
}
