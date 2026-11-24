import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pause, Play, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Notice, SectionTitle } from '@/components/UI';
import { saveSimParams } from '@/database/db';
import { projectileAt } from '@/engine/integrators';
import type { ThreeSceneDef } from '@/simulations/threeD/sceneDefs';

interface Runtime {
  group: THREE.Group;
  update: (time: number, p: Record<string, number>) => void;
}

function makeLine(points: THREE.Vector3[], color: number, opacity = 1): THREE.Line {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }),
  );
}

function setLinePoints(line: THREE.Line, points: THREE.Vector3[]) {
  const attribute = line.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
  if (!attribute || attribute.count !== points.length) return;
  points.forEach((point, index) => attribute.setXYZ(index, point.x, point.y, point.z));
  attribute.needsUpdate = true;
  line.geometry.computeBoundingSphere();
}

function makeSphere(radius: number, color: number, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.15, emissive: color, emissiveIntensity: 0.08 }));
  mesh.position.set(x, y, z);
  return mesh;
}

function makeLabel(text: string, x: number, y: number, z: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgba(10, 16, 40, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 40px system-ui, sans-serif';
    context.fillStyle = '#e9e6ff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 20);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.position.set(x, y, z);
  sprite.scale.set(2.8, 0.52, 1);
  return sprite;
}

function circlePoints(radius: number, y: number, plane: 'xz' | 'xy' = 'xz', count = 96): THREE.Vector3[] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return plane === 'xz'
      ? new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
      : new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, y);
  });
}

