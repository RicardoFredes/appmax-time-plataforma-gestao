/**
 * Editor visual do controle de projetos, com rascunho em `localStorage`.
 *
 * Fluxo: preencha o report da semana (progresso/saúde/nota) de cada projeto,
 * edite metadados ou adicione projetos — tudo salvo automaticamente no navegador
 * (nada sai daqui). Ao terminar, **Copiar JSON** (ou baixar) e colar em
 * `src/features/projetos/projetos.json`, depois deploy. O texto gerado usa o
 * mesmo formato do arquivo (`serialize.ts`), então o diff fica limpo.
 *
 * Aberto pela rota `#/projetos/editor` (tratada em `ProjetosPage`).
 */

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardCopy,
  Download,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import projetosData from "./projetos.json";
import { serializeProjetosData } from "./serialize";
import { PRIORIDADE_LABEL, SAUDE_META, STATUS_META, STATUS_ORDER, quarterDe } from "./derive";
import type { Projeto, ProjetoStatus, ProjetosData, RegistroSemanal } from "./types";

const STORAGE_KEY = "projetos:editor:draft:v1";
const DOC: string | undefined = (projetosData as { $doc?: string }).$doc;
const BASE: ProjetosData = { projetos: (projetosData as ProjetosData).projetos };

// ── datas ──────────────────────────────────────────────────────────────────
function mondayISO(d = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0 dom … 6 sáb
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function clone<T>(v: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(v)
    : (JSON.parse(JSON.stringify(v)) as T);
}

/**
 * Normaliza um rascunho carregado do localStorage. Rascunhos salvos antes da
 * migração "status em inglês" carregam `status` que não existe mais em
 * `STATUS_META` — coage para um valor válido para não quebrar a renderização.
 */
function sanitizeDraft(data: ProjetosData): ProjetosData {
  const projetos = (data.projetos ?? []).map((p) => ({
    ...p,
    status: STATUS_META[p.status] ? p.status : ("in_progress" as ProjetoStatus),
  }));
  return { projetos };
}

function ultimo(p: Projeto): RegistroSemanal | undefined {
  return [...p.registros].sort((a, b) => a.semana.localeCompare(b.semana)).pop();
}

/** Retorna uma cópia do projeto com o registro de `semana` criado/atualizado. */
function withRegistro(p: Projeto, semana: string, changes: Partial<RegistroSemanal>): Projeto {
  const registros = [...p.registros];
  const idx = registros.findIndex((r) => r.semana === semana);
  if (idx >= 0) {
    registros[idx] = { ...registros[idx], ...changes, semana };
  } else {
    const anterior = ultimo(p);
    registros.push({
      semana,
      progresso: anterior?.progresso ?? 0,
      saude: anterior?.saude ?? 3,
      nota: "",
      ...changes,
    });
  }
  registros.sort((a, b) => a.semana.localeCompare(b.semana));
  return { ...p, registros };
}

// ── rascunho no localStorage ─────────────────────────────────────────────────
function useDraft() {
  const [draft, setDraft] = useState<ProjetosData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return sanitizeDraft(JSON.parse(raw) as ProjetosData);
    } catch {
      /* ignora rascunho corrompido */
    }
    return clone(BASE);
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* quota/privado: segue sem persistir */
    }
  }, [draft]);
  return { draft, setDraft };
}

// ── átomos ──────────────────────────────────────────────────────────────────
const inputCls =
  "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

/** Seletor de saúde 1–5, botões coloridos pela `SAUDE_META`. */
function SaudePicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const m = SAUDE_META[n];
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            title={`${n} · ${m.label}`}
            className="flex h-9 w-12 flex-col items-center justify-center rounded-md border text-xs font-semibold transition-colors"
            style={{
              backgroundColor: active ? m.color : `${m.color}14`,
              color: active ? "#fff" : m.color,
              borderColor: active ? m.color : "transparent",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <Input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    />
  );
}

