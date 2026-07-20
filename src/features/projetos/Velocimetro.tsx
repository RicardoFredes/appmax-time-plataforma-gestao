import { SAUDE_META, saudeMeta } from "./derive";

/**
 * Velocímetro (medidor semicircular) de on-tracking. As faixas coloridas vão de
 * 1 (em perigo, vermelho, à esquerda) a 5 (on tracking, verde, à direita); o
 * ponteiro aponta a saúde atual.
 */
export function Velocimetro({ saude }: { saude: number }) {
  const { nivel, label, color } = saudeMeta(saude);

  const cx = 70;
  const cy = 72;
  const r = 56;
  const sw = 13;

  const pt = (deg: number, radius: number): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];
  };
  const arc = (t1: number, t2: number, radius: number): string => {
    const [x1, y1] = pt(t1, radius);
    const [x2, y2] = pt(t2, radius);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  // Ângulo do ponteiro: nível 1 → 180° (esquerda), nível 5 → 0° (direita).
  const clamped = Math.max(1, Math.min(5, saude));
  const needleDeg = (180 * (5 - clamped)) / 4;
  const [nx, ny] = pt(needleDeg, r - 6);

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 140 82" className="h-auto w-[130px] shrink-0" aria-hidden>
        {/* Faixas de 1 a 5 (esquerda → direita = vermelho → verde) */}
        {[1, 2, 3, 4, 5].map((n) => {
          const t1 = 180 - 36 * (n - 1);
          const t2 = 180 - 36 * n;
          return (
            <path
              key={n}
              d={arc(t1 - 0.6, t2 + 0.6, r)}
              fill="none"
              stroke={SAUDE_META[n].color}
              strokeWidth={sw}
              strokeLinecap="butt"
              opacity={n === nivel ? 1 : 0.35}
            />
          );
        })}
        {/* Ponteiro */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          className="stroke-foreground"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} className="fill-foreground" />
      </svg>

      <div className="shrink-0">
        <div className="text-3xl font-bold leading-none tabular-nums" style={{ color }}>
          {nivel}
          <span className="text-base font-medium text-muted-foreground">/5</span>
        </div>
        <div className="mt-1 text-xs font-medium" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  );
}
