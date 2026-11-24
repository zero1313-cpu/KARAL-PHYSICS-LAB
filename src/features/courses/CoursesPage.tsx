import { useMemo, useState } from 'react';
import { BookOpen, Gavel, Search, Star } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Card, Chip, EmptyState, Notice, PageHeader, SectionTitle } from '@/components/UI';
import { educationLevels } from '@/content';
import type { EducationLevelId, Lesson } from '@/content/types';

export function CoursesPage({ levelParam }: { levelParam?: string }) {
  const { t, loc, content, settings, updateSettings, navigate } = useApp();
  const [query, setQuery] = useState('');
  const selected = (levelParam as EducationLevelId) || settings.educationLevel;
  const level = educationLevels.find((item) => item.id === selected) ?? educationLevels[0];
  const chapters = useMemo(() => content.chapters.filter((chapter) => chapter.level === level.id), [content.chapters, level.id]);

  const lessonsFor = (chapterId: string): Lesson[] => content.lessons.filter((lesson) => lesson.chapterId === chapterId);
  const filtered = query.trim().toLowerCase();
  const visibleChapters = filtered
    ? chapters.filter((chapter) => loc(chapter.title).toLowerCase().includes(filtered) || lessonsFor(chapter.id).some((lesson) => loc(lesson.title).toLowerCase().includes(filtered)))
    : chapters;
  const lawCount = content.lessons.filter((lesson) => 'lawId' in lesson).length;
  const levelExperimentCount = content.experiments.filter((item) => item.level === level.id).length;

  return (
    <div>
      <PageHeader title={t('courses')} subtitle={t('moreSoon')} />
      <div className="scroll-thin -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2">
        {educationLevels.map((item) => (
          <button
            key={item.id}
            onClick={() => { void updateSettings({ educationLevel: item.id }); navigate(`course/${item.id}`); }}
            className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold ${selected === item.id ? 'border-violet-500 bg-violet-500/15' : 'border-[var(--border)] bg-[var(--surface)] opacity-75'}`}
          >
            {loc(item.name)}
          </button>
        ))}
      </div>

      <div className="panel mb-5 flex flex-wrap items-center gap-3 p-4">
        <div>
          <h2 className="text-lg font-bold">{loc(level.name)}</h2>
          <p className="text-xs opacity-70">{loc(level.description)}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Chip>{chapters.length} {t('chapters')}</Chip>
          <Chip>{lawCount} {t('lawLibrary')}</Chip>
          <Chip>{levelExperimentCount} {t('practicals')}</Chip>
        </div>
      </div>

      <label className="relative mb-5 block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        <input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchLessons')} />
      </label>

      {visibleChapters.length === 0 ? <EmptyState title={t('noResults')} /> : (
        <div className="space-y-3">
          {visibleChapters.map((chapter) => {
            const lessons = lessonsFor(chapter.id);
            return (
              <details key={chapter.id} className="panel group p-4" open={visibleChapters.length === 1}>
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/15 font-bold text-violet-600 dark:text-violet-300">{chapter.difficulty}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{loc(chapter.title)}</span>
                    <span className="block text-xs opacity-60">{lessons.length} {t('lessons')} · {chapter.tags.join(' · ')}</span>
                  </span>
                  <span className="text-xs opacity-50">▾</span>
                </summary>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {lessons.map((lesson) => {
                    const isLaw = 'lawId' in lesson;
                    return (
                      <Card key={lesson.id} onClick={() => navigate(`lesson/${lesson.id}`)}>
                        <div className="flex items-start gap-2">
                          {isLaw ? <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> : <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />}
                          <div className="min-w-0">
                            <p className="text-sm font-bold">{loc(lesson.title)}</p>
                            <p className="mt-1 line-clamp-2 text-xs opacity-65">{loc(lesson.summary)}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn text-xs" onClick={() => navigate(`quiz/quiz-${chapter.id}`)}>{t('attemptQuiz')}</button>
                  {content.experiments.filter((item) => item.chapterId === chapter.id).map((experiment) => (
                    <button key={experiment.id} className="btn text-xs" onClick={() => navigate(`experiment/${experiment.id}`)}>
                      <Star className="h-3 w-3" /> {loc(experiment.title)}
                    </button>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}
      <div className="mt-5"><Notice>{t('scienceNote')}</Notice></div>
    </div>
  );
}

export function LawLibraryPage() {
  const { t, loc, content, navigate } = useApp();
  const [query, setQuery] = useState('');
  const laws = content.laws.filter((law) => !query || loc(law.title).toLowerCase().includes(query.toLowerCase()) || law.lawId.includes(query.toLowerCase()));
  return (
    <div>
      <PageHeader title={t('lawLibrary')} subtitle={t('aboutText')} />
      <label className="relative mb-5 block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        <input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchLessons')} />
      </label>
      <SectionTitle title={`${laws.length} ${t('lawLibrary')}`} />
      {laws.length === 0 ? <EmptyState title={t('noResults')} /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {laws.map((law) => (
            <Card key={law.id} onClick={() => navigate(`lesson/${law.id}`)}>
              <div className="flex items-start gap-2">
                <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="font-bold">{loc(law.title)}</p>
                  <p className="mt-1 line-clamp-2 text-xs opacity-65">{loc(law.statement)}</p>
                  {law.formula && <div className="mt-2 text-xs"><code>{law.formula}</code></div>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