// ── card de um projeto ────────────────────────────────────────────────────────
function ProjetoCard({
  projeto,
  semana,
  estado,
  onPatch,
  onRegistro,
  onRemove,
}: {
  projeto: Projeto;
  semana: string;
  estado: "novo" | "alterado" | null;
  onPatch: (patch: Partial<Projeto>) => void;
  onRegistro: (changes: Partial<RegistroSemanal>) => void;
  onRemove: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const reg = projeto.registros.find((r) => r.semana === semana);
  const anterior = ultimo(projeto);
  const progresso = reg?.progresso ?? anterior?.progresso ?? 0;
  const saude = reg?.saude ?? anterior?.saude ?? 3;
  const nota = reg?.nota ?? "";

  return (
    <Card className="p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{projeto.codigo}</span>
            <span className="font-medium">{projeto.nome || "(sem nome)"}</span>
            <Badge variant={STATUS_META[projeto.status].badge}>
              {STATUS_META[projeto.status].label}
            </Badge>
            {estado && (
              <Badge variant={estado === "novo" ? "success" : "warning"}>{estado}</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {projeto.engenheiroNome ?? "Sem engenheiro"} · {projeto.quarter} ·{" "}
            {reg ? "registro desta semana" : "sem registro nesta semana ainda"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        >
          Dados
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Report da semana */}
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Field label={`Progresso — ${progresso}%`}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={progresso}
              onChange={(e) => onRegistro({ progresso: Number(e.target.value) })}
              className="h-2 flex-1 cursor-pointer accent-[#9b6afa]"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={progresso}
              onChange={(e) =>
                onRegistro({ progresso: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
              }
              className="h-9 w-20"
            />
          </div>
        </Field>
        <Field label={`Saúde — ${SAUDE_META[saude].label}`}>
          <SaudePicker value={saude} onChange={(n) => onRegistro({ saude: n })} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Nota da semana">
          <textarea
            value={nota}
            onChange={(e) => onRegistro({ nota: e.target.value })}
            rows={2}
            placeholder="Como andou o projeto nesta semana…"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Metadados (colapsável) */}
      {aberto && (
        <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
          <Field label="Nome">
            <Input value={projeto.nome} onChange={(e) => onPatch({ nome: e.target.value })} />
          </Field>
          <Field label="Código">
            <Input value={projeto.codigo} onChange={(e) => onPatch({ codigo: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select
              value={projeto.status}
              onValueChange={(v) => onPatch({ status: v as ProjetoStatus })}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Prioridade">
            <Select
              value={String(projeto.prioridade)}
              onValueChange={(v) => onPatch({ prioridade: Number(v) })}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} · {PRIORIDADE_LABEL[n]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Engenheiro (nome)">
            <Input
              value={projeto.engenheiroNome ?? ""}
              onChange={(e) => onPatch({ engenheiroNome: e.target.value || null })}
            />
          </Field>
          <Field label="Engenheiro (e-mail)">
            <Input
              value={projeto.engenheiroEmail ?? ""}
              onChange={(e) => onPatch({ engenheiroEmail: e.target.value || null })}
            />
          </Field>
          <Field label="Quarter">
            <Input value={projeto.quarter} onChange={(e) => onPatch({ quarter: e.target.value })} />
          </Field>
          <Field label="Início">
            <DateInput value={projeto.inicio} onChange={(v) => onPatch({ inicio: v })} />
          </Field>
          <Field label="Prazo">
            <DateInput value={projeto.prazo} onChange={(v) => onPatch({ prazo: v })} />
          </Field>
          <Field label="Fechamento">
            <DateInput value={projeto.fechamento} onChange={(v) => onPatch({ fechamento: v })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição">
              <textarea
                value={projeto.descricao}
                onChange={(e) => onPatch({ descricao: e.target.value })}
                rows={2}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button variant="outline" size="sm" onClick={onRemove} className="text-destructive">
              <Trash2 className="h-4 w-4" />
              Remover projeto
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── página do editor ──────────────────────────────────────────────────────────
export function ProjetosEditor({ onBack }: { onBack: () => void }) {
  const { draft, setDraft } = useDraft();
  const semana = useMemo(() => mondayISO(), []);
  const quarterAtual = useMemo(() => quarterDe(new Date()), []);
  const [quarterFiltro, setQuarterFiltro] = useState<string>(quarterAtual);
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const baseById = useMemo(() => {
    const m = new Map<string, Projeto>();
    for (const p of BASE.projetos) m.set(p.id, p);
    return m;
  }, []);

  const quarters = useMemo(() => {
    const set = new Set(draft.projetos.map((p) => p.quarter));
    set.add(quarterAtual);
    return ["todos", ...[...set].sort((a, b) => b.localeCompare(a))];
  }, [draft.projetos, quarterAtual]);

  const visiveis = useMemo(
    () =>
      quarterFiltro === "todos"
        ? draft.projetos
        : draft.projetos.filter((p) => p.quarter === quarterFiltro),
    [draft.projetos, quarterFiltro],
  );

  const alterados = useMemo(() => {
    let n = 0;
    for (const p of draft.projetos) {
      const base = baseById.get(p.id);
      if (!base || JSON.stringify(base) !== JSON.stringify(p)) n++;
    }
    return n;
  }, [draft.projetos, baseById]);

  const estadoDe = (p: Projeto): "novo" | "alterado" | null => {
    const base = baseById.get(p.id);
    if (!base) return "novo";
    return JSON.stringify(base) !== JSON.stringify(p) ? "alterado" : null;
  };

  const json = useMemo(() => serializeProjetosData(draft, DOC), [draft]);

  // mutadores
  const patchProjeto = (id: string, patch: Partial<Projeto>) =>
    setDraft((d) => ({ projetos: d.projetos.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  const patchRegistro = (id: string, changes: Partial<RegistroSemanal>) =>
    setDraft((d) => ({
      projetos: d.projetos.map((p) => (p.id === id ? withRegistro(p, semana, changes) : p)),
    }));

  const removerProjeto = (id: string) =>
    setDraft((d) => ({ projetos: d.projetos.filter((p) => p.id !== id) }));

  const novoProjeto = () => {
    const n = draft.projetos.length + 1;
    let id = `projeto-${n}`;
    while (draft.projetos.some((p) => p.id === id)) id = `${id}-x`;
    const novo: Projeto = {
      id,
      codigo: `PRJ-${n}`,
      nome: "",
      engenheiroEmail: null,
      engenheiroNome: null,
      inicio: null,
      prazo: null,
      fechamento: null,
      status: "in_progress",
      prioridade: 3,
      quarter: quarterFiltro === "todos" ? quarterAtual : quarterFiltro,
      descricao: "",
      registros: [{ semana, progresso: 0, saude: 3, nota: "" }],
    };
    setDraft((d) => ({ projetos: [...d.projetos, novo] }));
  };

  const descartar = () => {
    if (window.confirm("Descartar o rascunho e recarregar do arquivo atual?")) {
      setDraft(clone(BASE));
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setShowJson(true); // clipboard bloqueado (iframe): mostra o texto para copiar à mão
    }
  };

  const baixar = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projetos.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editor de projetos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Report da semana de {format(parseISO(semana), "dd/MM/yyyy", { locale: ptBR })} ·
              rascunho salvo automaticamente neste navegador.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={quarterFiltro} onValueChange={setQuarterFiltro}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q === "todos" ? "Todos os quarters" : q}
                    {q === quarterAtual ? " · atual" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={descartar}>
              <RotateCcw className="h-4 w-4" />
              Descartar
            </Button>
            <Button size="sm" onClick={copiar}>
              {copied ? <Check className="text-emerald-400" /> : <ClipboardCopy />}
              {copied ? "Copiado" : "Copiar JSON"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="flex flex-wrap items-center gap-x-4 gap-y-1 border-primary/30 bg-primary/5 p-4 text-sm">
        <span className="font-medium">
          {draft.projetos.length} projetos · {alterados} alterado(s)
        </span>
        <span className="text-muted-foreground">
          Ao terminar, copie o JSON e cole em{" "}
          <code className="rounded bg-muted px-1">src/features/projetos/projetos.json</code>, depois
          faça o deploy.
        </span>
      </Card>

      <div className="space-y-3">
        {visiveis.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Nenhum projeto neste quarter.
          </Card>
        ) : (
          visiveis.map((p) => (
            <ProjetoCard
              key={p.id}
              projeto={p}
              semana={semana}
              estado={estadoDe(p)}
              onPatch={(patch) => patchProjeto(p.id, patch)}
              onRegistro={(changes) => patchRegistro(p.id, changes)}
              onRemove={() => {
                if (window.confirm(`Remover ${p.codigo} ${p.nome}?`)) removerProjeto(p.id);
              }}
            />
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={novoProjeto}>
          <Plus className="h-4 w-4" />
          Novo projeto
        </Button>
        <Button variant="outline" onClick={baixar}>
          <Download className="h-4 w-4" />
          Baixar projetos.json
        </Button>
        <Button variant="ghost" onClick={() => setShowJson((s) => !s)}>
          {showJson ? "Ocultar JSON" : "Ver JSON"}
        </Button>
      </div>

      {showJson && (
        <Card className="p-4">
          <p className="mb-2 text-xs text-muted-foreground">
            Conteúdo para colar em <code>projetos.json</code> (selecione tudo e copie):
          </p>
          <textarea
            readOnly
            value={json}
            rows={16}
            onFocus={(e) => e.currentTarget.select()}
            className={`${inputCls} font-mono text-xs`}
          />
        </Card>
      )}
    </div>
  );
}
