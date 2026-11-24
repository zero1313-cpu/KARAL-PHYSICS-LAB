import { PHYS } from '@/physics/constants';
import type { SimDefinition } from '../types';
import { arrow, circle, clear, drawGrid, label, palette } from '../draw/canvasUtils';

const L = (en: string, hi: string) => ({ en, hi });

function wire(c: Parameters<SimDefinition['draw']>[0], points: Array<[number, number]>, color: string, width = 2) {
  const { ctx } = c;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function resistor(c: Parameters<SimDefinition['draw']>[0], x: number, y: number, w: number, h: number, text: string) {
  const colors = palette(c.theme);
  c.ctx.fillStyle = colors.bg;
  c.ctx.fillRect(x, y - h / 2, w, h);
  c.ctx.strokeStyle = colors.primary;
  c.ctx.lineWidth = 2;
  c.ctx.strokeRect(x, y - h / 2, w, h);
  label(c.ctx, text, x + w / 2, y, colors.text, 11, 'center');
}

export const electricitySims: SimDefinition[] = [
  {
    id: 'ohms-law',
    title: L("Ohm's law", 'ओम का नियम'),
    description: L('At constant temperature V = IR. The I–V graph is a straight line through the origin for an ohmic conductor.', 'नियत ताप पर V = IR. ओमिक चालक का I–V ग्राफ़ मूल बिंदु से होकर जाने वाली सीधी रेखा है।'),
    category: 'electricity',
    level: 'class-9-10',
    params: [
      { key: 'voltage', label: L('Voltage', 'विभवांतर'), unit: 'V', min: 0, max: 24, step: 0.5, default: 12 },
      { key: 'resistance', label: L('Resistance', 'प्रतिरोध'), unit: 'Ω', min: 1, max: 100, step: 1, default: 20 },
    ],
    readouts: [
      { label: L('Current', 'धारा'), unit: 'A', compute: (_s, p) => p.voltage / p.resistance, digits: 4 },
      { label: L('Power', 'शक्ति'), unit: 'W', compute: (_s, p) => (p.voltage * p.voltage) / p.resistance },
      { label: L('Conductance', 'चालकता'), unit: 'S', compute: (_s, p) => 1 / p.resistance, digits: 4 },
    ],
    init: () => ({ charge: 0 }),
    step: ({ state, p, dt }) => ({ charge: (state.charge + (p.voltage / p.resistance) * dt * 0.35) % 1 }),
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const y = c.height * 0.32;
      wire(c, [[30, y], [c.width * 0.62, y]], colors.text);
      wire(c, [[30, y], [30, y + 110], [c.width * 0.62, y + 110], [c.width * 0.62, y]], colors.text);
      resistor(c, c.width * 0.22, y, 90, 26, `${c.p.resistance} Ω`);
      c.ctx.fillStyle = colors.accent;
      c.ctx.fillRect(40, y + 42, 44, 26);
      label(c.ctx, `${c.p.voltage} V`, 62, y + 55, colors.bg, 11, 'center');
      for (let i = 0; i < 6; i++) {
        const f = (c.state.charge + i / 6) % 1;
        const x = 34 + f * (c.width * 0.6 - 40);
        circle(c.ctx, x, y, 3.5, colors.cyan);
      }
      arrow(c.ctx, c.width * 0.34, y - 16, c.width * 0.46, y - 16, colors.cyan, 2);
      label(c.ctx, `I = V/R = ${(c.p.voltage / c.p.resistance).toFixed(3)} A`, 30, y - 34, colors.text, 12);
      const gx = 30;
      const gy = c.height - 34;
      const gw = c.width * 0.45;
      const gh = 92;
      c.ctx.strokeStyle = colors.axis;
      c.ctx.lineWidth = 1;
      c.ctx.beginPath();
      c.ctx.moveTo(gx, gy);
      c.ctx.lineTo(gx + gw, gy);
      c.ctx.moveTo(gx, gy);
      c.ctx.lineTo(gx, gy - gh);
      c.ctx.stroke();
      const maxV = 24;
      const maxI = maxV / Math.min(5, c.p.resistance);
      c.ctx.beginPath();
      c.ctx.moveTo(gx, gy);
      c.ctx.lineTo(gx + gw, gy - Math.min(gh, (maxI * c.p.resistance * gh) / maxV));
      c.ctx.strokeStyle = colors.primary;
      c.ctx.lineWidth = 2;
      c.ctx.stroke();
      circle(c.ctx, gx + (c.p.voltage / maxV) * gw, gy - Math.min(gh, ((c.p.voltage / c.p.resistance) / maxI) * gh), 4, colors.accent);
      label(c.ctx, 'I', gx - 8, gy - gh, colors.muted, 11);
      label(c.ctx, 'V', gx + gw + 8, gy, colors.muted, 11);
    },
  },
  {
    id: 'series-parallel',
    title: L('Series and parallel circuits', 'श्रेणी और समान्तर परिपथ'),
    description: L('Compare equivalent resistance, total current and voltage division for identical resistors.', 'समान প্রতিরোধकों के लिए तुल्य प्रतिरोध, कुल धारा और विभव विभाजन की तुलना करें।'),
    category: 'electricity',
    level: 'class-9-10',
    params: [
      { key: 'voltage', label: L('Supply voltage', 'आपूर्ति वोल्टेज'), unit: 'V', min: 1, max: 24, step: 1, default: 12 },
      { key: 'resistance', label: L('Each resistor', 'प्रत्येक प्रतिरोधक'), unit: 'Ω', min: 1, max: 50, step: 1, default: 10 },
      { key: 'mode', label: L('Mode: 0 series, 1 parallel', 'मोड: 0 श्रेणी, 1 समान्तर'), unit: '', min: 0, max: 1, step: 1, default: 0 },
    ],
    readouts: [
      { label: L('Equivalent resistance', 'तुल्य प्रतिरोध'), unit: 'Ω', compute: (_s, p) => (p.mode < 0.5 ? 3 * p.resistance : p.resistance / 3) },
      { label: L('Total current', 'कुल धारा'), unit: 'A', compute: (_s, p) => (p.mode < 0.5 ? p.voltage / (3 * p.resistance) : (3 * p.voltage) / p.resistance) },
      { label: L('Voltage per resistor', 'प्रत्येक पर वोल्टेज'), unit: 'V', compute: (_s, p) => (p.mode < 0.5 ? p.voltage / 3 : p.voltage) },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      drawGrid(c, 34);
      const colors = palette(c.theme);
      const series = c.p.mode < 0.5;
      const top = 48;
      const bottom = c.height - 48;
      const left = 44;
      const right = c.width - 44;
      wire(c, [[left, top], [right, top]], colors.text);
      wire(c, [[left, top], [left, bottom], [right, bottom], [right, top]], colors.text);
      c.ctx.fillStyle = colors.accent;
      c.ctx.fillRect(left + 8, top + 44, 42, 24);
      label(c.ctx, `${c.p.voltage} V`, left + 29, top + 56, colors.bg, 10, 'center');
      if (series) {
        const stepX = (right - left - 80) / 3;
        for (let i = 0; i < 3; i++) resistor(c, left + 50 + i * stepX, top, 46, 18, `R${i + 1}`);
      } else {
        for (let i = 0; i < 3; i++) {
          const x = left + 100 + i * ((right - left - 160) / 2);
          wire(c, [[x, top], [x, top + 26]], colors.text);
          resistor(c, x - 23, top + 48, 46, 18, `R${i + 1}`);
          wire(c, [[x, top + 57], [x, bottom]], colors.text);
        }
      }
      arrow(c.ctx, left + 6, top - 14, left + 80, top - 14, colors.cyan, 2);
      label(c.ctx, series ? 'Series: R_eq = R₁+R₂+R₃' : 'Parallel: 1/R_eq = 1/R₁+1/R₂+1/R₃', left, bottom + 16, colors.text, 12);
    },
  },
  {
    id: 'kirchhoff',
    title: L("Kirchhoff's laws", 'किर्यहॉफ के नियम'),
    description: L('Two mesh currents solved from KVL: (R₁+R₃)I₁ − R₃I₂ = V₁ and −R₃I₁ + (R₂+R₃)I₂ = V₂.', 'KVL से दो जाल धाराएँ: (R₁+R₃)I₁ − R₃I₂ = V₁ तथा −R₃I₁ + (R₂+R₃)I₂ = V₂।'),
    category: 'electricity',
    level: 'class-12',
    params: [
      { key: 'v1', label: L('Source V₁', 'स्रोत V₁'), unit: 'V', min: 1, max: 24, step: 1, default: 12 },
      { key: 'v2', label: L('Source V₂', 'स्रोत V₂'), unit: 'V', min: 1, max: 24, step: 1, default: 6 },
      { key: 'r1', label: L('Resistor R₁', 'प्रतिरोधक R₁'), unit: 'Ω', min: 1, max: 20, step: 1, default: 4 },
      { key: 'r2', label: L('Resistor R₂', 'प्रतिरोधक R₂'), unit: 'Ω', min: 1, max: 20, step: 1, default: 6 },
      { key: 'r3', label: L('Shared R₃', 'साझा R₃'), unit: 'Ω', min: 1, max: 20, step: 1, default: 8 },
    ],
    readouts: [
      { label: L('Mesh current I₁', 'जाल धारा I₁'), unit: 'A', compute: (_s, p) => meshCurrents(p).i1, digits: 4 },
      { label: L('Mesh current I₂', 'जाल धारा I₂'), unit: 'A', compute: (_s, p) => meshCurrents(p).i2, digits: 4 },
      { label: L('Shared branch I₃', 'साझा शाखा I₃'), unit: 'A', compute: (_s, p) => meshCurrents(p).i1 - meshCurrents(p).i2, digits: 4 },
      { label: L('KVL check loop 1', 'KVL जाँच लूप 1'), unit: 'V', compute: (_s, p) => { const { i1, i2 } = meshCurrents(p); return p.v1 - i1 * p.r1 - (i1 - i2) * p.r3; }, digits: 3 },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      drawGrid(c, 34);
      const colors = palette(c.theme);
      const l = 30;
      const m = c.width / 2;
      const r = c.width - 30;
      const top = 40;
      const mid = c.height / 2;
      const bottom = c.height - 46;
      wire(c, [[l, top], [m, top], [m, mid]], colors.text);
      wire(c, [[m, mid], [r, top], [r, bottom], [m, bottom]], colors.text);
      wire(c, [[m, bottom], [l, bottom], [l, top]], colors.text);
      wire(c, [[m, mid], [m, bottom]], colors.primary, 3);
      resistor(c, l + 24, top, 40, 16, `R₁ ${c.p.r1}`);
      resistor(c, r - 64, top, 40, 16, `R₂ ${c.p.r2}`);
      resistor(c, m - 20, mid + 44, 40, 16, `R₃ ${c.p.r3}`);
      c.ctx.fillStyle = colors.accent;
      c.ctx.fillRect(l + 24, bottom - 30, 34, 18);
      c.ctx.fillRect(r - 58, bottom - 30, 34, 18);
      label(c.ctx, `V₁ ${c.p.v1}V`, l + 41, bottom - 4, colors.accent, 11, 'center');
      label(c.ctx, `V₂ ${c.p.v2}V`, r - 41, bottom - 4, colors.accent, 11, 'center');
      const { i1, i2 } = meshCurrents(c.p);
      arrow(c.ctx, l + 80, top - 14, l + 140, top - 14, colors.cyan, 2);
      arrow(c.ctx, r - 80, top - 14, r - 140, top - 14, colors.good, 2);
      label(c.ctx, `I₁ = ${i1.toFixed(3)} A`, l + 80, top - 26, colors.cyan, 11);
      label(c.ctx, `I₂ = ${i2.toFixed(3)} A`, r - 80, top - 26, colors.good, 11, 'right');
    },
  },
  {
    id: 'electric-field',
    title: L('Electric field of point charges', 'बिंदु आवेशों का विद्युत क्षेत्र'),
    description: L('Field vectors from two point charges are added using Coulomb’s law: E = kq r̂ / r².', 'दो बिंदु आवेशों के क्षेत्र सदिश कूलॉम्ब के नियम E = kq r̂ / r² से जोड़े जाते हैं।'),
    category: 'electricity',
    level: 'class-12',
    params: [
      { key: 'q1', label: L('Charge q₁', 'आवेश q₁'), unit: 'μC', min: -5, max: 5, step: 0.5, default: 2 },
      { key: 'q2', label: L('Charge q₂', 'आवेश q₂'), unit: 'μC', min: -5, max: 5, step: 0.5, default: -1 },
      { key: 'probeX', label: L('Probe X', 'जाँच बिंदु X'), unit: 'm', min: -4, max: 4, step: 0.1, default: 1 },
      { key: 'probeY', label: L('Probe Y', 'जाँच बिंदु Y'), unit: 'm', min: -3, max: 3, step: 0.1, default: 1 },
    ],
    readouts: [
      { label: L('E at probe', 'जाँच बिंदु पर E'), unit: 'N/C', compute: (_s, p) => Math.hypot(...electricFieldAt(p.probeX, p.probeY, p.q1, p.q2)) },
      { label: L('Eₓ', 'Eₓ'), unit: 'N/C', compute: (_s, p) => electricFieldAt(p.probeX, p.probeY, p.q1, p.q2)[0] },
      { label: L('Eᵧ', 'Eᵧ'), unit: 'N/C', compute: (_s, p) => electricFieldAt(p.probeX, p.probeY, p.q1, p.q2)[1] },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      drawGrid(c, 32);
      const colors = palette(c.theme);
      const cx = c.width / 2;
      const cy = c.height / 2;
      const scale = Math.min(c.width, c.height) / 9;
      const charges = [
        { q: c.p.q1, x: -1.6, y: 0 },
        { q: c.p.q2, x: 1.6, y: 0 },
      ];
      for (let gx = -4; gx <= 4; gx += 0.8) {
        for (let gy = -3; gy <= 3; gy += 0.8) {
          const [ex, ey] = electricFieldAt(gx, gy, c.p.q1, c.p.q2);
          const mag = Math.hypot(ex, ey);
          if (mag < 1) continue;
          const len = Math.min(20, 7 + Math.log10(mag) * 2.5);
          arrow(c.ctx, cx + gx * scale, cy - gy * scale, cx + gx * scale + (ex / mag) * len, cy - gy * scale - (ey / mag) * len, colors.muted, 1, 4);
        }
      }
      charges.forEach((ch) => {
        circle(c.ctx, cx + ch.x * scale, cy - ch.y * scale, 12, ch.q > 0 ? colors.danger : colors.cyan, colors.text);
        label(c.ctx, ch.q > 0 ? '+' : '−', cx + ch.x * scale, cy - ch.y * scale, colors.bg, 16, 'center');
      });
      const px = cx + c.p.probeX * scale;
      const py = cy - c.p.probeY * scale;
      const [ex, ey] = electricFieldAt(c.p.probeX, c.p.probeY, c.p.q1, c.p.q2);
      const mag = Math.hypot(ex, ey) || 1;
      circle(c.ctx, px, py, 5, colors.accent);
      arrow(c.ctx, px, py, px + (ex / mag) * 48, py - (ey / mag) * 48, colors.good, 2);
    },
  },
  {
    id: 'magnetic-field',
    title: L('Magnetic field around a wire', 'तार के चारों ओर चुम्बकीय क्षेत्र'),
    description: L('For a long straight wire B = μ₀I/(2πr); field circles follow the right-hand rule.', 'लंबे सीधे तार के लिए B = μ₀I/(2πr); क्षेत्र रेखाएँ दक्षिण-हस्त नियम का पालन करती हैं।'),
    category: 'magnetism',
    level: 'class-12',
    params: [
      { key: 'current', label: L('Current', 'धारा'), unit: 'A', min: 0.5, max: 20, step: 0.5, default: 6 },
      { key: 'radius', label: L('Distance r', 'दूरी r'), unit: 'm', min: 0.05, max: 1, step: 0.01, default: 0.2 },
    ],
    readouts: [
      { label: L('Magnetic flux density', 'चुम्बकीय फ्लक्स घनत्व'), unit: 'T', compute: (_s, p) => (PHYS.mu0 * p.current) / (2 * Math.PI * p.radius), digits: 7 },
      { label: L('Field at 2r', '2r पर क्षेत्र'), unit: 'T', compute: (_s, p) => (PHYS.mu0 * p.current) / (4 * Math.PI * p.radius), digits: 7 },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const cx = c.width / 2;
      const cy = c.height / 2;
      for (let r = 28; r < Math.min(c.width, c.height) / 2 - 10; r += 32) {
        c.ctx.beginPath();
        c.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        c.ctx.strokeStyle = colors.grid;
        c.ctx.lineWidth = 1;
        c.ctx.stroke();
        const angle = c.state.t * (0.8 + 2 / (r / 30));
        arrow(c.ctx, cx + r * Math.cos(angle), cy + r * Math.sin(angle), cx + r * Math.cos(angle + 0.22), cy + r * Math.sin(angle + 0.22), colors.muted, 1.5, 5);
      }
      circle(c.ctx, cx, cy, 10, colors.accent, colors.text);
      label(c.ctx, 'I ⊙ (out of page)', cx + 16, cy - 16, colors.text, 12);
      const rPx = Math.min(c.width, c.height) * 0.32 * (c.p.radius / 0.5);
      circle(c.ctx, cx + rPx, cy, 5, colors.cyan);
      arrow(c.ctx, cx, cy, cx + rPx, cy, colors.cyan, 1.5);
      label(c.ctx, `r = ${c.p.radius.toFixed(2)} m`, cx + rPx / 2, cy - 12, colors.cyan, 11);
    },
  },
  {
    id: 'electromagnetic-induction',
    title: L('Electromagnetic induction', 'विद्युत चुम्बकीय प्रेरण'),
    description: L('A magnet passes through a coil. Flux changes and an emf ε = −N dΦ/dt appears (Faraday–Lenz).', 'चुम्बक कुंडली से होकर गुजरता है। फ्लक्स बदलता है और ε = −N dΦ/dt उत्पन्न होता है।'),
    category: 'magnetism',
    level: 'class-12',
    params: [
      { key: 'turns', label: L('Coil turns N', 'कुंडली के चक्कर N'), unit: 'N', min: 10, max: 200, step: 5, default: 60 },
      { key: 'field', label: L('Magnetic field', 'चुम्बकीय क्षेत्र'), unit: 'T', min: 0.1, max: 2, step: 0.05, default: 0.8 },
      { key: 'speed', label: L('Magnet speed', 'चुम्बक का वेग'), unit: 'm/s', min: 0.5, max: 8, step: 0.1, default: 2.5 },
      { key: 'area', label: L('Coil area', 'कुंडली क्षेत्रफल'), unit: 'm²', min: 0.01, max: 0.5, step: 0.01, default: 0.1 },
    ],
    readouts: [
      { label: L('Flux Φ', 'फ्लक्स Φ'), unit: 'Wb', compute: (s, p) => p.turns * p.field * p.area * Math.exp(-s.x * s.x * 4), digits: 5 },
      { label: L('Induced emf', 'प्रेरित विद्युत वाहक बल'), unit: 'V', compute: (s, p) => emfOf(s, p), digits: 4 },
      { label: L('Magnet position', 'चुम्बक की स्थिति'), unit: 'm', compute: (s) => s.x },
    ],
    init: () => ({ x: -1.6 }),
    step: ({ state, p, dt }) => {
      let x = state.x + p.speed * dt;
      if (x > 1.7) x = -1.7;
      return { x };
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 34);
      const colors = palette(c.theme);
      const y = c.height / 2;
      const cx = c.width / 2;
      for (let i = -3; i <= 3; i++) {
        const x = cx + i * 16;
        c.ctx.beginPath();
        c.ctx.ellipse(x, y, 8, 52, 0, 0, Math.PI * 2);
        c.ctx.strokeStyle = i === 0 ? colors.primary : colors.muted;
        c.ctx.lineWidth = i === 0 ? 2.5 : 1.2;
        c.ctx.stroke();
      }
      const mx = cx + c.state.x * (c.width * 0.24);
      c.ctx.fillStyle = colors.danger;
      c.ctx.fillRect(mx - 22, y - 20, 22, 40);
      c.ctx.fillStyle = colors.cyan;
      c.ctx.fillRect(mx, y - 20, 22, 40);
      label(c.ctx, 'N', mx - 11, y, colors.bg, 12, 'center');
      label(c.ctx, 'S', mx + 11, y, colors.bg, 12, 'center');
      const emf = emfOf(c.state, c.p);
      arrow(c.ctx, cx + 70, y - 58, cx + 70 + Math.max(-60, Math.min(60, emf * 6)), y - 58, colors.good, 2);
      label(c.ctx, `ε = ${emf.toFixed(3)} V`, cx + 70, y - 76, colors.good, 12);
      label(c.ctx, c.lang === 'hi' ? 'लेंज़: प्रेरित धारा फ्लक्स के परिवर्तन का विरोध करती है' : 'Lenz: induced current opposes the change in flux', 12, 20, colors.text, 11);
    },
  },
];

