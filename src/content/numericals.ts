import { PHYS } from '@/physics/constants';
import { formatScientific } from '@/physics/units';
import { pendulumPeriod, projectileFlightTime, projectileMaxHeight, projectileRange, springFrequency } from '@/engine/integrators';
import type { Localized, NumericalTemplate } from './types';

const L = (en: string, hi: string): Localized => ({ en, hi });
const fixed = (x: number, n = 4) => formatScientific(x, n);

function template(
  id: string,
  title: Localized,
  difficulty: NumericalTemplate['difficulty'],
  chapterId: string,
  topic: string,
  inputs: NumericalTemplate['inputs'],
  defaults: Record<string, number>,
  formulaLatex: string,
  formulaExplanation: Localized,
  solve: NumericalTemplate['solve'],
  hint: Localized,
): NumericalTemplate {
  return { id, title, difficulty, chapterId, topic, inputs, defaults, formulaLatex, formulaExplanation, solve, hint };
}

export const numericalTemplates: NumericalTemplate[] = [
  template('num-force', L('Force from mass and acceleration', 'द्रव्यमान और त्वरण से बल'), 'easy', 'class-9-10-newtons-laws', 'Newton laws',
    [
      { key: 'm', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.1, max: 200, step: 0.5 },
      { key: 'a', label: L('Acceleration', 'त्वरण'), unit: 'm/s²', min: -20, max: 20, step: 0.5 },
    ], { m: 5, a: 3 }, 'F = ma',
    L('Net force equals mass times acceleration.', 'परिणामी बल द्रव्यमान गुणा त्वरण है।'),
    (v) => ({
      value: v.m * v.a, unit: 'N',
      steps: [L(`F = ${fixed(v.m)} × ${fixed(v.a)}`, `F = ${fixed(v.m)} × ${fixed(v.a)}`), L(`F = ${fixed(v.m * v.a)} N`, `F = ${fixed(v.m * v.a)} N`)],
    }),
    L('Multiply mass and acceleration.', 'द्रव्यमान और त्वरण का गुणा करें।')),

  template('num-acceleration', L('Acceleration from force', 'बल से त्वरण'), 'easy', 'class-9-10-newtons-laws', 'Newton laws',
    [
      { key: 'F', label: L('Net force', 'परिणामी बल'), unit: 'N', min: 1, max: 500, step: 1 },
      { key: 'm', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.1, max: 100, step: 0.5 },
    ], { F: 60, m: 12 }, 'a = F/m',
    L('Rearrange F = ma to solve for acceleration.', 'त्वरण के लिए F = ma को पुनः व्यवस्थित करें।'),
    (v) => ({ value: v.F / v.m, unit: 'm/s²', steps: [L(`a = ${fixed(v.F)} / ${fixed(v.m)}`, `a = ${fixed(v.F)} / ${fixed(v.m)}`), L(`a = ${fixed(v.F / v.m)} m/s²`, `a = ${fixed(v.F / v.m)} m/s²`)] }),
    L('Divide force by mass.', 'बल को द्रव्यमान से भाग दें।')),

  template('num-friction', L('Friction-limited acceleration', 'घर्षण सीमित त्वरण'), 'medium', 'class-6-8-friction', 'Friction',
    [
      { key: 'F', label: L('Applied force', 'लगाया बल'), unit: 'N', min: 0, max: 300, step: 1 },
      { key: 'm', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.5, max: 60, step: 0.5 },
      { key: 'mu', label: L('Friction coefficient', 'घर्षण गुणांक'), unit: 'μ', min: 0, max: 1, step: 0.01 },
    ], { F: 50, m: 10, mu: 0.2 }, 'a = (F − μmg)/m',
    L('Kinetic friction μmg reduces the net force.', 'गतिज घर्षण μmg परिणामी बल को घटाता है।'),
    (v) => {
      const f = v.mu * v.m * PHYS.g;
      const a = v.F > f ? (v.F - f) / v.m : 0;
      return { value: a, unit: 'm/s²', steps: [L(`f = μmg = ${fixed(v.mu)} × ${fixed(v.m)} × ${fixed(PHYS.g)} = ${fixed(f)} N`, `f = μmg = ${fixed(v.mu)} × ${fixed(v.m)} × ${fixed(PHYS.g)} = ${fixed(f)} N`), L(`a = (${fixed(v.F)} − ${fixed(f)})/${fixed(v.m)} = ${fixed(a)} m/s²`, `a = (${fixed(v.F)} − ${fixed(f)})/${fixed(v.m)} = ${fixed(a)} m/s²`)] };
    },
    L('Find friction first: f = μmg.', 'पहले घर्षण ज्ञात करें: f = μmg।')),

  template('num-impulse', L('Impulse and momentum change', 'आवेग और संवेग परिवर्तन'), 'medium', 'class-9-10-momentum', 'Momentum',
    [
      { key: 'F', label: L('Average force', 'औसत बल'), unit: 'N', min: 1, max: 1000, step: 1 },
      { key: 't', label: L('Time', 'समय'), unit: 's', min: 0.01, max: 10, step: 0.01 },
    ], { F: 200, t: 0.05 }, 'J = FΔt = Δp',
    L('Impulse equals average force times contact time.', 'आवेग औसत बल गुणा संपर्क समय है।'),
    (v) => ({ value: v.F * v.t, unit: 'N s', steps: [L(`J = ${fixed(v.F)} × ${fixed(v.t)}`, `J = ${fixed(v.F)} × ${fixed(v.t)}`), L(`J = ${fixed(v.F * v.t)} N s`, `J = ${fixed(v.F * v.t)} N s`)] }),
    L('Multiply force by time interval.', 'बल को समय अंतराल से गुणा करें।')),

  template('num-ke', L('Kinetic energy', 'गतिज ऊर्जा'), 'easy', 'class-11-work-energy-power', 'Work & Energy',
    [
      { key: 'm', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.1, max: 500, step: 0.5 },
      { key: 'v', label: L('Speed', 'चाल'), unit: 'm/s', min: 0, max: 100, step: 1 },
    ], { m: 20, v: 15 }, 'K = ½mv²',
    L('Kinetic energy is half the product of mass and velocity squared.', 'गतिज ऊर्जा द्रव्यमान और वेग के वर्ग के गुणनफल का आधा है।'),
    (v) => ({ value: 0.5 * v.m * v.v * v.v, unit: 'J', steps: [L(`K = 0.5 × ${fixed(v.m)} × (${fixed(v.v)})²`, `K = 0.5 × ${fixed(v.m)} × (${fixed(v.v)})²`), L(`K = ${fixed(0.5 * v.m * v.v * v.v)} J`, `K = ${fixed(0.5 * v.m * v.v * v.v)} J`)] }),
    L('Square the speed before multiplying.', 'गुणा करने से पहले चाल का वर्ग करें।')),

  template('num-pe', L('Gravitational potential energy', 'गुरुत्वीय विभव ऊर्जा'), 'easy', 'class-9-10-work-energy', 'Work & Energy',
    [
      { key: 'm', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.1, max: 200, step: 0.5 },
      { key: 'h', label: L('Height', 'ऊँचाई'), unit: 'm', min: 0, max: 100, step: 1 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01 },
    ], { m: 10, h: 5, g: 9.81 }, 'U = mgh',
    L('Potential energy near Earth’s surface.', 'पृथ्वी सतह के पास विभव ऊर्जा।'),
    (v) => ({ value: v.m * v.g * v.h, unit: 'J', steps: [L(`U = ${fixed(v.m)} × ${fixed(v.g)} × ${fixed(v.h)}`, `U = ${fixed(v.m)} × ${fixed(v.g)} × ${fixed(v.h)}`), L(`U = ${fixed(v.m * v.g * v.h)} J`, `U = ${fixed(v.m * v.g * v.h)} J`)] }),
    L('Use g in m/s² and height in metres.', 'g, m/s² और ऊँचाई मीटर में लें।')),

  template('num-power', L('Power from work and time', 'कार्य और समय से शक्ति'), 'easy', 'class-11-work-energy-power', 'Work & Energy',
    [
      { key: 'W', label: L('Work', 'कार्य'), unit: 'J', min: 1, max: 100000, step: 10 },
      { key: 't', label: L('Time', 'समय'), unit: 's', min: 0.1, max: 600, step: 1 },
    ], { W: 5000, t: 20 }, 'P = W/t',
    L('Power is work divided by time.', 'शक्ति कार्य को समय से भाग देने पर मिलती है।'),
    (v) => ({ value: v.W / v.t, unit: 'W', steps: [L(`P = ${fixed(v.W)} / ${fixed(v.t)}`, `P = ${fixed(v.W)} / ${fixed(v.t)}`), L(`P = ${fixed(v.W / v.t)} W`, `P = ${fixed(v.W / v.t)} W`)] }),
    L('Convert time to seconds first.', 'समय को सेकंड में बदलें।')),

  template('num-gravity', L('Gravitational force between masses', 'द्रव्यमानों के बीच गुरुत्व बल'), 'medium', 'class-11-gravitation', 'Gravitation',
    [
      { key: 'm1', label: L('Mass 1', 'द्रव्यमान 1'), unit: 'kg', min: 1, max: 1e10, step: 100 },
      { key: 'm2', label: L('Mass 2', 'द्रव्यमान 2'), unit: 'kg', min: 1, max: 1e10, step: 100 },
      { key: 'r', label: L('Centre distance', 'केंद्र दूरी'), unit: 'm', min: 0.1, max: 1e7, step: 100 },
    ], { m1: 1000, m2: 1000, r: 2 }, 'F = Gm₁m₂/r²',
    L('Use centre-to-centre distance in metres.', 'केंद्र-से-केंद्र दूरी मीटर में लें।'),
    (v) => {
      const F = (PHYS.G * v.m1 * v.m2) / (v.r * v.r);
      return { value: F, unit: 'N', steps: [L(`F = (${PHYS.G.toExponential(4)} × ${fixed(v.m1)} × ${fixed(v.m2)}) / (${fixed(v.r)})²`, `F = (${PHYS.G.toExponential(4)} × ${fixed(v.m1)} × ${fixed(v.m2)}) / (${fixed(v.r)})²`), L(`F = ${F.toExponential(4)} N`, `F = ${F.toExponential(4)} N`)] };
    },
    L('Square the separation before dividing.', 'भाग देने से पहले दूरी का वर्ग करें।')),

  template('num-g', L('Surface gravity', 'सतही गुरुत्व'), 'medium', 'class-11-gravitation', 'Gravitation',
    [
      { key: 'M', label: L('Planet mass', 'ग्रह द्रव्यमान'), unit: 'kg', min: 1e20, max: 1e28, step: 1e24 },
      { key: 'R', label: L('Planet radius', 'ग्रह त्रिज्या'), unit: 'm', min: 1e5, max: 1e8, step: 1e5 },
    ], { M: 5.972e24, R: 6.371e6 }, 'g = GM/R²',
    L('Surface gravity from planet mass and radius.', 'ग्रह द्रव्यमान और त्रिज्या से सतही गुरुत्व।'),
    (v) => {
      const g = (PHYS.G * v.M) / (v.R * v.R);
      return { value: g, unit: 'm/s²', steps: [L(`g = (G × M)/R²`, `g = (G × M)/R²`), L(`g = ${fixed(g)} m/s²`, `g = ${fixed(g)} m/s²`)] };
    },
    L('Radius must be in metres.', 'त्रिज्या मीटर में होनी चाहिए।')),

  template('num-projectile-range', L('Projectile range', 'प्रक्षेप्य परास'), 'medium', 'class-11-kinematics', 'Projectile',
    [
      { key: 'v0', label: L('Launch speed', 'प्रारंभिक वेग'), unit: 'm/s', min: 1, max: 200, step: 1 },
      { key: 'angle', label: L('Angle', 'कोण'), unit: '°', min: 1, max: 89, step: 1 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01 },
    ], { v0: 20, angle: 45, g: 9.81 }, 'R = v₀² sin(2θ)/g',
    L('Ideal range on level ground with no air drag.', 'वायु प्रतिरोध रहित समतल भूमि पर आदर्श परास।'),
    (v) => {
      const R = projectileRange(v.v0, v.angle, v.g);
      return { value: R, unit: 'm', steps: [L(`R = (${fixed(v.v0)})² × sin(${fixed(2 * v.angle)}°)/${fixed(v.g)}`, `R = (${fixed(v.v0)})² × sin(${fixed(2 * v.angle)}°)/${fixed(v.g)}`), L(`R = ${fixed(R)} m`, `R = ${fixed(R)} m`)] };
    },
    L('Maximum range occurs at 45° for level ground.', 'समतल भूमि पर 45° पर परास अधिकतम होती है।')),

  template('num-projectile-height', L('Maximum projectile height', 'अधिकतम प्रक्षेप्य ऊँचाई'), 'medium', 'class-11-kinematics', 'Projectile',
    [
      { key: 'v0', label: L('Launch speed', 'प्रारंभिक वेग'), unit: 'm/s', min: 1, max: 200, step: 1 },
      { key: 'angle', label: L('Angle', 'कोण'), unit: '°', min: 1, max: 89, step: 1 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01 },
    ], { v0: 30, angle: 60, g: 9.81 }, 'H = v₀² sin²θ/(2g)',
    L('Only the vertical velocity component contributes to maximum height.', 'अधिकतम ऊँचाई में केवल ऊर्ध्वाधर वेग घटक योगदान देता है।'),
    (v) => {
      const H = projectileMaxHeight(v.v0, v.angle, v.g);
      return { value: H, unit: 'm', steps: [L(`v_y = v₀ sin θ`, `v_y = v₀ sin θ`), L(`H = v_y²/(2g) = ${fixed(H)} m`, `H = v_y²/(2g) = ${fixed(H)} m`)] };
    },
    L('Find the vertical component first.', 'पहले ऊर्ध्वाधर घटक निकालें।')),

  template('num-flight-time', L('Projectile flight time', 'प्रक्षेप्य उड़ान समय'), 'medium', 'class-11-kinematics', 'Projectile',
    [
      { key: 'v0', label: L('Launch speed', 'प्रारंभिक वेग'), unit: 'm/s', min: 1, max: 200, step: 1 },
      { key: 'angle', label: L('Angle', 'कोण'), unit: '°', min: 1, max: 89, step: 1 },
      { key: 'h', label: L('Initial height', 'प्रारंभिक ऊँचाई'), unit: 'm', min: 0, max: 100, step: 1 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01 },
    ], { v0: 20, angle: 45, h: 10, g: 9.81 }, 'T = (v₀sinθ + √(v₀²sin²θ + 2gh))/g',
    L('Positive root of the vertical position equation y(t) = 0.', 'ऊर्ध्वाधर स्थिति समीकरण y(t) = 0 का धनात्मक मूल।'),
    (v) => {
      const T = projectileFlightTime(v.v0, v.angle, v.h, v.g);
      return { value: T, unit: 's', steps: [L(`0 = h + v₀sinθ·T − ½gT²`, `0 = h + v₀sinθ·T − ½gT²`), L(`T = ${fixed(T)} s`, `T = ${fixed(T)} s`)] };
    },
    L('Solve the quadratic and keep the positive root.', 'द्विघात हल करें और धनात्मक मूल लें।')),

  template('num-pendulum', L('Pendulum period', 'लोलक आवर्तकाल'), 'easy', 'class-11-oscillations', 'Oscillations',
    [
      { key: 'L', label: L('Length', 'लंबाई'), unit: 'm', min: 0.1, max: 10, step: 0.1 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01 },
    ], { L: 1, g: 9.81 }, 'T = 2π√(L/g)',
    L('Small-angle approximation for a simple pendulum.', 'सरल लोलक के लिए छोटे कोण उपचयन।'),
    (v) => ({ value: pendulumPeriod(v.L, v.g), unit: 's', steps: [L(`T = 2π√(${fixed(v.L)}/${fixed(v.g)})`, `T = 2π√(${fixed(v.L)}/${fixed(v.g)})`), L(`T = ${fixed(pendulumPeriod(v.L, v.g))} s`, `T = ${fixed(pendulumPeriod(v.L, v.g))} s`)] }),
    L('Convert length to metres.', 'लंबाई मीटर में बदलें।')),

  template('num-spring', L('Spring oscillator frequency', 'स्प्रिंग दोलक आवृत्ति'), 'medium', 'class-11-oscillations', 'Oscillations',
    [
      { key: 'm', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.1, max: 20, step: 0.1 },
      { key: 'k', label: L('Spring constant', 'स्प्रिंग नियतांक'), unit: 'N/m', min: 1, max: 500, step: 1 },
    ], { m: 2, k: 50 }, 'ω = √(k/m), T = 2π√(m/k)',
    L('Ideal mass–spring oscillator.', 'आदर्श द्रव्यमान–स्प्रिंग दोलक।'),
    (v) => {
      const f = springFrequency(v.m, v.k);
      return { value: f.omega, unit: 'rad/s', steps: [L(`ω = √(${fixed(v.k)}/${fixed(v.m)})`, `ω = √(${fixed(v.k)}/${fixed(v.m)})`), L(`ω = ${fixed(f.omega)} rad/s; T = ${fixed(f.period)} s`, `ω = ${fixed(f.omega)} rad/s; T = ${fixed(f.period)} s`)] };
    },
    L('Use SI units for k and m.', 'k और m SI इकाइयों में लें।')),

  template('num-circular', L('Centripetal force', 'अभिकेन्द्री बल'), 'medium', 'class-11-laws-motion', 'Circular Motion',
    [
      { key: 'm', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.1, max: 200, step: 0.5 },
      { key: 'v', label: L('Speed', 'चाल'), unit: 'm/s', min: 0.1, max: 100, step: 0.5 },
      { key: 'r', label: L('Radius', 'त्रिज्या'), unit: 'm', min: 0.1, max: 100, step: 0.5 },
    ], { m: 2, v: 10, r: 5 }, 'F = mv²/r',
    L('Centripetal force points toward the centre of the path.', 'अभिकेन्द्री बल पथ के केंद्र की ओर होता है।'),
    (v) => ({ value: (v.m * v.v * v.v) / v.r, unit: 'N', steps: [L(`F = ${fixed(v.m)} × (${fixed(v.v)})² / ${fixed(v.r)}`, `F = ${fixed(v.m)} × (${fixed(v.v)})² / ${fixed(v.r)}`), L(`F = ${fixed((v.m * v.v * v.v) / v.r)} N`, `F = ${fixed((v.m * v.v * v.v) / v.r)} N`)] }),
    L('Square the speed.', 'चाल का वर्ग करें।')),

  template('num-ohm', L('Ohm’s law calculation', 'ओम नियम गणना'), 'easy', 'class-9-10-ohms-law', 'Electricity',
    [
      { key: 'V', label: L('Voltage', 'वोल्टेज'), unit: 'V', min: 0, max: 500, step: 1 },
      { key: 'R', label: L('Resistance', 'प्रतिरोध'), unit: 'Ω', min: 0.1, max: 1000, step: 1 },
    ], { V: 24, R: 8 }, 'I = V/R',
    L('Current equals voltage divided by resistance.', 'धारा वोल्टेज को प्रतिरोध से भाग देने पर मिलती है।'),
    (v) => ({ value: v.V / v.R, unit: 'A', steps: [L(`I = ${fixed(v.V)} / ${fixed(v.R)}`, `I = ${fixed(v.V)} / ${fixed(v.R)}`), L(`I = ${fixed(v.V / v.R)} A`, `I = ${fixed(v.V / v.R)} A`)] }),
    L('Rearrange V = IR.', 'V = IR को पुनः व्यवस्थित करें।')),

  template('num-resistance', L('Wire resistance', 'तार का प्रतिरोध'), 'medium', 'class-9-10-resistance', 'Electricity',
    [
      { key: 'rho', label: L('Resistivity', 'विशेष प्रतिरोध'), unit: 'Ω m', min: 1e-8, max: 1e-5, step: 1e-8 },
      { key: 'l', label: L('Length', 'लंबाई'), unit: 'm', min: 0.1, max: 100, step: 0.1 },
      { key: 'A', label: L('Cross-section area', 'अनुप्रस्थ क्षेत्र'), unit: 'm²', min: 1e-9, max: 1e-4, step: 1e-9 },
    ], { rho: 1.7e-8, l: 2, A: 1e-6 }, 'R = ρL/A',
    L('Resistance grows with length and falls with cross-section.', 'प्रतिरोध लंबाई के साथ बढ़ता और क्षेत्रफल के साथ घटता है।'),
    (v) => ({ value: (v.rho * v.l) / v.A, unit: 'Ω', steps: [L(`R = ${v.rho.toExponential(2)} × ${fixed(v.l)} / ${v.A.toExponential(2)}`, `R = ${v.rho.toExponential(2)} × ${fixed(v.l)} / ${v.A.toExponential(2)}`), L(`R = ${fixed((v.rho * v.l) / v.A, 6)} Ω`, `R = ${fixed((v.rho * v.l) / v.A, 6)} Ω`)] }),
    L('Area must be in square metres.', 'क्षेत्रफल वर्ग मीटर में हो।')),

  template('num-coulomb', L('Coulomb force', 'कूलॉम्ब बल'), 'medium', 'class-12-electrostatics', 'Electrostatics',
    [
      { key: 'q1', label: L('Charge 1', 'आवेश 1'), unit: 'C', min: -0.001, max: 0.001, step: 1e-6 },
      { key: 'q2', label: L('Charge 2', 'आवेश 2'), unit: 'C', min: -0.001, max: 0.001, step: 1e-6 },
      { key: 'r', label: L('Separation', 'दूरी'), unit: 'm', min: 0.01, max: 10, step: 0.01 },
    ], { q1: 2e-6, q2: 3e-6, r: 0.1 }, 'F = k|q₁q₂|/r²',
    L('Use the magnitude of charges for force magnitude; sign gives attraction or repulsion.', 'बल परिमाण के लिए आवेशों का परिमाण लें; चिह्न आकर्षण/प्रतिकर्षण बताता है।'),
    (v) => ({ value: (PHYS.ke * Math.abs(v.q1 * v.q2)) / (v.r * v.r), unit: 'N', steps: [L(`F = k |q₁q₂| / r²`, `F = k |q₁q₂| / r²`), L(`F = ${fixed((PHYS.ke * Math.abs(v.q1 * v.q2)) / (v.r * v.r), 6)} N`, `F = ${fixed((PHYS.ke * Math.abs(v.q1 * v.q2)) / (v.r * v.r), 6)} N`)] }),
    L('Convert microcoulombs to coulombs.', 'माइक्रोकूलॉम्ब को कूलॉम्ब में बदलें।')),

  template('num-emf', L('Induced emf', 'प्रेरित emf'), 'hard', 'class-12-induction', 'EM Induction',
    [
      { key: 'N', label: L('Turns', 'चक्कर'), unit: '', min: 1, max: 1000, step: 10 },
      { key: 'dPhi', label: L('Flux change', 'फ्लक्स परिवर्तन'), unit: 'Wb', min: 0.001, max: 2, step: 0.01 },
      { key: 't', label: L('Time', 'समय'), unit: 's', min: 0.01, max: 10, step: 0.01 },
    ], { N: 100, dPhi: 0.05, t: 0.1 }, '|ε| = N ΔΦ/Δt',
    L('Magnitude of induced emf from average flux-change rate.', 'औसत फ्लक्स परिवर्तन दर से प्रेरित emf का परिमाण।'),
    (v) => ({ value: (v.N * v.dPhi) / v.t, unit: 'V', steps: [L(`|ε| = N ΔΦ/Δt`, `|ε| = N ΔΦ/Δt`), L(`|ε| = ${fixed((v.N * v.dPhi) / v.t)} V`, `|ε| = ${fixed((v.N * v.dPhi) / v.t)} V`)] }),
    L('Multiply by the number of turns.', 'चक्करों की संख्या से गुणा करें।')),

  template('num-lens', L('Lens image distance', 'लेंस प्रतिबिंब दूरी'), 'hard', 'class-12-ray-optics', 'Optics',
    [
      { key: 'f', label: L('Focal length (signed)', 'फोकस दूरी (चिह्नित)'), unit: 'm', min: -1, max: 1, step: 0.01 },
      { key: 'u', label: L('Object distance (signed)', 'वस्तु दूरी (चिह्नित)'), unit: 'm', min: -10, max: -0.01, step: 0.1 },
    ], { f: 0.2, u: -0.6 }, '1/v = 1/f + 1/u',
    L('Cartesian sign convention: real object u < 0, converging lens f > 0.', 'कार्तीय परंपरा: वास्तविक वस्तु u < 0, अभिसारी लेंस f > 0।'),
    (v) => {
      const inv = 1 / v.f + 1 / v.u;
      const image = 1 / inv;
      return { value: image, unit: 'm', steps: [L(`1/v = 1/${fixed(v.f)} + 1/(${fixed(v.u)})`, `1/v = 1/${fixed(v.f)} + 1/(${fixed(v.u)})`), L(`v = ${fixed(image)} m; m = v/u = ${fixed(image / v.u)}`, `v = ${fixed(image)} m; m = v/u = ${fixed(image / v.u)}`)] };
    },
    L('Keep signs consistent.', 'चिह्न नियत रखें।')),

  template('num-ideal-gas', L('Ideal gas volume', 'आदर्श गैस आयतन'), 'medium', 'class-11-kinetic-theory', 'Thermal',
    [
      { key: 'n', label: L('Amount', 'मात्रा'), unit: 'mol', min: 0.1, max: 10, step: 0.1 },
      { key: 'T', label: L('Temperature', 'तापमान'), unit: 'K', min: 50, max: 1000, step: 5 },
      { key: 'P', label: L('Pressure', 'दाब'), unit: 'Pa', min: 1000, max: 1e6, step: 1000 },
    ], { n: 1, T: 300, P: 100000 }, 'V = nRT/P',
    L('Ideal gas equation of state.', 'आदर्श गैस का अवस्था समीकरण।'),
    (v) => {
      const V = (v.n * PHYS.R * v.T) / v.P;
      return { value: V, unit: 'm³', steps: [L(`V = nRT/P`, `V = nRT/P`), L(`V = ${fixed(V, 6)} m³`, `V = ${fixed(V, 6)} m³`)] };
    },
    L('Temperature must be in kelvin.', 'तापमान केल्विन में होना चाहिए।')),

  template('num-photoelectric', L('Photoelectron kinetic energy', 'फोटोइलेक्ट्रॉन गतिज ऊर्जा'), 'hard', 'class-12-dual-nature', 'Modern Physics',
    [
      { key: 'f', label: L('Frequency', 'आवृत्ति'), unit: 'Hz', min: 1e14, max: 5e15, step: 1e14 },
      { key: 'phiEV', label: L('Work function', 'कार्यफलन'), unit: 'eV', min: 0.5, max: 6, step: 0.1 },
    ], { f: 8e14, phiEV: 2 }, 'K_max = hf − φ',
    L('Use φ in joules when h is in J·s.', 'जब h, J·s में हो तो φ को जूल में लें।'),
    (v) => {
      const joules = PHYS.h * v.f - v.phiEV * PHYS.e;
      return { value: joules / PHYS.e, unit: 'eV', steps: [L(`hf = ${(PHYS.h * v.f).toExponential(4)} J`, `hf = ${(PHYS.h * v.f).toExponential(4)} J`), L(`K_max = ${fixed(joules / PHYS.e, 4)} eV`, `K_max = ${fixed(joules / PHYS.e, 4)} eV`)] };
    },
    L('1 eV = 1.602×10⁻¹⁹ J.', '1 eV = 1.602×10⁻¹⁹ J।')),

  template('num-buoyancy', L('Buoyant force', 'उत्प्लावन बल'), 'medium', 'diploma-fluid-mechanics', 'Fluids',
    [
      { key: 'rho', label: L('Fluid density', 'द्रव घनत्व'), unit: 'kg/m³', min: 100, max: 20000, step: 100 },
      { key: 'V', label: L('Submerged volume', 'डूबा आयतन'), unit: 'm³', min: 0.001, max: 5, step: 0.001 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01 },
    ], { rho: 1000, V: 0.02, g: 9.81 }, 'F_b = ρgV',
    L('Weight of the displaced fluid.', 'विस्थापित द्रव के भार के बराबर।'),
    (v) => ({ value: v.rho * v.g * v.V, unit: 'N', steps: [L(`F_b = ${fixed(v.rho)} × ${fixed(v.g)} × ${fixed(v.V)}`, `F_b = ${fixed(v.rho)} × ${fixed(v.g)} × ${fixed(v.V)}`), L(`F_b = ${fixed(v.rho * v.g * v.V)} N`, `F_b = ${fixed(v.rho * v.g * v.V)} N`)] }),
    L('Use submerged volume, not total volume.', 'कुल आयतन के बजाय डूबा आयतन लें।')),

  template('num-bernoulli', L('Pressure change in horizontal flow', 'क्षैतिज प्रवाह में दाब परिवर्तन'), 'hard', 'diploma-fluid-mechanics', 'Fluids',
    [
      { key: 'rho', label: L('Density', 'घनत्व'), unit: 'kg/m³', min: 100, max: 20000, step: 100 },
      { key: 'v1', label: L('Initial speed', 'प्रारंभिक वेग'), unit: 'm/s', min: 0.1, max: 50, step: 0.5 },
      { key: 'v2', label: L('Final speed', 'अंतिम वेग'), unit: 'm/s', min: 0.1, max: 50, step: 0.5 },
    ], { rho: 1000, v1: 2, v2: 4 }, 'P₂ − P₁ = ½ρ(v₁² − v₂²)',
    L('Horizontal Bernoulli relation for an ideal fluid.', 'आदर्श द्रव के लिए क्षैतिज बर्नौली संबंध।'),
    (v) => {
      const dp = 0.5 * v.rho * (v.v1 * v.v1 - v.v2 * v.v2);
      return { value: dp, unit: 'Pa', steps: [L(`ΔP = ½ × ${fixed(v.rho)} × (${fixed(v.v1)}² − ${fixed(v.v2)}²)`, `ΔP = ½ × ${fixed(v.rho)} × (${fixed(v.v1)}² − ${fixed(v.v2)}²)`), L(`ΔP = ${fixed(dp)} Pa`, `ΔP = ${fixed(dp)} Pa`)] };
    },
    L('Faster flow means lower static pressure.', 'तेज़ प्रवाह पर स्थिर दाब कम होता है।')),
];

export const numericalById = new Map(numericalTemplates.map((n) => [n.id, n]));
