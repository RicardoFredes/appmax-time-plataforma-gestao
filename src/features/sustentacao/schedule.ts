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
 * - Overrides (trocas pontuais em `config.json`) vencem o rodízio e a cobertura:
 *   o slot é **partido** nos trechos do override, e o resto do slot continua
 *   valendo normalmente.
 */
import { addDays, parseISO, startOfDay, startOfWeek } from "date-fns";
import type {
  DutyOverride,
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

/** Trecho vindo de um override: quem ele substituiu no plantão e por quê. */
export interface OverrideInfo {
  replaced: SustentacaoEngineer;
  motivo: string;
}

export interface Slot {
  /** Índice do slot relativo ao anchor (0 = slot atual do anchorMonday). */
  index: number;
  /** Id estável para keys de render (um slot pode virar vários trechos). */
  key: string;
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
  /** Preenchido quando o trecho foi fixado à mão (override). */
  override: OverrideInfo | null;
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

/** Turno "cru" do rodízio (base + cobertura de férias), antes dos overrides. */
function rotationSlot(
  engenheiros: SustentacaoEngineer[],
  index: number,
  semanas: number,
  anchor: Date,
  ferias: Vacation[],
): Omit<Slot, "key" | "override"> {
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

/** Override do grupo já resolvido em datas, na ordem cronológica. */
interface Ov {
  start: Date;
  end: Date;
  engineer: SustentacaoEngineer;
  motivo: string;
}

function overridesForGroup(overrides: DutyOverride[], grupo: number): Ov[] {
  return overrides
    .filter((o) => o.grupo === grupo && o.inicio && o.fim && o.email)
    .map((o) => ({
      start: startOfDay(parseISO(o.inicio)),
      end: startOfDay(parseISO(o.fim)),
      engineer: { email: o.email, name: o.name },
      motivo: o.motivo,
    }))
    .filter((o) => o.start.getTime() <= o.end.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Parte o slot do rodízio nos trechos cobertos por overrides. O que sobra do
 * slot mantém o plantão natural (base/cobertura de férias). Overrides que se
 * sobrepõem: o que começa primeiro ganha.
 */
function splitSlot(raw: Omit<Slot, "key" | "override">, overrides: Ov[]): Slot[] {
  const seg = (start: Date, end: Date, ov: Ov | null): Slot => ({
    ...raw,
    key: `${raw.index}:${start.getTime()}`,
    start,
    end,
    ...(ov
      ? {
          effective: ov.engineer,
          coveringFor: null,
          uncovered: false,
          override: { replaced: raw.effective, motivo: ov.motivo },
        }
      : { override: null }),
  });

  const out: Slot[] = [];
  let cursor = raw.start;
  for (const ov of overrides) {
    const s = ov.start.getTime() > cursor.getTime() ? ov.start : cursor;
    const e = ov.end.getTime() < raw.end.getTime() ? ov.end : raw.end;
    if (s.getTime() > e.getTime()) continue; // não cruza o que resta do slot
    if (s.getTime() > cursor.getTime()) out.push(seg(cursor, addDays(s, -1), null));
    out.push(seg(s, e, ov));
    cursor = addDays(e, 1);
    if (cursor.getTime() > raw.end.getTime()) break;
  }
  if (cursor.getTime() <= raw.end.getTime()) out.push(seg(cursor, raw.end, null));
  return out;
}

/** Junta trechos vizinhos do mesmo override (um override pode cruzar slots). */
function mergeOverrides(slots: Slot[]): Slot[] {
  const out: Slot[] = [];
  for (const s of slots) {
    const prev = out[out.length - 1];
    if (
      prev?.override &&
      s.override &&
      prev.effective.email === s.effective.email &&
      addDays(prev.end, 1).getTime() === s.start.getTime()
    ) {
      out[out.length - 1] = { ...prev, end: s.end };
      continue;
    }
    out.push(s);
  }
  return out;
}

/** Escala de um grupo: trecho atual + próximos `upcomingCount` trechos. */
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
  const overrides = overridesForGroup(data.overrides ?? [], grupo.grupo);
  const today = startOfDay(now);

  // Gera slots com folga: cada slot pode virar vários trechos, e trechos já
  // encerrados (o override pode começar no meio do slot atual) são descartados.
  const segments = mergeOverrides(
    Array.from({ length: upcomingCount + 2 }, (_, i) =>
      splitSlot(
        rotationSlot(engenheiros, currentIdx + i, semanas, anchor, ferias),
        overrides,
      ),
    ).flat(),
  ).filter((s) => s.end.getTime() >= today.getTime());

  return {
    ...base,
    weekInSlot,
    current: segments[0] ?? null,
    upcoming: segments.slice(1, 1 + upcomingCount),
  };
}

export function scheduleForAll(data: SustentacaoData, now: Date): GroupSchedule[] {
  return data.grupos.map((g) => scheduleForGroup(data, g, now));
}
