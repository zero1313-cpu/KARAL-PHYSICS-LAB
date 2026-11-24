import { useMemo, useState } from 'react';
import { Bookmark, Clipboard, Search } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { BookmarkButton } from '@/components/BookmarkButton';
import { MathText } from '@/components/MathText';
import { Chip, EmptyState, Notice, PageHeader, SectionTitle } from '@/components/UI';

export function FormulaBookPage() {
  const { t, loc, content, lang } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [copied, setCopied] = useState<string | null>(null);
  const categories = useMemo(() => [...new Set(content.formulas.map((formula) => formula.category))], [content.formulas]);
  const filtered = content.formulas.filter((formula) => {
    const matchesCategory = category === 'all' || formula.category === category;
    const text = `${loc(formula.name)} ${formula.plain} ${formula.latex} ${formula.category} ${loc(formula.description)}`.toLowerCase();
    return matchesCategory && (!query || text.includes(query.toLowerCase()));
  });

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1500);
    } catch { setCopied(null); }
  };

  return (
    <div>
      <PageHeader title={t('formulaBook')} subtitle={`${content.formulas.length} ${t('formulaCount')} · ${t('unlocked')}`} />
      <div className="panel mb-5 p-4">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchLessons')} />
        </label>
        <div className="scroll-thin mt-3 flex gap-2 overflow-x-auto pb-1">
          <button className={`chip shrink-0 ${category === 'all' ? 'border-violet-500 text-violet-500' : ''}`} onClick={() => setCategory('all')}>{t('all')}</button>
          {categories.map((item) => <button key={item} className={`chip shrink-0 ${category === item ? 'border-violet-500 text-violet-500' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </div>

      <SectionTitle title={`${filtered.length} ${t('formulaCount')}`} />
      {filtered.length === 0 ? <EmptyState title={t('noResults')} /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((formula) => (
            <article key={formula.id} className="panel flex flex-col p-4">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{loc(formula.name)}</h2>
                  <p className="text-xs opacity-60">{formula.category}</p>
                </div>
                <BookmarkButton type="formula" itemId={formula.id} compact />
                <button className="btn h-9 w-9 p-0" onClick={() => { void copy(formula.id, formula.plain); }} aria-label={t('copyFormula')} title={t('copyFormula')}>
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
              <div className="my-3 rounded-xl bg-[var(--surface-2)] p-3 text-center text-lg"><MathText latex={formula.latex} display /></div>
              <p className="text-sm">{loc(formula.description)}</p>
              {formula.symbols.length > 0 && (
                <div className="mt-3 space-y-1 text-xs">
                  {formula.symbols.map((symbol) => (
                    <p key={symbol.symbol}><span className="font-mono font-bold">{symbol.symbol}</span> — {loc(symbol.meaning)} ({symbol.unit})</p>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip>SI: {formula.siUnit}</Chip>
                <Chip>[{formula.dimension}]</Chip>
                {copied === formula.id && <Chip>{t('copied')}</Chip>}
              </div>
              {formula.related.length > 0 && <p className="mt-2 text-[11px] opacity-55">{t('related')}: {formula.related.join(', ')}</p>}
              {formula.notes && <p className="mt-2 text-[11px] opacity-55">{loc(formula.notes)}</p>}
              <p className="mt-auto pt-3 text-[10px] opacity-40">{lang === 'hi' ? 'स्थानीय रूप से संग्रहीत' : 'Stored locally'}</p>
            </article>
          ))}
        </div>
      )}
      <div className="mt-5"><Notice>{t('scienceNote')}</Notice></div>
      <p className="mt-3 text-center text-xs opacity-50"><Bookmark className="mr-1 inline h-3 w-3" /> {t('exportTip')}</p>
    </div>
  );
}
