/** CODATA-aligned SI constants used by the offline solver and simulations. */
export const PHYS = {
  G: 6.6743e-11, // gravitational constant, m^3 kg^-1 s^-2
  g: 9.80665, // standard acceleration due to gravity, m s^-2
  c: 2.99792458e8, // speed of light in vacuum, m s^-1
  h: 6.62607015e-34, // Planck constant, J s
  hbar: 1.054571817e-34, // reduced Planck constant, J s
  e: 1.602176634e-19, // elementary charge, C
  me: 9.1093837139e-31, // electron rest mass, kg
  mp: 1.67262192595e-27, // proton rest mass, kg
  mn: 1.67492750056e-27, // neutron rest mass, kg
  kB: 1.380649e-23, // Boltzmann constant, J K^-1
  NA: 6.02214076e23, // Avogadro constant, mol^-1
  R: 8.314462618, // molar gas constant, J mol^-1 K^-1
  eps0: 8.8541878128e-12, // vacuum permittivity, F m^-1
  mu0: 1.25663706212e-6, // vacuum permeability, N A^-2
  ke: 8.9875517923e9, // Coulomb constant, N m^2 C^-2
  sigma: 5.670374419e-8, // Stefan-Boltzmann constant, W m^-2 K^-4
  Rydberg: 1.0973731568160e7, // Rydberg constant, m^-1
  atm: 101325, // standard atmosphere, Pa
} as const;

export const CONSTANT_LIST = [
  { symbol: 'G', name: 'Gravitational constant', value: PHYS.G, unit: 'm³ kg⁻¹ s⁻²' },
  { symbol: 'g', name: 'Standard gravity', value: PHYS.g, unit: 'm s⁻²' },
  { symbol: 'c', name: 'Speed of light', value: PHYS.c, unit: 'm s⁻¹' },
  { symbol: 'h', name: 'Planck constant', value: PHYS.h, unit: 'J s' },
  { symbol: 'e', name: 'Elementary charge', value: PHYS.e, unit: 'C' },
  { symbol: 'mₑ', name: 'Electron mass', value: PHYS.me, unit: 'kg' },
  { symbol: 'k_B', name: 'Boltzmann constant', value: PHYS.kB, unit: 'J K⁻¹' },
  { symbol: 'N_A', name: 'Avogadro constant', value: PHYS.NA, unit: 'mol⁻¹' },
  { symbol: 'R', name: 'Molar gas constant', value: PHYS.R, unit: 'J mol⁻¹ K⁻¹' },
  { symbol: 'ε₀', name: 'Vacuum permittivity', value: PHYS.eps0, unit: 'F m⁻¹' },
  { symbol: 'μ₀', name: 'Vacuum permeability', value: PHYS.mu0, unit: 'N A⁻²' },
  { symbol: 'σ', name: 'Stefan–Boltzmann constant', value: PHYS.sigma, unit: 'W m⁻² K⁻⁴' },
] as const;
