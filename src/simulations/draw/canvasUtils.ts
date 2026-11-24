import type { DrawContext, ThemeMode } from '../types';

export function palette(theme: ThemeMode) {
  return theme === 'dark'
    ? {
        bg: '#0C1130',
        grid: 'rgba(148,163,220,0.10)',
        axis: 'rgba(180,196,255,0.42)',
        text: '#DDE4FF',
        muted: '#9BA7D4',
        primary: '#A78BFA',
        cyan: '#35D6DA',
        accent: '#F5B971',
        danger: '#FB7185',
        good: '#4ADE80',
      }
    : {
        bg: '#F8F9FD',
        grid: 'rgba(60,70,130,0.11)',
        axis: 'rgba(50,60,110,0.50)',
        text: '#18204A',
        muted: '#5B648C',
        primary: '#6D3FD1',
        cyan: '#0A9CA6',
        accent: '#B45309',
        danger: '#BE123C',
        good: '#15803D',
      };
}

export function clear(c: DrawContext) {
  const { ctx, width, height } = c;
  const colors = palette(c.theme);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);
}

export function drawGrid(c: DrawContext, spacing = 40) {
  const { ctx, width, height } = c;
  const colors = palette(c.theme);
  ctx.save();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawAxes(c: DrawContext, ox: number, oy: number) {
  const { ctx, width, height } = c;
  const colors = palette(c.theme);
  ctx.save();
  ctx.strokeStyle = colors.axis;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, oy);
  ctx.lineTo(width, oy);
  ctx.moveTo(ox, 0);
  ctx.lineTo(ox, height);
  ctx.stroke();
  ctx.restore();
}

export function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width = 2, head = 8) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke?: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size = 12, align: CanvasTextAlign = 'left') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function spring(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, turns: number, amplitude: number, color: string) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const segments = turns * 2;
  for (let i = 1; i < segments; i++) {
    const f = i / segments;
    const offset = (i % 2 === 0 ? -1 : 1) * amplitude;
    ctx.lineTo(x1 + dx * f + px * offset, y1 + dy * f + py * offset);
  }
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function gauge(c: DrawContext, x: number, y: number, value: number, max: number, text: string) {
  const colors = palette(c.theme);
  const w = 110;
  const h = 8;
  c.ctx.fillStyle = colors.grid;
  c.ctx.fillRect(x, y, w, h);
  c.ctx.fillStyle = colors.primary;
  c.ctx.fillRect(x, y, Math.max(0, Math.min(1, value / max)) * w, h);
  label(c.ctx, text, x, y + 20, colors.muted, 11);
}
