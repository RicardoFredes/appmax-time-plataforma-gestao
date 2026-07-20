import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { saudeMeta } from "./derive";
import type { RegistroSemanal } from "./types";

const ACCENT = "#9b6afa"; // roxo Appmax
const MARCO_COLOR = { inicio: "#9b6afa", fim: "#10b981" } as const; // roxo / emerald
const MARCO_LABEL = { inicio: "Início", fim: "Fim" } as const;

const W = 460;
const H = 210;
const PAD = { top: 14, right: 16, bottom: 36, left: 40 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/** Gráfico de linha da evolução do progresso (%), com pontos coloridos pela saúde. */
export function EvolucaoChart({ registros }: { registros: RegistroSemanal[] }) {
  if (registros.length === 0) return null;

  const n = registros.length;
  const x = (i: number) => (n === 1 ? PAD.left + PLOT_W / 2 : PAD.left + (i / (n - 1)) * PLOT_W);
  const y = (v: number) => PAD.top + (1 - Math.max(0, Math.min(100, v)) / 100) * PLOT_H;

  const pts = registros.map((r, i) => ({ x: x(i), y: y(r.progresso), r }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M${pts[0].x.toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} ` +
    pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
    ` L${pts[pts.length - 1].x.toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} Z`;

  // Rótulos do eixo X: no máximo ~8, distribuídos.
  const step = Math.max(1, Math.ceil(n / 8));
  const gridY = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gráfico de evolução do progresso"
    >
      <defs>
        <linearGradient id="evo-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grade horizontal + rótulos Y */}
      {gridY.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            y1={y(v)}
            x2={W - PAD.right}
            y2={y(v)}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray={v === 0 ? undefined : "3 3"}
          />
          <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[13px]">
            {v}
          </text>
        </g>
      ))}

      {n > 1 && <path d={areaPath} fill="url(#evo-area)" />}
      {n > 1 && (
        <path d={linePath} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Pontos: bandeira nos marcos (início/fim, sem saúde), círculo colorido nos demais */}
      {pts.map((p, i) => {
        if (p.r.marco) {
          const color = MARCO_COLOR[p.r.marco];
          // Mastro para cima; para baixo quando o ponto está colado no topo.
          const up = p.y - 16 >= PAD.top;
          const tip = up ? p.y - 13 : p.y + 13;
          const midOuter = up ? p.y - 10.5 : p.y + 10.5;
          const midInner = up ? p.y - 8 : p.y + 8;
          return (
            <g key={p.r.semana}>
              <title>
                {MARCO_LABEL[p.r.marco]} · {format(parseISO(p.r.semana), "dd/MM/yyyy", { locale: ptBR })}
              </title>
              <line x1={p.x} y1={p.y} x2={p.x} y2={tip} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
              <path d={`M${p.x},${tip} L${p.x + 7},${midOuter} L${p.x},${midInner} Z`} fill={color} />
              <circle cx={p.x} cy={p.y} r={3} fill={color} className="stroke-background" strokeWidth={2} />
            </g>
          );
        }
        return (
          <circle
            key={p.r.semana}
            cx={p.x}
            cy={p.y}
            r={i === n - 1 ? 5.5 : 4.5}
            fill={saudeMeta(p.r.saude).color}
            className="stroke-background"
            strokeWidth={2}
          >
            <title>
              {format(parseISO(p.r.semana), "dd/MM/yyyy", { locale: ptBR })} · {p.r.progresso}% ·
              saúde {saudeMeta(p.r.saude).nivel}/5
            </title>
          </circle>
        );
      })}

      {/* Rótulos do eixo X */}
      {registros.map((r, i) =>
        i % step === 0 || i === n - 1 ? (
          <text
            key={r.semana}
            x={x(i)}
            y={H - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[13px]"
          >
            {format(parseISO(r.semana), "dd/MM", { locale: ptBR })}
          </text>
        ) : null,
      )}
    </svg>
  );
}
