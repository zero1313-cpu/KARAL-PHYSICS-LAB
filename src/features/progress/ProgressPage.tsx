import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardCheck, NotebookPen, Target } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Card, EmptyState, Notice, PageHeader, SectionTitle, Stat } from '@/components/UI';
import { educationLevels } from '@/content';
import { db, type NoteRecord, type ProgressRecord, type QuizAttempt } from '@/database/db';

export function ProgressPage() {
  const { t, loc, content, navigate, lang } = useApp();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    void Promise.all([db.progress.toArray(), db.quizAttempts.toArray(), db.notes.toArray()])
      .then(([p, a, n]) => { setProgress(p); setAttempts(a); setNotes(n); })
      .catch(() => undefined);
  }, [version]);

  const completedRecords = progress.filter((item) => item.completed);
  const totalSeconds = progress.reduce((sum, item) => sum + item.secondsStudied, 0);
  const accuracy = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score / Math.max(1, item.total), 0) / attempts.length * 100) : 0;

  const weakTopics = useMemo(() => {
    const counts = new Map<string, number>();
    const questionTopic = new Map<string, string>();
    content.quizzes.forEach((quiz) => quiz.questions.forEach((question) => questionTopic.set(question.id, question.topic)));
    attempts.forEach((attempt) => attempt.wrongIds.forEach((id) => {
      const topic = questionTopic.get(id) ?? attempt.topic;
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [attempts, content.quizzes]);

  return (
    <div className="space-y-6">
      <PageHeader title={t('progress')} subtitle={t('progressOverview')} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('completedLessons')} value={completedRecords.length} />
        <Stat label={t('quizAttempts')} value={attempts.length} />
        <Stat label={t('averageAccuracy')} value={`${accuracy}%`} />
        <Stat label={t('time')} value={`${Math.round(totalSeconds / 60)} min`} />
      </div>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('byLevel')} />
        <div className="space-y-3">
          {educationLevels.map((level) => {
            const chapters = content.chapters.filter((chapter) => chapter.level === level.id);
            const lessonIds = new Set(chapters.flatMap((chapter) => chapter.lessonIds));
            const done = completedRecords.filter((record) => lessonIds.has(record.lessonId)).length;
            const percent = lessonIds.size ? Math.round(done / lessonIds.size * 100) : 0;
            return (
              <div key={level.id}>
                <div className="mb-1 flex justify-between text-xs"><span>{loc(level.name)}</span><span>{done}/{lessonIds.size} · {percent}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-teal-400" style={{ width: `${percent}%` }} /></div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle title={t('completedLessons')} />
        {completedRecords.length === 0 ? <EmptyState title={t('noResults')} /> : (
          <div className="grid gap-2 sm:grid-cols-2">
            {completedRecords.map((record) => {
              const lesson = content.lessons.find((item) => item.id === record.lessonId);
              return (
                <Card key={record.lessonId} onClick={() => navigate(`lesson/${record.lessonId}`)}>
                  <p className="flex items-center gap-2 truncate text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {lesson ? loc(lesson.title) : record.lessonId}</p>
                  <p className="mt-1 text-[11px] opacity-60">{Math.round(record.secondsStudied / 60)} min · {new Date(record.updatedAt).toLocaleDateString()}</p>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('weakTopics')} action={<Target className="h-4 w-4 opacity-50" />} />
        {weakTopics.length === 0 ? <p className="text-sm opacity-65">{t('noWeakTopics')}</p> : (
          <div className="flex flex-wrap gap-2">
            {weakTopics.map(([topic, count]) => {
              const quiz = content.quizzes.find((item) => item.questions.some((question) => question.topic === topic));
              return (
                <button key={topic} className="chip" onClick={() => quiz && navigate(`quiz/${quiz.id}`)}>{topic} · {count} {lang === 'hi' ? 'गलतियाँ' : 'errors'}</button>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('notesTitle')} action={<NotebookPen className="h-4 w-4 opacity-50" />} />
        {notes.length === 0 ? <p className="text-sm opacity-65">{t('notesEmpty')}</p> : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl border border-[var(--border)] p-3">
                <p className="text-xs font-bold opacity-70">{note.lessonId.replace(/^experiment:/, '').replace(/^note:/, '')}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{note.text || '—'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel p-4 sm:p-5">
        <SectionTitle title={t('quizAttempts')} action={<ClipboardCheck className="h-4 w-4 opacity-50" />} />
        {attempts.length === 0 ? <p className="text-sm opacity-65">{t('noWeakTopics')}</p> : (
          <div className="grid gap-2 sm:grid-cols-2">
            {attempts.slice(0, 12).map((attempt) => (
              <Card key={attempt.id} onClick={() => navigate(`quiz/${attempt.quizId}`)}>
                <p className="flex items-center gap-2 text-sm font-semibold"><BookOpen className="h-4 w-4" /> {attempt.topic}</p>
                <p className="mt-1 text-xs opacity-60">{attempt.score}/{attempt.total} · {Math.round(attempt.score / Math.max(1, attempt.total) * 100)}% · {new Date(attempt.createdAt).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        )}
        <button className="btn mt-4 text-xs" onClick={() => setVersion((value) => value + 1)}>{t('reload')}</button>
      </section>
      <Notice>{t('privacyText')}</Notice>
    </div>
  );
}
