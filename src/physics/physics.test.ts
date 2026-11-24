import { describe, expect, it } from 'vitest';
import { evaluateExpression } from './expression';
import { convertUnit, formatScientific } from './units';
import { DIM, QUANTITY_DIMENSIONS, divDimensions, formatDimensions, mulDimensions, powDimensions, sameDimensions } from './dimensions';
import { PHYS } from './constants';
import { pendulumPeriod, projectileAt, projectileFlightTime, projectileMaxHeight, projectileRange, springFrequency, stepRK4, stepSemiImplicit, createParticle } from '@/engine/integrators';

describe('safe expression evaluator', () => {
  it('respects arithmetic precedence and associativity', () => {
    expect(evaluateExpression('2 + 3 * 4')).toBe(14);
    expect(evaluateExpression('(2 + 3) * 4')).toBe(20);
    expect(evaluateExpression('2 ^ 3 ^ 2')).toBe(512);
    expect(evaluateExpression('-2 ^ 2')).toBe(-4);
    expect(evaluateExpression('5 - 2 - 1')).toBe(2);
  });

  it('supports scientific notation, constants and functions', () => {
    expect(evaluateExpression('2e3 + 1')).toBe(2001);
    expect(evaluateExpression('π')).toBeCloseTo(Math.PI, 10);
    expect(evaluateExpression('G')).toBe(PHYS.G);
    expect(evaluateExpression('sqrt(9) + abs(-4)')).toBe(7);
    expect(evaluateExpression('log(1000)')).toBeCloseTo(3, 10);
  });

  it('handles degree mode for direct and inverse trigonometry', () => {
    expect(evaluateExpression('sin(90)', true)).toBeCloseTo(1, 10);
    expect(evaluateExpression('cos(0)', true)).toBeCloseTo(1, 10);
    expect(evaluateExpression('asin(1)', true)).toBeCloseTo(90, 10);
    expect(evaluateExpression('sin(pi/2)')).toBeCloseTo(1, 10);
  });

  it('rejects invalid, undefined and unsafe expressions without eval', () => {
    expect(() => evaluateExpression('1 / 0')).toThrow(/zero/i);
    expect(() => evaluateExpression('sqrt(-1)')).toThrow();
    expect(() => evaluateExpression('window')).toThrow(/unknown name/i);
    expect(() => evaluateExpression('alert(1)')).toThrow(/unknown name/i);
    expect(() => evaluateExpression('constructor')).toThrow(/unknown name/i);
    expect(() => evaluateExpression('(2 + 3')).toThrow(/closing bracket/i);
    expect(() => evaluateExpression('2 3')).toThrow(/trailing/i);
  });
});

describe('unit conversion', () => {
  it('converts within a category through SI base units', () => {
    expect(convertUnit('length', 1, 'km', 'm')).toBeCloseTo(1000, 9);
    expect(convertUnit('length', 100, 'cm', 'm')).toBeCloseTo(1, 9);
    expect(convertUnit('speed', 36, 'km/h', 'm/s')).toBeCloseTo(10, 9);
    expect(convertUnit('energy', 1, 'eV', 'J')).toBeCloseTo(PHYS.e, 30);
    expect(convertUnit('pressure', 1, 'atm', 'Pa')).toBeCloseTo(101325, 6);
    expect(convertUnit('mass', 1, 'tonne', 'kg')).toBeCloseTo(1000, 9);
  });

  it('applies offsets correctly for temperature', () => {
    expect(convertUnit('temperature', 0, 'C', 'K')).toBeCloseTo(273.15, 9);
    expect(convertUnit('temperature', 32, 'F', 'C')).toBeCloseTo(0, 9);
    expect(convertUnit('temperature', 100, 'C', 'F')).toBeCloseTo(212, 9);
  });

  it('rejects unknown units and formats finite values', () => {
    expect(() => convertUnit('length', 1, 'km', 'parsec')).toThrow(/unknown unit/i);
    expect(formatScientific(0)).toBe('0');
    expect(formatScientific(Number.NaN)).toBe('—');
    expect(formatScientific(123456)).toContain('e');
  });
});

describe('dimensional analysis', () => {
  it('multiplies, divides and raises dimensions', () => {
    expect(sameDimensions(mulDimensions(DIM.velocity, DIM.time), DIM.length)).toBe(true);
    expect(sameDimensions(divDimensions(DIM.force, DIM.acceleration), DIM.mass)).toBe(true);
    expect(sameDimensions(powDimensions(DIM.length, 3), QUANTITY_DIMENSIONS.volume)).toBe(true);
    expect(formatDimensions(DIM.force)).toBe('M · L · T^-2');
    expect(formatDimensions(DIM.dimensionless)).toBe('dimensionless');
  });

  it('matches known quantity dimensions', () => {
    expect(sameDimensions(QUANTITY_DIMENSIONS.force, mulDimensions(DIM.mass, DIM.acceleration))).toBe(true);
    expect(sameDimensions(QUANTITY_DIMENSIONS.resistance, divDimensions(DIM.potential, DIM.current))).toBe(true);
    expect(sameDimensions(QUANTITY_DIMENSIONS.energy, mulDimensions(DIM.force, DIM.length))).toBe(true);
    expect(sameDimensions(QUANTITY_DIMENSIONS.capacitance, divDimensions(DIM.charge, DIM.potential))).toBe(true);
    expect(QUANTITY_DIMENSIONS.refractiveIndex.every((v) => v === 0)).toBe(true);
  });
});

describe('integrators and analytic relations', () => {
  it('matches closed-form projectile results', () => {
    expect(projectileRange(20, 45, 10)).toBeCloseTo(40, 9);
    expect(projectileMaxHeight(20, 90, 10)).toBeCloseTo(20, 9);
    expect(projectileFlightTime(20, 90, 0, 10)).toBeCloseTo(4, 9);
    const point = projectileAt(20, 45, 0, 0, 1, 10);
    expect(point.x).toBeCloseTo(20 * Math.cos(Math.PI / 4), 9);
    expect(point.y).toBeCloseTo(20 * Math.sin(Math.PI / 4) - 5, 9);
  });

  it('returns exact constant-acceleration kinematics with RK4', () => {
    const state = createParticle(0, 0, 2, 0);
    const next = stepRK4(state, () => ({ x: 3, y: -1 }), 2);
    expect(next.position.x).toBeCloseTo(10, 9);
    expect(next.position.y).toBeCloseTo(-2, 9);
    expect(next.velocity.x).toBeCloseTo(8, 9);
    expect(next.time).toBe(2);
  });

  it('keeps a symplectic step finite for an oscillator', () => {
    let state = createParticle(1, 0);
    for (let i = 0; i < 1000; i++) {
      state = stepSemiImplicit(state, (s) => ({ x: -s.position.x, y: 0 }), 0.01);
      expect(Number.isFinite(state.position.x)).toBe(true);
    }
    expect(Math.hypot(state.position.x, state.velocity.x)).toBeLessThan(2);
  });

  it('computes pendulum and spring periods', () => {
    expect(pendulumPeriod(9.80665, 9.80665)).toBeCloseTo(2 * Math.PI, 9);
    const spring = springFrequency(1, 4);
    expect(spring.omega).toBeCloseTo(2, 9);
    expect(spring.period).toBeCloseTo(Math.PI, 9);
  });
});
