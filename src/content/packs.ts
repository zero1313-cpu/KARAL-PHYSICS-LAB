import type { ContentPack, Experiment, FormulaEntry, Lesson, Localized, QuizQuestion, Chapter } from './types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLocalized(value: unknown): value is Localized {
  return isObject(value) && typeof value.en === 'string' && typeof value.hi === 'string';
}

function requireArray(value: unknown, field: string): unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`Content pack field ${field} must be an array`);
  return value;
}

function validateLessons(value: unknown): Lesson[] {
  return requireArray(value, 'lessons').map((raw, index) => {
    if (!isObject(raw) || typeof raw.id !== 'string' || typeof raw.chapterId !== 'string' || !isLocalized(raw.title)) {
      throw new Error(`Invalid lesson at index ${index}`);
    }
    return raw as unknown as Lesson;
  });
}

function validateFormulas(value: unknown): FormulaEntry[] {
  return requireArray(value, 'formulas').map((raw, index) => {
    if (!isObject(raw) || typeof raw.id !== 'string' || typeof raw.latex !== 'string' || !isLocalized(raw.name)) {
      throw new Error(`Invalid formula at index ${index}`);
    }
    return raw as unknown as FormulaEntry;
  });
}

function validateQuestions(value: unknown): QuizQuestion[] {
  return requireArray(value, 'questions').map((raw, index) => {
    if (!isObject(raw) || typeof raw.id !== 'string' || !Array.isArray(raw.options) || typeof raw.correctIndex !== 'number') {
      throw new Error(`Invalid question at index ${index}`);
    }
    if (raw.correctIndex < 0 || raw.correctIndex >= raw.options.length) throw new Error(`Invalid answer index at question ${index}`);
    return raw as unknown as QuizQuestion;
  });
}

function validateExperiments(value: unknown): Experiment[] {
  return requireArray(value, 'experiments').map((raw, index) => {
    if (!isObject(raw) || typeof raw.id !== 'string' || !isLocalized(raw.title)) throw new Error(`Invalid experiment at index ${index}`);
    return raw as unknown as Experiment;
  });
}

function validateChapters(value: unknown): Chapter[] {
  return requireArray(value, 'chapters').map((raw, index) => {
    if (!isObject(raw) || typeof raw.id !== 'string' || !isLocalized(raw.title) || typeof raw.level !== 'string') {
      throw new Error(`Invalid chapter at index ${index}`);
    }
    return { ...(raw as unknown as Chapter), lessonIds: Array.isArray(raw.lessonIds) ? (raw.lessonIds as string[]) : [] };
  });
}

/** Validate an untrusted local JSON pack before installing or merging it. */
export function validateContentPack(input: unknown): ContentPack {
  if (!isObject(input)) throw new Error('Content pack must be a JSON object');
  if (input.schemaVersion !== 1) throw new Error('Unsupported content pack schema');
  if (typeof input.id !== 'string' || input.id.length < 2) throw new Error('Content pack needs an id');
  if (!isLocalized(input.name) || !isLocalized(input.description)) throw new Error('Content pack needs bilingual name and description');
  const pack: ContentPack = {
    schemaVersion: 1,
    id: input.id,
    name: input.name,
    description: input.description,
    builtIn: false,
    lessons: validateLessons(input.lessons),
    formulas: validateFormulas(input.formulas),
    questions: validateQuestions(input.questions),
    experiments: validateExperiments(input.experiments),
    chapters: validateChapters(input.chapters),
  };
  const total = (pack.lessons?.length ?? 0) + (pack.formulas?.length ?? 0) + (pack.questions?.length ?? 0) + (pack.experiments?.length ?? 0);
  if (total === 0) throw new Error('Content pack has no usable content');
  return pack;
}

export const examplePack: ContentPack = {
  schemaVersion: 1,
  id: 'example-local-pack',
  name: L('Example extension pack', 'उदाहरण स्थानीय पैक'),
  description: L('Demonstrates the local content pack format. Replace it with your own offline studies.', 'स्थानीय कंटेंट पैक फ़ॉर्मैट का उदाहरण। अपने ऑफ़लाइन अध्ययन के लिए इसे बदलें।'),
  builtIn: false,
  formulas: [
    {
      id: 'pack-kinetic-energy',
      name: L('Kinetic energy reminder', 'गतिज ऊर्जा स्मरण'),
      category: 'Mechanics',
      latex: 'K = \\frac{1}{2}mv^2',
      plain: 'K = ½ m v²',
      symbols: [],
      siUnit: 'J',
      dimension: 'M L² T⁻²',
      related: [],
      description: L('A locally added formula entry.', 'स्थानीय रूप से जोड़ा गया सूत्र।'),
    },
  ],
};

function L(en: string, hi: string): Localized {
  return { en, hi };
}
