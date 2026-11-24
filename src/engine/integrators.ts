export interface Vec2 {
  x: number;
  y: number;
}

export interface Particle2D {
  position: Vec2;
  velocity: Vec2;
  acceleration: Vec2;
  time: number;
}

export type AccelerationFn = (state: Particle2D, t: number) => Vec2;

export function createParticle(x: number, y: number, vx = 0, vy = 0): Particle2D {
  return { position: { x, y }, velocity: { x: vx, y: vy }, acceleration: { x: 0, y: 0 }, time: 0 };
}

/** Semi-implicit (symplectic) Euler: stable and energy-friendly for oscillators. */
export function stepSemiImplicit(state: Particle2D, acceleration: AccelerationFn, dt: number): Particle2D {
  const a = acceleration(state, state.time);
  const velocity = { x: state.velocity.x + a.x * dt, y: state.velocity.y + a.y * dt };
  const position = { x: state.position.x + velocity.x * dt, y: state.position.y + velocity.y * dt };
  return {
    position,
    velocity,
    acceleration: a,
    time: state.time + dt,
  };
}

/** Classical fourth-order Runge–Kutta for position and velocity. */
export function stepRK4(state: Particle2D, acceleration: AccelerationFn, dt: number): Particle2D {
  const a0 = acceleration(state, state.time);
  const s1 = {
    position: { x: state.position.x + state.velocity.x * dt * 0.5, y: state.position.y + state.velocity.y * dt * 0.5 },
    velocity: { x: state.velocity.x + a0.x * dt * 0.5, y: state.velocity.y + a0.y * dt * 0.5 },
    acceleration: a0,
    time: state.time + dt * 0.5,
  };
  const a1 = acceleration(s1, s1.time);
  const s2 = {
    position: { x: state.position.x + s1.velocity.x * dt * 0.5, y: state.position.y + s1.velocity.y * dt * 0.5 },
    velocity: { x: state.velocity.x + a1.x * dt * 0.5, y: state.velocity.y + a1.y * dt * 0.5 },
    acceleration: a1,
    time: state.time + dt * 0.5,
  };
  const a2 = acceleration(s2, s2.time);
  const s3 = {
    position: { x: state.position.x + s2.velocity.x * dt, y: state.position.y + s2.velocity.y * dt },
    velocity: { x: state.velocity.x + a2.x * dt, y: state.velocity.y + a2.y * dt },
    acceleration: a2,
    time: state.time + dt,
  };
  const a3 = acceleration(s3, s3.time);
  return {
    position: {
      x: state.position.x + (dt / 6) * (state.velocity.x + 2 * s1.velocity.x + 2 * s2.velocity.x + s3.velocity.x),
      y: state.position.y + (dt / 6) * (state.velocity.y + 2 * s1.velocity.y + 2 * s2.velocity.y + s3.velocity.y),
    },
    velocity: {
      x: state.velocity.x + (dt / 6) * (a0.x + 2 * a1.x + 2 * a2.x + a3.x),
      y: state.velocity.y + (dt / 6) * (a0.y + 2 * a1.y + 2 * a2.y + a3.y),
    },
    acceleration: a0,
    time: state.time + dt,
  };
}

/** Closed-form projectile position (no drag), valid for constant gravity. */
export function projectileAt(v0: number, angleDeg: number, x0: number, y0: number, t: number, g: number) {
  const theta = (angleDeg * Math.PI) / 180;
  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta);
  return { x: x0 + vx * t, y: y0 + vy * t - 0.5 * g * t * t, vx, vy: vy - g * t };
}

export function projectileRange(v0: number, angleDeg: number, g: number): number {
  return (v0 * v0 * Math.sin((2 * angleDeg * Math.PI) / 180)) / g;
}

export function projectileMaxHeight(v0: number, angleDeg: number, g: number): number {
  const vy = v0 * Math.sin((angleDeg * Math.PI) / 180);
  return (vy * vy) / (2 * g);
}

export function projectileFlightTime(v0: number, angleDeg: number, y0: number, g: number): number {
  const vy = v0 * Math.sin((angleDeg * Math.PI) / 180);
  return (vy + Math.sqrt(vy * vy + 2 * g * y0)) / g;
}

/** Simple pendulum: theta'' + (g/L) sin(theta) = 0, small angle T = 2π√(L/g). */
export function pendulumPeriod(length: number, g: number): number {
  return 2 * Math.PI * Math.sqrt(length / g);
}

/** Mass-spring: omega = sqrt(k/m), T = 2π/omega. */
export function springFrequency(mass: number, k: number) {
  const omega = Math.sqrt(k / mass);
  return { omega, period: (2 * Math.PI) / omega };
}
