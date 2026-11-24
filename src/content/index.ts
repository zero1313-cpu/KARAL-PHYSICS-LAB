import { chapters as curriculumChapters, educationLevels } from './curriculum';
import { experiments as builtInExperiments } from './experiments';
import { formulas as builtInFormulas } from './formulas';
import { examplePack, validateContentPack } from './packs';
import { buildQuizzes } from './quizzes';
import { mechanicsLawLessons } from './seeds/mechanics';
import { electricityOpticsLawLessons } from './seeds/electricityOptics';
import { makeLesson, L, type LessonSeed } from './lessonFactory';
import { numericalTemplates } from './numericals';
import { formatScientific } from '@/physics/units';
import type {
  Chapter,
  ContentPack,
  EducationLevel,
  Experiment,
  FormulaEntry,
  Law,
  Lesson,
  Localized,
  Quiz,
  QuizQuestion,
} from './types';

export { educationLevels, builtInExperiments, builtInFormulas, examplePack, validateContentPack };
export type { Chapter, ContentPack, EducationLevel, Experiment, FormulaEntry, Law, Lesson, Localized, Quiz };

export const builtInLawLessons: Law[] = [...mechanicsLawLessons, ...electricityOpticsLawLessons];
export const lawLibrary: Law[] = builtInLawLessons;

interface TopicGuide {
  examples: Localized[];
  applications: Localized[];
  mistakes: Localized[];
  notes: Localized[];
  kind: NonNullable<LessonSeed['diagram']>['kind'];
}

const genericGuide: TopicGuide = {
  examples: [L('A measured quantity in a school laboratory or everyday situation.', 'विद्यालयी प्रयोगशाला या दैनिक जीवन की कोई मापी गई राशि।')],
  applications: [L('Solving chapter numericals with SI units and stated assumptions.', 'SI इकाइयों और दी गई मान्यताओं के साथ अध्याय के हल करना।')],
  mistakes: [L('Using a formula without checking the physical conditions.', 'भौतिक परिस्थितियाँ जाँचे बिना सूत्र लगाना।')],
  notes: [L('Keep quantities in SI units unless the problem states otherwise.', 'जब तक प्रश्न में न कहा जाए, राशियाँ SI इकाइयों में रखें।')],
  kind: 'generic',
};

