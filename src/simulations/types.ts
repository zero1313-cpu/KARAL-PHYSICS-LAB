import type { EducationLevelId, Localized } from '@/content/types';

export type SimState = Record<string, number>;
export type ThemeMode = 'dark' | 'light';

export interface SimParam {
  key: string;
  label: Localized;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface SimReadout {
  label: Localized;
  unit: string;
  compute: (state: SimState, p: Record<string, number>) => number;
  digits?: number;
}

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  state: SimState;
  p: Record<string, number>;
  t: number;
  theme: ThemeMode;
  lang: 'en' | 'hi';
}

export interface StepContext {
  state: SimState;
  p: Record<string, number>;
  dt: number;
  t: number;
}

export interface SimDefinition {
  id: string;
  title: Localized;
  description: Localized;
  category: 'mechanics' | 'electricity' | 'magnetism' | 'waves' | 'optics' | 'thermal' | 'modern';
  level: EducationLevelId;
  params: SimParam[];
  readouts: SimReadout[];
  init?: (p: Record<string, number>) => SimState;
  step?: (c: StepContext) => SimState;
  draw: (c: DrawContext) => void;
  note?: Localized;
  threeDId?: string;
}
