import { lazy, Suspense, useEffect, useState } from 'react';
import { Box } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { EmptyState, Notice, PageHeader } from '@/components/UI';
import { canUse3D } from '@/engine/capabilities';
import { simulationById } from '@/simulations/registry';
import { threeSceneById, type ThreeSceneDef } from '@/simulations/threeD/sceneDefs';
import { SimulationRunner } from './SimulationRunner';

const ThreeLab = lazy(() => import('./ThreeLab'));

export function Lab3DPage({ sceneId }: { sceneId: string }) {
  const { t, loc, settings } = useApp();
  const scene = threeSceneById.get(sceneId);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [sceneId]);

  if (!scene) return <EmptyState title={t('notFound')} text={t('notFoundText')} />;
  const fallback = simulationById.get(scene.fallback2D);
  const use3D = canUse3D(settings.animationQuality) && !failed;

  if (!use3D) {
    return (
      <div className="space-y-4">
        <PageHeader title={loc((scene as ThreeSceneDef).title)} subtitle={loc((scene as ThreeSceneDef).description)} />
        <Notice tone="warn">{failed ? t('no3D') : t('simulationFallback')}</Notice>
        {fallback ? <SimulationRunner sim={fallback} /> : <EmptyState title={t('webglUnsupported')} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title={loc(scene.title)} subtitle={loc(scene.description)} />
      <div className="flex items-center gap-2 text-xs opacity-60"><Box className="h-4 w-4" /> {t('rotateHint')}</div>
      <Suspense fallback={<div className="panel h-[460px] animate-pulse" />}>
        <ThreeLab scene={scene} onFailure={() => setFailed(true)} />
      </Suspense>
    </div>
  );
}
