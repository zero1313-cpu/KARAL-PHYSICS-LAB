import { useMemo, useState } from 'react';
import { Beaker, BookOpen, FlaskConical, Search, Sigma } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Card, EmptyState, PageHeader } from '@/components/UI';
import { simulations } from '@/simulations/registry';

interface Result { id: string; title: string; subtitle: string; path: string; icon: typeof BookOpen }

export function SearchPage() {
  const { t, loc, content, navigate } = useApp();
  const [query, setQuery] = useState('');

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const found: Result[] = [];
    content.lessons.forEach((lesson) => {
      const text = `${loc(lesson.title)} ${loc(lesson.summary)} ${loc(lesson.definition)}`.toLowerCase();
      if (text.includes(q)) found.push({ id: lesson.id, title: loc(lesson.title), subtitle: loc(lesson.summary), path: `lesson/${lesson.id}`, icon: BookOpen });
    });
    content.formulas.forEach((formula) => {
      const text = `${loc(formula.name)} ${formula.plain} ${formula.latex} ${loc(formula.description)}`.toLowerCase();
      if (text.includes(q)) found.push({ id: formula.id, title: loc(formula.name), subtitle: formula.plain, path: 'formulas', icon: Sigma });
    });
    content.experiments.forEach((experiment) => {
      const text = `${loc(experiment.title)} ${loc(experiment.aim)}`.toLowerCase();
      if (text.includes(q)) found.push({ id: experiment.id, title: loc(experiment.title), subtitle: loc(experiment.aim), path: `experiment/${experiment.id}`, icon: Beaker });
    });
    simulations.forEach((sim) => {
      const text = `${loc(sim.title)} ${loc(sim.description)}`.toLowerCase();
      if (text.includes(q)) found.push({ id: sim.id, title: loc(sim.title), subtitle: loc(sim.description), path: `sim/${sim.id}`, icon: FlaskConical });
    });
    return found.slice(0, 60);
  }, [query, content, loc]);

  return (
    <div>
      <PageHeader title={t('search')} subtitle={t('searchLessons')} />
      <label className="panel mb-5 flex items-center gap-3 p-3">
        <Search className="h-5 w-5 opacity-50" />
        <input autoFocus className="w-full bg-transparent text-base outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchLessons')} />
      </label>
      {query && results.length === 0 ? <EmptyState title={t('noResults')} /> : (
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((result) => {
            const Icon = result.icon;
            return (
              <Card key={`${result.id}-${result.path}`} onClick={() => navigate(result.path)}>
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{result.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs opacity-65">{result.subtitle}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {!query && <EmptyState title={t('search')} text={t('searchLessons')} />}
    </div>
  );
}
