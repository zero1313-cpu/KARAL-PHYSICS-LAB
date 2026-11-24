import { Bookmark, BookOpen, Beaker, FlaskConical, Sigma } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Card, EmptyState, PageHeader, SectionTitle } from '@/components/UI';
import { simulationById } from '@/simulations/registry';
import type { BookmarkRecord } from '@/database/db';

export function BookmarksPage() {
  const { t, loc, content, bookmarks, navigate } = useApp();

  const resolve = (item: BookmarkRecord) => {
    if (item.type === 'lesson') {
      const lesson = content.lessons.find((entry) => entry.id === item.itemId);
      return { title: lesson ? loc(lesson.title) : item.itemId, path: `lesson/${item.itemId}`, icon: BookOpen };
    }
    if (item.type === 'formula') {
      const formula = content.formulas.find((entry) => entry.id === item.itemId);
      return { title: formula ? loc(formula.name) : item.itemId, path: 'formulas', icon: Sigma };
    }
    if (item.type === 'experiment') {
      const experiment = content.experiments.find((entry) => entry.id === item.itemId);
      return { title: experiment ? loc(experiment.title) : item.itemId, path: `experiment/${item.itemId}`, icon: Beaker };
    }
    const sim = simulationById.get(item.itemId);
    return { title: sim ? loc(sim.title) : item.itemId, path: `sim/${item.itemId}`, icon: FlaskConical };
  };

  const groups = [
    { type: 'lesson' as const, label: t('lessons') },
    { type: 'formula' as const, label: t('formulaBook') },
    { type: 'experiment' as const, label: t('practicals') },
    { type: 'simulation' as const, label: t('physicsLab') },
  ];

  return (
    <div>
      <PageHeader title={t('bookmarks')} subtitle={`${bookmarks.length} ${t('bookmarks').toLowerCase()}`} />
      {bookmarks.length === 0 ? <EmptyState title={t('bookmarksEmpty')} /> : (
        <div className="space-y-6">
          {groups.map((group) => {
            const items = bookmarks.filter((item) => item.type === group.type);
            if (items.length === 0) return null;
            return (
              <section key={group.type}>
                <SectionTitle title={`${group.label} (${items.length})`} />
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((item) => {
                    const resolved = resolve(item);
                    const Icon = resolved.icon;
                    return (
                      <div key={item.key} className="panel flex items-center gap-3 p-3">
                        <Icon className="h-4 w-4 shrink-0 text-violet-500" />
                        <Card className="min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none" onClick={() => navigate(resolved.path)}>
                          <span className="block truncate text-sm font-semibold">{resolved.title}</span>
                        </Card>
                        <BookmarkButton type={item.type} itemId={item.itemId} compact />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <p className="text-xs opacity-50"><Bookmark className="mr-1 inline h-3 w-3" /> {t('bookmarksEmpty')}</p>
        </div>
      )}
    </div>
  );
}

