import { describe, expect, it } from 'vitest';
import { threeScenes } from './threeD/sceneDefs';
import { simulations, simulationById } from './registry';
import type { DrawContext, SimState } from './types';

function drawContext(state: SimState, p: Record<string, number>, t: number, theme: 'dark' | 'light'): DrawContext {
  const gradient = { addColorStop: () => undefined };
  const ctx = new Proxy({} as CanvasRenderingContext2D, {
    get(_target, property) {
      if (property === 'createLinearGradient' || property === 'createRadialGradient') return () => gradient;
      if (property === 'measureText') return () => ({ width: 10 });
      return () => undefined;
    },
    set() {
      return true;
    },
  });
  return { ctx, width: 800, height: 480, state, p, t, theme, lang: 'en' };
}

describe('2D simulation definitions', () => {
  it('registers distinct usable simulations', () => {
    expect(simulations.length).toBeGreaterThanOrEqual(20);
    const ids = simulations.map((sim) => sim.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const sim of simulations) {
      expect(sim.title.en.trim().length).toBeGreaterThan(0);
      expect(sim.title.hi.trim().length).toBeGreaterThan(0);
      expect(sim.params.length).toBeGreaterThan(0);
      const keys = sim.params.map((param) => param.key);
      expect(new Set(keys).size, `${sim.id} duplicate params`).toBe(keys.length);
      for (const param of sim.params) {
        expect(param.min, `${sim.id}.${param.key} range`).toBeLessThan(param.max);
        expect(param.step, `${sim.id}.${param.key} step`).toBeGreaterThan(0);
        expect(param.default, `${sim.id}.${param.key} default`).toBeGreaterThanOrEqual(param.min);
        expect(param.default, `${sim.id}.${param.key} default`).toBeLessThanOrEqual(param.max);
      }
    }
  });

  it('keeps readouts, stepping and drawing functional for every simulation', () => {
    for (const sim of simulations) {
      const p = Object.fromEntries(sim.params.map((param) => [param.key, param.default]));
      let state: SimState = sim.init ? sim.init(p) : {};
      for (const value of Object.values(state)) {
        expect(Number.isFinite(value), `${sim.id} initial state`).toBe(true);
      }
      for (const readout of sim.readouts) {
        const value = readout.compute(state, p);
        expect(typeof value, `${sim.id} readout ${readout.label.en}`).toBe('number');
      }
      for (let i = 0; i < 60; i++) {
        state = sim.step ? sim.step({ state, p, dt: 1 / 60, t: i / 60 }) : state;
        for (const value of Object.values(state)) {
          expect(Number.isFinite(value), `${sim.id} state after ${i} steps`).toBe(true);
        }
      }
      for (const theme of ['dark', 'light'] as const) {
        expect(() => sim.draw(drawContext(state, p, 1, theme)), `${sim.id} draw (${theme})`).not.toThrow();
      }
    }
  });

  it('maps every 3D scene and opt-in simulation to a valid 2D fallback', () => {
    expect(threeScenes.length).toBeGreaterThanOrEqual(10);
    const sceneIds = new Set(threeScenes.map((scene) => scene.id));
    expect(sceneIds.size).toBe(threeScenes.length);
    for (const scene of threeScenes) {
      expect(simulationById.has(scene.fallback2D), `${scene.id} fallback`).toBe(true);
      expect(scene.legend.length).toBeGreaterThan(0);
      expect(scene.params.length).toBeGreaterThan(0);
    }
    for (const sim of simulations) {
      if (sim.threeDId) expect(sceneIds.has(sim.threeDId), `${sim.id} 3D link`).toBe(true);
    }
  });
});
