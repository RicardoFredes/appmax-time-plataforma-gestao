/** Átomos gráficos do panorama do relatório (rosca, barra de distribuição, mini-stat). */

/**
 * Rosca com dois anéis concêntricos: o externo é a média ponderada (destaque,
 * roxo) e o interno a média simples (laranja). O centro mostra a ponderada.
 */
export function Donut({ value, inner }: { value: number; inner: number }) {
  const size = 104;
  const stroke = 7;
  const gap = 1;
  const center = size / 2;
  const rings = [
    { pct: Math.max(0, Math.min(100, value)), r: (size - stroke) / 2, color: "#9b6afa" },
    { pct: Math.max(0, Math.min(100, inner)), r: (size - stroke) / 2 - stroke - gap, color: "#f97316" },
  ];
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {rings.map((ring, i) => {
          const c = 2 * Math.PI * ring.r;
          return (
            <g key={i}>
              <circle cx={center} cy={center} r={ring.r} fill="none" strokeWidth={stroke} className="stroke-muted" />
              <circle
                cx={center}
                cy={center}
                r={ring.r}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="butt"
                stroke={ring.color}
                strokeDasharray={c}
                strokeDashoffset={c * (1 - ring.pct / 100)}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums">
        {rings[0].pct}%
      </div>
    </div>
  );
}

/** Barra empilhada da distribuição de on-tracking (on-track / atenção / risco). */
export function DistBar({ onTrack, warning, atRisk }: { onTrack: number; warning: number; atRisk: number }) {
  const total = onTrack + warning + atRisk || 1;
  const segs = [
    { n: onTrack, c: "#10b981", label: "On-track" },
    { n: warning, c: "#f59e0b", label: "Atenção" },
    { n: atRisk, c: "#ef4444", label: "Em risco" },
  ];
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segs.map((s) =>
          s.n > 0 ? (
            <div key={s.label} style={{ width: `${(s.n / total) * 100}%`, backgroundColor: s.c }} />
          ) : null,
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {segs.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.c }} />
            {s.label} <span className="font-semibold tabular-nums text-foreground">{s.n}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function MiniStat({
  label,
  value,
  title,
}: {
  label: string;
  value: number | string;
  title?: string;
}) {
  return (
    <div className="text-center" title={title}>
      <div className="text-2xl font-semibold leading-none tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
