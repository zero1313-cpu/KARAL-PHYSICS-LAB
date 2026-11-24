import { PHYS } from '@/physics/constants';
import { projectileAt, projectileFlightTime, projectileMaxHeight, projectileRange, stepRK4 } from '@/engine/integrators';
import type { SimDefinition, SimState } from '../types';
import { arrow, circle, clear, drawAxes, drawGrid, label, palette, spring } from '../draw/canvasUtils';

const L = (en: string, hi: string) => ({ en, hi });

function ground(c: Parameters<SimDefinition['draw']>[0], y: number) {
  const colors = palette(c.theme);
  c.ctx.strokeStyle = colors.axis;
  c.ctx.lineWidth = 2;
  c.ctx.beginPath();
  c.ctx.moveTo(0, y);
  c.ctx.lineTo(c.width, y);
  c.ctx.stroke();
  for (let x = 10; x < c.width; x += 18) {
    c.ctx.beginPath();
    c.ctx.moveTo(x, y);
    c.ctx.lineTo(x - 8, y + 8);
    c.ctx.stroke();
  }
}

function drawBlock(c: Parameters<SimDefinition['draw']>[0], x: number, y: number, w: number, h: number, color: string, text?: string) {
  const colors = palette(c.theme);
  c.ctx.fillStyle = color;
  c.ctx.fillRect(x, y - h, w, h);
  c.ctx.strokeStyle = colors.text;
  c.ctx.lineWidth = 1.5;
  c.ctx.strokeRect(x, y - h, w, h);
  if (text) label(c.ctx, text, x + w / 2, y - h / 2, colors.bg, 12, 'center');
}

