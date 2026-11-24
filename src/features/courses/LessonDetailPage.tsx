import { useEffect, useState } from 'react';
import { Check, CheckCircle2, ChevronDown, Circle, FileQuestion, NotebookPen, Save } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Diagram } from '@/components/Diagram';
import { MathText } from '@/components/MathText';
import { BulletList, EmptyState, Notice, PageHeader, Section, SectionTitle, Stat } from '@/components/UI';
import { db, setLessonComplete, addStudySeconds, saveNote, visitItem } from '@/database/db';
import type { Law, Lesson } from '@/content/types';

export function LessonDetailPage({ lesson }: { lesson: Lesson }) {
  const { t, loc, content, navigate } = useApp();
  const [complete, setComplete] = useState(false);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    void visitItem('lesson', lesson.id, loc(lesson.title));
    void db.progress.get(lesson.id).then((record) => setComplete(record?.completed ?? false));
    void db.notes.get(`note:${lesson.id}`).then((record) => { setNote(record?.text ?? ''); setSaved(false); });
    const timer = window.setInterval(() => { void addStudySeconds(lesson.id, 30); }, 30_000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const chapter = content.chapters.find((item) => item.id === lesson.chapterId);
  const law = 'lawId' in lesson ? (lesson as Law) : undefined;
  const related = content.lessons.filter((item) => lesson.relatedConcepts.includes(item.id) || (law && lesson.relatedConcepts.includes(law.lawId)));

  return (
    <div className="space-y-5">
      <PageHeader title={loc(lesson.title)} subtitle={loc(lesson.summary)} />
      <div className="flex flex-wrap items-center gap-2">
        {chapter && <span className="chip">{loc(chapter.title)}</span>}
        {law && <span className="chip">⚖️ {t('lawLibrary')}</span>}
        <span className="chip">{t('version')} {new Date(lesson.updatedAt).getFullYear()}</span>
        <div className="ml-auto flex gap-2">
          <BookmarkButton type="lesson" itemId={lesson.id} />
          <button className="btn" onClick={() => { const next = !complete; setComplete(next); void setLessonComplete(lesson.id, next); }}>
            {complete ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4" />}
            {complete ? t('completed') : t('markComplete')}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t('lessonSections')} value={17} />
        <Stat label={t('workedExamples')} value={lesson.workedExamples.length} />
        <Stat label={t('practice')} value={lesson.practiceQuestions.length + lesson.mcqs.length} />
      </div>

      {law && (
        <Section title={t('lawLibrary')}>
          <p><strong>{t('definition')}:</strong> {loc(law.statement)}</p>
          <p><strong>{t('assumptions')}:</strong> {loc(law.conditions)}</p>
        </Section>
      )}

      <Section title={t('introduction')}><p>{loc(lesson.introduction)}</p></Section>
      <Section title={t('definition')}><p>{loc(lesson.definition)}</p></Section>
      <Section title={t('explanation')}><p>{loc(lesson.explanation)}</p></Section>

      <div className="panel p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold">{t('diagram')}</h2>
        <Diagram spec={lesson.diagram} />
      </div>

      <Section title={t('examples')}><BulletList items={lesson.realLifeExamples.map(loc)} /></Section>

      {lesson.derivation && <Section title={t('derivation')}><p>{loc(lesson.derivation)}</p></Section>}

      {lesson.formula && (
        <section className="panel p-4 sm:p-5">
          <h2 className="mb-2 text-base font-bold">{t('formula')}</h2>
          <div className="rounded-xl bg-[var(--surface-2)] p-4 text-center text-xl"><MathText latex={lesson.formula} display /></div>
          <p className="mt-2 text-center font-mono text-xs opacity-60">{lesson.formula}</p>
        </section>
      )}

      {lesson.variables && lesson.variables.length > 0 && (
        <section className="panel overflow-x-auto p-4 sm:p-5">
          <h2 className="mb-3 text-base font-bold">{t('variables')}</h2>
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-xs uppercase opacity-60"><tr><th className="p-2">Symbol</th><th className="p-2">Meaning</th><th className="p-2">{t('unit')}</th></tr></thead>
            <tbody>
              {lesson.variables.map((item) => (
                <tr key={item.symbol} className="border-t border-[var(--border)]">
                  <td className="p-2 font-bold"><MathText latex={item.symbol} /></td>
                  <td className="p-2">{loc(item.meaning)}</td>
                  <td className="p-2 font-mono text-xs">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Section title={t('units')}>
        <p>{loc(lesson.siUnits)}</p>
        {lesson.dimensions && <p className="font-mono text-xs opacity-70">{lesson.dimensions}</p>}
      </Section>

      <Section title={t('applications')}><BulletList items={lesson.applications.map(loc)} /></Section>
      <Section title={t('mistakes')}><BulletList items={lesson.commonMistakes.map(loc)} /></Section>
      <Section title={t('assumptions')}><p>{loc(lesson.assumptions)}</p><p className="mt-2 text-xs opacity-60">{t('scienceNote')}</p></Section>

      <div>
        <SectionTitle title={t('workedExamples')} />
        <div className="space-y-3">
          {lesson.workedExamples.length === 0 && <EmptyState title={t('noResults')} />}
          {lesson.workedExamples.map((example) => (
            <details key={example.id} className="panel p-4">
              <summary className="cursor-pointer font-semibold">{loc(example.question)}</summary>
              <div className="mt-3 space-y-2 text-sm">
                <p><strong>{t('given')}:</strong> {loc(example.given)}</p>
                <p><strong>{t('required')}:</strong> {loc(example.required)}</p>
                <p><strong>{t('correctFormula')}:</strong> <code>{example.formula}</code></p>
                <p><strong>{t('solutionSteps')}:</strong></p>
                <ol className="list-decimal space-y-1 pl-5">{example.steps.map((step, index) => <li key={index}>{loc(step)}</li>)}</ol>
                <p className="font-bold text-emerald-600 dark:text-emerald-400"><strong>{t('finalAnswer')}:</strong> {loc(example.answer)}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title={t('practice')} />
        <div className="space-y-3">
          {lesson.practiceQuestions.map((question) => (
            <div key={question.id} className="panel p-4">
              <div className="flex items-start gap-2">
                <FileQuestion className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                <p className="flex-1 text-sm font-semibold">{loc(question.prompt)}</p>
                <button className="btn h-8 px-2 text-xs" onClick={() => setRevealed((current) => ({ ...current, [question.id]: !current[question.id] }))}>
                  {revealed[question.id] ? t('hideSolution') : t('showSolution')}
                </button>
              </div>
              {question.hint && revealed[question.id] && <p className="mt-2 text-xs opacity-60">💡 {t('hint')}: {loc(question.hint)}</p>}
              {revealed[question.id] && (
                <div className="mt-2 rounded-lg bg-[var(--surface-2)] p-3 text-sm">
                  <p><strong>{t('answer')}:</strong> {loc(question.answer)}</p>
                  <p className="mt-1"><strong>{t('solutionSteps')}:</strong> {loc(question.solution)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title={t('mcqs')} />
        <div className="space-y-3">
          {lesson.mcqs.map((question) => {
            const chosen = answers[question.id];
            return (
              <div key={question.id} className="panel p-4">
                <p className="text-sm font-semibold">{loc(question.prompt)}</p>
                <div className="mt-3 grid gap-2">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: index }))}
                      className={`btn justify-start text-left ${chosen === index ? (index === question.correctIndex ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10') : ''}`}
                    >
                      {chosen === index ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      {loc(option)}
                    </button>
                  ))}
                </div>
                {chosen !== undefined && <div className="mt-2 text-xs opacity-75">{chosen === question.correctIndex ? t('correct') : t('incorrect')} {loc(question.explanation)}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <Section title={t('revision')}><BulletList items={lesson.revisionNotes.map(loc)} /></Section>
      <Section title={t('related')}>
        <div className="flex flex-wrap gap-2">
          {related.length === 0 && <span className="text-xs opacity-60">{t('noResults')}</span>}
          {related.map((item) => <button key={item.id} className="chip" onClick={() => navigate(`lesson/${item.id}`)}>{loc(item.title)}</button>)}
        </div>
      </Section>

      <section className="panel p-4 sm:p-5">
        <h2 className="mb-2 flex items-center gap-2 text-base font-bold"><NotebookPen className="h-4 w-4" /> {t('notesTitle')}</h2>
        <textarea className="input min-h-[110px]" value={note} onChange={(event) => { setNote(event.target.value); setSaved(false); }} placeholder={t('notesEmpty')} />
        <div className="mt-2 flex items-center gap-3">
          <button className="btn btn-primary text-xs" onClick={() => { void saveNote(lesson.id, note).then(() => setSaved(true)); }}><Save className="h-4 w-4" /> {t('saveNotes')}</button>
          {saved && <span className="text-xs text-emerald-500">{t('notesSaved')}</span>}
        </div>
      </section>

      <Notice>{t('scienceNote')}</Notice>
      <button className="btn w-full" onClick={() => navigate('courses')}><ChevronDown className="h-4 w-4 rotate-90" /> {t('back')}</button>
    </div>
  );
}
