import type { DiagramSpec } from '@/content/types';
import { useApp } from '@/app/AppContext';

interface DiagramProps {
  spec: DiagramSpec;
  compact?: boolean;
}

export function Diagram({ spec, compact = false }: DiagramProps) {
  const { loc } = useApp();
  const labels = spec.labels.map(loc);
  const line = '#7C8AB8';
  const accent = '#35D6DA';
  const warm = '#F5B971';

  return (
    <figure className="panel overflow-hidden p-3">
      <svg viewBox="0 0 400 210" role="img" aria-label={loc(spec.caption)} className="w-full rounded-xl bg-slate-950/5 dark:bg-white/5">
        <defs>
          <marker id={`arrow-${spec.id}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={accent} />
          </marker>
        </defs>
        {spec.kind === 'force' && (
          <g strokeWidth="2" fill="none">
            <rect x="150" y="85" width="100" height="55" rx="8" stroke={line} fill={`${warm}22`} />
            <path d="M250 112 H340" stroke={accent} markerEnd={`url(#arrow-${spec.id})`} />
            <path d="M150 112 H60" stroke={warm} markerEnd={`url(#arrow-${spec.id})`} />
            <path d="M200 85 V25" stroke={accent} markerEnd={`url(#arrow-${spec.id})`} />
            <path d="M200 140 V195" stroke={warm} markerEnd={`url(#arrow-${spec.id})`} />
          </g>
        )}
        {spec.kind === 'circuit' && (
          <g strokeWidth="2" fill="none" stroke={line}>
            <rect x="80" y="55" width="240" height="115" rx="6" />
            <path d="M105 112 h35 M260 112 h35" />
            <path d="M140 90 v44 M260 90 v44" />
            <circle cx="200" cy="112" r="18" stroke={accent} />
            <path d="M180 70 h40 M184 64 h32" stroke={warm} />
            <text x="200" y="182" textAnchor="middle" fontSize="12" fill="currentColor">V = IR</text>
          </g>
        )}
        {spec.kind === 'ray' && (
          <g strokeWidth="2" fill="none">
            <path d="M60 40 H200 M60 80 H200 M60 120 H200" stroke={warm} />
            <path d="M200 30 C225 75 225 135 200 180" stroke={accent} />
            <path d="M200 40 L330 110 M200 80 L330 135 M200 120 L330 160" stroke={accent} markerEnd={`url(#arrow-${spec.id})`} />
          </g>
        )}
        {spec.kind === 'wave' && (
          <g fill="none" strokeWidth="2">
            <path d="M20 105 Q60 45 100 105 T180 105 T260 105 T340 105" stroke={accent} />
            <path d="M20 145 Q60 185 100 145 T180 145 T260 145 T340 145" stroke={warm} />
            <path d="M20 105 V145" stroke={line} strokeDasharray="4 4" />
          </g>
        )}
        {spec.kind === 'energy' && (
          <g fill="none" strokeWidth="2">
            <rect x="40" y="70" width="90" height="60" rx="8" stroke={warm} />
            <rect x="160" y="70" width="80" height="60" rx="8" stroke={accent} />
            <rect x="290" y="70" width="70" height="60" rx="8" stroke={line} />
            <path d="M130 100 H160 M240 100 H290" stroke={line} markerEnd={`url(#arrow-${spec.id})`} />
          </g>
        )}
        {spec.kind === 'field' && (
          <g fill="none" strokeWidth="2" stroke={accent}>
            <circle cx="200" cy="105" r="18" fill={`${warm}55`} stroke={warm} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return <path key={deg} d={`M${200 + 25 * Math.cos(rad)} ${105 + 25 * Math.sin(rad)} L${200 + 85 * Math.cos(rad)} ${105 + 85 * Math.sin(rad)}`} markerEnd={`url(#arrow-${spec.id})`} />;
            })}
          </g>
        )}
        {spec.kind === 'generic' && (
          <g fill="none" strokeWidth="2">
            {spec.shapes?.length ? spec.shapes.map((shape, index) => (
              shape.type === 'circle'
                ? <circle key={index} cx={shape.x1} cy={shape.y1} r={Math.max(4, Math.abs(shape.x2 - shape.x1))} stroke={index % 2 ? warm : accent} />
                : <line key={index} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={index % 2 ? warm : accent} markerEnd={shape.type === 'arrow' ? `url(#arrow-${spec.id})` : undefined} />
            )) : (
              <>
                <line x1="50" y1="105" x2="350" y2="105" stroke={line} />
                <circle cx="130" cy="105" r="24" stroke={accent} />
                <circle cx="270" cy="105" r="24" stroke={warm} />
                <line x1="130" y1="105" x2="270" y2="105" stroke={accent} markerEnd={`url(#arrow-${spec.id})`} />
              </>
            )}
          </g>
        )}
        <text x="12" y="18" fontSize="11" className="fill-slate-500 dark:fill-slate-400">{loc(spec.caption)}</text>
      </svg>
      {!compact && (
        <div className="mt-2 flex flex-wrap gap-2">
          {labels.map((label, index) => <span key={`${label}-${index}`} className="chip">{label}</span>)}
        </div>
      )}
    </figure>
  );
}