const topicGuides: Record<string, TopicGuide> = {
  motion: {
    examples: [L('A bus changing speed on a straight road.', 'सीधी सड़क पर गति बदलती बस।'), L('A ball thrown upward and returning to the hand.', 'ऊपर फेंकी गई गेंद का वापस हाथ में आना।')],
    applications: [L('Calculating stopping distance and travel time.', 'रुकने की दूरी और यात्रा समय की गणना।')],
    mistakes: [L('Mixing distance with displacement or speed with velocity.', 'दूरी और विस्थापन या चाल और वेग को मिलाना।')],
    notes: [L('Choose a sign convention before substituting values.', 'मान डालने से पहले चिह्न परंपरा चुनें।')],
    kind: 'force',
  },
  force: {
    examples: [L('Pushing a shopping trolley.', 'खरीदारी की गाड़ी को धक्का देना।')],
    applications: [L('Free-body diagrams and equilibrium analysis.', 'मुक्त-पिंड आरेख और संतुलन विश्लेषण।')],
    mistakes: [L('Forgetting action–reaction pairs act on different bodies.', 'क्रिया–प्रतिक्रिया युग्म अलग पिंडों पर होते हैं—भूलना।')],
    notes: [L('Draw all forces before writing equations.', 'समीकरण लिखने से पहले सभी बल खींचें।')],
    kind: 'force',
  },
  electricity: {
    examples: [L('A torch circuit with a cell, switch and bulb.', 'सेल, स्विच और बल्ब वाला टॉर्च परिपथ।')],
    applications: [L('Choosing safe current ratings for household circuits.', 'घरेलू परिपथों के लिए सुरक्षित धारा रेटिंग चुनना।')],
    mistakes: [L('Connecting an ammeter in parallel or a voltmeter in series.', 'एमीटर समान्तर या वोल्टमीटर श्रेणी में जोड़ना।')],
    notes: [L('Conventional current flows from higher to lower potential.', 'पारंपरिक धारा उच्च से निम्न विभव की ओर बहती है।')],
    kind: 'circuit',
  },
  optics: {
    examples: [L('A ray of light bending as it enters water.', 'पानी में प्रवेश करते समय प्रकाश किरण का मुड़ना।')],
    applications: [L('Lens design, mirrors and optical instruments.', 'लेंस डिज़ाइन, दर्पण और प्रकाश उपकरण।')],
    mistakes: [L('Mixing real and virtual image sign conventions.', 'वास्तविक और आभासी प्रतिबिंब के चिह्न नियम मिलाना।')],
    notes: [L('Draw at least two principal rays to locate an image.', 'प्रतिबिंब ज्ञात करने के लिए कम से कम दो मुख्य किरणें खींचें।')],
    kind: 'ray',
  },
  waves: {
    examples: [L('Ripples on water and sound from a tuning fork.', 'जल पर तरंगें और ट्यूनिंग फोर्क की ध्वनि।')],
    applications: [L('Sound intensity, resonance and signal frequencies.', 'ध्वनि तीव्रता, अनुनाद और संकेत आवृत्तियाँ।')],
    mistakes: [L('Confusing amplitude with wavelength.', 'आयाम और तरंगदैर्घ्य को मिलाना।')],
    notes: [L('For a travelling wave, v = fλ.', 'संचारी तरंग के लिए v = fλ।')],
    kind: 'wave',
  },
  thermal: {
    examples: [L('Heating water and observing temperature change.', 'पानी गरम कर ताप परिवर्तन देखना।')],
    applications: [L('Heat engines, refrigeration and weather models.', 'ऊष्मा इंजन, शीतलन और मौसम मॉडल।')],
    mistakes: [L('Using Celsius temperature in gas-law ratios.', 'गैस नियम अनुपातों में सेल्सियस ताप लगाना।')],
    notes: [L('Use absolute temperature in thermodynamic equations.', 'तापगतिक समीकरणों में पूर्ण ताप लगाएँ।')],
    kind: 'energy',
  },
  quantum: {
    examples: [L('Photoelectric emission from a clean metal surface.', 'स्वच्छ धातु सतह से प्रकाश-विद्युत उत्सर्जन।')],
    applications: [L('Photodiodes, lasers and atomic spectra.', 'फोटोडायोड, लेज़र और परमाणु स्पेक्ट्रम।')],
    mistakes: [L('Treating the Bohr orbit as a literal classical path.', 'बोर कक्षा को वास्तविक शास्त्रीय पथ मानना।')],
    notes: [L('Quantum models have domains set by experiment, not visual intuition.', 'क्वांटम मॉडलों की सीमाएँ प्रयोग निर्धारित करती हैं, दृश्य अंतर्ज्ञान नहीं।')],
    kind: 'field',
  },
};

function guideFor(tags: string[]): TopicGuide {
  for (const tag of tags) {
    const guide = topicGuides[tag];
    if (guide) return guide;
  }
  if (tags.includes('newton')) return topicGuides.force;
  if (tags.includes('light')) return topicGuides.optics;
  if (tags.includes('sound')) return topicGuides.waves;
  if (tags.includes('gas')) return topicGuides.thermal;
  return genericGuide;
}

