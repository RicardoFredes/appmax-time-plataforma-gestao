/**
 * Cálculo do rodízio de sustentação (puro, sem estado global).
 *
 * Regras:
 * - Semanas começam na segunda-feira; cada engenheiro cobre
 *   `semanasPorEngenheiro` semanas seguidas (um "slot").
 * - O slot que contém `anchorMonday` é o slot 0 e cabe ao primeiro engenheiro
 *   de cada grupo (`engenheiros[0]`). O rodízio segue a ordem da lista.
 * - A semana corrente é derivada do relógio do cliente (`now`), então o painel
 *   está sempre certo independentemente de quando os dados foram gerados.
 * - Férias: se o engenheiro do slot estiver de férias sobrepondo o período, o
 *   plantão é coberto pelo próximo do rodízio que estiver disponível.
 */
import { addDays, parseISO, startOfWeek } from "date-fns";
import type {
  SustentacaoData,
  SustentacaoEngineer,
  Vacation,
} from "@/features/tasks/types";

/** Segunda-feira da semana da data (00:00 local). */
export function mondayOf(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 });
}

/** Diferença em semanas inteiras entre duas segundas-feiras. */
function weeksBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

/** A ausência sobrepõe o intervalo [start, end]? (datas inclusivas) */
function overlapsVacation(
  email: string,
  start: Date,
  end: Date,
  ferias: Vacation[],
): Vacation | null {
  for (const v of ferias) {
    if (v.email !== email) continue;
    const vi = parseISO(v.inicio);
    const vf = parseISO(v.fim);
    if (vi.getTime() <= end.getTime() && vf.getTime() >= start.getTime()) return v;
  }
  return null;
}

export interface Slot {
  /** Índice do slot relativo ao anchor (0 = slot atual do anchorMonday). */
  index: number;
  start: Date;
  end: Date;
  /** De quem é o turno natural. */
  base: SustentacaoEngineer;
  /** Quem efetivamente cobre (base, ou um substituto se `base` de férias). */
  effective: SustentacaoEngineer;
  /** Preenchido quando `effective` está cobrindo alguém de férias. */
  coveringFor: SustentacaoEngineer | null;
  /** Base de férias e ninguém disponível para cobrir. */
  uncovered: boolean;
}

export interface GroupSchedule {
  grupo: number;
  escopo: string;
  engenheiros: SustentacaoEngineer[];
  current: Slot | null;
  upcoming: Slot[];
  /** Em qual semana do slot atual estamos (1..semanasPorEngenheiro). */
  weekInSlot: number;
}

function buildSlot(
  engenheiros: SustentacaoEngineer[],
  index: number,
  semanas: number,
  anchor: Date,
  ferias: Vacation[],
): Slot {
  const start = addDays(anchor, index * semanas * 7);
  const end = addDays(start, semanas * 7 - 1);
  const n = engenheiros.length;
  const baseIdx = ((index % n) + n) % n;
  const base = engenheiros[baseIdx];

  let effective = base;
  let coveringFor: SustentacaoEngineer | null = null;
  let uncovered = false;

  if (overlapsVacation(base.email, start, end, ferias)) {
    let sub: SustentacaoEngineer | null = null;
    for (let k = 1; k < n; k++) {
      const cand = engenheiros[(baseIdx + k) % n];
      if (!overlapsVacation(cand.email, start, end, ferias)) {
        sub = cand;
        break;
      }
    }
    if (sub) {
      effective = sub;
      coveringFor = base;
    } else {
      uncovered = true;
    }
  }

  return { index, start, end, base, effective, coveringFor, uncovered };
}

/** Escala de um grupo: slot atual + próximos `upcomingCount` slots. */
export function scheduleForGroup(
  data: SustentacaoData,
  grupo: { grupo: number; escopo: string; engenheiros: SustentacaoEngineer[] },
  now: Date,
  upcomingCount = 5,
): GroupSchedule {
  const engenheiros = grupo.engenheiros;
  const base = {
    grupo: grupo.grupo,
    escopo: grupo.escopo,
    engenheiros,
    current: null as Slot | null,
    upcoming: [] as Slot[],
    weekInSlot: 1,
  };
  if (engenheiros.length === 0 || !data.anchorMonday) return base;

  const semanas = Math.max(1, data.semanasPorEngenheiro);
  const anchor = mondayOf(parseISO(data.anchorMonday));
  const weeks = weeksBetween(anchor, mondayOf(now));
  const currentIdx = Math.floor(weeks / semanas);
  const weekInSlot = ((weeks % semanas) + semanas) % semanas + 1;

  const ferias = data.ferias;
  return {
    ...base,
    weekInSlot,
    current: buildSlot(engenheiros, currentIdx, semanas, anchor, ferias),
    upcoming: Array.from({ length: upcomingCount }, (_, i) =>
      buildSlot(engenheiros, currentIdx + 1 + i, semanas, anchor, ferias),
    ),
  };
}

export function scheduleForAll(data: SustentacaoData, now: Date): GroupSchedule[] {
  return data.grupos.map((g) => scheduleForGroup(data, g, now));
}
