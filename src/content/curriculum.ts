import type { Chapter, EducationLevel, EducationLevelId, Localized } from './types';

export const educationLevels: EducationLevel[] = [
  { id: 'class-6-8', name: { en: 'Class 6–8', hi: 'कक्षा 6–8' }, description: { en: 'Foundations and everyday observations', hi: 'मूलभूत अवधारणाएँ और दैनिक प्रेक्षण' }, icon: 'sprout', accent: '#35D6DA' },
  { id: 'class-9-10', name: { en: 'Class 9–10', hi: 'कक्षा 9–10' }, description: { en: 'School-level core physics', hi: 'विद्यालय स्तर की मुख्य भौतिकी' }, icon: 'book', accent: '#9467F5' },
  { id: 'class-11', name: { en: 'Class 11', hi: 'कक्षा 11' }, description: { en: 'Mechanics, heat, oscillations and waves', hi: 'यांत्रिकी, ऊष्मा, दोलन और तरंगें' }, icon: 'atom', accent: '#A78BFA' },
  { id: 'class-12', name: { en: 'Class 12', hi: 'कक्षा 12' }, description: { en: 'Electricity, magnetism, optics and modern physics', hi: 'विद्युत, चुम्बकत्व, प्रकाशिकी और आधुनिक भौतिकी' }, icon: 'zap', accent: '#F5B971' },
  { id: 'diploma', name: { en: 'Diploma & Engineering', hi: 'डिप्लोमा और इंजीनियरिंग' }, description: { en: 'Applied and engineering physics', hi: 'व्यावहारिक और इंजीनियरिंग भौतिकी' }, icon: 'wrench', accent: '#60A5FA' },
  { id: 'undergraduate', name: { en: 'Undergraduate', hi: 'स्नातक' }, description: { en: 'BSc-level physics topics', hi: 'बीएससी स्तर के विषय' }, icon: 'graduation', accent: '#C084FC' },
  { id: 'advanced', name: { en: 'Advanced', hi: 'उन्नत' }, description: { en: 'Postgraduate foundations and advanced methods', hi: 'स्नातकोत्तर आधार और उन्नत विधियाँ' }, icon: 'orbit', accent: '#FB7185' },
];

