import { chapters, educationLevels } from './curriculum';
import { formulas } from './formulas';
import type { EducationLevelId, Localized, Quiz, QuizQuestion } from './types';

const L = (en: string, hi: string): Localized => ({ en, hi });

const levelOf = new Map(educationLevels.map((level) => [level.id, level]));

function topicFromChapter(chapterId: string): string {
  return chapters.find((chapter) => chapter.id === chapterId)?.title.en ?? 'General physics';
}

function deriveQuestions(lessons: Array<{
  id: string;
  chapterId: string;
  level: EducationLevelId;
  title: Localized;
  mcqs: Array<{ id: string; prompt: Localized; options: Localized[]; correctIndex: number; explanation: Localized }>;
}>): QuizQuestion[] {
  return lessons.flatMap((lesson) =>
    lesson.mcqs.map((mcq) => ({
      ...mcq,
      id: `quizq-${mcq.id}`,
      chapterId: lesson.chapterId,
      level: lesson.level,
      difficulty: 'medium' as const,
      topic: topicFromChapter(lesson.chapterId),
    })),
  );
}

/** Deterministic questions generated from the local formula book. No network or random numbers. */
function formulaQuestions(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  formulas.forEach((formula, index) => {
    const unitOptions = [formula, ...formulas.filter((other) => other.siUnit !== formula.siUnit).slice(index + 1, index + 4)];
    while (unitOptions.length < 4) {
      const fallback = formulas.find((other) => !unitOptions.includes(other) && other.siUnit !== formula.siUnit);
      if (!fallback) break;
      unitOptions.push(fallback);
    }
    if (unitOptions.length === 4) {
      const rotated = unitOptions.slice(1).concat(unitOptions.slice(0, 1));
      const correctIndex = rotated.findIndex((item) => item.id === formula.id);
      questions.push({
        id: `quizq-unit-${formula.id}`,
        prompt: L(`What is the SI unit of ${formula.name.en}?`, `${formula.name.hi} की SI इकाई क्या है?`),
        options: rotated.map((item) => L(item.siUnit, item.siUnit)),
        correctIndex,
        explanation: L(`${formula.name.en}: ${formula.plain}. SI unit: ${formula.siUnit}.`, `${formula.name.hi}: ${formula.plain}। SI इकाई: ${formula.siUnit}।`),
        chapterId: 'class-11-physical-world',
        level: 'class-11',
        difficulty: 'easy',
        topic: 'Units and measurements',
      });
    }
    const relationOptions = [formula, ...formulas.filter((other) => other.id !== formula.id).slice(index + 2, index + 5)];
    while (relationOptions.length < 4) {
      const fallback = formulas.find((other) => !relationOptions.includes(other));
      if (!fallback) break;
      relationOptions.push(fallback);
    }
    if (relationOptions.length === 4) {
      const rotated = relationOptions.slice(2).concat(relationOptions.slice(0, 2));
      questions.push({
        id: `quizq-relation-${formula.id}`,
        prompt: L(`Which relation represents ${formula.name.en}?`, `${formula.name.hi} का संबंध कौन सा है?`),
        options: rotated.map((item) => L(item.plain, item.plain)),
        correctIndex: rotated.findIndex((item) => item.id === formula.id),
        explanation: L(`${formula.name.en} is written as ${formula.plain}.`, `${formula.name.hi} को ${formula.plain} लिखा जाता है।`),
        chapterId: 'class-11-physical-world',
        level: 'class-11',
        difficulty: 'medium',
        topic: 'Formula recognition',
      });
    }
  });
  return questions;
}

const generalPool = formulaQuestions();

export function buildQuizzes(
  lessons: Array<{
    id: string;
    chapterId: string;
    level: EducationLevelId;
    title: Localized;
    mcqs: Array<{ id: string; prompt: Localized; options: Localized[]; correctIndex: number; explanation: Localized }>;
  }>,
): Quiz[] {
  const byChapter = new Map<string, QuizQuestion[]>();
  for (const question of deriveQuestions(lessons)) {
    const list = byChapter.get(question.chapterId) ?? [];
    if (!list.some((existing) => existing.id === question.id)) list.push(question);
    byChapter.set(question.chapterId, list);
  }

  return chapters.map((chapter) => {
    const own = byChapter.get(chapter.id) ?? [];
    const needed = Math.max(6, Math.min(10, own.length));
    const fillers = generalPool.filter((question) => !own.some((item) => item.id === question.id));
    const selected = [...own];
    for (let i = 0; selected.length < needed && i < fillers.length; i++) {
      const source = fillers[i];
      selected.push({
        ...source,
        id: `${source.id}-${chapter.id}`,
        chapterId: chapter.id,
        level: chapter.level,
        topic: topicFromChapter(chapter.id),
      });
    }
    return {
      id: `quiz-${chapter.id}`,
      title: L(`${chapter.title.en} quiz`, `${chapter.title.hi} क्विज़`),
      chapterId: chapter.id,
      level: chapter.level,
      timeLimitSeconds: Math.max(90, selected.length * 15),
      questions: selected,
    };
  });
}

export const builtInQuizzes = buildQuizzes([]);

export function levelName(level: EducationLevelId, lang: 'en' | 'hi'): string {
  return levelOf.get(level)?.name[lang] ?? level;
}
