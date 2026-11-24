import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, FileQuestion, Play, Search, XCircle } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Card, EmptyState, Notice, PageHeader, Stat } from '@/components/UI';
import { educationLevels } from '@/content';
import { saveQuizAttempt, type QuizAttempt } from '@/database/db';
import type { Quiz } from '@/content/types';

export function QuizzesPage() {
  const { t, loc, content, navigate, settings } = useApp();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(settings.educationLevel);
  const quizzes = useMemo(() => content.quizzes.filter((quiz) =>
    (level === 'all' || quiz.level === level) &&
    (!query || loc(quiz.title).toLowerCase().includes(query.toLowerCase()) || quiz.questions.some((q) => loc(q.prompt).toLowerCase().includes(query.toLowerCase()))),
  ), [content.quizzes, level, query, loc]);
  const chapterCounts = new Set(quizzes.map((quiz) => quiz.chapterId)).size;

  return (
    <div>
      <PageHeader title={t('quizzes')} subtitle={`${t('chapterWise')} · ${t('timedTest')}`} />
      <div className="panel mb-5 p-4">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchLessons')} />
        </label>
        <div className="scroll-thin mt-3 flex gap-2 overflow-x-auto pb-1">
          <button className={`chip shrink-0 ${level === 'all' ? 'border-violet-500 text-violet-500' : ''}`} onClick={() => setLevel('all')}>{t('all')}</button>
          {educationLevels.map((item) => <button key={item.id} className={`chip shrink-0 ${level === item.id ? 'border-violet-500 text-violet-500' : ''}`} onClick={() => setLevel(item.id)}>{loc(item.name)}</button>)}
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('quizzes')} value={quizzes.length} />
        <Stat label={t('chapters')} value={chapterCounts} />
        <Stat label={t('questions')} value={quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0)} />
        <Stat label={t('timedTest')} value={`${quizzes[0] ? Math.round(quizzes[0].timeLimitSeconds / 60) : 0} min`} />
      </div>
      {quizzes.length === 0 ? <EmptyState title={t('noResults')} /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} onClick={() => navigate(`quiz/${quiz.id}`)}>
              <div className="flex items-start gap-2">
                <FileQuestion className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{loc(quiz.title)}</p>
                  <p className="mt-1 text-xs opacity-65">{quiz.questions.length} {t('questions')} · <Clock3 className="inline h-3 w-3" /> {Math.round(quiz.timeLimitSeconds / 60)} min</p>
                  <p className="mt-2 text-[10px] uppercase tracking-widest opacity-50">{quiz.questions[0]?.topic}</p>
                </div>
                <Play className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-5"><Notice>{t('scienceNote')}</Notice></div>
    </div>
  );
}

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const { t, loc, navigate } = useApp();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(quiz.timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const question = quiz.questions[Math.min(index, quiz.questions.length - 1)];
  const answered = Object.keys(answers).length;
  const correctIds = quiz.questions.filter((q) => answers[q.id] === q.correctIndex).map((q) => q.id);
  const wrongIds = quiz.questions.filter((q) => answers[q.id] !== q.correctIndex).map((q) => q.id);

  const submit = () => {
    if (submitting || finished) return;
    setSubmitting(true);
    setFinished(true);
    void saveQuizAttempt({
      quizId: quiz.id,
      chapterId: quiz.chapterId,
      topic: quiz.questions[0]?.topic ?? 'General',
      score: correctIds.length,
      total: quiz.questions.length,
      correctIds,
      wrongIds,
      durationSeconds: quiz.timeLimitSeconds - remaining,
    }).then(setAttempt).finally(() => setSubmitting(false));
  };

  const modal = useMemo(() => {
    if (!finished) return null;
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
        <div className="panel max-h-[85vh] w-full max-w-xl overflow-y-auto p-5">
          <h2 className="text-xl font-black">{t('resultSummary')}</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label={t('score')} value={`${correctIds.length}/${quiz.questions.length}`} />
            <Stat label={t('accuracy')} value={`${Math.round(correctIds.length / Math.max(1, quiz.questions.length) * 100)}%`} />
            <Stat label={t('time')} value={`${quiz.timeLimitSeconds - remaining}s`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={() => { setAnswers({}); setIndex(0); setRemaining(quiz.timeLimitSeconds); setFinished(false); setAttempt(null); setShowSolutions(false); }}><Play className="h-4 w-4" /> {t('retry')}</button>
            <button className="btn" onClick={() => setShowSolutions((value) => !value)}>{t('viewSolutions')}</button>
            <button className="btn" onClick={() => navigate('quizzes')}>{t('back')}</button>
          </div>
          {attempt && <p className="mt-2 text-xs opacity-60">Saved locally · {new Date(attempt.createdAt).toLocaleString()}</p>}
          {showSolutions && (
            <div className="mt-4 space-y-3">
              {quiz.questions.map((item, qIndex) => {
                const correct = answers[item.id] === item.correctIndex;
                return (
                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                    <p className="flex gap-2 font-semibold">{correct ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />} Q{qIndex + 1}. {loc(item.prompt)}</p>
                    <p className="mt-1 text-xs opacity-70">{t('answer')}: {loc(item.options[item.correctIndex])}</p>
                    <p className="mt-1 text-xs opacity-60">{loc(item.explanation)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }, [finished, correctIds.length, quiz, remaining, t, answers, loc, attempt, showSolutions, navigate]);

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  useEffect(() => { if (remaining === 0 && !finished) submit(); }, [remaining, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!question) return <EmptyState title={t('noResults')} />;

  return (
    <div>
      <PageHeader title={loc(quiz.title)} subtitle={`${quiz.questions.length} ${t('questions')} · ${t('timedTest')}`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`chip ${remaining < 30 ? 'text-red-500' : ''}`}><Clock3 className="h-3 w-3" /> {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span>
        <span className="chip">{answered}/{quiz.questions.length} {t('questions')}</span>
        <button className="btn ml-auto text-xs" onClick={submit}>{t('finish')}</button>
      </div>
      <div className="panel p-4 sm:p-6">
        <p className="text-xs uppercase tracking-widest opacity-50">Q{index + 1} · {question.topic}</p>
        <h2 className="mt-2 text-lg font-bold">{loc(question.prompt)}</h2>
        <div className="mt-5 grid gap-2">
          {question.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
              className={`btn min-h-[48px] justify-start text-left ${answers[question.id] === optionIndex ? 'border-violet-500 bg-violet-500/10' : ''}`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--border)] text-xs font-bold">{String.fromCharCode(65 + optionIndex)}</span>
              {loc(option)}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button className="btn" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}>{t('previous')}</button>
        <div className="hidden flex-wrap justify-center gap-1 sm:flex">
          {quiz.questions.map((item, qIndex) => (
            <button key={item.id} onClick={() => setIndex(qIndex)} className={`h-8 w-8 rounded-lg text-xs ${qIndex === index ? 'bg-violet-500 text-white' : answers[item.id] !== undefined ? 'bg-emerald-500/20 text-emerald-600' : 'bg-[var(--surface-2)] opacity-60'}`}>{qIndex + 1}</button>
          ))}
        </div>
        {index < quiz.questions.length - 1
          ? <button className="btn btn-primary" onClick={() => setIndex((value) => value + 1)}>{t('next')}</button>
          : <button className="btn btn-primary" onClick={submit}>{t('submit')}</button>}
      </div>
      {modal}
    </div>
  );
}
