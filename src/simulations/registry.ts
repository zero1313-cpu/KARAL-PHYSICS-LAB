import type { Localized } from '@/content/types';
import type { SimDefinition } from './types';
import { mechanicsSims } from './twoD/mechanics';
import { electricitySims } from './twoD/electricity';
import { wavesOpticsSims } from './twoD/wavesOptics';

export const simulations: SimDefinition[] = [...mechanicsSims, ...electricitySims, ...wavesOpticsSims];

export const simulationById = new Map(simulations.map((sim) => [sim.id, sim]));

export function getSimulation(id: string): SimDefinition | undefined {
  return simulationById.get(id);
}

export const simCategories: Record<SimDefinition['category'], Localized> = {
  mechanics: { en: 'Mechanics', hi: 'यांत्रिकी' },
  electricity: { en: 'Electricity', hi: 'विद्युत' },
  magnetism: { en: 'Magnetism', hi: 'चुम्बकत्व' },
  waves: { en: 'Waves & Sound', hi: 'तरंग एवं ध्वनि' },
  optics: { en: 'Optics', hi: 'प्रकाशिकी' },
  thermal: { en: 'Thermal physics', hi: 'ऊष्मीय भौतिकी' },
  modern: { en: 'Modern physics', hi: 'आधुनिक भौतिकी' },
};

export function simulationsForLevel(level: string): SimDefinition[] {
  const order = ['class-6-8', 'class-9-10', 'class-11', 'class-12', 'diploma', 'undergraduate', 'advanced'];
  return simulations.filter((s) => order.indexOf(s.level) <= order.indexOf(level));
}