function buildRuntime(id: string, p: Record<string, number>, legend: string[]): Runtime {
  const group = new THREE.Group();
  group.add(new THREE.GridHelper(20, 20, 0x44507a, 0x26304f));

  const label = (index: number, x: number, y: number, z: number) => {
    if (legend[index]) group.add(makeLabel(legend[index], x, y, z));
  };

  if (id === 'projectile-3d') {
    const trajectory: THREE.Vector3[] = [];
    const flight = projectileAt(p.v0, p.angle, 0, 0, 0, p.g);
    const total = p.v0 > 0 ? Math.max(0.2, (2 * flight.vy) / p.g) : 0.2;
    for (let i = 0; i <= 90; i++) {
      const point = projectileAt(p.v0, p.angle, 0, 0, (i / 90) * total, p.g);
      trajectory.push(new THREE.Vector3(point.x * 0.1, point.y * 0.1, 0));
    }
    group.add(makeLine(trajectory, 0x35d6da));
    const ball = makeSphere(0.24, 0xf5b971);
    group.add(ball);
    const gravity = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 1.2, 0xfb7185, 0.25, 0.14);
    const velocity = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0xa78bfa, 0.25, 0.14);
    group.add(gravity, velocity);
    label(0, trajectory[45]?.x ?? 0, (trajectory[45]?.y ?? 0) + 0.7, 0);
    label(1, 2, 2.4, 0);
    label(2, -2, -1.6, 0);
    return {
      group,
      update: (time) => {
        const t = time % Math.max(0.3, total);
        const point = projectileAt(p.v0, p.angle, 0, 0, t, p.g);
        ball.position.set(point.x * 0.1, Math.max(0, point.y * 0.1), 0);
        gravity.position.copy(ball.position);
        velocity.position.copy(ball.position);
        const vector = new THREE.Vector3(point.vx, point.vy, 0);
        if (vector.lengthSq() > 1e-6) velocity.setDirection(vector.normalize());
        velocity.setLength(Math.min(3, Math.hypot(point.vx, point.vy) * 0.08), 0.25, 0.14);
      },
    };
  }

  if (id === 'gravity-3d') {
    const planet = makeSphere(0.9 * Math.cbrt(p.mass / 6), 0x4c7df5);
    group.add(planet);
    const orbitRadius = p.radius * 0.45;
    group.add(makeLine(circlePoints(orbitRadius, 0), 0x35d6da, 0.8));
    const satellite = makeSphere(0.22, 0xf5b971);
    group.add(satellite);
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1.2, 0xfb7185, 0.22, 0.12);
    group.add(arrow);
    label(0, 0, 1.8, 0);
    label(2, orbitRadius, 0.7, 0);
    return {
      group,
      update: (time) => {
        const omega = 600 * p.speed * Math.sqrt((6.6743e-11 * p.mass * 1e24) / Math.pow(p.radius * 1e6, 3));
        const angle = time * omega;
        satellite.position.set(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius);
        arrow.position.copy(satellite.position);
        arrow.setDirection(new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).normalize());
      },
    };
  }

  if (id === 'electric-field-3d') {
    const charge = makeSphere(0.55, 0xfb7185);
    group.add(charge);
    for (let index = 0; index < 16; index++) {
      const theta = (index / 16) * Math.PI * 2;
      for (const phi of [-0.6, 0, 0.6]) {
        const direction = new THREE.Vector3(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi)).normalize();
        const end = direction.clone().multiplyScalar(1.6 + p.charge * 0.25);
        group.add(new THREE.ArrowHelper(direction, direction.clone().multiplyScalar(0.6), end.length() - 0.6, 0x35d6da, 0.22, 0.12));
      }
    }
    label(0, 0, 1.3, 0);
    label(1, 3, 0.7, 0);
    return { group, update: () => undefined };
  }

  if (id === 'magnetic-field-3d') {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 9, 16), new THREE.MeshStandardMaterial({ color: 0xf5b971 }));
    wire.rotation.z = Math.PI / 2;
    group.add(wire);
    for (let y = -3; y <= 3; y += 1.5) group.add(makeLine(circlePoints(1.2 + p.current * 0.04, y), 0x35d6da));
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-3, 0, 0), 1.5, 0xa78bfa, 0.25, 0.14);
    group.add(arrow);
    label(0, 0, 1.2, 0);
    label(1, 2.8, 1.6, 0);
    return { group, update: () => undefined };
  }

  if (id === 'molecular-3d') {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 5, 5)), new THREE.LineBasicMaterial({ color: 0x7c8ab8 }));
    group.add(edges);
    const count = Math.round(p.count);
    const particles: Array<{ mesh: THREE.Mesh; velocity: THREE.Vector3 }> = [];
    const thermal = Math.sqrt(p.temperature / 300);
    for (let index = 0; index < count; index++) {
      const seed = index + 1;
      const mesh = makeSphere(0.11, index % 3 === 0 ? 0x35d6da : 0xa78bfa,
        Math.sin(seed * 2.3) * 3.6, Math.cos(seed * 1.7) * 2.1, Math.sin(seed * 3.1) * 2.1);
      const velocity = new THREE.Vector3(Math.cos(seed * 1.3), Math.sin(seed * 2.1), Math.cos(seed * 0.7)).normalize().multiplyScalar(thermal * 1.4);
      particles.push({ mesh, velocity });
      group.add(mesh);
    }
    label(0, -3, 3.1, 0);
    label(1, 3, 3.1, 0);
    return {
      group,
      update: (_, next) => {
        const speedScale = Math.sqrt(next.temperature / 300);
        particles.forEach(({ mesh, velocity }) => {
          const nextPosition = mesh.position.clone().addScaledVector(velocity, 0.016 * speedScale);
          for (const axis of ['x', 'y', 'z'] as const) {
            const limit = axis === 'x' ? 3.8 : 2.3;
            if (Math.abs(nextPosition[axis]) > limit) velocity[axis] *= -1;
          }
          mesh.position.copy(nextPosition);
        });
      },
    };
  }

  if (id === 'wave-3d' || id === 'em-wave-3d') {
    const lines: THREE.Line[] = [];
    const offsets = id === 'wave-3d' ? [-3, -1.5, 0, 1.5, 3] : [0];
    for (const z of offsets) {
      const points = Array.from({ length: 120 }, (_, i) => new THREE.Vector3(-7 + (14 * i) / 119, 0, z));
      const line = makeLine(points, id === 'em-wave-3d' ? 0x35d6da : 0xa78bfa);
      lines.push(line);
      group.add(line);
      if (id === 'em-wave-3d') group.add(makeLine(points.map((point) => new THREE.Vector3(point.x, 0, z)), 0xfb7185));
    }
    if (id === 'em-wave-3d') group.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-5, -2.2, 0), 3, 0xf5b971, 0.3, 0.16));
    legend.slice(0, 2).forEach((_, index) => label(index, -4 + index * 8, 2.5, 0));
    return {
      group,
      update: (time, next) => {
        const k = (2 * Math.PI) / Math.max(0.5, next.wavelength);
        const omega = 2 * Math.PI * next.frequency;
        lines.forEach((line) => {
          const z = offsets[lines.indexOf(line)];
          const points = Array.from({ length: 120 }, (_, i) => {
            const x = -7 + (14 * i) / 119;
            const y = next.amplitude * Math.sin(k * x - omega * time) * (id === 'wave-3d' ? 1 : 1.5);
            return new THREE.Vector3(x, y, z + (id === 'em-wave-3d' ? next.amplitude * Math.sin(k * x - omega * time) * 0.8 : 0));
          });
          setLinePoints(line, points);
        });
        if (id === 'em-wave-3d') {
          const magnetic = group.children.filter((child): child is THREE.Line => child instanceof THREE.Line && child !== lines[0]);
          magnetic.forEach((line) => {
            const points = Array.from({ length: 120 }, (_, i) => {
              const x = -7 + (14 * i) / 119;
              return new THREE.Vector3(x, 0, next.amplitude * Math.sin(k * x - omega * time) * 1.3);
            });
            setLinePoints(line, points);
          });
        }
      },
    };
  }

  if (id === 'pendulum-3d') {
    const pivotY = 4;
    group.add(makeSphere(0.12, 0xf5b971, 0, pivotY, 0));
    const string = makeLine([new THREE.Vector3(0, pivotY, 0), new THREE.Vector3(0, pivotY - p.length, 0)], 0xa5aecb);
    group.add(string);
    const bob = makeSphere(0.35, 0x35d6da);
    group.add(bob);
    const velocity = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1.2, 0xfb7185, 0.22, 0.12);
    group.add(velocity);
    label(0, 0, pivotY - p.length - 0.8, 0);
    return {
      group,
      update: (time, next) => {
        const amplitude = (next.amplitude * Math.PI) / 180;
        const theta = amplitude * Math.cos(Math.sqrt(next.g / next.length) * time);
        const x = next.length * Math.sin(theta);
        const y = pivotY - next.length * Math.cos(theta);
        bob.position.set(x, y, 0);
        setLinePoints(string, [new THREE.Vector3(0, pivotY, 0), new THREE.Vector3(x, y, 0)]);
        velocity.position.copy(bob.position);
        velocity.setDirection(new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0).normalize());
      },
    };
  }

  if (id === 'spring-3d') {
    const anchor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 3), new THREE.MeshStandardMaterial({ color: 0x7c8ab8 }));
    anchor.position.x = -5;
    group.add(anchor);
    const spring = makeLine([], 0xa78bfa);
    group.add(spring);
    const mass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), new THREE.MeshStandardMaterial({ color: 0x35d6da }));
    group.add(mass);
    label(0, 2, 1.6, 0);
    return {
      group,
      update: (time, next) => {
        const omega = Math.sqrt(next.k / next.mass);
        const x = 2.2 + 1.1 * Math.cos(omega * time);
        mass.position.x = x;
        const points = Array.from({ length: 160 }, (_, index) => {
          const fraction = index / 159;
          return new THREE.Vector3(-4.8 + (x + 0.55 + 4.8) * fraction, Math.sin(fraction * Math.PI * 18) * 0.55, Math.cos(fraction * Math.PI * 18) * 0.55);
        });
        if ((spring.geometry.getAttribute('position') as THREE.BufferAttribute | undefined)?.count !== points.length) {
          spring.geometry.dispose();
          spring.geometry = new THREE.BufferGeometry().setFromPoints(points);
        } else setLinePoints(spring, points);
      },
    };
  }

  if (id === 'optics-3d') {
    const lens = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 16), new THREE.MeshPhysicalMaterial({ color: 0x8fd8ff, transparent: true, opacity: 0.35, roughness: 0.1 }));
    lens.scale.set(0.28, 2, 2);
    group.add(lens);
    const focal = Math.max(1, p.focal * 0.35);
    const rayLines: THREE.Line[] = [];
    for (const y of [-p.spread, -p.spread / 2, 0, p.spread / 2, p.spread]) {
      const line = makeLine([new THREE.Vector3(-7, y, 0), new THREE.Vector3(0, y, 0), new THREE.Vector3(focal * 4, 0, 0)], 0xf5b971);
      rayLines.push(line);
      group.add(line);
    }
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.2, side: THREE.DoubleSide }));
    plane.rotation.y = Math.PI / 2;
    plane.position.x = focal * 4;
    group.add(plane);
    label(0, -5, 2.4, 0);
    label(1, 2, 1.4, 0);
    label(2, focal * 4, -2.4, 0);
    return { group, update: () => undefined };
  }

  if (id === 'atomic-3d') {
    const nucleus = makeSphere(0.45, 0xfb7185);
    group.add(nucleus);
    const radius = 1.2 + p.level * 0.55;
    for (let axis = 0; axis < 3; axis++) {
      const ring = makeLine(circlePoints(radius, 0), 0x35d6da, 0.55);
      ring.rotation.x = axis === 0 ? 0 : axis === 1 ? Math.PI / 3 : Math.PI / 2;
      ring.rotation.z = axis === 2 ? Math.PI / 4 : 0;
      group.add(ring);
    }
    const electron = makeSphere(0.16, 0xa78bfa);
    group.add(electron);
    label(0, 0, 1.2, 0);
    label(1, radius, -1.2, 0);
    return {
      group,
      update: (time, next) => {
        const angle = time * next.speed;
        const r = 1.2 + next.level * 0.55;
        electron.position.set(Math.cos(angle) * r, Math.sin(angle) * r * 0.5, Math.sin(angle * 1.3) * r * 0.5);
      },
    };
  }

  // Default fallback: a labelled static field marker.
  group.add(makeSphere(0.6, 0x35d6da));
  label(0, 0, 1.4, 0);
  return { group, update: () => undefined };
}

