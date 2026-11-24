import { describe, expect, it } from 'vitest';
import { canUse3D, detectCapabilities } from './capabilities';

describe('3D capability fallback', () => {
  it('falls back to 2D when no WebGL context or low-memory device is detected', () => {
    const caps = detectCapabilities();
    expect(caps.webgl).toBe(false);
    expect(caps.lowMemory).toBe(true);
    expect(canUse3D('high')).toBe(false);
    expect(canUse3D('balanced')).toBe(false);
    expect(canUse3D('low')).toBe(false);
  });
});
