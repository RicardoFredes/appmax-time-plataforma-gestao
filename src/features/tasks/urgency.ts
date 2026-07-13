import type { Urgency } from "./types";

export const URGENCY_ORDER: Urgency[] = ["alta", "media", "baixa"];

/**
 * Paleta de urgência em tons "soft" (fundo claro + texto forte), usando
 * rose/orange/slate para não competir com os hues de status.
 */
export const URGENCY_META: Record<
  Urgency,
  { label: string; bg: string; text: string; solid: string; rank: number }
> = {
  alta: { label: "Alta", bg: "#ffe4e6", text: "#be123c", solid: "#f43f5e", rank: 0 }, // rose
  media: { label: "Média", bg: "#ffedd5", text: "#c2410c", solid: "#f97316", rank: 1 }, // orange
  baixa: { label: "Baixa", bg: "#f1f5f9", text: "#475569", solid: "#94a3b8", rank: 2 }, // slate
};