function disposeGroup(group: THREE.Group) {
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((item) => disposeMaterial(item));
    else if (material) disposeMaterial(material);
  });
}

function disposeMaterial(material: THREE.Material) {
  const sprite = material as THREE.SpriteMaterial;
  sprite.map?.dispose?.();
  material.dispose();
}

export default function ThreeLab({ scene, onFailure }: { scene: ThreeSceneDef; onFailure: () => void }) {
  const { t, loc, settings } = useApp();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const onFailureRef = useRef(onFailure);
  const [params, setParams] = useState<Record<string, number>>(() => Object.fromEntries(scene.params.map((p) => [p.key, p.default])));
  const [running, setRunning] = useState(true);
  const runningRef = useRef(running);
  const paramsRef = useRef(params);

  useEffect(() => { onFailureRef.current = onFailure; }, [onFailure]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { paramsRef.current = params; }, [params]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: settings.animationQuality === 'high', alpha: true, powerPreference: 'low-power' });
    } catch (error) {
      console.error('3D renderer failed', error);
      onFailureRef.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.animationQuality === 'low' ? 1 : 1.5));
    renderer.setSize(mount.clientWidth || 600, mount.clientHeight || 460);
    renderer.domElement.className = 'block h-full w-full rounded-xl';
    mount.appendChild(renderer.domElement);

    const threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(document.documentElement.classList.contains('dark') ? 0x070a18 : 0xf5f7fb);
    const camera = new THREE.PerspectiveCamera(50, (mount.clientWidth || 600) / (mount.clientHeight || 460), 0.1, 200);
    camera.position.set(8, 6, 11);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.saveState();
    controlsRef.current = controls;
    threeScene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const light = new THREE.DirectionalLight(0xffffff, 1.4);
    light.position.set(6, 10, 8);
    threeScene.add(light);

    const runtime = buildRuntime(scene.id, paramsRef.current, scene.legend.map(loc));
    threeScene.add(runtime.group);

    const resize = () => {
      const width = mount.clientWidth || 600;
      const height = mount.clientHeight || 460;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : undefined;
    observer?.observe(mount);

    let frameId = 0;
    let time = 0;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (runningRef.current) time += dt;
      runtime.update(time, paramsRef.current);
      controls.update();
      renderer.render(threeScene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      controls.dispose();
      disposeGroup(runtime.group);
      renderer.dispose();
      renderer.domElement.remove();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, settings.animationQuality, settings.language, params]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="panel overflow-hidden p-2">
        <div ref={mountRef} className="h-[360px] w-full overflow-hidden rounded-xl sm:h-[500px]" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={() => setRunning((value) => !value)}>{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? t('pause') : t('play')}</button>
          <button className="btn" onClick={() => controlsRef.current?.reset()}><RotateCcw className="h-4 w-4" /> {t('reset')}</button>
          <span className="chip ml-auto">{t('rotateHint')}</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="panel p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><SlidersHorizontal className="h-4 w-4" /> {t('parameters')}</h2>
          <div className="space-y-4">
            {scene.params.map((param) => (
              <label key={param.key} className="block">
                <span className="mb-1 flex justify-between text-xs"><span>{loc(param.label)}</span><span className="font-mono font-bold">{params[param.key]} {param.unit}</span></span>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={params[param.key]}
                  onChange={(event) => {
                    const next = { ...paramsRef.current, [param.key]: Number(event.target.value) };
                    setParams(next);
                    paramsRef.current = next;
                    void saveSimParams(scene.id, next);
                  }}
                  aria-label={loc(param.label)}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="panel p-4">
          <SectionTitle title={t('legend')} />
          <ul className="space-y-2 text-xs">
            {scene.legend.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: ['#35D6DA', '#F5B971', '#A78BFA'][index % 3] }} />
                {loc(item)}
              </li>
            ))}
          </ul>
        </div>
        <Notice>{t('scienceNote')}</Notice>
      </div>
    </div>
  );
}
