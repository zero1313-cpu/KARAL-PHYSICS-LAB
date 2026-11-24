export interface DeviceCapabilities {
  webgl: boolean;
  lowMemory: boolean;
  reduceMotion: boolean;
  deviceMemoryGB: number | null;
  hardwareConcurrency: number;
}

/** Conservative, on-device capability probe. No network or fingerprinting is used. */
export function detectCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { webgl: false, lowMemory: true, reduceMotion: true, deviceMemoryGB: null, hardwareConcurrency: 1 };
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  let webgl = false;
  try {
    const canvas = document.createElement('canvas');
    webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    webgl = false;
  }
  const deviceMemoryGB = nav.deviceMemory ?? null;
  const hardwareConcurrency = nav.hardwareConcurrency ?? 2;
  const lowMemory = (deviceMemoryGB !== null && deviceMemoryGB < 4) || hardwareConcurrency <= 2;
  return {
    webgl,
    lowMemory,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    deviceMemoryGB,
    hardwareConcurrency,
  };
}

export function canUse3D(animationQuality: 'high' | 'balanced' | 'low'): boolean {
  const caps = detectCapabilities();
  if (!caps.webgl) return false;
  if (animationQuality === 'low') return false;
  if (caps.lowMemory && animationQuality !== 'high') return false;
  return true;
}
