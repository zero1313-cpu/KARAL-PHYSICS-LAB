import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Box, CalendarDays, CheckCircle2, Clock3, FlaskConical, Sigma, Sparkles, Target, WifiOff } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Card, Chip, SectionTitle, Stat } from '@/components/UI';
import { MathText } from '@/components/MathText';
import { educationLevels } from '@/content';
import { db, type ProgressRecord, type RecentRecord, type QuizAttempt } from '@/database/db';
import { simulations } from '@/simulations/registry';
import { threeScenes } from '@/simulations/threeD/sceneDefs';

export function HomePage() {
  const { t, loc, content, settings, updateSettings, navigate, online, lang } = useApp();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [recents, setRecents] = useState<RecentRecord[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    void Promise.all([db.progress.toArray(), db.recent.orderBy('visitedAt').reverse().limit(6).toArray(), db.quizAttempts.toArray()])
      .then(([p, r, a]) => { setProgress(p); setRecents(r); setAttempts(a); })
      .catch(() => undefined);
  }, [content, online]);

  const levelChapters = useMemo(() => content.chapters.filter((chapter) => chapter.level === settings.educationLevel), [content.chapters, settings.educationLevel]);
  const levelLessons = useMemo(() => content.lessons.filter((lesson) => levelChapters.some((chapter) => chapter.id === lesson.chapterId)), [content.lessons, levelChapters]);
  const continueLesson = useMemo(() => {
    const lastLesson = recents.find((item) => item.type === 'lesson' && content.lessons.some((lesson) => lesson.id === item.id.split(':')[1]));
    const id = lastLesson?.id.split(':')[1] ?? levelLessons[0]?.id ?? content.lessons[0]?.id;
    return content.lessons.find((lesson) => lesson.id === id);
  }, [recents, content.lessons, levelLessons]);

  const formulaOfDay = useMemo(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return content.formulas[day % content.formulas.length];
  }, [content.formulas]);

  const dailyQuiz = useMemo(() => content.quizzes.find((quiz) => quiz.level === settings.educationLevel) ?? content.quizzes[0], [content.quizzes, settings.educationLevel]);
  const completed = progress.filter((item) => item.completed).length;
  const accuracy = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score / Math.max(1, item.total), 0) / attempts.length * 100) : 0;
  const streak = useMemo(() => {
    const days = new Set([...progress.map((p) => p.updatedAt), ...attempts.map((a) => a.createdAt)].map((time) => new Date(time).toDateString()));
    let count = 0;
    for (let offset = 0; offset < 30; offset++) {
      const day = new Date();
      day.setDate(day.getDate() - offset);
      if (days.has(day.toDateString())) count++;
      else if (offset > 0) break;
    }
    return count;
  }, [progress, attempts]);

  const quickSims = simulations.slice(0, 3);
  const quick3D = threeScenes.slice(0, 2);

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-teal-600 p-5 text-white sm:p-7">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="chip border-white/30 bg-white/15 text-white"><Sparkles className="h-3 w-3" /> {t('tagline')}</span>
            <span className="chip border-white/30 bg-white/15 text-white">{online ? t('offlineReady') : <><WifiOff className="h-3 w-3" /> {t('offlineReady')}</>}</span>
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">{t('welcome')} 👋</h1>
          <p className="mt-1 text-sm text-white/85">{t('welcomeSub')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {continueLesson && (
              <button className="btn bg-white text-violet-800" onClick={() => navigate(`lesson/${continueLesson.id}`)}>
                {t('continueLearning')}: {loc(continueLesson.title)} <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button className="btn border-white/40 bg-white/10 text-white" onClick={() => navigate('lab')}>
              <FlaskConical className="h-4 w-4" /> {t('openLab')}
            </button>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle title={t('educationLevel')} />
        <div className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {educationLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => { void updateSettings({ educationLevel: level.id }); }}
              className={`shrink-0 rounded-xl border px-4 py-3 text-left transition ${settings.educationLevel === level.id ? 'border-violet-500 bg-violet-500/15' : 'border-[var(--border)] bg-[var(--surface)] opacity-75'}`}
            >
              <span className="block text-sm font-bold">{loc(level.name)}</span>
              <span className="block text-[11px] opacity-65">{loc(level.description)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('completedLessons')} value={completed} />
        <Stat label={t('quizAttempts')} value={attempts.length} />
        <Stat label={t('averageAccuracy')} value={`${accuracy}%`} />
        <Stat label={t('studyStreak')} value={`${streak} ${t('days')}`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <SectionTitle title={t('quickLabs')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickSims.map((sim) => (
              <Card key={sim.id} onClick={() => navigate(`sim/${sim.id}`)} className="min-h-[104px]">
                <FlaskConical className="mb-2 h-5 w-5 text-teal-500" />
                <p className="line-clamp-2 text-sm font-bold">{loc(sim.title)}</p>
                <p className="mt-1 text-[11px] opacity-60">{t('lab2D')}</p>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle title={t('lab3D')} />
          <div className="grid grid-cols-2 gap-3">
            {quick3D.map((scene) => (
              <Card key={scene.id} onClick={() => navigate(`three/${scene.id}`)} className="min-h-[104px]">
                <Box className="mb-2 h-5 w-5 text-violet-500" />
                <p className="line-clamp-2 text-sm font-bold">{loc(scene.title)}</p>
                <p className="mt-1 text-[11px] opacity-60">{t('rotateHint').split('·')[0]}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold">{t('formulaOfDay')}</h2>
            <Sigma className="h-5 w-5 text-violet-500" />
          </div>
          {formulaOfDay && (
            <>
              <p className="text-sm font-semibold">{loc(formulaOfDay.name)}</p>
              <div className="my-3 rounded-xl bg-[var(--surface-2)] p-3 text-center text-lg"><MathText latex={formulaOfDay.latex} display /></div>
              <p className="text-xs opacity-70">{loc(formulaOfDay.description)}</p>
              <button className="btn mt-3 text-xs" onClick={() => navigate('formulas')}>{t('viewAll')}</button>
            </>
          )}
        </div>
        <div className="panel p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold">{t('dailyPractice')}</h2>
            <Target className="h-5 w-5 text-teal-500" />
          </div>
          {dailyQuiz && (
            <>
              <p className="text-sm font-semibold">{loc(dailyQuiz.title)}</p>
              <p className="mt-1 text-xs opacity-70">{dailyQuiz.questions.length} {t('questions')} · {Math.round(dailyQuiz.timeLimitSeconds / 60)} min · {t('practiceMode')}</p>
              <p className="mt-3 text-xs opacity-60">{t('dailyGoal')}</p>
              <button className="btn btn-primary mt-3 text-xs" onClick={() => navigate(`quiz/${dailyQuiz.id}`)}>{t('attemptQuiz')}</button>
            </>
          )}
        </div>
      </section>

      {recents.length > 0 && (
        <section>
          <SectionTitle title={t('recentlyOpened')} />
          <div className="grid gap-2 sm:grid-cols-2">
            {recents.map((item) => (
              <Card key={item.id} onClick={() => {
                const id = item.id.split(':').slice(1).join(':');
                navigate(item.type === 'simulation' ? `sim/${id}` : item.type === 'experiment' ? `experiment/${id}` : `lesson/${id}`);
              }}>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 opacity-50" />
                  <span className="truncate text-sm font-semibold">{item.title}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="panel p-5">
        <div className="flex flex-wrap items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          <div className="flex-1">
            <h2 className="font-bold">{t('builtInContent')}</h2>
            <p className="text-xs opacity-70">{t('aboutText')}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip>{content.chapters.length} {t('chapters')}</Chip>
          <Chip>{content.lessons.length} {t('lessons')}</Chip>
          <Chip>{content.formulas.length} {t('formulaCount')}</Chip>
          <Chip>{simulations.length} 2D</Chip>
          <Chip>{threeScenes.length} 3D</Chip>
          <Chip><CalendarDays className="h-3 w-3" /> {t('unlocked')}</Chip>
        </div>
        <p className="mt-3 text-xs opacity-60">{t('moreSoon')} · {lang === 'hi' ? 'सेटिंग्स में स्थानीय पैक लोड करें।' : 'Load local packs in Settings.'}</p>
      </section>
    </div>
  );
}