const enToHi: Record<string, string> = {
  Measurement: 'मापन', Units: 'इकाइयाँ', Motion: 'गति', Force: 'बल', Pressure: 'दाब', Friction: 'घर्षण', Work: 'कार्य', Energy: 'ऊर्जा', Light: 'प्रकाश', Reflection: 'परावर्तन', Sound: 'ध्वनि', Electricity: 'विद्युत', Magnetism: 'चुम्बकत्व', Heat: 'ऊष्मा', 'Basic Astronomy': 'खगोल विज्ञान का परिचय', "Newton's Laws": 'न्यूटन के नियम', Gravitation: 'गुरुत्वाकर्षण', 'Work and Energy': 'कार्य और ऊर्जा', Momentum: 'संवेग', Refraction: 'अपवर्तन', 'Human Eye': 'मानव नेत्र', "Ohm's Law": 'ओम का नियम', Resistance: 'प्रतिरोध', 'Magnetic Effects of Current': 'धारा के चुम्बकीय प्रभाव', 'Sources of Energy': 'ऊर्जा के स्रोत', 'Physical World': 'भौतिक जगत', 'Units and Measurements': 'इकाइयाँ और मापन', Vectors: 'सदिश', Kinematics: 'गति विज्ञान', 'Laws of Motion': 'गति के नियम', 'Work Energy Power': 'कार्य, ऊर्जा और शक्ति', 'Rotational Motion': 'घूर्णन गति', 'Properties of Matter': 'पदार्थ के गुण', 'Thermal Physics': 'ऊष्मीय भौतिकी', Thermodynamics: 'तापविज्ञान', 'Kinetic Theory': 'गतिक सिद्धांत', Oscillations: 'दोलन', Waves: 'तरंगें', Electrostatics: 'स्थिरविद्युत', 'Electric Potential': 'विद्युत विभव', Capacitance: 'धारिता', 'Current Electricity': 'विद्युत धारा', 'Moving Charges': 'गतिशील आवेश', 'Electromagnetic Induction': 'विद्युत चुम्बकीय प्रेरण', 'Alternating Current': 'प्रत्यावर्ती धारा', 'Electromagnetic Waves': 'विद्युत चुम्बकीय तरंगें', 'Ray Optics': 'किरण प्रकाशिकी', 'Wave Optics': 'तरंग प्रकाशिकी', 'Dual Nature': 'द्वैत स्वभाव', Atoms: 'परमाणु', Nuclei: 'न्यूक्लियस', Semiconductors: 'अर्धचालक', 'Applied Mechanics': 'अनुप्रयुक्त यांत्रिकी', 'Engineering Physics': 'इंजीनियरिंग भौतिकी', 'Fluid Mechanics': 'तरल यांत्रिकी', Materials: 'पदार्थ विज्ञान', 'Semiconductor Devices': 'अर्धचालक उपकरण', 'Electrical Fundamentals': 'विद्युत के मूल सिद्धांत', 'Modern Optics': 'आधुनिक प्रकाशिकी', Acoustics: 'ध्वनि विज्ञान', 'Classical Mechanics': 'शास्त्रीय यांत्रिकी', 'Mathematical Physics': 'गणितीय भौतिकी', Electromagnetism: 'विद्युत चुम्बकत्व', 'Advanced Thermodynamics': 'उन्नत तापविज्ञान', 'Quantum Mechanics': 'क्वांटम यांत्रिकी', 'Statistical Mechanics': 'सांख्यिकीय यांत्रिकी', 'Solid State Physics': 'ठोस अवस्था भौतिकी', 'Nuclear Physics': 'न्यूक्लियर भौतिकी', 'Atomic Physics': 'परमाणु भौतिकी', Electronics: 'इलेक्ट्रॉनिकी', Relativity: 'सापेक्षता', 'Lagrangian Mechanics': 'लाग्रांजियन यांत्रिकी', 'Hamiltonian Mechanics': 'हैमिल्टोनियन यांत्रिकी', 'Tensor Fundamentals': 'टेंसर के मूल सिद्धांत', 'Special Relativity': 'विशेष सापेक्षता', 'General Relativity Fundamentals': 'सामान्य सापेक्षता का परिचय', 'Quantum Theory': 'क्वांटम सिद्धांत', Electrodynamics: 'विद्युत गतिकी', 'Particle Physics': 'कण भौतिकी', 'Advanced Mathematical Methods': 'उन्नत गणितीय विधियाँ', "Coulomb's Law": 'कूलॉम्ब का नियम', "Gauss's Law": 'गॉस का नियम', "Faraday's Law": 'फैराडे का नियम', "Lenz's Law": 'लेंज़ का नियम', "Archimedes' Principle": 'आर्किमिडीज़ का सिद्धांत', "Bernoulli's Principle": 'बर्नौली का सिद्धांत', 'Doppler Effect': 'डॉपलर प्रभाव', 'Lens Formula': 'लेंस सूत्र', 'Mirror Formula': 'दर्पण सूत्र', "Hooke's Law": 'हुक का नियम', "Boyle's Law": 'बॉयल का नियम', "Charles's Law": 'चार्ल्स का नियम', "Conservation of Energy": 'ऊर्जा संरक्षण', 'Conservation of Momentum': 'संवेग संरक्षण', 'Laws of Thermodynamics': 'तापविज्ञान के नियम', 'First Law of Thermodynamics': 'तापविज्ञान का प्रथम नियम', "Kirchhoff's Laws": 'किर्यहॉफ के नियम', "Ampere's Law": 'एम्पीयर का नियम', "Snell's Law": 'स्नेल का नियम', 'Photoelectric Equation': 'प्रकाशवैद्युत समीकरण', 'Simple Harmonic Motion': 'सरल आवर्ती गति', 'Current and Resistance': 'धारा और प्रतिरोध', 'Electric Field': 'विद्युत क्षेत्र', 'Magnetic Field': 'चुम्बकीय क्षेत्र', 'Wave Motion': 'तरंग गति', 'Projectile Motion': 'प्रक्षेप्य गति', 'Circular Motion': 'वृत्तीय गति', 'Gas Laws': 'गैस के नियम', 'Heat Transfer': 'ऊष्मा स्थानांतरण', 'Spring Oscillation': 'स्प्रिंग दोलन', 'Simple Pendulum': 'सरल लोलक', 'Free Fall': 'मुक्त गिरन', 'Friction on an Incline': 'ढलान पर घर्षण', 'Elastic Collision': 'प्रत्यास्थ टक्कर', 'Reflection and Refraction': 'परावर्तन और अपवर्तन', 'Free Energy': 'मुक्त ऊर्जा', 'Quantum States': 'क्वांटम अवस्थाएँ', 'Gauge Fundamentals': 'गेज सिद्धांत का परिचय' };

function chapter(level: EducationLevelId, slug: string, titleEn: string, difficulty: Chapter['difficulty'], tags: string[]): Chapter {
  const title: Localized = { en: titleEn, hi: enToHi[titleEn] ?? titleEn };
  return { id: `${level}-${slug}`, level, title, lessonIds: [], tags, difficulty };
}

