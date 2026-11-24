import { useState } from 'react';
import { Box, FlaskConical, Search } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Card, EmptyState, PageHeader, SectionTitle } from '@/components/UI';
import { simCategories, simulations } from '@/simulations/registry';
import { threeScenes } from '@/simulations/threeD/sceneDefs';

export function LabBrowserPage() {
  const { t, loc, navigate } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const categories = [...new Set(simulations.map((sim) => sim.category))];
  const filtered = simulations.filter((sim) =>
    (category === 'all' || sim.category === category) &&
    (!query || loc(sim.title).toLowerCase().includes(query.toLowerCase()) || loc(sim.description).toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('physicsLab')} subtitle={t('scienceNote')} back={false} />
      <div className="panel p-4">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('selectSimulation')} />
        </label>
        <div className="scroll-thin mt-3 flex gap-2 overflow-x-auto pb-1">
          <button className={`chip shrink-0 ${category === 'all' ? 'border-violet-500 text-violet-500' : ''}`} onClick={() => setCategory('all')}>{t('all')}</button>
          {categories.map((item) => (
            <button key={item} className={`chip shrink-0 ${category === item ? 'border-violet-500 text-violet-500' : ''}`} onClick={() => setCategory(item)}>{loc(simCategories[item])}</button>
          ))}
        </div>
      </div>

      <section>
        <SectionTitle title={`${t('lab2D')} · ${filtered.length}`} />
        {filtered.length === 0 ? <EmptyState title={t('noResults')} /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sim) => (
              <Card key={sim.id} onClick={() => navigate(`sim/${sim.id}`)}>
                <div className="flex items-start gap-2">
                  <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                  <div>
                    <p className="font-bold">{loc(sim.title)}</p>
                    <p className="mt-1 line-clamp-2 text-xs opacity-65">{loc(sim.description)}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-widest opacity-50">{loc(simCategories[sim.category])}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle title={`${t('lab3D')} · ${threeScenes.length}`} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {threeScenes.map((scene) => (
            <Card key={scene.id} onClick={() => navigate(`three/${scene.id}`)}>
              <div className="flex items-start gap-2">
                <Box className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
                <div>
                  <p className="font-bold">{loc(scene.title)}</p>
                  <p className="mt-1 line-clamp-2 text-xs opacity-65">{loc(scene.description)}</p>
                  <p className="mt-2 text-[10px] opacity-50">{t('rotateHint')}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
