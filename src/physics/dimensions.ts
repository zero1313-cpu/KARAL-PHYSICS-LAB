/** Dimensional analysis helpers. Dimensions are [M, L, T, I, Θ, N, J]. */
export type Dimensions = readonly [number, number, number, number, number, number, number];

export const DIM = {
  dimensionless: [0, 0, 0, 0, 0, 0, 0],
  length: [0, 1, 0, 0, 0, 0, 0],
  mass: [1, 0, 0, 0, 0, 0, 0],
  time: [0, 0, 1, 0, 0, 0, 0],
  current: [0, 0, 0, 1, 0, 0, 0],
  temperature: [0, 0, 0, 0, 1, 0, 0],
  amount: [0, 0, 0, 0, 0, 1, 0],
  luminous: [0, 0, 0, 0, 0, 0, 1],
  velocity: [0, 1, -1, 0, 0, 0, 0],
  acceleration: [0, 1, -2, 0, 0, 0, 0],
  force: [1, 1, -2, 0, 0, 0, 0],
  energy: [1, 2, -2, 0, 0, 0, 0],
  power: [1, 2, -3, 0, 0, 0, 0],
  pressure: [1, -1, -2, 0, 0, 0, 0],
  charge: [0, 0, 1, 1, 0, 0, 0],
  potential: [1, 2, -3, -1, 0, 0, 0],
  resistance: [1, 2, -3, -2, 0, 0, 0],
  magneticField: [1, 0, -2, -1, 0, 0, 0],
  frequency: [0, 0, -1, 0, 0, 0, 0],
  angle: [0, 0, 0, 0, 0, 0, 0],
} satisfies Record<string, Dimensions>;

export function mulDimensions(a: Dimensions, b: Dimensions): Dimensions {
  return a.map((v, i) => v + b[i]) as unknown as Dimensions;
}

export function divDimensions(a: Dimensions, b: Dimensions): Dimensions {
  return a.map((v, i) => v - b[i]) as unknown as Dimensions;
}

export function powDimensions(a: Dimensions, n: number): Dimensions {
  return a.map((v) => v * n) as unknown as Dimensions;
}

export function sameDimensions(a: Dimensions, b: Dimensions): boolean {
  return a.every((v, i) => Math.abs(v - b[i]) < 1e-12);
}

export function formatDimensions(d: Dimensions): string {
  const symbols = ['M', 'L', 'T', 'I', 'Θ', 'N', 'J'];
  return d
    .map((v, i) => (v === 0 ? '' : `${symbols[i]}${v === 1 ? '' : `^${v}`}`))
    .filter(Boolean)
    .join(' · ') || 'dimensionless';
}

/** Dimensional form for a small set of named quantities used in lessons. */
export const QUANTITY_DIMENSIONS: Record<string, Dimensions> = {
  force: DIM.force,
  mass: DIM.mass,
  acceleration: DIM.acceleration,
  velocity: DIM.velocity,
  displacement: DIM.length,
  distance: DIM.length,
  time: DIM.time,
  period: DIM.time,
  frequency: DIM.frequency,
  work: DIM.energy,
  energy: DIM.energy,
  kineticEnergy: DIM.energy,
  potentialEnergy: DIM.energy,
  power: DIM.power,
  pressure: DIM.pressure,
  stress: DIM.pressure,
  charge: DIM.charge,
  current: DIM.current,
  voltage: DIM.potential,
  potential: DIM.potential,
  resistance: DIM.resistance,
  capacitance: divDimensions(DIM.charge, DIM.potential),
  magneticField: DIM.magneticField,
  electricField: divDimensions(DIM.force, DIM.charge),
  momentum: mulDimensions(DIM.mass, DIM.velocity),
  impulse: mulDimensions(DIM.force, DIM.time),
  torque: mulDimensions(DIM.force, DIM.length),
  angle: DIM.angle,
  temperature: DIM.temperature,
  heat: DIM.energy,
  wavelength: DIM.length,
  refractiveIndex: DIM.dimensionless,
  density: divDimensions(DIM.mass, powDimensions(DIM.length, 3)),
  volume: powDimensions(DIM.length, 3),
  area: powDimensions(DIM.length, 2),
  springConstant: divDimensions(DIM.force, DIM.length),
  gravitationalConstant: divDimensions(mulDimensions(powDimensions(DIM.length, 3), DIM.mass), powDimensions(DIM.time, 2)),
};
