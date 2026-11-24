import { PHYS } from '@/physics/constants';
import type { SimDefinition } from '../types';
import { arrow, circle, clear, drawGrid, label, palette } from '../draw/canvasUtils';

const L = (en: string, hi: string) => ({ en, hi });

export const wavesOpticsSims: SimDefinition[] = [
  {
    id: 'reflection-refraction',
    title: L('Reflection and refraction', 'परावर्तन और अपवर्तन'),
    description: L('Snell’s law n₁ sin i = n₂ sin r with a correctly labelled normal and reflected ray.', 'स्नेल का नियम n₁ sin i = n₂ sin r, सही चिह्नित अभिलंब और परावर्तित किरण के साथ।'),
    category: 'optics',
    level: 'class-9-10',
    params: [
      { key: 'angle', label: L('Incident angle', 'आपतन कोण'), unit: '°', min: 0, max: 89, step: 1, default: 35 },
      { key: 'n1', label: L('First medium n₁', 'पहला माध्यम n₁'), unit: '', min: 1, max: 2, step: 0.01, default: 1 },
      { key: 'n2', label: L('Second medium n₂', 'दूसरा माध्यम n₂'), unit: '', min: 1, max: 2, step: 0.01, default: 1.5 },
    ],
    readouts: [
      { label: L('Refraction angle', 'अपवर्तन कोण'), unit: '°', compute: (_s, p) => snellAngle(p.angle, p.n1, p.n2) },
      { label: L('Reflection angle', 'परावर्तन कोण'), unit: '°', compute: (_s, p) => p.angle },
      { label: L('Critical angle', 'क्रांतिक कोण'), unit: '°', compute: (_s, p) => (p.n2 > p.n1 ? (Math.asin(p.n1 / p.n2) * 180) / Math.PI : NaN) },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const ox = c.width / 2;
      const oy = c.height / 2;
      c.ctx.fillStyle = c.theme === 'dark' ? '#121A3A' : '#E7ECFB';
      c.ctx.fillRect(0, oy, c.width, c.height - oy);
      c.ctx.strokeStyle = colors.axis;
      c.ctx.lineWidth = 2;
      c.ctx.beginPath();
      c.ctx.moveTo(0, oy);
      c.ctx.lineTo(c.width, oy);
      c.ctx.stroke();
      c.ctx.setLineDash([5, 5]);
      c.ctx.strokeStyle = colors.muted;
      c.ctx.beginPath();
      c.ctx.moveTo(ox, 30);
      c.ctx.lineTo(ox, c.height - 30);
      c.ctx.stroke();
      c.ctx.setLineDash([]);
      const theta = (c.p.angle * Math.PI) / 180;
      const r = snellAngle(c.p.angle, c.p.n1, c.p.n2);
      const length = Math.min(ox, oy) - 20;
      const ix = ox - Math.sin(theta) * length;
      const iy = oy - Math.cos(theta) * length;
      arrow(c.ctx, ix, iy, ox, oy, colors.accent, 2.5);
      arrow(c.ctx, ox, oy, ox + Math.sin(theta) * length, iy, colors.cyan, 2.5);
      if (Number.isFinite(r)) {
        const rr = (r * Math.PI) / 180;
        arrow(c.ctx, ox, oy, ox + Math.sin(rr) * length, oy + Math.cos(rr) * length, colors.good, 2.5);
        label(c.ctx, `r = ${r.toFixed(1)}°`, ox + 18, oy + 30, colors.good, 12);
      } else {
        label(c.ctx, 'Total internal reflection', ox + 18, oy + 30, colors.danger, 12);
      }
      label(c.ctx, `i = ${c.p.angle}°`, ox - 76, oy - 46, colors.accent, 12);
      label(c.ctx, 'normal', ox + 8, 36, colors.muted, 11);
      label(c.ctx, `n₁ = ${c.p.n1.toFixed(2)}`, 12, 20, colors.text, 12);
      label(c.ctx, `n₂ = ${c.p.n2.toFixed(2)}`, 12, 40, colors.text, 12);
    },
  },
  {
    id: 'lenses',
    title: L('Convex and concave lenses', 'उत्तल और अवतल लेंस'),
    description: L('Thin lens ray diagram using the Cartesian sign convention; image distance from 1/v − 1/u = 1/f.', 'पतले लेंस का किरण चित्र कार्तीय चिह्न परंपरा से; 1/v − 1/u = 1/f से प्रतिबिंब दूरी।'),
    category: 'optics',
    level: 'class-12',
    threeDId: 'optics-3d',
    params: [
      { key: 'focal', label: L('Focal length (signed)', 'फोकस दूरी (चिह्नित)'), unit: 'cm', min: -25, max: 25, step: 1, default: 10 },
      { key: 'objectDistance', label: L('Object distance |u|', 'वस्तु दूरी |u|'), unit: 'cm', min: 5, max: 60, step: 1, default: 30 },
      { key: 'objectHeight', label: L('Object height', 'वस्तु ऊँचाई'), unit: 'cm', min: 2, max: 20, step: 1, default: 8 },
    ],
    readouts: [
      { label: L('Image distance v', 'प्रतिबिंब दूरी v'), unit: 'cm', compute: (_s, p) => imageDistance(p), digits: 2 },
      { label: L('Magnification', 'आवर्धन'), unit: 'm', compute: (_s, p) => imageDistance(p) / -p.objectDistance, digits: 3 },
      { label: L('Image height', 'प्रतिबिंब ऊँचाई'), unit: 'cm', compute: (_s, p) => Math.abs((imageDistance(p) / -p.objectDistance) * p.objectHeight), digits: 2 },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const ox = c.width / 2;
      const ay = c.height / 2;
      const scale = Math.min(3.2, (c.width * 0.42) / Math.max(30, pAbs(c.p.objectDistance, imageDistance(c.p))));
      c.ctx.strokeStyle = colors.axis;
      c.ctx.lineWidth = 1;
      c.ctx.beginPath();
      c.ctx.moveTo(10, ay);
      c.ctx.lineTo(c.width - 10, ay);
      c.ctx.stroke();
      c.ctx.strokeStyle = colors.primary;
      c.ctx.lineWidth = 3;
      c.ctx.beginPath();
      c.ctx.ellipse(ox, ay, c.p.focal >= 0 ? 10 : 5, 62, 0, 0, Math.PI * 2);
      c.ctx.stroke();
      const ux = ox - c.p.objectDistance * scale;
      const uh = c.p.objectHeight * scale * 0.8;
      arrow(c.ctx, ux, ay, ux, ay - uh, colors.accent, 3);
      const v = imageDistance(c.p);
      if (Number.isFinite(v)) {
        const vx = ox + v * scale;
        const m = v / -c.p.objectDistance;
        if (Math.abs(vx - ox) < c.width) {
          arrow(c.ctx, vx, ay, vx, ay - m * uh, m < 0 ? colors.danger : colors.good, 3);
        }
        const fx = ox + c.p.focal * scale;
        c.ctx.strokeStyle = colors.grid;
        c.ctx.lineWidth = 1;
        c.ctx.beginPath();
        c.ctx.moveTo(ux, ay - uh);
        c.ctx.lineTo(ox, ay - uh);
        c.ctx.lineTo(fx, ay);
        c.ctx.moveTo(ux, ay - uh);
        c.ctx.lineTo(ox, ay);
        c.ctx.lineTo(vx, ay - m * uh);
        c.ctx.stroke();
        if (Number.isFinite(fx)) circle(c.ctx, fx, ay, 3, colors.cyan);
      }
      label(c.ctx, 'F', ox + c.p.focal * scale, ay + 16, colors.cyan, 11);
      label(c.ctx, 'F′', ox - c.p.focal * scale, ay + 16, colors.cyan, 11);
      label(c.ctx, c.p.focal >= 0 ? 'Convex' : 'Concave', ox - 30, 24, colors.text, 12);
    },
  },
  {
    id: 'wave-motion',
    title: L('Transverse wave motion', 'अनुप्रस्थ तरंग गति'),
    description: L('A travelling sinusoid y = A sin(kx − ωt); particle velocity differs from wave speed.', 'संचारी साइन तरंग y = A sin(kx − ωt); कण वेग तरंग वेग से भिन्न है।'),
    category: 'waves',
    level: 'class-11',
    threeDId: 'wave-3d',
    params: [
      { key: 'amplitude', label: L('Amplitude', 'आयाम'), unit: 'm', min: 0.1, max: 2, step: 0.1, default: 1 },
      { key: 'wavelength', label: L('Wavelength', 'तरंगदैर्घ्य'), unit: 'm', min: 0.5, max: 10, step: 0.1, default: 4 },
      { key: 'frequency', label: L('Frequency', 'आवृत्ति'), unit: 'Hz', min: 0.1, max: 3, step: 0.1, default: 0.8 },
    ],
    readouts: [
      { label: L('Wave speed', 'तरंग वेग'), unit: 'm/s', compute: (_s, p) => p.wavelength * p.frequency },
      { label: L('Angular frequency', 'कोणीय आवृत्ति'), unit: 'rad/s', compute: (_s, p) => 2 * Math.PI * p.frequency },
      { label: L('Wave number', 'तरंग संख्या'), unit: 'rad/m', compute: (_s, p) => (2 * Math.PI) / p.wavelength },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      drawGrid(c, 34);
      const colors = palette(c.theme);
      const mid = c.height / 2;
      const k = (2 * Math.PI) / c.p.wavelength;
      const omega = 2 * Math.PI * c.p.frequency;
      const ampPx = Math.min(90, c.p.amplitude * 45);
      c.ctx.beginPath();
      for (let x = 0; x <= c.width; x += 2) {
        const X = (x / c.width) * 8;
        const y = mid - c.p.amplitude * Math.sin(k * X - omega * c.state.t) * (ampPx / Math.max(0.1, c.p.amplitude));
        if (x === 0) c.ctx.moveTo(x, y);
        else c.ctx.lineTo(x, y);
      }
      c.ctx.strokeStyle = colors.primary;
      c.ctx.lineWidth = 2.5;
      c.ctx.stroke();
      const px = c.width * 0.25;
      const Xp = (px / c.width) * 8;
      const y = mid - ampPx * Math.sin(k * Xp - omega * c.state.t);
      const dy = -ampPx * omega * Math.cos(k * Xp - omega * c.state.t);
      circle(c.ctx, px, y, 5, colors.accent, colors.text);
      arrow(c.ctx, px, y, px, y + Math.max(-40, Math.min(40, dy * 0.06)), colors.cyan, 2);
      c.ctx.strokeStyle = colors.axis;
      c.ctx.beginPath();
      c.ctx.moveTo(0, mid);
      c.ctx.lineTo(c.width, mid);
      c.ctx.stroke();
      label(c.ctx, `v = fλ = ${(c.p.wavelength * c.p.frequency).toFixed(2)} m/s`, 12, 20, colors.text, 12);
    },
  },
  {
    id: 'sound-waves',
    title: L('Sound waves', 'ध्वनि तरंगें'),
    description: L('Longitudinal compressions and rarefactions of air particles; λ = v/f.', 'वायु कणों के संपीड़न और विरलन; λ = v/f।'),
    category: 'waves',
    level: 'class-9-10',
    params: [
      { key: 'frequency', label: L('Frequency', 'आवृत्ति'), unit: 'Hz', min: 40, max: 1000, step: 10, default: 220 },
      { key: 'amplitude', label: L('Particle amplitude', 'कण आयाम'), unit: 'mm', min: 0.1, max: 3, step: 0.1, default: 1 },
      { key: 'soundSpeed', label: L('Speed of sound', 'ध्वनि का वेग'), unit: 'm/s', min: 280, max: 380, step: 1, default: 343 },
    ],
    readouts: [
      { label: L('Wavelength', 'तरंगदैर्घ्य'), unit: 'm', compute: (_s, p) => p.soundSpeed / p.frequency, digits: 4 },
      { label: L('Period', 'आवर्तकाल'), unit: 's', compute: (_s, p) => 1 / p.frequency, digits: 5 },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const k = (2 * Math.PI * c.p.frequency) / c.p.soundSpeed;
      for (let row = 0; row < 3; row++) {
        const baseY = c.height * (0.28 + row * 0.22);
        for (let i = 0; i < 110; i++) {
          const x0 = (i / 110) * c.width;
          const X = (x0 / c.width) * 6;
          const displacement = 14 * c.p.amplitude * Math.sin(k * X - 2 * Math.PI * c.p.frequency * c.state.t * 0.04);
          circle(c.ctx, x0 + displacement, baseY, 2.6, colors.muted);
        }
      }
      label(c.ctx, `λ = v/f = ${(c.p.soundSpeed / c.p.frequency).toFixed(3)} m`, 12, 20, colors.text, 12);
      label(c.ctx, c.lang === 'hi' ? 'संपीड़न → कण एक साथ; विरलन → कण दूर' : 'Compression → particles close; rarefaction → particles apart', 12, c.height - 14, colors.muted, 11);
    },
  },
  {
    id: 'doppler-effect',
    title: L('Doppler effect', 'डॉपलर प्रभाव'),
    description: L('Moving source wavefronts and observed frequency f′ = f v/(v ∓ vₛ).', 'गतिशील स्रोत की तरंगाग्र और प्रेक्षित आवृत्ति f′ = f v/(v ∓ vₛ)।'),
    category: 'waves',
    level: 'class-11',
    params: [
      { key: 'frequency', label: L('Source frequency', 'स्रोत आवृत्ति'), unit: 'Hz', min: 1, max: 20, step: 1, default: 4 },
      { key: 'sourceSpeed', label: L('Source speed (signed)', 'स्रोत वेग (चिह्नित)'), unit: 'm/s', min: -30, max: 30, step: 1, default: 12 },
      { key: 'waveSpeed', label: L('Wave speed', 'तरंग वेग'), unit: 'm/s', min: 20, max: 80, step: 1, default: 40 },
    ],
    readouts: [
      { label: L('Observed frequency ahead', 'आगे प्रेक्षित आवृत्ति'), unit: 'Hz', compute: (_s, p) => (p.frequency * p.waveSpeed) / Math.max(1, p.waveSpeed - p.sourceSpeed), digits: 3 },
      { label: L('Observed frequency behind', 'पीछे प्रेक्षित आवृत्ति'), unit: 'Hz', compute: (_s, p) => (p.frequency * p.waveSpeed) / Math.max(1, p.waveSpeed + p.sourceSpeed), digits: 3 },
      { label: L('Wavelength ahead', 'आगे तरंगदैर्घ्य'), unit: 'm', compute: (_s, p) => Math.max(0, (p.waveSpeed - p.sourceSpeed) / p.frequency), digits: 3 },
    ],
    init: () => ({ x: -2, t: 0, n: 0, emit: 0 }),
    step: ({ state, p, dt }) => {
      let x = state.x + (p.sourceSpeed / p.waveSpeed) * dt * 2;
      if (x > 3) x = -3;
      if (x < -3) x = 3;
      const n = state.n;
      const out: Record<string, number> = { x, t: state.t + dt, n, emit: state.emit + dt };
      if (state.emit > 1 / p.frequency && n < 16) {
        out[`wx${n}`] = x;
        out[`wt${n}`] = state.t;
        out.n = n + 1;
        out.emit = 0;
      }
      if (n >= 16) {
        for (let i = 0; i < 16; i++) {
          out[`wx${i}`] = out[`wx${i + 1}`] ?? x;
          out[`wt${i}`] = out[`wt${i + 1}`] ?? state.t;
        }
        out.n = 15;
      }
      return out;
    },
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const cy = c.height / 2;
      const scale = c.width / 7;
      const observerX = c.width - 46;
      c.ctx.fillStyle = colors.good;
      c.ctx.fillRect(observerX, cy - 16, 14, 32);
      label(c.ctx, 'O', observerX + 7, cy - 26, colors.good, 12, 'center');
      for (let i = 0; i < c.state.n; i++) {
        const radius = (c.state.t - (c.state[`wt${i}`] ?? 0)) * c.p.waveSpeed * (scale / 40);
        if (radius <= 0) continue;
        c.ctx.beginPath();
        c.ctx.arc(c.width / 2 + (c.state[`wx${i}`] ?? 0) * scale, cy, radius, 0, Math.PI * 2);
        c.ctx.strokeStyle = colors.grid;
        c.ctx.lineWidth = 1;
        c.ctx.stroke();
      }
      const sx = c.width / 2 + c.state.x * scale;
      circle(c.ctx, sx, cy, 10, colors.danger, colors.text);
      arrow(c.ctx, sx, cy - 18, sx + Math.sign(c.p.sourceSpeed) * 40, cy - 18, colors.accent, 2);
      label(c.ctx, 'S', sx, cy + 24, colors.text, 12, 'center');
      const fObs = (c.p.frequency * c.p.waveSpeed) / Math.max(1, c.p.waveSpeed - c.p.sourceSpeed);
      label(c.ctx, `f = ${c.p.frequency} Hz   f′(ahead) = ${fObs.toFixed(2)} Hz`, 12, 20, colors.text, 12);
    },
  },
  {
    id: 'heat-transfer',
    title: L('Heat transfer', 'ऊष्मा स्थानांतरण'),
    description: L('Conduction, convection and radiation rates from their standard model equations.', 'चालन, संवहन और विकिरण दरें उनके मानक मॉडल समीकरणों से।'),
    category: 'thermal',
    level: 'class-11',
    params: [
      { key: 'mode', label: L('Mode: 0 conduction, 1 convection, 2 radiation', 'मोड: 0 चालन, 1 संवहन, 2 विकिरण'), unit: '', min: 0, max: 2, step: 1, default: 0 },
      { key: 'hot', label: L('Hot temperature', 'गर्म तापमान'), unit: 'K', min: 275, max: 600, step: 5, default: 373 },
      { key: 'cold', label: L('Cold temperature', 'ठंडा तापमान'), unit: 'K', min: 250, max: 360, step: 5, default: 293 },
      { key: 'area', label: L('Area', 'क्षेत्रफल'), unit: 'm²', min: 0.01, max: 2, step: 0.01, default: 0.1 },
      { key: 'length', label: L('Length', 'लंबाई'), unit: 'm', min: 0.01, max: 1, step: 0.01, default: 0.2 },
    ],
    readouts: [
      { label: L('Conduction rate', 'चालन दर'), unit: 'W', compute: (_s, p) => (400 * p.area * (p.hot - p.cold)) / p.length },
      { label: L('Convection rate', 'संवहन दर'), unit: 'W', compute: (_s, p) => 10 * p.area * Math.max(0, p.hot - p.cold) },
      { label: L('Radiation rate', 'विकिरण दर'), unit: 'W', compute: (_s, p) => 0.8 * PHYS.sigma * p.area * (Math.pow(p.hot, 4) - Math.pow(p.cold, 4)), digits: 2 },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const mode = Math.round(c.p.mode);
      if (mode === 0) {
        const x1 = 50;
        const x2 = c.width - 50;
        const y = c.height / 2 - 18;
        for (let i = 0; i < 20; i++) {
          const f = i / 19;
          c.ctx.fillStyle = f < 0.5 ? `rgba(251,113,133,${0.25 + f})` : `rgba(53,214,218,${0.25 + (1 - f)})`;
          c.ctx.fillRect(x1 + f * (x2 - x1), y, (x2 - x1) / 20 + 1, 36);
        }
        for (let i = 1; i < 5; i++) arrow(c.ctx, x1 + (i * (x2 - x1)) / 5, y - 14, x1 + (i * (x2 - x1)) / 5 + 26, y - 14, colors.accent, 1.5);
        label(c.ctx, `T_hot = ${c.p.hot} K`, x1, y - 34, colors.danger, 12);
        label(c.ctx, `T_cold = ${c.p.cold} K`, x2, y - 34, colors.cyan, 12, 'right');
        label(c.ctx, 'Q/t = kAΔT/L', c.width / 2, y + 66, colors.text, 13, 'center');
      } else if (mode === 1) {
        const cx = c.width / 2;
        c.ctx.fillStyle = colors.danger;
        c.ctx.fillRect(cx - 60, c.height - 80, 120, 40);
        for (let i = 0; i < 8; i++) {
          const x = cx - 40 + i * 12;
          const y = c.height - 90 - ((c.state.t * 40 + i * 22) % 180);
          arrow(c.ctx, x, y, x, y - 18, colors.accent, 1.5, 5);
        }
        label(c.ctx, 'Q/t = hAΔT', c.width / 2, 30, colors.text, 13, 'center');
      } else {
        const cx = c.width / 2;
        const cy = c.height / 2;
        circle(c.ctx, cx, cy, 28, colors.accent);
        for (let i = 0; i < 6; i++) {
          const r = 46 + i * 16 + ((c.state.t * 22) % 16);
          c.ctx.beginPath();
          c.ctx.arc(cx, cy, r, -0.8, 0.8);
          c.ctx.strokeStyle = colors.accent;
          c.ctx.globalAlpha = 0.6 - i * 0.08;
          c.ctx.stroke();
          c.ctx.globalAlpha = 1;
        }
        label(c.ctx, 'P = εσA(T₁⁴ − T₂⁴)', c.width / 2, 30, colors.text, 13, 'center');
      }
    },
  },
  {
    id: 'gas-laws',
    title: L('Gas laws: ideal gas', 'गैस के नियम: आदर्श गैस'),
    description: L('Piston volume follows PV = nRT. Particle speed grows as √T.', 'पिस्टन आयतन PV = nRT का पालन करता है। कण वेग √T के अनुपात में बढ़ता है।'),
    category: 'thermal',
    level: 'class-11',
    params: [
      { key: 'moles', label: L('Amount n', 'मात्रा n'), unit: 'mol', min: 0.1, max: 3, step: 0.1, default: 1 },
      { key: 'temperature', label: L('Temperature', 'तापमान'), unit: 'K', min: 100, max: 600, step: 5, default: 300 },
      { key: 'pressure', label: L('Pressure', 'दाब'), unit: 'kPa', min: 50, max: 300, step: 5, default: 100 },
    ],
    readouts: [
      { label: L('Volume', 'आयतन'), unit: 'm³', compute: (_s, p) => (p.moles * PHYS.R * p.temperature) / (p.pressure * 1000), digits: 5 },
      { label: L('nRT', 'nRT'), unit: 'J', compute: (_s, p) => p.moles * PHYS.R * p.temperature },
      { label: L('PV', 'PV'), unit: 'J', compute: (_s, p) => p.pressure * 1000 * ((p.moles * PHYS.R * p.temperature) / (p.pressure * 1000)) },
    ],
    init: () => ({ t: 0 }),
    step: ({ state, dt }) => ({ t: state.t + dt }),
    draw: (c) => {
      clear(c);
      const colors = palette(c.theme);
      const volume = (c.p.moles * PHYS.R * c.p.temperature) / (c.p.pressure * 1000);
      const pistonY = Math.max(60, c.height - 60 - Math.min(1, volume / 0.08) * (c.height - 150));
      const left = c.width / 2 - 80;
      const right = c.width / 2 + 80;
      c.ctx.strokeStyle = colors.text;
      c.ctx.lineWidth = 2;
      c.ctx.strokeRect(left, pistonY, right - left, c.height - 40 - pistonY);
      c.ctx.fillStyle = colors.primary;
      c.ctx.fillRect(left - 8, pistonY - 12, right - left + 16, 12);
      const speed = Math.sqrt(c.p.temperature / 300) * 34;
      for (let i = 0; i < 24; i++) {
        const px = left + 8 + ((i * 37 + c.state.t * speed) % (right - left - 16));
        const py = pistonY + 12 + Math.abs(Math.sin(i * 2.1 + c.state.t * speed * 0.05)) * (c.height - 56 - pistonY);
        circle(c.ctx, px, py, 3, colors.cyan);
      }
      label(c.ctx, `P = ${c.p.pressure} kPa   T = ${c.p.temperature} K   V = ${volume.toFixed(4)} m³`, 12, 20, colors.text, 12);
      label(c.ctx, 'PV = nRT', c.width - 12, 20, colors.muted, 12, 'right');
    },
  },
];

function snellAngle(incidentDeg: number, n1: number, n2: number): number {
  const sinR = (n1 / n2) * Math.sin((incidentDeg * Math.PI) / 180);
  if (sinR > 1) return NaN;
  return (Math.asin(sinR) * 180) / Math.PI;
}

function imageDistance(p: Record<string, number>): number {
  if (Math.abs(p.focal) < 1e-9) return NaN;
  const u = -Math.abs(p.objectDistance);
  return 1 / (1 / p.focal + 1 / u);
}

function pAbs(a: number, b: number) {
  return Math.max(Math.abs(a), Number.isFinite(b) ? Math.abs(b) : 0);
}
