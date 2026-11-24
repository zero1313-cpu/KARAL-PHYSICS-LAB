import type { SimParam } from '../types';
import type { Localized } from '@/content/types';

export interface ThreeSceneDef {
  id: string;
  title: Localized;
  description: Localized;
  fallback2D: string;
  params: SimParam[];
  legend: Localized[];
}

const L = (en: string, hi: string) => ({ en, hi });

export const threeScenes: ThreeSceneDef[] = [
  {
    id: 'projectile-3d',
    title: L('3D projectile trajectory', '3D प्रक्षेप्य पथ'),
    description: L('A projectile arc with velocity and gravity vectors in three dimensions.', 'तीन आयामों में वेग और गुरुत्व सदिशों के साथ प्रक्षेप्य चाप।'),
    fallback2D: 'projectile-motion',
    params: [
      { key: 'v0', label: L('Launch speed', 'प्रारंभिक वेग'), unit: 'm/s', min: 5, max: 40, step: 1, default: 20 },
      { key: 'angle', label: L('Elevation', 'उन्नयन कोण'), unit: '°', min: 10, max: 80, step: 1, default: 45 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.1, default: 9.8 },
    ],
    legend: [L('Trajectory', 'पथ'), L('Velocity', 'वेग'), L('Gravity', 'गुरुत्व')],
  },
  {
    id: 'gravity-3d',
    title: L('Gravitational system', 'गुरुत्वीय प्रणाली'),
    description: L('Planet–satellite orbital motion with an inverse-square force.', 'व्युत्क्रम-वर्ग बल के साथ ग्रह–उपग्रह कक्षीय गति।'),
    fallback2D: 'circular-motion',
    params: [
      { key: 'mass', label: L('Central mass', 'केन्द्रीय द्रव्यमान'), unit: '×10²⁴ kg', min: 1, max: 10, step: 0.5, default: 6 },
      { key: 'radius', label: L('Orbit radius', 'कक्षा त्रिज्या'), unit: '×10⁶ m', min: 4, max: 12, step: 0.5, default: 7 },
      { key: 'speed', label: L('Orbital speed factor', 'कक्षीय वेग गुणक'), unit: '×', min: 0.4, max: 1.6, step: 0.05, default: 1 },
    ],
    legend: [L('Central body', 'केन्द्रीय पिंड'), L('Orbit', 'कक्षा'), L('Satellite', 'उपग्रह')],
  },
  {
    id: 'electric-field-3d',
    title: L('Electric field lines', 'विद्युत क्षेत्र रेखाएँ'),
    description: L('Three-dimensional radial field around a positive point charge.', 'धनात्मक बिंदु आवेश के चारों ओर त्रि-आयामी त्रिज्यात्मक क्षेत्र।'),
    fallback2D: 'electric-field',
    params: [
      { key: 'charge', label: L('Charge', 'आवेश'), unit: 'μC', min: 0.5, max: 10, step: 0.5, default: 3 },
    ],
    legend: [L('Positive charge', 'धन आवेश'), L('Field line', 'क्षेत्र रेखा')],
  },
  {
    id: 'magnetic-field-3d',
    title: L('Magnetic field lines', 'चुम्बकीय क्षेत्र रेखाएँ'),
    description: L('Field loops around a long current-carrying wire.', 'धारा वहन करने वाले लंबे तार के चारों ओर क्षेत्र लूप।'),
    fallback2D: 'magnetic-field',
    params: [{ key: 'current', label: L('Current', 'धारा'), unit: 'A', min: 1, max: 20, step: 1, default: 8 }],
    legend: [L('Wire', 'तार'), L('Field loop', 'क्षेत्र लूप')],
  },
  {
    id: 'molecular-3d',
    title: L('Molecular motion', 'अणुओं की गति'),
    description: L('Gas particles in a box; average kinetic energy rises with temperature.', 'डिब्बे में गैस कण; औसत गतिज ऊर्जा ताप के साथ बढ़ती है।'),
    fallback2D: 'gas-laws',
    params: [
      { key: 'temperature', label: L('Temperature', 'तापमान'), unit: 'K', min: 100, max: 800, step: 10, default: 300 },
      { key: 'count', label: L('Particle count', 'कण संख्या'), unit: '', min: 20, max: 160, step: 10, default: 80 },
    ],
    legend: [L('Particle', 'कण'), L('Container', 'पात्र')],
  },
  {
    id: 'wave-3d',
    title: L('Wave propagation', 'तरंग संचरण'),
    description: L('A travelling transverse wave surface with adjustable amplitude and wavelength.', 'समायोज्य आयाम और तरंगदैर्घ्य के साथ संचारी अनुप्रस्थ तरंग सतह।'),
    fallback2D: 'wave-motion',
    params: [
      { key: 'amplitude', label: L('Amplitude', 'आयाम'), unit: '', min: 0.2, max: 2, step: 0.1, default: 1 },
      { key: 'wavelength', label: L('Wavelength', 'तरंगदैर्घ्य'), unit: '', min: 1, max: 8, step: 0.1, default: 3 },
      { key: 'frequency', label: L('Frequency', 'आवृत्ति'), unit: 'Hz', min: 0.1, max: 2, step: 0.1, default: 0.5 },
    ],
    legend: [L('Crest', 'शिखर'), L('Trough', 'गर्त')],
  },
  {
    id: 'pendulum-3d',
    title: L('3D pendulum', '3D लोलक'),
    description: L('A swinging bob with its instantaneous velocity vector.', 'झूलते हुए गोले और उसका तात्क्षणिक वेग सदिश।'),
    fallback2D: 'pendulum',
    params: [
      { key: 'length', label: L('Length', 'लंबाई'), unit: 'm', min: 0.5, max: 4, step: 0.1, default: 2 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.1, default: 9.8 },
      { key: 'amplitude', label: L('Angle', 'कोण'), unit: '°', min: 5, max: 70, step: 1, default: 30 },
    ],
    legend: [L('Bob', 'गोला'), L('String', 'डोरी'), L('Velocity', 'वेग')],
  },
  {
    id: 'spring-3d',
    title: L('3D spring oscillator', '3D स्प्रिंग दोलक'),
    description: L('A helix spring with an oscillating mass.', 'दोलन करते द्रव्यमान के साथ हेलिकल स्प्रिंग।'),
    fallback2D: 'spring-oscillation',
    params: [
      { key: 'mass', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.2, max: 6, step: 0.1, default: 1 },
      { key: 'k', label: L('Spring constant', 'स्प्रिंग नियतांक'), unit: 'N/m', min: 5, max: 120, step: 1, default: 30 },
    ],
    legend: [L('Mass', 'द्रव्यमान'), L('Equilibrium', 'संतुलन')],
  },
  {
    id: 'optics-3d',
    title: L('3D ray tracing', '3D किरण अनुरेखण'),
    description: L('Parallel rays refracting through a converging lens toward the focal plane.', 'अभिसारी लेंस से होकर फोकल तल की ओर अपवर्तित समान्तर किरणें।'),
    fallback2D: 'lenses',
    params: [
      { key: 'focal', label: L('Focal length', 'फोकस दूरी'), unit: '', min: 2, max: 10, step: 0.5, default: 5 },
      { key: 'spread', label: L('Beam spread', 'किरण पुंज फैलाव'), unit: '', min: 0.5, max: 3, step: 0.1, default: 1.5 },
    ],
    legend: [L('Incident ray', 'आपतन किरण'), L('Refracted ray', 'अपवर्तित किरण'), L('Focal plane', 'फोकल तल')],
  },
  {
    id: 'atomic-3d',
    title: L('Atomic model', 'परमाणु मॉडल'),
    description: L('A schematic Bohr-style orbit illustration, not a quantum-mechanical trajectory.', 'योजनात्मक बोर-शैली कक्षा चित्र, क्वांटम-यांत्रिक कक्ष नहीं।'),
    fallback2D: 'electric-field',
    params: [
      { key: 'level', label: L('Principal quantum number n', 'मुख्य क्वांटम संख्या n'), unit: 'n', min: 1, max: 6, step: 1, default: 3 },
      { key: 'speed', label: L('Animation speed', 'एनीमेशन वेग'), unit: '×', min: 0.2, max: 2, step: 0.1, default: 1 },
    ],
    legend: [L('Nucleus', 'न्यूक्लियस'), L('Electron (schematic)', 'इलेक्ट्रॉन (योजनात्मक)')],
  },
  {
    id: 'em-wave-3d',
    title: L('Electromagnetic wave', 'विद्युत चुम्बकीय तरंग'),
    description: L('Mutually perpendicular oscillating electric and magnetic fields propagating together.', 'एक साथ संचरण करने वाले परस्पर लंबवत विद्युत और चुम्बकीय क्षेत्र।'),
    fallback2D: 'wave-motion',
    params: [
      { key: 'amplitude', label: L('Field amplitude', 'क्षेत्र आयाम'), unit: '', min: 0.5, max: 2.5, step: 0.1, default: 1 },
      { key: 'wavelength', label: L('Wavelength', 'तरंगदैर्घ्य'), unit: '', min: 2, max: 8, step: 0.2, default: 4 },
      { key: 'frequency', label: L('Frequency', 'आवृत्ति'), unit: 'Hz', min: 0.1, max: 1.5, step: 0.1, default: 0.4 },
    ],
    legend: [L('Electric field E', 'विद्युत क्षेत्र E'), L('Magnetic field B', 'चुम्बकीय क्षेत्र B'), L('Propagation', 'संचरण')],
  },
];

export const threeSceneById = new Map(threeScenes.map((s) => [s.id, s]));
