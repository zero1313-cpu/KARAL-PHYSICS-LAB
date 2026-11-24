export type Lang = 'en' | 'hi';
export type Localized = Record<Lang, string>;

export type EducationLevelId =
  | 'class-6-8'
  | 'class-9-10'
  | 'class-11'
  | 'class-12'
  | 'diploma'
  | 'undergraduate'
  | 'advanced';

export interface EducationLevel {
  id: EducationLevelId;
  name: Localized;
  description: Localized;
  icon: string;
  accent: string;
}

export interface Chapter {
  id: string;
  level: EducationLevelId;
  title: Localized;
  lessonIds: string[];
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface LessonSection {
  id: string;
  title: Localized;
  body: Localized;
  latex?: string;
}

export interface WorkedExample {
  id: string;
  question: Localized;
  given: Localized;
  required: Localized;
  formula: string;
  steps: Localized[];
  answer: Localized;
}

export interface PracticeQuestion {
  id: string;
  prompt: Localized;
  hint?: Localized;
  answer: Localized;
  solution: Localized;
}

export interface MCQ {
  id: string;
  prompt: Localized;
  options: Localized[];
  correctIndex: number;
  explanation: Localized;
}

export interface DiagramSpec {
  id: string;
  caption: Localized;
  kind: 'force' | 'circuit' | 'ray' | 'wave' | 'energy' | 'field' | 'generic';
  labels: Localized[];
  /** Generic schematic geometry normalized to 0..100. */
  shapes?: Array<{ type: 'line' | 'box' | 'circle' | 'arrow'; x1: number; y1: number; x2: number; y2: number }>;
}

export interface Lesson {
  id: string;
  chapterId: string;
  level: EducationLevelId;
  title: Localized;
  summary: Localized;
  introduction: Localized;
  definition: Localized;
  explanation: Localized;
  diagram: DiagramSpec;
  realLifeExamples: Localized[];
  derivation?: Localized;
  formula?: string;
  variables?: Array<{ symbol: string; meaning: Localized; unit: string }>;
  siUnits?: Localized;
  dimensions?: string;
  applications: Localized[];
  commonMistakes: Localized[];
  relatedConcepts: string[];
  workedExamples: WorkedExample[];
  practiceQuestions: PracticeQuestion[];
  mcqs: MCQ[];
  revisionNotes: Localized[];
  assumptions?: Localized;
  updatedAt: string;
}

export interface Law extends Lesson {
  lawId: string;
  statement: Localized;
  conditions: Localized;
}

export interface FormulaEntry {
  id: string;
  name: Localized;
  category: string;
  latex: string;
  plain: string;
  symbols: Array<{ symbol: string; meaning: Localized; unit: string }>;
  siUnit: string;
  dimension: string;
  related: string[];
  description: Localized;
  notes?: Localized;
  chapterIds?: string[];
}

export interface NumericalTemplate {
  id: string;
  title: Localized;
  difficulty: 'easy' | 'medium' | 'hard';
  chapterId: string;
  topic: string;
  /** JSON-serialized named inputs, e.g. { mass: 2, acceleration: 3 } */
  defaults: Record<string, number>;
  inputs: Array<{ key: string; label: Localized; unit: string; min: number; max: number; step: number }>;
  formulaLatex: string;
  formulaExplanation: Localized;
  solve: (v: Record<string, number>) => { value: number; unit: string; steps: Localized[] };
  hint: Localized;
}

export interface Experiment {
  id: string;
  title: Localized;
  chapterId: string;
  level: EducationLevelId;
  aim: Localized;
  apparatus: Localized[];
  theory: Localized;
  diagram: DiagramSpec;
  procedure: Localized[];
  observations: Localized[];
  calculation: Localized;
  result: Localized;
  precautions: Localized[];
  viva: Array<{ q: Localized; a: Localized }>;
  simulationId?: string;
}

export interface QuizQuestion extends MCQ {
  chapterId: string;
  level: EducationLevelId;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface Quiz {
  id: string;
  title: Localized;
  chapterId: string;
  level: EducationLevelId;
  timeLimitSeconds: number;
  questions: QuizQuestion[];
}

export interface ContentPack {
  schemaVersion: number;
  id: string;
  name: Localized;
  description: Localized;
  builtIn: boolean;
  lessons?: Lesson[];
  formulas?: FormulaEntry[];
  questions?: QuizQuestion[];
  experiments?: Experiment[];
  chapters?: Chapter[];
}
