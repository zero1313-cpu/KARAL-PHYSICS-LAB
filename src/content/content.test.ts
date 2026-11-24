import { describe, expect, it } from 'vitest';
import {
  builtInChapters,
  builtInExperiments,
  builtInFormulas,
  builtInLessons,
  buildContent,
  educationLevels,
  examplePack,
  lawLibrary,
  validateContentPack,
} from '@/content';
import { numericalTemplates } from '@/content/numericals';
import { simulationById } from '@/simulations/registry';
import type { Law, Localized, QuizQuestion } from '@/content/types';

function expectLocalized(value: Localized, label: string): void {
  expect(typeof value.en, `${label} English`).toBe('string');
  expect(typeof value.hi, `${label} Hindi`).toBe('string');
  expect(value.en.trim().length, `${label} English text`).toBeGreaterThan(0);
  expect(value.hi.trim().length, `${label} Hindi text`).toBeGreaterThan(0);
}

describe('curriculum and lesson integrity', () => {
  it('covers every education level with chapters and lessons', () => {
    const levelIds = educationLevels.map((level) => level.id);
    expect(new Set(builtInChapters.map((chapter) => chapter.level))).toEqual(new Set(levelIds));
    expect(builtInChapters.length).toBeGreaterThan(50);
    expect(builtInLessons.length).toBeGreaterThan(builtInChapters.length);
    for (const level of educationLevels) expectLocalized(level.name, `level ${level.id} name`);
  });

  it('has unique ids and valid chapter links', () => {
    const chapterIds = new Set(builtInChapters.map((chapter) => chapter.id));
    expect(chapterIds.size).toBe(builtInChapters.length);
    const lessonIds = new Set(builtInLessons.map((lesson) => lesson.id));
    expect(lessonIds.size).toBe(builtInLessons.length);
    for (const chapter of builtInChapters) {
      expect(chapter.lessonIds.length).toBeGreaterThan(0);
      for (const id of chapter.lessonIds) expect(lessonIds.has(id)).toBe(true);
    }
    for (const lesson of builtInLessons) {
      expect(chapterIds.has(lesson.chapterId)).toBe(true);
      expect(lesson.level).toBe(builtInChapters.find((chapter) => chapter.id === lesson.chapterId)?.level);
    }
  });

  it('gives every lesson all required bilingual sections and exercises', () => {
    for (const lesson of builtInLessons) {
      const label = `lesson ${lesson.id}`;
      for (const field of ['title', 'summary', 'introduction', 'definition', 'explanation', 'siUnits', 'assumptions'] as const) {
        expectLocalized(lesson[field] as Localized, `${label} ${field}`);
      }
      expect(lesson.derivation?.en.trim().length, `${label} derivation`).toBeGreaterThan(0);
      expect(lesson.diagram.labels.length, `${label} diagram labels`).toBeGreaterThan(0);
      expect(lesson.realLifeExamples.length, `${label} examples`).toBeGreaterThan(0);
      expect(lesson.applications.length, `${label} applications`).toBeGreaterThan(0);
      expect(lesson.commonMistakes.length, `${label} mistakes`).toBeGreaterThan(0);
      expect(lesson.revisionNotes.length, `${label} revision notes`).toBeGreaterThan(0);
      expect(lesson.workedExamples.length, `${label} worked examples`).toBeGreaterThan(0);
      expect(lesson.practiceQuestions.length, `${label} practice`).toBeGreaterThan(0);
      expect(lesson.mcqs.length, `${label} MCQs`).toBeGreaterThan(0);
      for (const worked of lesson.workedExamples) {
        expectLocalized(worked.question, `${label} worked question`);
        expectLocalized(worked.given, `${label} worked given`);
        expectLocalized(worked.required, `${label} worked required`);
        expect(worked.formula.trim().length).toBeGreaterThan(0);
        expect(worked.steps.length).toBeGreaterThan(0);
        expectLocalized(worked.answer, `${label} worked answer`);
      }
      for (const question of lesson.practiceQuestions) {
        expectLocalized(question.prompt, `${label} practice question`);
        expectLocalized(question.answer, `${label} practice answer`);
        expectLocalized(question.solution, `${label} practice solution`);
      }
      for (const question of lesson.mcqs) {
        expectLocalized(question.prompt, `${label} MCQ`);
        expectLocalized(question.explanation, `${label} MCQ explanation`);
      }
      for (const mcq of lesson.mcqs) {
        expect(mcq.options.length).toBeGreaterThan(1);
        expect(mcq.correctIndex).toBeGreaterThanOrEqual(0);
        expect(mcq.correctIndex).toBeLessThan(mcq.options.length);
      }
    }
  });

  it('provides law statements, conditions and assumptions', () => {
    expect(lawLibrary.length).toBeGreaterThanOrEqual(20);
    for (const law of lawLibrary) {
      expectLocalized((law as Law).statement, `${law.id} statement`);
      expectLocalized((law as Law).conditions, `${law.id} conditions`);
      expect(law.formula?.trim().length).toBeGreaterThan(0);
      expect(law.dimensions?.trim().length).toBeGreaterThan(0);
      expect(law.relatedConcepts.length).toBeGreaterThan(0);
    }
  });

  it('contains no placeholder markers in bundled bilingual text', () => {
    const bundled = [...builtInLessons, ...builtInExperiments, ...builtInFormulas, ...lawLibrary];
    for (const item of bundled) {
      const serialized = JSON.stringify(item);
      expect(serialized, `placeholder in ${item.id}`).not.toMatch(/TODO|FIXME|<PUT>|PLACEHOLDER/i);
    }
  });
});