/** Field from two point charges (in μC) at coordinates in metres. */
function electricFieldAt(x: number, y: number, q1: number, q2: number): [number, number] {
  const charges = [
    { q: q1 * 1e-6, x: -1.6, y: 0 },
    { q: q2 * 1e-6, x: 1.6, y: 0 },
  ];
  let ex = 0;
  let ey = 0;
  for (const ch of charges) {
    const dx = x - ch.x;
    const dy = y - ch.y;
    const r2 = Math.max(0.05, dx * dx + dy * dy);
    const factor = (PHYS.ke * ch.q) / (r2 * Math.sqrt(r2));
    ex += factor * dx;
    ey += factor * dy;
  }
  return [ex, ey];
}

function meshCurrents(p: Record<string, number>) {
  const a = p.r1 + p.r3;
  const b = -p.r3;
  const d = p.r2 + p.r3;
  const det = a * d - b * b;
  return {
    i1: (p.v1 * d - b * p.v2) / det,
    i2: (a * p.v2 - b * p.v1) / det,
  };
}

function emfOf(s: Record<string, number>, p: Record<string, number>) {
  // A Gaussian spatial field profile keeps the derivative analytic and sign-consistent.
  return 2 * p.turns * p.field * p.area * p.speed * s.x * Math.exp(-s.x * s.x * 4);
}
