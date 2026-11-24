import { useState } from 'react';
import { Delete, Equal, History } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { Notice, SectionTitle } from '@/components/UI';
import { CONSTANT_LIST } from '@/physics/constants';
import { evaluateExpression } from '@/physics/expression';
import { formatScientific, UNIT_GROUPS, convertUnit, type ConversionCategory } from '@/physics/units';

const KEYS = [
  '7', '8', '9', '/', 'sqrt(', '(', ')', 'C',
  '4', '5', '6', '*', 'sin(', 'cos(', 'tan(', 'ln(',
  '1', '2', '3', '-', '^', 'pi', 'e', 'log(',
  '0', '.', '+', '×', '÷', 'G', 'g', 'c',
];

export function Calculator() {
  const { t } = useApp();
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [degrees, setDegrees] = useState(true);
  const [history, setHistory] = useState<Array<{ expression: string; answer: string }>>([]);
  const [category, setCategory] = useState<ConversionCategory>('length');
  const [from, setFrom] = useState(UNIT_GROUPS.length.units[0].id);
  const [to, setTo] = useState(UNIT_GROUPS.length.units[1].id);
  const [value, setValue] = useState('1');

  const evaluate = () => {
    try {
      const result = evaluateExpression(expression, degrees);
      const text = formatScientific(result, 6);
      setAnswer(text);
      setError('');
      setHistory((current) => [{ expression, answer: text }, ...current].slice(0, 20));
    } catch (cause) {
      setAnswer('');
      setError(cause instanceof Error ? cause.message : t('incorrect'));
    }
  };

  const converted = (() => {
    try { return formatScientific(convertUnit(category, Number(value), from, to), 6); }
    catch { return '—'; }
  })();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel p-4">
        <SectionTitle title={t('calculator')} action={
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={degrees} onChange={(event) => setDegrees(event.target.checked)} />
            Degrees
          </label>
        } />
        <input className="input font-mono text-lg" value={expression} onChange={(event) => setExpression(event.target.value)} placeholder="e.g. sqrt(2)*G" aria-label={t('expression')} />
        <div className="mt-2 grid grid-cols-8 gap-1.5">
          {KEYS.map((key) => (
            <button
              key={key}
              className={`btn h-10 p-0 text-xs ${key === 'C' ? 'text-red-500' : ''}`}
              onClick={() => {
                if (key === 'C') { setExpression(''); setAnswer(''); setError(''); }
                else setExpression((current) => current + (key === '×' ? '*' : key === '÷' ? '/' : key));
              }}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn btn-primary flex-1" onClick={evaluate}><Equal className="h-4 w-4" /> {t('evaluate')}</button>
          <button className="btn" onClick={() => setExpression((current) => current.slice(0, -1))} aria-label="Backspace"><Delete className="h-4 w-4" /></button>
        </div>
        <div className="mt-3 rounded-xl bg-[var(--surface-2)] p-3">
          <p className="text-xs opacity-60">{t('answer')}</p>
          <p className="break-all font-mono text-lg font-bold">{answer || '—'}</p>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
        <Notice>No eval() is used. Expressions are parsed locally by a safe deterministic evaluator.</Notice>
      </section>

      <div className="space-y-4">
        <section className="panel p-4">
          <SectionTitle title={t('constants')} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CONSTANT_LIST.map((constant) => (
              <button key={constant.symbol} className="rounded-lg border border-[var(--border)] p-2 text-left text-xs hover:border-violet-400" onClick={() => setExpression((current) => current + constant.symbol)}>
                <span className="font-mono font-bold">{constant.symbol}</span>
                <span className="block opacity-60">{constant.unit}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <SectionTitle title={t('conversions')} />
          <div className="grid grid-cols-2 gap-2">
            <select className="select" value={category} onChange={(event) => {
              const next = event.target.value as ConversionCategory;
              setCategory(next);
              setFrom(UNIT_GROUPS[next].units[0].id);
              setTo(UNIT_GROUPS[next].units[1]?.id ?? UNIT_GROUPS[next].units[0].id);
            }}>
              {Object.keys(UNIT_GROUPS).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input className="input" type="number" value={value} onChange={(event) => setValue(event.target.value)} aria-label={t('value')} />
            <select className="select" value={from} onChange={(event) => setFrom(event.target.value)}>
              {UNIT_GROUPS[category].units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
            </select>
            <select className="select" value={to} onChange={(event) => setTo(event.target.value)}>
              {UNIT_GROUPS[category].units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
            </select>
          </div>
          <p className="mt-3 rounded-xl bg-[var(--surface-2)] p-3 font-mono text-lg font-bold">{converted} <span className="text-xs opacity-60">{UNIT_GROUPS[category].units.find((unit) => unit.id === to)?.label}</span></p>
        </section>

        <section className="panel p-4">
          <SectionTitle title={t('history')} action={<History className="h-4 w-4 opacity-50" />} />
          {history.length === 0 ? <p className="text-xs opacity-60">—</p> : (
            <ul className="space-y-1 text-xs">
              {history.map((item, index) => <li key={`${item.expression}-${index}`} className="flex justify-between gap-2 border-b border-[var(--border)] py-1 font-mono"><span className="truncate">{item.expression}</span><span className="font-bold">{item.answer}</span></li>)}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