describe('formula book, numericals and experiments', () => {
  it('has searchable formulas with SI units and dimensions', () => {
    expect(builtInFormulas.length).toBeGreaterThan(20);
    const ids = new Set(builtInFormulas.map((formula) => formula.id));
    expect(ids.size).toBe(builtInFormulas.length);
    for (const formula of builtInFormulas) {
      expectLocalized(formula.name, `formula ${formula.id} name`);
      expect(formula.latex.trim().length).toBeGreaterThan(0);
      expect(formula.plain.trim().length).toBeGreaterThan(0);
      expect(formula.siUnit.trim().length).toBeGreaterThan(0);
      expect(formula.dimension.trim().length).toBeGreaterThan(0);
      expectLocalized(formula.description, `formula ${formula.id} description`);
    }
  });

  it('solves every numerical deterministically with finite SI answers', () => {
    expect(numericalTemplates.length).toBeGreaterThan(15);
    for (const template of numericalTemplates) {
      const label = `numerical ${template.id}`;
      for (const [key, value] of Object.entries(template.defaults)) {
        const input = template.inputs.find((item) => item.key === key);
        expect(input, `${label} missing input ${key}`).toBeDefined();
        expect(value).toBeGreaterThanOrEqual(input!.min);
        expect(value).toBeLessThanOrEqual(input!.max);
      }
      const first = template.solve(template.defaults);
      const second = template.solve(template.defaults);
      expect(Number.isFinite(first.value), label).toBe(true);
      expect(first.value, label).toBe(second.value);
      expect(first.unit.trim().length, label).toBeGreaterThan(0);
      expect(first.steps.length, label).toBeGreaterThan(0);
      expect(template.formulaLatex.trim().length, label).toBeGreaterThan(0);
    }
  });

  it('links virtual experiments to real simulation definitions', () => {
    expect(builtInExperiments.length).toBeGreaterThan(5);
    for (const experiment of builtInExperiments) {
      expectLocalized(experiment.title, `experiment ${experiment.id} title`);
      expect(experiment.procedure.length).toBeGreaterThan(0);
      expect(experiment.observations.length).toBeGreaterThan(0);
      expect(experiment.precautions.length).toBeGreaterThan(0);
      expect(experiment.viva.length).toBeGreaterThan(0);
      if (experiment.simulationId) expect(simulationById.has(experiment.simulationId)).toBe(true);
    }
  });
});

describe('quizzes and local content packs', () => {
  it('builds chapter-wise quizzes with valid timed questions', () => {
    const content = buildContent();
    expect(content.quizzes.length).toBeGreaterThan(10);
    for (const quiz of content.quizzes) {
      expect(quiz.timeLimitSeconds).toBeGreaterThan(0);
      expect(quiz.questions.length).toBeGreaterThan(0);
      for (const question of quiz.questions as QuizQuestion[]) {
        expectLocalized(question.prompt, `question ${question.id}`);
        expect(question.options.length).toBeGreaterThan(1);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(question.options.length);
      }
    }
  });

  it('validates untrusted packs and merges accepted content locally', () => {
    expect(() => validateContentPack({ ...examplePack, schemaVersion: 99 })).toThrow(/schema/i);
    expect(() => validateContentPack({ nope: true })).toThrow(/schema/i);
    const pack = validateContentPack(JSON.parse(JSON.stringify(examplePack)) as unknown);
    expect(pack.id).toBe(examplePack.id);
    const merged = buildContent([pack]);
    expect(merged.formulas.some((formula) => formula.id === 'pack-kinetic-energy')).toBe(true);
    expect(merged.packs).toHaveLength(1);
  });
});
