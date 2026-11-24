import type {
  DiagramSpec,
  EducationLevelId,
  Law,
  Lesson,
  Localized,
  MCQ,
  PracticeQuestion,
  WorkedExample,
} from './types';

export interface LessonSeed {
  id: string;
  chapterId: string;
  level: EducationLevelId;
  title: Localized;
  summary: Localized;
  definition: Localized;
  explanation: Localized;
  statement?: Localized;
  conditions?: Localized;
  derivation: Localized;
  formula?: string;
  variables?: Array<{ symbol: string; meaning: Localized; unit: string }>;
  siUnit: Localized;
  dimension?: string;
  assumptions: Localized;
  examples: Localized[];
  applications: Localized[];
  mistakes: Localized[];
  notes: Localized[];
  related: string[];
  diagram: Pick<DiagramSpec, 'kind' | 'labels' | 'shapes'>;
  worked: WorkedExample[];
  practice: PracticeQuestion[];
  mcqs: MCQ[];
  isLaw?: boolean;
}

export const L = (en: string, hi: string): Localized => ({ en, hi });

export function variable(symbol: string, meaningEn: string, meaningHi: string, unit: string) {
  return { symbol, meaning: L(meaningEn, meaningHi), unit };
}

export function example(
  id: string,
  question: Localized,
  given: Localized,
  required: Localized,
  formula: string,
  steps: Localized[],
  answer: Localized,
): WorkedExample {
  return { id, question, given, required, formula, steps, answer };
}

export function practice(id: string, prompt: Localized, answer: Localized, solution: Localized, hint?: Localized): PracticeQuestion {
  return { id, prompt, answer, solution, hint };
}

export function mcq(id: string, prompt: Localized, options: Localized[], correctIndex: number, explanation: Localized): MCQ {
  return { id, prompt, options, correctIndex, explanation };
}

export function makeLesson(seed: LessonSeed): Lesson {
  const diagram: DiagramSpec = {
    id: `diagram-${seed.id}`,
    caption: L('Labelled schematic diagram', 'लेबल सहित योजनात्मक चित्र'),
    kind: seed.diagram.kind,
    labels: seed.diagram.labels,
    shapes: seed.diagram.shapes,
  };
  const lesson: Lesson = {
    id: seed.id,
    chapterId: seed.chapterId,
    level: seed.level,
    title: seed.title,
    summary: seed.summary,
    introduction: seed.summary,
    definition: seed.definition,
    explanation: seed.explanation,
    diagram,
    realLifeExamples: seed.examples,
    derivation: seed.derivation,
    formula: seed.formula,
    variables: seed.variables,
    siUnits: seed.siUnit,
    dimensions: seed.dimension,
    applications: seed.applications,
    commonMistakes: seed.mistakes,
    relatedConcepts: seed.related,
    workedExamples: seed.worked,
    practiceQuestions: seed.practice,
    mcqs: seed.mcqs,
    revisionNotes: seed.notes,
    assumptions: seed.assumptions,
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  return lesson;
}

export function makeLaw(seed: LessonSeed, lawId: string): Law {
  return {
    ...makeLesson(seed),
    id: lawId,
    lawId,
    title: seed.title,
    statement: seed.statement ?? seed.definition,
    conditions: seed.conditions ?? seed.assumptions,
    relatedConcepts: seed.related,
  };
}
