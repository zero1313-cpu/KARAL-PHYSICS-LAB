import { useMemo, useState } from 'react';
import { Calculator as CalculatorIcon, CircleHelp, ListOrdered, RotateCcw, Sigma } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { MathText } from '@/components/MathText';
import { Notice, PageHeader, Section } from '@/components/UI';
import { numericalTemplates } from '@/content/numericals';
import { PHYS } from '@/physics/constants';
import { formatScientific } from '@/physics/units';
import { Calculator } from './Calculator';

function conversionLine(unit: string, value: number): string {
  if (unit === 'eV') return `${value} eV = ${formatScientific(value * PHYS.e, 4)} J`;
  if (unit === '°') return `${value}° = ${formatScientific(value * Math.PI / 180, 4)} rad`;
  if (unit === 'μC') return `${value} μC = ${formatScientific(value * 1e-6, 4)} C`;
  if (unit === 'min') return `${value} min = ${value * 60} s`;
  return `${value} ${unit || '(dimensionless)'} — SI-compatible`;
}

export function NumericalsPage({ tab = 'solver' }: { tab?: 'solver' | 'calculator' }) {
  const { t, loc, navigate } = useApp();
  const [selectedId, setSelectedId] = useState(numericalTemplates[0].id);
  const [difficulty, setDifficulty] = useState('all');
  const [showHint, setShowHint] = useState(false);
  const template = numericalTemplates.find((item) => item.id === selectedId) ?? numericalTemplates[0];
  const [values, setValues] = useState<Record<string, number>>({ ...template.defaults });

  const filtered = useMemo(() => numericalTemplates.filter((item) => difficulty === 'all' || item.difficulty === difficulty), [difficulty]);
  const result = useMemo(() => {
    try { return template.solve(values); }
    catch (error) { return { value: Number.NaN, unit: '', steps: [{ en: error instanceof Error ? error.message : 'Invalid input', hi: 'अमान्य इनपुट' }] }; }
  }, [template, values]);

  const choose = (id: string) => {
    const next = numericalTemplates.find((item) => item.id === id);
    if (!next) return;
    setSelectedId(id);
    setValues({ ...next.defaults });
    setShowHint(false);
  };

  return (
    <div>
      <PageHeader title={t('numericals')} subtitle="Step-by-step deterministic solutions with SI units" />
      <div className="mb-5 flex flex-wrap gap-2">
        <button className={`btn ${tab === 'solver' ? 'btn-primary' : ''}`} onClick={() => navigate('numericals')}><ListOrdered className="h-4 w-4" /> {t('solver')}</button>
        <button className={`btn ${tab === 'calculator' ? 'btn-primary' : ''}`} onClick={() => navigate('calculator')}><CalculatorIcon className="h-4 w-4" /> {t('calculator')}</button>
      </div>
      {tab === 'calculator' ? <Calculator /> : (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-3">
            <div className="panel p-3">
              <div className="mb-2 flex flex-wrap gap-1">
                {['all', 'easy', 'medium', 'hard'].map((item) => (
                  <button key={item} className={`chip ${difficulty === item ? 'border-violet-500 text-violet-500' : ''}`} onClick={() => setDifficulty(item)}>
                    {item === 'all' ? t('all') : item === 'easy' ? t('easy') : item === 'medium' ? t('mediumDifficulty') : t('hard')}
                  </button>
                ))}
              </div>
              <div className="scroll-thin max-h-[540px] space-y-1.5 overflow-y-auto pr-1">
                {filtered.map((item) => (
                  <button key={item.id} onClick={() => choose(item.id)} className={`w-full rounded-xl border p-2 text-left text-xs ${selectedId === item.id ? 'border-violet-500 bg-violet-500/10' : 'border-[var(--border)] hover:border-violet-400'}`}>
                    <span className="block font-semibold">{loc(item.title)}</span>
                    <span className="mt-0.5 block opacity-55">{item.topic} · {item.difficulty}</span>
                  </button>
                ))}
              </div>
            </div>
            <Notice>{t('scienceNote')}</Notice>
          </aside>

          <div className="space-y-4">
            <section className="panel p-4 sm:p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest opacity-50">{t('practiceMode')} · {template.difficulty}</p>
                  <h2 className="text-lg font-bold">{loc(template.title)}</h2>
                  <p className="mt-1 text-xs opacity-65">{t('topic')}: {template.topic}</p>
                </div>
                <button className="btn text-xs" onClick={() => setValues({ ...template.defaults })}><RotateCcw className="h-4 w-4" /> {t('reset')}</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {template.inputs.map((input) => (
                  <label key={input.key} className="block">
                    <span className="mb-1 flex justify-between text-xs"><span>{loc(input.label)}</span><span className="font-mono opacity-60">{input.unit}</span></span>
                    <input
                      className="input"
                      type="number"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={values[input.key] ?? 0}
                      onChange={(event) => setValues((current) => ({ ...current, [input.key]: Number(event.target.value) }))}
                    />
                  </label>
                ))}
              </div>
              <button className="btn mt-3 text-xs" onClick={() => setShowHint((value) => !value)}><CircleHelp className="h-4 w-4" /> {t('hint')}</button>
              {showHint && <p className="mt-2 rounded-lg bg-[var(--surface-2)] p-2 text-xs">{loc(template.hint)}</p>}
            </section>

            <Section title={t('given')}>
              <p className="font-mono text-sm">{template.inputs.map((input) => `${input.key} = ${values[input.key]} ${input.unit}`).join('; ')}</p>
            </Section>
            <Section title={t('required')}><p>{loc(template.title)}</p></Section>
            <section className="panel p-4 sm:p-5">
              <h2 className="mb-2 text-base font-bold">{t('correctFormula')}</h2>
              <div className="rounded-xl bg-[var(--surface-2)] p-3 text-center text-lg"><MathText latex={template.formulaLatex} display /></div>
              <p className="mt-2 text-xs opacity-70">{t('formulaExplanation')}: {loc(template.formulaExplanation)}</p>
            </section>
            <Section title={t('unitConversion')}>
              <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
                {template.inputs.map((input) => <li key={input.key}>{conversionLine(input.unit, values[input.key] ?? 0)}</li>)}
              </ul>
            </Section>
            <Section title={t('substitution')}>
              <p className="font-mono text-sm">{template.inputs.map((input) => `${input.key} = ${values[input.key]}`).join(', ')}</p>
            </Section>
            <Section title={t('solutionSteps')}>
              <ol className="list-decimal space-y-1 pl-5">{result.steps.map((step, index) => <li key={index}>{loc(step)}</li>)}</ol>
            </Section>
            <section className="panel border-emerald-400/50 bg-emerald-400/5 p-4 sm:p-5">
              <h2 className="text-base font-bold text-emerald-600 dark:text-emerald-400">{t('finalAnswer')}</h2>
              <p className="mt-2 font-mono text-2xl font-extrabold">{formatScientific(result.value, 5)} {result.unit}</p>
              {result.unit === 'eV' && <p className="mt-1 text-xs opacity-70">{formatScientific(result.value * PHYS.e, 5)} J</p>}
              <p className="mt-2 flex items-center gap-2 text-xs opacity-60"><Sigma className="h-3 w-3" /> {t('scienceNote')}</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export function CalculatorPage() {
  const { t } = useApp();
  return (
    <div>
      <PageHeader title={t('calculator')} subtitle={t('conversions')} />
      <Calculator />
    </div>
  );
}