export const mechanicsSims: SimDefinition[] = [
  {
    id: 'projectile-motion',
    title: L('Projectile motion', 'प्रक्षेप्य गति'),
    description: L('Vary launch speed, angle and gravity. The predicted parabola and live velocity vectors are computed analytically.', 'वेग, कोण और गुरुत्व बदलें। अनुमानित परवलय और वेग सदिश विश्लेषित रूप से गणना किए जाते हैं।'),
    category: 'mechanics',
    level: 'class-11',
    threeDId: 'projectile-3d',
    note: L('Ideal model: no air resistance, constant gravity, point mass.', 'आदर्श मॉडल: कोई वायु प्रतिरोध नहीं, नियत गुरुत्व, बिंदु द्रव्यमान।'),
    params: [
      { key: 'v0', label: L('Launch speed', 'प्रारंभिक वेग'), unit: 'm/s', min: 2, max: 60, step: 1, default: 24 },
      { key: 'angle', label: L('Launch angle', 'प्रक्षेपण कोण'), unit: '°', min: 5, max: 85, step: 1, default: 45 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01, default: PHYS.g },
      { key: 'height', label: L('Launch height', 'प्रारंभिक ऊँचाई'), unit: 'm', min: 0, max: 30, step: 1, default: 0 },
    ],
    readouts: [
      { label: L('Range', 'परास'), unit: 'm', compute: (_s, p) => projectileRange(p.v0, p.angle, p.g) },
      { label: L('Max height', 'अधिकतम ऊँचाई'), unit: 'm', compute: (_s, p) => projectileMaxHeight(p.v0, p.angle, p.g) + p.height },
      { label: L('Flight time', 'उड़ान समय'), unit: 's', compute: (_s, p) => projectileFlightTime(p.v0, p.angle, p.height, p.g) },
      { label: L('Speed now', 'वर्तमान वेग'), unit: 'm/s', compute: (s) => Math.hypot(s.vx, s.vy) },
    ],
    init: (p) => {
      const theta = (p.angle * Math.PI) / 180;
      return { x: 0, y: p.height, vx: p.v0 * Math.cos(theta), vy: p.v0 * Math.sin(theta), t: 0, n: 0, sample: 0 };
    },
    step: ({ state, p, dt }) => {
      const next = stepRK4(
        { position: { x: state.x, y: state.y }, velocity: { x: state.vx, y: state.vy }, acceleration: { x: 0, y: -p.g }, time: state.t },
        () => ({ x: 0, y: -p.g }),
        dt,
      );
      const out: SimState = { ...state, x: next.position.x, y: next.position.y, vx: next.velocity.x, vy: next.velocity.y, t: next.time, sample: state.sample + dt };
      if (out.y < 0) {
        const theta = (p.angle * Math.PI) / 180;
        return { x: 0, y: p.height, vx: p.v0 * Math.cos(theta), vy: p.v0 * Math.sin(theta), t: 0, n: 0, sample: 0 };
      }
      if (out.sample > 0.06 && out.n < 60) {
        out[`tx${out.n}`] = out.x;
        out[`ty${out.n}`] = out.y;
        out.n += 1;
        out.sample = 0;
      }
      return out;
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 36);
      const colors = palette(c.theme);
      const scale = Math.max(1.2, Math.min((c.width - 130) / Math.max(10, projectileRange(c.p.v0, c.p.angle, c.p.g)), (c.height - 90) / Math.max(8, projectileMaxHeight(c.p.v0, c.p.angle, c.p.g) + c.p.height)));
      const ox = 54;
      const oy = c.height - 52;
      drawAxes(c, ox, oy);
      const total = projectileFlightTime(c.p.v0, c.p.angle, c.p.height, c.p.g);
      c.ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const t = (total * i) / 90;
        const pt = projectileAt(c.p.v0, c.p.angle, 0, c.p.height, t, c.p.g);
        const px = ox + pt.x * scale;
        const py = oy - pt.y * scale;
        if (i === 0) c.ctx.moveTo(px, py);
        else c.ctx.lineTo(px, py);
      }
      c.ctx.setLineDash([5, 5]);
      c.ctx.strokeStyle = colors.primary;
      c.ctx.lineWidth = 2;
      c.ctx.stroke();
      c.ctx.setLineDash([]);
      const bx = ox + c.state.x * scale;
      const by = oy - c.state.y * scale;
      for (let i = 0; i < c.state.n; i++) circle(c.ctx, ox + c.state[`tx${i}`] * scale, oy - c.state[`ty${i}`] * scale, 2.5, colors.cyan);
      circle(c.ctx, bx, by, 8, colors.accent, colors.text);
      arrow(c.ctx, bx, by, bx + c.state.vx * scale * 0.16, by - c.state.vy * scale * 0.16, colors.cyan, 2);
      arrow(c.ctx, bx, by, bx, by + Math.min(38, c.p.g * 3), colors.danger, 2);
      label(c.ctx, 'v', bx + c.state.vx * scale * 0.16 + 5, by - c.state.vy * scale * 0.16, colors.cyan);
      label(c.ctx, 'g', bx + 6, by + Math.min(38, c.p.g * 3), colors.danger);
      label(c.ctx, `t = ${c.state.t.toFixed(2)} s`, 12, 20, colors.text, 13);
    },
  },
  {
    id: 'newtons-laws',
    title: L("Newton's laws of motion", 'न्यूटन के गति के नियम'),
    description: L('An applied force acts on a block. Net force, acceleration and velocity follow F_net = ma.', 'ब्लॉक पर बल लगता है। परिणामी बल, त्वरण और वेग F_net = ma से मिलते हैं।'),
    category: 'mechanics',
    level: 'class-9-10',
    params: [
      { key: 'mass', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.5, max: 20, step: 0.5, default: 4 },
      { key: 'force', label: L('Applied force', 'लगाया गया बल'), unit: 'N', min: 0, max: 100, step: 1, default: 24 },
      { key: 'mu', label: L('Friction coefficient', 'घर्षण गुणांक'), unit: 'μ', min: 0, max: 0.8, step: 0.01, default: 0.1 },
    ],
    readouts: [
      { label: L('Net force', 'परिणामी बल'), unit: 'N', compute: (_s, p) => Math.max(0, p.force - p.mu * p.mass * PHYS.g) },
      { label: L('Acceleration', 'त्वरण'), unit: 'm/s²', compute: (_s, p) => Math.max(0, (p.force - p.mu * p.mass * PHYS.g) / p.mass) },
      { label: L('Velocity', 'वेग'), unit: 'm/s', compute: (s) => s.v },
      { label: L('Displacement', 'विस्थापन'), unit: 'm', compute: (s) => s.x },
    ],
    init: () => ({ x: 0, v: 0 }),
    step: ({ state, p, dt }) => {
      const friction = p.mu * p.mass * PHYS.g;
      const net = p.force > friction ? p.force - friction : p.force > 0 ? 0 : 0;
      const a = net / p.mass;
      let x = state.x + state.v * dt + 0.5 * a * dt * dt;
      let v = state.v + a * dt;
      if (x > 12) { x = 0; v = 0; }
      return { x, v };
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 40);
      const colors = palette(c.theme);
      const y = c.height - 62;
      ground(c, y);
      const x = 54 + (c.state.x / 12) * (c.width - 150);
      drawBlock(c, x, y, 70, 52, colors.primary, c.lang === 'hi' ? 'm' : 'm');
      const forceLen = Math.min(110, c.p.force * 1.5);
      arrow(c.ctx, x + 70, y - 26, x + 70 + forceLen, y - 26, colors.good, 3);
      label(c.ctx, `F = ${c.p.force} N`, x + 76 + forceLen * 0.3, y - 40, colors.good, 12);
      const frictionLen = Math.min(80, c.p.mu * 130);
      arrow(c.ctx, x, y - 10, x - frictionLen, y - 10, colors.danger, 2);
      label(c.ctx, `f = ${(c.p.mu * c.p.mass * PHYS.g).toFixed(1)} N`, x - frictionLen - 4, y + 20, colors.danger, 11, 'right');
      arrow(c.ctx, x + 34, y - 52, x + 34, y - 52 - Math.min(60, c.state.v * 5), colors.cyan, 2);
      label(c.ctx, `v = ${c.state.v.toFixed(2)} m/s`, 12, 22, colors.text, 13);
      label(c.ctx, c.lang === 'hi' ? 'F_net = ma' : 'F_net = ma', c.width - 12, 22, colors.muted, 12, 'right');
    },
  },
  {
    id: 'force-acceleration',
    title: L('Force and acceleration', 'बल और त्वरण'),
    description: L('Explore inverse proportionality between mass and acceleration at constant force.', 'नियत बल पर द्रव्यमान और त्वरण के व्युत्क्रमानुपाती संबंध देखें।'),
    category: 'mechanics',
    level: 'class-6-8',
    params: [
      { key: 'mass', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 1, max: 12, step: 1, default: 3 },
      { key: 'force', label: L('Force', 'बल'), unit: 'N', min: 2, max: 60, step: 1, default: 18 },
    ],
    readouts: [
      { label: L('Acceleration', 'त्वरण'), unit: 'm/s²', compute: (_s, p) => p.force / p.mass },
      { label: L('Velocity', 'वेग'), unit: 'm/s', compute: (s) => s.v },
      { label: L('Momentum', 'संवेग'), unit: 'kg m/s', compute: (s, p) => p.mass * s.v },
    ],
    init: () => ({ x: 0, v: 0 }),
    step: ({ state, p, dt }) => {
      const a = p.force / p.mass;
      let x = state.x + state.v * dt + 0.5 * a * dt * dt;
      let v = state.v + a * dt;
      if (x > 10) { x = 0; v = 0; }
      return { x, v };
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 36);
      const colors = palette(c.theme);
      const y = c.height - 56;
      ground(c, y);
      const x = 40 + (c.state.x / 10) * (c.width - 130);
      drawBlock(c, x, y, 62, 46, colors.cyan, `${c.p.mass} kg`);
      arrow(c.ctx, x + 62, y - 24, x + 62 + Math.min(100, c.p.force * 2), y - 24, colors.good, 3);
      const a = c.p.force / c.p.mass;
      arrow(c.ctx, x + 30, y - 50, x + 30, y - 50 - Math.min(70, a * 4), colors.primary, 2);
      label(c.ctx, `a = F/m = ${a.toFixed(2)} m/s²`, 12, 20, colors.text, 13);
    },
  },
  {
    id: 'friction',
    title: L('Friction on an incline', 'तिरछे तल पर घर्षण'),
    description: L('A block slides down an incline. Acceleration is g(sin θ − μ cos θ).', 'ब्लॉक ढलान पर फिसलता है। त्वरण g(sin θ − μ cos θ) है।'),
    category: 'mechanics',
    level: 'class-9-10',
    params: [
      { key: 'angle', label: L('Incline angle', 'ढलान कोण'), unit: '°', min: 5, max: 60, step: 1, default: 30 },
      { key: 'mu', label: L('Friction coefficient', 'घर्षण गुणांक'), unit: 'μ', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01, default: PHYS.g },
    ],
    readouts: [
      { label: L('Downslope gravity', 'ढलान के अनुदिश गुरुत्व'), unit: 'N/kg', compute: (_s, p) => p.g * Math.sin((p.angle * Math.PI) / 180) },
      { label: L('Friction resistance', 'घर्षण प्रतिरोध'), unit: 'N/kg', compute: (_s, p) => p.mu * p.g * Math.cos((p.angle * Math.PI) / 180) },
      { label: L('Acceleration', 'त्वरण'), unit: 'm/s²', compute: (_s, p) => Math.max(0, p.g * (Math.sin((p.angle * Math.PI) / 180) - p.mu * Math.cos((p.angle * Math.PI) / 180))) },
    ],
    init: () => ({ s: 0, v: 0 }),
    step: ({ state, p, dt }) => {
      const theta = (p.angle * Math.PI) / 180;
      const a = p.g * (Math.sin(theta) - p.mu * Math.cos(theta));
      let s = state.s + state.v * dt + 0.5 * a * dt * dt;
      let v = state.v + a * dt;
      if (s > 9) { s = 0; v = 0; }
      if (s < 0) { s = 0; v = 0; }
      return { s, v };
    },
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const theta = (c.p.angle * Math.PI) / 180;
      const x0 = 30;
      const y0 = c.height - 30;
      const length = Math.min(c.width - 70, (c.height - 90) / Math.max(0.2, Math.tan(theta)));
      c.ctx.strokeStyle = colors.axis;
      c.ctx.lineWidth = 2;
      c.ctx.beginPath();
      c.ctx.moveTo(x0, y0);
      c.ctx.lineTo(x0 + length, y0 - length * Math.tan(theta));
      c.ctx.stroke();
      const px = x0 + c.state.s * Math.cos(theta);
      const py = y0 - c.state.s * Math.sin(theta);
      c.ctx.save();
      c.ctx.translate(px, py);
      c.ctx.rotate(-theta);
      c.ctx.fillStyle = colors.primary;
      c.ctx.fillRect(-18, -34, 36, 30);
      c.ctx.strokeStyle = colors.text;
      c.ctx.strokeRect(-18, -34, 36, 30);
      c.ctx.restore();
      arrow(c.ctx, px, py - 20, px + Math.cos(theta) * 70, py - 20 - Math.sin(theta) * 70, colors.good, 2);
      arrow(c.ctx, px, py - 6, px - Math.cos(theta) * 55, py - 6 + Math.sin(theta) * 55, colors.danger, 2);
      arrow(c.ctx, px, py - 18, px, py + 40, colors.cyan, 2);
      label(c.ctx, `θ = ${c.p.angle}°   μ = ${c.p.mu.toFixed(2)}`, 12, 20, colors.text, 13);
    },
  },
  {
    id: 'free-fall',
    title: L('Free fall', 'मुक्त गिरन'),
    description: L('A body accelerates under gravity. Bounce uses a coefficient of restitution.', 'पिंड गुरुत्व से त्वरित होता है। उछाल पुनःप्रत्यास्थता गुणांक पर निर्भर है।'),
    category: 'mechanics',
    level: 'class-9-10',
    params: [
      { key: 'height', label: L('Drop height', 'गिरने की ऊँचाई'), unit: 'm', min: 2, max: 50, step: 1, default: 20 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01, default: PHYS.g },
      { key: 'restitution', label: L('Bounce factor', 'उछाल गुणांक'), unit: 'e', min: 0, max: 0.95, step: 0.01, default: 0.5 },
    ],
    readouts: [
      { label: L('Height', 'ऊँचाई'), unit: 'm', compute: (s) => s.y },
      { label: L('Velocity', 'वेग'), unit: 'm/s', compute: (s) => s.v },
      { label: L('Impact speed', 'टकराव वेग'), unit: 'm/s', compute: (_s, p) => Math.sqrt(2 * p.g * p.height) },
    ],
    init: (p) => ({ y: p.height, v: 0, t: 0 }),
    step: ({ state, p, dt }) => {
      let v = state.v - p.g * dt;
      let y = state.y + v * dt;
      if (y <= 0) {
        y = 0;
        v = -v * p.restitution;
        if (v < 0.15) { y = p.height; v = 0; }
      }
      return { y, v, t: state.t + dt };
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 40);
      const colors = palette(c.theme);
      const floor = c.height - 42;
      const scale = (floor - 35) / Math.max(4, c.p.height);
      ground(c, floor);
      const y = floor - c.state.y * scale;
      circle(c.ctx, c.width / 2, y, 11, colors.accent, colors.text);
      arrow(c.ctx, c.width / 2 + 22, y - 8, c.width / 2 + 22, y - 8 + Math.min(60, Math.abs(c.state.v) * 4), colors.danger, 2);
      label(c.ctx, `h = ${c.state.y.toFixed(2)} m`, 12, 20, colors.text, 13);
      label(c.ctx, `v = ${c.state.v.toFixed(2)} m/s`, 12, 40, colors.muted, 12);
    },
  },
  {
    id: 'circular-motion',
    title: L('Uniform circular motion', 'एकसमान वृत्तीय गति'),
    description: L('Velocity is tangential; centripetal acceleration points to the centre.', 'वेग स्पर्शरेखीय है; अभिकेन्द्री त्वरण केन्द्र की ओर होता है।'),
    category: 'mechanics',
    level: 'class-11',
    params: [
      { key: 'radius', label: L('Radius', 'त्रिज्या'), unit: 'm', min: 0.5, max: 10, step: 0.1, default: 3 },
      { key: 'omega', label: L('Angular speed', 'कोणीय वेग'), unit: 'rad/s', min: 0.2, max: 5, step: 0.1, default: 1.6 },
    ],
    readouts: [
      { label: L('Tangential speed', 'स्पर्शरेखीय वेग'), unit: 'm/s', compute: (_s, p) => p.omega * p.radius },
      { label: L('Centripetal acceleration', 'अभिकेन्द्री त्वरण'), unit: 'm/s²', compute: (_s, p) => p.omega * p.omega * p.radius },
      { label: L('Period', 'आवर्तकाल'), unit: 's', compute: (_s, p) => (2 * Math.PI) / p.omega },
    ],
    init: () => ({ theta: 0 }),
    step: ({ state, p, dt }) => ({ theta: (state.theta + p.omega * dt) % (Math.PI * 2) }),
    draw: (c) => {
      clear(c);
      drawGrid(c, 36);
      const colors = palette(c.theme);
      const cx = c.width / 2;
      const cy = c.height / 2;
      const r = Math.min(c.width, c.height) * 0.32;
      c.ctx.beginPath();
      c.ctx.arc(cx, cy, r, 0, Math.PI * 2);
      c.ctx.strokeStyle = colors.axis;
      c.ctx.lineWidth = 1.5;
      c.ctx.stroke();
      const x = cx + r * Math.cos(c.state.theta);
      const y = cy + r * Math.sin(c.state.theta);
      circle(c.ctx, cx, cy, 4, colors.text);
      circle(c.ctx, x, y, 10, colors.accent, colors.text);
      const ac = c.p.omega * c.p.omega * c.p.radius;
      arrow(c.ctx, x, y, x - Math.cos(c.state.theta) * Math.min(90, ac * 12), y - Math.sin(c.state.theta) * Math.min(90, ac * 12), colors.danger, 2);
      arrow(c.ctx, x, y, x - Math.sin(c.state.theta) * 70, y + Math.cos(c.state.theta) * 70, colors.cyan, 2);
      label(c.ctx, 'a_c', x - Math.cos(c.state.theta) * 95, y - Math.sin(c.state.theta) * 95, colors.danger, 11);
      label(c.ctx, 'v', x - Math.sin(c.state.theta) * 80, y + Math.cos(c.state.theta) * 80, colors.cyan, 11);
    },
  },
  {
    id: 'pendulum',
    title: L('Simple pendulum', 'सरल लोलक'),
    description: L('Nonlinear pendulum integrated with RK4; small-angle period T = 2π√(L/g) shown for comparison.', 'RK4 से गैर-रैखिक लोलक; तुलना के लिए छोटे कोण पर T = 2π√(L/g)।'),
    category: 'mechanics',
    level: 'class-11',
    threeDId: 'pendulum-3d',
    params: [
      { key: 'length', label: L('String length', 'डोरी की लंबाई'), unit: 'm', min: 0.2, max: 4, step: 0.1, default: 1.5 },
      { key: 'g', label: L('Gravity', 'गुरुत्व'), unit: 'm/s²', min: 1, max: 20, step: 0.01, default: PHYS.g },
      { key: 'amplitude', label: L('Initial angle', 'प्रारंभिक कोण'), unit: '°', min: 5, max: 80, step: 1, default: 25 },
    ],
    readouts: [
      { label: L('Small-angle period', 'छोटे कोण पर आवर्तकाल'), unit: 's', compute: (_s, p) => 2 * Math.PI * Math.sqrt(p.length / p.g) },
      { label: L('Current angle', 'वर्तमान कोण'), unit: '°', compute: (s) => (s.theta * 180) / Math.PI },
      { label: L('Angular speed', 'कोणीय वेग'), unit: 'rad/s', compute: (s) => s.omega },
    ],
    init: (p) => ({ theta: (p.amplitude * Math.PI) / 180, omega: 0 }),
    step: ({ state, p, dt }) => {
      const stateLike = {
        position: { x: state.theta, y: 0 },
        velocity: { x: state.omega, y: 0 },
        acceleration: { x: 0, y: 0 },
        time: 0,
      };
      const next = stepRK4(stateLike, (s) => ({ x: -(p.g / p.length) * Math.sin(s.position.x), y: 0 }), dt);
      return { theta: next.position.x, omega: next.velocity.x };
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 36);
      const colors = palette(c.theme);
      const cx = c.width / 2;
      const cy = 32;
      const r = Math.min(c.height - 100, 230);
      c.ctx.strokeStyle = colors.axis;
      c.ctx.beginPath();
      c.ctx.moveTo(cx - 60, cy);
      c.ctx.lineTo(cx + 60, cy);
      c.ctx.stroke();
      const bx = cx + r * Math.sin(c.state.theta);
      const by = cy + r * Math.cos(c.state.theta);
      c.ctx.strokeStyle = colors.text;
      c.ctx.lineWidth = 1.5;
      c.ctx.beginPath();
      c.ctx.moveTo(cx, cy);
      c.ctx.lineTo(bx, by);
      c.ctx.stroke();
      circle(c.ctx, bx, by, 13, colors.accent, colors.text);
      c.ctx.beginPath();
      c.ctx.arc(cx, cy, r, Math.PI / 2 - 0.8, Math.PI / 2 + 0.8);
      c.ctx.strokeStyle = colors.grid;
      c.ctx.setLineDash([3, 5]);
      c.ctx.stroke();
      c.ctx.setLineDash([]);
      label(c.ctx, `L = ${c.p.length.toFixed(1)} m`, cx + 16, cy + r * 0.4, colors.muted, 12);
    },
  },
  {
    id: 'spring-oscillation',
    title: L('Spring oscillation', 'स्प्रिंग दोलन'),
    description: L('Damped mass–spring oscillator. ω = √(k/m) and T = 2π√(m/k).', 'अवमंदित द्रव्यमान–स्प्रिंग दोलक। ω = √(k/m), T = 2π√(m/k)।'),
    category: 'mechanics',
    level: 'class-11',
    threeDId: 'spring-3d',
    params: [
      { key: 'mass', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.2, max: 10, step: 0.1, default: 1 },
      { key: 'k', label: L('Spring constant', 'स्प्रिंग नियतांक'), unit: 'N/m', min: 5, max: 200, step: 1, default: 40 },
      { key: 'damping', label: L('Damping', 'अवमंदन'), unit: 'kg/s', min: 0, max: 3, step: 0.05, default: 0.15 },
    ],
    readouts: [
      { label: L('Angular frequency', 'कोणीय आवृत्ति'), unit: 'rad/s', compute: (_s, p) => Math.sqrt(p.k / p.mass) },
      { label: L('Period', 'आवर्तकाल'), unit: 's', compute: (_s, p) => 2 * Math.PI * Math.sqrt(p.mass / p.k) },
      { label: L('Displacement', 'विस्थापन'), unit: 'm', compute: (s) => s.x },
      { label: L('Total energy', 'कुल ऊर्जा'), unit: 'J', compute: (s, p) => 0.5 * p.k * s.x * s.x + 0.5 * p.mass * s.v * s.v },
    ],
    init: () => ({ x: 0.35, v: 0 }),
    step: ({ state, p, dt }) => {
      const a = -(p.k / p.mass) * state.x - (p.damping / p.mass) * state.v;
      let x = state.x + state.v * dt;
      let v = state.v + a * dt;
      if (Math.abs(x) > 0.45) x = Math.sign(x) * 0.45;
      return { x, v };
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 36);
      const colors = palette(c.theme);
      const cx = c.width / 2;
      const cy = 24;
      const y = cy + 110 + (c.state.x / 0.45) * 90;
      c.ctx.strokeStyle = colors.axis;
      c.ctx.lineWidth = 4;
      c.ctx.beginPath();
      c.ctx.moveTo(cx - 50, cy);
      c.ctx.lineTo(cx + 50, cy);
      c.ctx.stroke();
      spring(c.ctx, cx, cy, cx, y - 25, 9, 14, colors.primary);
      c.ctx.fillStyle = colors.accent;
      c.ctx.fillRect(cx - 28, y - 25, 56, 42);
      c.ctx.strokeStyle = colors.text;
      c.ctx.lineWidth = 1.5;
      c.ctx.strokeRect(cx - 28, y - 25, 56, 42);
      label(c.ctx, `${c.p.mass.toFixed(1)} kg`, cx, y - 4, colors.bg, 12, 'center');
      const yEq = cy + 110;
      c.ctx.strokeStyle = colors.grid;
      c.ctx.setLineDash([4, 4]);
      c.ctx.beginPath();
      c.ctx.moveTo(cx - 70, yEq);
      c.ctx.lineTo(cx + 70, yEq);
      c.ctx.stroke();
      c.ctx.setLineDash([]);
      label(c.ctx, 'equilibrium', cx + 74, yEq, colors.muted, 11);
    },
  },
  {
    id: 'momentum-collision',
    title: L('Conservation of momentum', 'संवेग संरक्षण'),
    description: L('One-dimensional elastic collision of two carts. Both momentum and kinetic energy are conserved.', 'दो गाड़ियों की एक-विमीय प्रत्यास्थ टक्कर। संवेग और गतिज ऊर्जा दोनों संरक्षित हैं।'),
    category: 'mechanics',
    level: 'class-9-10',
    params: [
      { key: 'm1', label: L('Cart 1 mass', 'गाड़ी 1 द्रव्यमान'), unit: 'kg', min: 0.5, max: 8, step: 0.5, default: 2 },
      { key: 'm2', label: L('Cart 2 mass', 'गाड़ी 2 द्रव्यमान'), unit: 'kg', min: 0.5, max: 8, step: 0.5, default: 3 },
      { key: 'u1', label: L('Cart 1 velocity', 'गाड़ी 1 वेग'), unit: 'm/s', min: 0, max: 10, step: 0.5, default: 6 },
      { key: 'u2', label: L('Cart 2 velocity', 'गाड़ी 2 वेग'), unit: 'm/s', min: -6, max: 6, step: 0.5, default: 0 },
    ],
    readouts: [
      { label: L('Initial momentum', 'प्रारंभिक संवेग'), unit: 'kg m/s', compute: (_s, p) => p.m1 * p.u1 + p.m2 * p.u2 },
      { label: L('Final momentum', 'अंतिम संवेग'), unit: 'kg m/s', compute: (s, p) => p.m1 * s.v1 + p.m2 * s.v2 },
      { label: L('Cart 1 final', 'गाड़ी 1 अंतिम वेग'), unit: 'm/s', compute: (s) => s.v1 },
      { label: L('Cart 2 final', 'गाड़ी 2 अंतिम वेग'), unit: 'm/s', compute: (s) => s.v2 },
    ],
    init: (p) => ({ x1: 0.08, x2: 0.72, v1: p.u1 / 10, v2: p.u2 / 10, hit: 0 }),
    step: ({ state, p, dt }) => {
      const x1 = state.x1 + state.v1 * dt;
      let x2 = state.x2 + state.v2 * dt;
      let v1 = state.v1;
      let v2 = state.v2;
      let hit = state.hit;
      if (!hit && x1 >= x2 - 0.12) {
        const f1 = ((p.m1 - p.m2) / (p.m1 + p.m2)) * p.u1 + ((2 * p.m2) / (p.m1 + p.m2)) * p.u2;
        const f2 = ((2 * p.m1) / (p.m1 + p.m2)) * p.u1 + ((p.m2 - p.m1) / (p.m1 + p.m2)) * p.u2;
        v1 = f1 / 10;
        v2 = f2 / 10;
        hit = 1;
      }
      if (x2 > 1.05 || x1 < -0.05) return { x1: 0.08, x2: 0.72, v1: p.u1 / 10, v2: p.u2 / 10, hit: 0 };
      return { x1, x2, v1, v2, hit };
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 40);
      const colors = palette(c.theme);
      const y = c.height - 62;
      ground(c, y);
      const x1 = c.state.x1 * (c.width - 40);
      const x2 = c.state.x2 * (c.width - 40);
      drawBlock(c, x1, y, 54, 44, colors.primary, `m₁=${c.p.m1}`);
      drawBlock(c, x2, y, 54, 44, colors.accent, `m₂=${c.p.m2}`);
      arrow(c.ctx, x1 + 27, y - 52, x1 + 27 + c.state.v1 * 130, y - 52, colors.good, 2);
      arrow(c.ctx, x2 + 27, y - 52, x2 + 27 + c.state.v2 * 130, y - 52, colors.cyan, 2);
      label(c.ctx, c.lang === 'hi' ? 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂' : 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂', 12, 20, colors.text, 13);
    },
  },
  {
    id: 'work-energy',
    title: L('Work and energy', 'कार्य और ऊर्जा'),
    description: L('Work done by the pulling force, work lost to friction and the resulting kinetic energy.', 'खींचने वाले बल द्वारा कार्य, घर्षण में हानि और परिणामी गतिज ऊर्जा।'),
    category: 'mechanics',
    level: 'class-9-10',
    params: [
      { key: 'force', label: L('Pulling force', 'खींचने का बल'), unit: 'N', min: 2, max: 60, step: 1, default: 20 },
      { key: 'mass', label: L('Mass', 'द्रव्यमान'), unit: 'kg', min: 0.5, max: 10, step: 0.5, default: 4 },
      { key: 'mu', label: L('Friction coefficient', 'घर्षण गुणांक'), unit: 'μ', min: 0, max: 0.5, step: 0.01, default: 0.15 },
    ],
    readouts: [
      { label: L('Work by force', 'बल द्वारा कार्य'), unit: 'J', compute: (s, p) => p.force * s.x },
      { label: L('Work by friction', 'घर्षण द्वारा कार्य'), unit: 'J', compute: (s, p) => -p.mu * p.mass * PHYS.g * s.x },
      { label: L('Kinetic energy', 'गतिज ऊर्जा'), unit: 'J', compute: (s, p) => 0.5 * p.mass * s.v * s.v },
      { label: L('Displacement', 'विस्थापन'), unit: 'm', compute: (s) => s.x },
    ],
    init: () => ({ x: 0, v: 0 }),
    step: ({ state, p, dt }) => {
      const a = (p.force - p.mu * p.mass * PHYS.g) / p.mass;
      let x = state.x + state.v * dt + 0.5 * a * dt * dt;
      let v = state.v + a * dt;
      if (x > 10) { x = 0; v = 0; }
      return { x, v };
    },
    draw: (c) => {
      clear(c);
      drawGrid(c, 40);
      const colors = palette(c.theme);
      const y = c.height - 62;
      ground(c, y);
      const x = 40 + (c.state.x / 10) * (c.width - 130);
      drawBlock(c, x, y, 60, 48, colors.primary, `${c.p.mass} kg`);
      arrow(c.ctx, x + 60, y - 26, x + 60 + Math.min(100, c.p.force * 2), y - 26, colors.good, 3);
      const wf = c.p.force * c.state.x;
      const ke = 0.5 * c.p.mass * c.state.v * c.state.v;
      const max = Math.max(1, wf);
      c.ctx.fillStyle = colors.good;
      c.ctx.fillRect(16, 18, (c.width - 32) * (ke / max), 8);
      c.ctx.fillStyle = colors.danger;
      c.ctx.fillRect(16 + (c.width - 32) * (ke / max), 18, (c.width - 32) * Math.max(0, 1 - ke / max), 8);
      label(c.ctx, `W = Fd = ${wf.toFixed(1)} J   KE = ${ke.toFixed(1)} J`, 16, 40, colors.text, 12);
    },
  },
];