function chapterOverview(chapter: Chapter): Lesson {
  const guide = guideFor(chapter.tags);
  const level = educationLevels.find((item) => item.id === chapter.level);
  const template = numericalTemplates.find((item) => item.chapterId === chapter.id) ?? numericalTemplates[0];
  const solution = template.solve(template.defaults);
  const given: Localized = {
    en: Object.entries(template.defaults).map(([key, value]) => `${key} = ${value}`).join(', '),
    hi: Object.entries(template.defaults).map(([key, value]) => `${key} = ${value}`).join(', '),
  };
  const seed: LessonSeed = {
    id: `overview-${chapter.id}`,
    chapterId: chapter.id,
    level: chapter.level,
    title: L(`${chapter.title.en}: chapter overview`, `${chapter.title.hi}: अध्याय अवलोकन`),
    summary: L(
      `An offline overview of ${chapter.title.en} with core ideas, assumptions, a worked numerical and links to the law library.`,
      `${chapter.title.hi} का ऑफ़लाइन अवलोकन—मुख्य विचार, मान्यताएँ, हल किया गया संख्यात्मक प्रश्न और नियम पुस्तकालय के लिंक।`,
    ),
    definition: L(
      `${chapter.title.en} collects the definitions, relations and methods used to describe ${chapter.tags.join(', ')} at ${level?.name.en ?? 'this'} level.`,
      `${chapter.title.hi} में ${level?.name.hi ?? 'इस'} स्तर पर ${chapter.tags.join(', ')} का वर्णन करने वाली परिभाषाएँ, संबंध और विधियाँ शामिल हैं।`,
    ),
    explanation: L(
      'Study each law separately for its derivation and limits, then return here to connect the ideas. The numerical below uses the chapter formula with SI values.',
      'हर नियम का व्युप्पत्ति और सीमाएँ अलग पढ़ें, फिर यहाँ लौटकर विचारों को जोड़ें। नीचे संख्यात्मक प्रश्न अध्याय सूत्र और SI मानों का उपयोग करता है।',
    ),
    derivation: L(
      'The relations in this chapter follow from the listed law lessons. Each law states its own assumptions before any formula is applied.',
      'इस अध्याय के संबंध सूचीबद्ध नियम पाठों से आते हैं। किसी सूत्र से पहले हर नियम अपनी मान्यताएँ बताता है।',
    ),
    formula: template.formulaLatex,
    siUnit: L(`Answer unit: ${solution.unit}`, `उत्तर की इकाई: ${solution.unit}`),
    dimension: 'See the formula book for quantity-specific dimensions.',
    assumptions: L(
      'These are idealized models for learning. Real systems may include friction, losses, non-linearity and measurement uncertainty.',
      'ये अध्ययन के लिए आदर्शीकृत मॉडल हैं। वास्तविक निकायों में घर्षण, हानि, गैर-रैखिकता और माप अनिश्चितता हो सकती है।',
    ),
    examples: guide.examples,
    applications: guide.applications,
    mistakes: guide.mistakes,
    notes: [...guide.notes, L('Curriculum lists are community-maintained outlines, not official board syllabi.', 'पाठ्यक्रम सूचियाँ सामुदायिक रूप से बनाए गए खाके हैं, आधिकारिक बोर्ड पाठ्यक्रम नहीं हैं।')],
    related: chapter.tags,
    diagram: { kind: guide.kind, labels: [chapter.title, ...chapter.tags.slice(0, 2).map((tag) => L(tag, tag))] },
    worked: [
      {
        id: `overview-worked-${chapter.id}`,
        question: template.title,
        given,
        required: L('Find the quantity asked for by the chapter formula.', 'अध्याय सूत्र द्वारा पूछी गई राशि ज्ञात करें।'),
        formula: template.formulaLatex,
        steps: solution.steps,
        answer: L(`${formatScientific(solution.value)} ${solution.unit}`, `${formatScientific(solution.value)} ${solution.unit}`),
      },
    ],
    practice: [
      {
        id: `overview-practice-${chapter.id}`,
        prompt: L(`Which relation is used in the worked example for ${chapter.title.en}?`, `${chapter.title.hi} के हल किए गए उदाहरण में कौन सा संबंध लगता है?`),
        answer: L(template.formulaLatex, template.formulaLatex),
        solution: L(template.formulaExplanation.en, template.formulaExplanation.hi),
        hint: L('Look at the formula line above the worked example.', 'हल किए गए उदाहरण के ऊपर सूत्र पंक्ति देखें।'),
      },
    ],
    mcqs: [
      {
        id: `overview-mcq-${chapter.id}`,
        prompt: L(`What is the SI unit of the answer in the ${chapter.title.en} worked example?`, `${chapter.title.hi} के हल उदाहरण में उत्तर की SI इकाई क्या है?`),
        options: [L(solution.unit, solution.unit), L('kg', 'kg'), L('m', 'm'), L('s', 's')],
        correctIndex: 0,
        explanation: L('The solver reports the result in the SI unit shown in its final answer.', 'हलकर्ता परिणाम अंतिम उत्तर में दी गई SI इकाई में बताता है।'),
      },
    ],
    isLaw: false,
  };
  return makeLesson(seed);
}