export const chapters: Chapter[] = [
  // Class 6–8
  chapter('class-6-8', 'measurement', 'Measurement', 1, ['units', 'basics']),
  chapter('class-6-8', 'units', 'Units', 1, ['units', 'basics']),
  chapter('class-6-8', 'motion', 'Motion', 1, ['motion', 'kinematics']),
  chapter('class-6-8', 'force', 'Force', 1, ['force', 'newton']),
  chapter('class-6-8', 'pressure', 'Pressure', 1, ['pressure', 'fluids']),
  chapter('class-6-8', 'friction', 'Friction', 1, ['friction', 'force']),
  chapter('class-6-8', 'work', 'Work', 1, ['work', 'energy']),
  chapter('class-6-8', 'energy', 'Energy', 1, ['energy']),
  chapter('class-6-8', 'light', 'Light', 1, ['light', 'optics']),
  chapter('class-6-8', 'reflection', 'Reflection', 1, ['light', 'optics']),
  chapter('class-6-8', 'sound', 'Sound', 1, ['sound', 'waves']),
  chapter('class-6-8', 'electricity', 'Electricity', 1, ['electricity']),
  chapter('class-6-8', 'magnetism', 'Magnetism', 1, ['magnetism']),
  chapter('class-6-8', 'heat', 'Heat', 1, ['thermal']),
  chapter('class-6-8', 'astronomy', 'Basic Astronomy', 1, ['astronomy']),

  // Class 9–10
  chapter('class-9-10', 'motion', 'Motion', 2, ['motion', 'kinematics']),
  chapter('class-9-10', 'newtons-laws', "Newton's Laws", 2, ['force', 'newton']),
  chapter('class-9-10', 'gravitation', 'Gravitation', 2, ['gravity']),
  chapter('class-9-10', 'work-energy', 'Work and Energy', 2, ['work', 'energy']),
  chapter('class-9-10', 'momentum', 'Momentum', 2, ['momentum']),
  chapter('class-9-10', 'sound', 'Sound', 2, ['sound', 'waves']),
  chapter('class-9-10', 'light', 'Light', 2, ['light', 'optics']),
  chapter('class-9-10', 'reflection', 'Reflection', 2, ['light', 'optics']),
  chapter('class-9-10', 'refraction', 'Refraction', 2, ['light', 'optics']),
  chapter('class-9-10', 'human-eye', 'Human Eye', 2, ['light', 'optics', 'biology']),
  chapter('class-9-10', 'electricity', 'Electricity', 2, ['electricity']),
  chapter('class-9-10', 'ohms-law', "Ohm's Law", 2, ['electricity', 'ohm']),
  chapter('class-9-10', 'resistance', 'Resistance', 2, ['electricity', 'ohm']),
  chapter('class-9-10', 'magnetic-effects', 'Magnetic Effects of Current', 2, ['magnetism', 'electricity']),
  chapter('class-9-10', 'energy-sources', 'Sources of Energy', 2, ['energy']),

  // Class 11
  chapter('class-11', 'physical-world', 'Physical World', 2, ['foundations']),
  chapter('class-11', 'units-measurements', 'Units and Measurements', 2, ['units']),
  chapter('class-11', 'vectors', 'Vectors', 2, ['vectors', 'math']),
  chapter('class-11', 'kinematics', 'Kinematics', 3, ['motion', 'kinematics']),
  chapter('class-11', 'laws-motion', 'Laws of Motion', 3, ['force', 'newton']),
  chapter('class-11', 'work-energy-power', 'Work Energy Power', 3, ['work', 'energy']),
  chapter('class-11', 'rotational-motion', 'Rotational Motion', 3, ['rotation']),
  chapter('class-11', 'gravitation', 'Gravitation', 3, ['gravity']),
  chapter('class-11', 'properties-matter', 'Properties of Matter', 3, ['materials', 'fluids']),
  chapter('class-11', 'thermal-physics', 'Thermal Physics', 3, ['thermal']),
  chapter('class-11', 'thermodynamics', 'Thermodynamics', 3, ['thermal']),
  chapter('class-11', 'kinetic-theory', 'Kinetic Theory', 3, ['thermal', 'gas']),
  chapter('class-11', 'oscillations', 'Oscillations', 3, ['oscillations']),
  chapter('class-11', 'waves', 'Waves', 3, ['waves']),

  // Class 12
  chapter('class-12', 'electrostatics', 'Electrostatics', 4, ['electricity', 'electrostatics']),
  chapter('class-12', 'electric-potential', 'Electric Potential', 4, ['electricity', 'electrostatics']),
  chapter('class-12', 'capacitance', 'Capacitance', 4, ['electricity', 'electrostatics']),
  chapter('class-12', 'current-electricity', 'Current Electricity', 4, ['electricity']),
  chapter('class-12', 'moving-charges', 'Moving Charges', 4, ['magnetism', 'electricity']),
  chapter('class-12', 'magnetism', 'Magnetism', 4, ['magnetism']),
  chapter('class-12', 'induction', 'Electromagnetic Induction', 4, ['magnetism', 'electricity']),
  chapter('class-12', 'alternating-current', 'Alternating Current', 4, ['electricity']),
  chapter('class-12', 'em-waves', 'Electromagnetic Waves', 4, ['waves', 'optics']),
  chapter('class-12', 'ray-optics', 'Ray Optics', 4, ['optics']),
  chapter('class-12', 'wave-optics', 'Wave Optics', 4, ['optics', 'waves']),
  chapter('class-12', 'dual-nature', 'Dual Nature', 4, ['quantum']),
  chapter('class-12', 'atoms', 'Atoms', 4, ['quantum', 'atomic']),
  chapter('class-12', 'nuclei', 'Nuclei', 4, ['nuclear']),
  chapter('class-12', 'semiconductors', 'Semiconductors', 4, ['electronics']),

  // Diploma and engineering
  chapter('diploma', 'applied-mechanics', 'Applied Mechanics', 3, ['mechanics', 'engineering']),
  chapter('diploma', 'engineering-physics', 'Engineering Physics', 3, ['engineering']),
  chapter('diploma', 'fluid-mechanics', 'Fluid Mechanics', 3, ['fluids', 'engineering']),
  chapter('diploma', 'materials', 'Materials', 3, ['materials', 'engineering']),
  chapter('diploma', 'semiconductor-devices', 'Semiconductor Devices', 3, ['electronics', 'engineering']),
  chapter('diploma', 'electrical-fundamentals', 'Electrical Fundamentals', 3, ['electricity', 'engineering']),
  chapter('diploma', 'modern-optics', 'Modern Optics', 3, ['optics', 'engineering']),
  chapter('diploma', 'acoustics', 'Acoustics', 3, ['sound', 'engineering']),

  // Undergraduate
  chapter('undergraduate', 'classical-mechanics', 'Classical Mechanics', 5, ['mechanics', 'advanced']),
  chapter('undergraduate', 'mathematical-physics', 'Mathematical Physics', 5, ['math', 'advanced']),
  chapter('undergraduate', 'electromagnetism', 'Electromagnetism', 5, ['electricity', 'advanced']),
  chapter('undergraduate', 'advanced-thermodynamics', 'Advanced Thermodynamics', 5, ['thermal', 'advanced']),
  chapter('undergraduate', 'quantum-mechanics', 'Quantum Mechanics', 5, ['quantum', 'advanced']),
  chapter('undergraduate', 'statistical-mechanics', 'Statistical Mechanics', 5, ['thermal', 'advanced']),
  chapter('undergraduate', 'solid-state', 'Solid State Physics', 5, ['materials', 'advanced']),
  chapter('undergraduate', 'nuclear-physics', 'Nuclear Physics', 5, ['nuclear', 'advanced']),
  chapter('undergraduate', 'atomic-physics', 'Atomic Physics', 5, ['atomic', 'advanced']),
  chapter('undergraduate', 'electronics', 'Electronics', 5, ['electronics', 'advanced']),
  chapter('undergraduate', 'relativity', 'Relativity', 5, ['relativity', 'advanced']),

  // Advanced
  chapter('advanced', 'lagrangian', 'Lagrangian Mechanics', 5, ['mechanics', 'advanced']),
  chapter('advanced', 'hamiltonian', 'Hamiltonian Mechanics', 5, ['mechanics', 'advanced']),
  chapter('advanced', 'tensors', 'Tensor Fundamentals', 5, ['math', 'advanced']),
  chapter('advanced', 'special-relativity', 'Special Relativity', 5, ['relativity', 'advanced']),
  chapter('advanced', 'general-relativity', 'General Relativity Fundamentals', 5, ['relativity', 'advanced']),
  chapter('advanced', 'quantum-theory', 'Quantum Theory', 5, ['quantum', 'advanced']),
  chapter('advanced', 'electrodynamics', 'Electrodynamics', 5, ['electricity', 'advanced']),
  chapter('advanced', 'particle-physics', 'Particle Physics', 5, ['quantum', 'advanced']),
  chapter('advanced', 'math-methods', 'Advanced Mathematical Methods', 5, ['math', 'advanced']),
];

export const chapterById = new Map(chapters.map((c) => [c.id, c]));

export function chaptersForLevel(level: EducationLevelId): Chapter[] {
  return chapters.filter((c) => c.level === level);
}

export function levelName(level: EducationLevelId): Localized {
  return educationLevels.find((l) => l.id === level)?.name ?? { en: level, hi: level };
}
