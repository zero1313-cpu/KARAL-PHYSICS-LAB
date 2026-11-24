import { useEffect, useReducer, useRef, useState } from 'react';
import { Box, Pause, Play, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Notice, PageHeader, SectionTitle } from '@/components/UI';
import { getSimParams, saveSimParams, visitItem } from '@/database/db';
import { simCategories } from '@/simulations/registry';
import type { SimDefinition, SimState } from '@/simulations/types';
import { formatScientific } from '@/physics/units';

export function SimulationRunner({ sim, embedded = false }: { sim: SimDefinition; embedded?: boolean }) {
  const { t, loc, settings, navigate, updateSettings } = useApp();
  const [params, setParams] = useState<Record<string, number>>(() => Object.fromEntries(sim.params.map((p) => [p.key, p.default])));
  const [running, setRunning] = useState(() => !(settings.reduceMotion));
  const [saved, setSaved] = useState(false);
  const [, forceRender] = useReducer((value: number) => value + 1, 0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<SimState>(sim.init ? sim.init(Object.fromEntries(sim.params.map((p) => [p.key, p.default]))) : {});
  const paramsRef = useRef(params);
  const runningRef = useRef(running);
  const timeRef = useRef(0);
  const speedRef = useRef(settings.animationQuality === 'low' ? 0.5 : 1);

  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { runningRef.current = running; }, [running]);

  useEffect(() => {
    void visitItem('simulation', sim.id, loc(sim.title));
    void getSimParams(sim.id).then((stored) => {
      if (!stored) return;
      const next = { ...paramsRef.current };
      for (const param of sim.params) if (Number.isFinite(stored[param.key])) next[param.key] = stored[param.key];
      setParams(next);
      paramsRef.current = next;
      stateRef.current = sim.init ? sim.init(next) : {};
      timeRef.current = 0;
      forceRender();
    }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frameId = 0;
    let last = performance.now();
    let frame = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, settings.animationQuality === 'low' ? 1 : 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : undefined;
    observer?.observe(canvas);

    const drawFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) * speedRef.current;
      last = now;
      if (runningRef.current && dt > 0) {
        const stepped = sim.step ? sim.step({ state: stateRef.current, p: paramsRef.current, dt, t: timeRef.current }) : stateRef.current;
        stateRef.current = stepped ?? stateRef.current;
        timeRef.current += dt;
      }
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      try {
        sim.draw({
          ctx: context,
          width: rect.width,
          height: rect.height,
          state: stateRef.current,
          p: paramsRef.current,
          t: timeRef.current,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          lang: settings.language,
        });
      } catch (error) {
        console.error(`Simulation ${sim.id} draw failed`, error);
      }
      frame++;
      if (frame % 6 === 0) forceRender();
      frameId = requestAnimationFrame(drawFrame);
    };
    frameId = requestAnimationFrame(drawFrame);
    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.id, settings.animationQuality, settings.language]);

  const reset = () => {
    stateRef.current = sim.init ? sim.init(paramsRef.current) : {};
    timeRef.current = 0;
    forceRender();
  };

  const readoutValues = sim.readouts.map((readout) => ({
    label: loc(readout.label),
    value: readout.compute(stateRef.current, paramsRef.current),
    digits: readout.digits ?? 3,
    unit: readout.unit,
  }));

  return (
    <div className={embedded ? '' : 'space-y-5'}>
      {!embedded && <PageHeader title={loc(sim.title)} subtitle={loc(sim.description)} />}
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">{loc(simCategories[sim.category])}</span>
        <span className="chip">{t('lab2D')}</span>
        <BookmarkButton type="simulation" itemId={sim.id} compact />
        {sim.threeDId && <button className="btn ml-auto text-xs" onClick={() => navigate(`three/${sim.threeDId}`)}><Box className="h-4 w-4" /> {t('lab3D')}</button>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="panel overflow-hidden p-2 sm:p-3">
          <canvas
            ref={canvasRef}
            className="h-[300px] w-full rounded-xl bg-white dark:bg-slate-950 sm:h-[430px]"
            role="img"
            aria-label={loc(sim.title)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className="btn btn-primary" onClick={() => setRunning((value) => !value)}>
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? t('pause') : t('play')}
            </button>
            <button className="btn" onClick={reset}><RotateCcw className="h-4 w-4" /> {t('reset')}</button>
            <label className="ml-auto flex items-center gap-2 text-xs opacity-70">
              {t('animationQuality')}
              <select
                className="select w-auto py-1"
                value={settings.animationQuality}
                onChange={(event) => {
                  const value = event.target.value as typeof settings.animationQuality;
                  speedRef.current = value === 'low' ? 0.5 : value === 'high' ? 1.4 : 1;
                  void updateSettings({ animationQuality: value });
                }}
              >
                <option value="low">{t('low')}</option>
                <option value="balanced">{t('balanced')}</option>
                <option value="high">{t('high')}</option>
              </select>
            </label>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {readoutValues.map((readout) => (
              <div key={readout.label} className="rounded-xl bg-[var(--surface-2)] p-2">
                <p className="text-[11px] opacity-60">{readout.label}</p>
                <p className="font-mono text-sm font-bold">{formatScientific(readout.value, readout.digits)} <span className="text-xs opacity-60">{readout.unit}</span></p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><SlidersHorizontal className="h-4 w-4" /> {t('parameters')}</h2>
            <div className="space-y-4">
              {sim.params.map((param) => (
                <label key={param.key} className="block">
                  <span className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span>{loc(param.label)}</span>
                    <span className="font-mono font-bold">{params[param.key]} {param.unit}</span>
                  </span>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={params[param.key]}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      const next = { ...paramsRef.current, [param.key]: value };
                      setParams(next);
                      paramsRef.current = next;
                      void saveSimParams(sim.id, next).then(() => { setSaved(true); window.setTimeout(() => setSaved(false), 1200); });
                    }}
                    aria-label={loc(param.label)}
                  />
                </label>
              ))}
            </div>
            {saved && <p className="mt-3 text-[11px] text-emerald-500">{t('notesSaved')}</p>}
          </div>
          <div className="panel p-4">
            <SectionTitle title={t('legend')} />
            <p className="text-xs opacity-75">{loc(sim.description)}</p>
            {sim.threeDId && <button className="btn mt-3 w-full text-xs" onClick={() => navigate(`three/${sim.threeDId}`)}><Box className="h-4 w-4" /> {t('openLab')} ({t('lab3D')})</button>}
          </div>
          <Notice>{sim.note ? loc(sim.note) : t('scienceNote')}</Notice>
        </div>
      </div>
    </div>
  );
}