const overviewLessons = curriculumChapters.map(chapterOverview);
const combinedLessons: Lesson[] = [...builtInLawLessons, ...overviewLessons];

function attachLessonIds(chapter: Chapter): Chapter {
  return { ...chapter, lessonIds: combinedLessons.filter((lesson) => lesson.chapterId === chapter.id).map((lesson) => lesson.id) };
}

export const builtInChapters: Chapter[] = curriculumChapters.map(attachLessonIds);
export const builtInLessons: Lesson[] = combinedLessons.map((lesson) => {
  const chapter = builtInChapters.find((item) => item.id === lesson.chapterId);
  return chapter && !chapter.lessonIds.includes(lesson.id) ? { ...lesson, chapterId: chapter.id } : lesson;
});

export interface AppContent {
  chapters: Chapter[];
  lessons: Lesson[];
  laws: Law[];
  formulas: FormulaEntry[];
  experiments: Experiment[];
  quizzes: Quiz[];
  packs: ContentPack[];
}

/** Merge bundled content with validated local packs. Duplicate IDs are replaced by the last installed pack. */
export function buildContent(packs: ContentPack[] = []): AppContent {
  if (packs.length === 0) {
    return {
      chapters: builtInChapters,
      lessons: builtInLessons,
      laws: lawLibrary,
      formulas: builtInFormulas,
      experiments: builtInExperiments,
      quizzes: buildQuizzes(builtInLessons),
      packs: [],
    };
  }
  const packChapters = packs.flatMap((pack) => pack.chapters ?? []);
  const chapters = [...builtInChapters, ...packChapters];
  const packLessons = packs.flatMap((pack) => pack.lessons ?? []);
  const lessons = mergeById(builtInLessons, packLessons);
  const laws = lessons.filter((lesson): lesson is Law => Boolean((lesson as Law).lawId));
  const formulas = mergeById(builtInFormulas, packs.flatMap((pack) => pack.formulas ?? []));
  const experiments = mergeById(builtInExperiments, packs.flatMap((pack) => pack.experiments ?? []));
  const packQuestions = packs.flatMap((pack) => pack.questions ?? []);
  const quizzes = buildQuizzes(lessons);
  for (const pack of packs) {
    const questions = packQuestions.filter((q) => (pack.questions ?? []).includes(q));
    if (questions.length === 0) continue;
    quizzes.unshift({
      id: `quiz-pack-${pack.id}`,
      title: pack.name,
      chapterId: questions[0].chapterId,
      level: questions[0].level,
      timeLimitSeconds: Math.max(60, questions.length * 15),
      questions,
    });
  }
  return {
    chapters: chapters.map((chapter) => ({
      ...chapter,
      lessonIds: [...new Set([...chapter.lessonIds, ...lessons.filter((lesson) => lesson.chapterId === chapter.id).map((lesson) => lesson.id)])],
    })),
    lessons,
    laws,
    formulas,
    experiments,
    quizzes,
    packs,
  };
}

function mergeById<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const map = new Map(base.map((item) => [item.id, item]));
  for (const item of extra) map.set(item.id, item);
  return [...map.values()];
}

export function findLesson(content: AppContent, id: string): Lesson | undefined {
  return content.lessons.find((lesson) => lesson.id === id);
}

export function findQuiz(content: AppContent, id: string): Quiz | undefined {
  return content.quizzes.find((quiz) => quiz.id === id);
}

export function questionsForChapter(content: AppContent, chapterId: string): QuizQuestion[] {
  return content.quizzes.filter((quiz) => quiz.chapterId === chapterId).flatMap((quiz) => quiz.questions);
}
