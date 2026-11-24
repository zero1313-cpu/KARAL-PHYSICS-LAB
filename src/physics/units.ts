export type ConversionCategory = 'length' | 'mass' | 'time' | 'speed' | 'energy' | 'pressure' | 'temperature' | 'power' | 'angle' | 'charge';

interface UnitDef {
  id: string;
  label: string;
  /** value in SI base unit = value * factor (+ offset for temperature) */
  factor: number;
  offset?: number;
}

export const UNIT_GROUPS: Record<ConversionCategory, { si: string; units: UnitDef[] }> = {
  length: {
    si: 'm',
    units: [
      { id: 'm', label: 'metre (m)', factor: 1 },
      { id: 'km', label: 'kilometre (km)', factor: 1000 },
      { id: 'cm', label: 'centimetre (cm)', factor: 0.01 },
      { id: 'mm', label: 'millimetre (mm)', factor: 0.001 },
      { id: 'nm', label: 'nanometre (nm)', factor: 1e-9 },
      { id: 'angstrom', label: 'Ångström (Å)', factor: 1e-10 },
      { id: 'mile', label: 'mile (mi)', factor: 1609.344 },
      { id: 'foot', label: 'foot (ft)', factor: 0.3048 },
      { id: 'inch', label: 'inch (in)', factor: 0.0254 },
    ],
  },
  mass: {
    si: 'kg',
    units: [
      { id: 'kg', label: 'kilogram (kg)', factor: 1 },
      { id: 'g', label: 'gram (g)', factor: 1e-3 },
      { id: 'mg', label: 'milligram (mg)', factor: 1e-6 },
      { id: 'tonne', label: 'tonne (t)', factor: 1000 },
      { id: 'amu', label: 'atomic mass unit (u)', factor: 1.66053906892e-27 },
      { id: 'lb', label: 'pound (lb)', factor: 0.45359237 },
    ],
  },
  time: {
    si: 's',
    units: [
      { id: 's', label: 'second (s)', factor: 1 },
      { id: 'min', label: 'minute (min)', factor: 60 },
      { id: 'h', label: 'hour (h)', factor: 3600 },
      { id: 'day', label: 'day (d)', factor: 86400 },
      { id: 'year', label: 'year (yr)', factor: 31557600 },
      { id: 'ms', label: 'millisecond (ms)', factor: 1e-3 },
    ],
  },
  speed: {
    si: 'm/s',
    units: [
      { id: 'm/s', label: 'metre per second (m/s)', factor: 1 },
      { id: 'km/h', label: 'km per hour (km/h)', factor: 1 / 3.6 },
      { id: 'cm/s', label: 'cm per second (cm/s)', factor: 0.01 },
      { id: 'mph', label: 'mile per hour (mph)', factor: 0.44704 },
      { id: 'knot', label: 'knot (kn)', factor: 0.514444 },
      { id: 'c', label: 'speed of light (c)', factor: 2.99792458e8 },
    ],
  },
  energy: {
    si: 'J',
    units: [
      { id: 'J', label: 'joule (J)', factor: 1 },
      { id: 'kJ', label: 'kilojoule (kJ)', factor: 1e3 },
      { id: 'cal', label: 'calorie (cal)', factor: 4.184 },
      { id: 'kcal', label: 'kilocalorie (kcal)', factor: 4184 },
      { id: 'eV', label: 'electronvolt (eV)', factor: 1.602176634e-19 },
      { id: 'Wh', label: 'watt hour (Wh)', factor: 3600 },
      { id: 'kWh', label: 'kilowatt hour (kWh)', factor: 3.6e6 },
    ],
  },
  pressure: {
    si: 'Pa',
    units: [
      { id: 'Pa', label: 'pascal (Pa)', factor: 1 },
      { id: 'kPa', label: 'kilopascal (kPa)', factor: 1e3 },
      { id: 'bar', label: 'bar', factor: 1e5 },
      { id: 'atm', label: 'atmosphere (atm)', factor: 101325 },
      { id: 'mmHg', label: 'mm of mercury (mmHg)', factor: 133.322387415 },
      { id: 'psi', label: 'pound per square inch (psi)', factor: 6894.757293168 },
    ],
  },
  temperature: {
    si: 'K',
    units: [
      { id: 'K', label: 'kelvin (K)', factor: 1 },
      { id: 'C', label: 'Celsius (°C)', factor: 1, offset: 273.15 },
      { id: 'F', label: 'Fahrenheit (°F)', factor: 5 / 9, offset: 255.3722222222222 },
    ],
  },
  power: {
    si: 'W',
    units: [
      { id: 'W', label: 'watt (W)', factor: 1 },
      { id: 'kW', label: 'kilowatt (kW)', factor: 1e3 },
      { id: 'hp', label: 'metric horsepower (hp)', factor: 735.49875 },
      { id: 'BTU/h', label: 'BTU per hour', factor: 0.29307107 },
    ],
  },
  angle: {
    si: 'rad',
    units: [
      { id: 'rad', label: 'radian (rad)', factor: 1 },
      { id: 'deg', label: 'degree (°)', factor: Math.PI / 180 },
      { id: 'grad', label: 'gradian (gon)', factor: Math.PI / 200 },
      { id: 'arcsec', label: 'arcsecond (″)', factor: Math.PI / (180 * 3600) },
    ],
  },
  charge: {
    si: 'C',
    units: [
      { id: 'C', label: 'coulomb (C)', factor: 1 },
      { id: 'mAh', label: 'milliampere hour (mAh)', factor: 3.6 },
      { id: 'μC', label: 'microcoulomb (μC)', factor: 1e-6 },
      { id: 'e', label: 'elementary charges (e)', factor: 1.602176634e-19 },
    ],
  },
};

/** Convert a value between units within one category, via SI base units. */
export function convertUnit(category: ConversionCategory, value: number, from: string, to: string): number {
  const group = UNIT_GROUPS[category];
  const source = group.units.find((u) => u.id === from);
  const target = group.units.find((u) => u.id === to);
  if (!source || !target) throw new Error(`Unknown unit: ${from} / ${to}`);
  const si = value * source.factor + (source.offset ?? 0);
  return (si - (target.offset ?? 0)) / target.factor;
}

export function formatScientific(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e5 || abs < 1e-3) return value.toExponential(digits).replace(/\.0+e/, 'e');
  return Number(value.toPrecision(digits + 2)).toString();
}
