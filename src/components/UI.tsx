import type { ReactNode } from 'react';
import { ArrowLeft, ChevronRight, Inbox } from 'lucide-react';
import { useApp } from '@/app/AppContext';

export function Card({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={`panel p-4 text-left transition hover:border-violet-400/60 ${className}`}>
      {children}
      {onClick && <ChevronRight className="float-right mt-[-1.4rem] h-4 w-4 opacity-50" />}
    </Tag>
  );
}

export function PageHeader({ title, subtitle, back = true }: { title: string; subtitle?: string; back?: boolean }) {
  const { goBack } = useApp();
  return (
    <header className="mb-5 flex items-start gap-3">
      {back && (
        <button className="btn mt-1 h-9 w-9 p-0" onClick={goBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm opacity-70">{subtitle}</p>}
      </div>
    </header>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {action}
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="panel flex flex-col items-center gap-2 p-8 text-center">
      <Inbox className="h-8 w-8 opacity-50" />
      <p className="font-semibold">{title}</p>
      {text && <p className="max-w-md text-sm opacity-70">{text}</p>}
    </div>
  );
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' | 'success' }) {
  const colors = {
    info: 'border-sky-400/40 bg-sky-400/10',
    warn: 'border-amber-400/40 bg-amber-400/10',
    success: 'border-emerald-400/40 bg-emerald-400/10',
  } as const;
  return <div className={`rounded-xl border px-3 py-2 text-sm ${colors[tone]}`}>{children}</div>;
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel p-3">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs opacity-65">{label}</p>
    </div>
  );
}

export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="panel p-4 sm:p-5">
      <h2 className="mb-3 text-base font-bold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed opacity-90">{children}</div>
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-1 pl-5">{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
}
