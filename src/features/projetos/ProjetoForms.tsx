/**
 * Formulários (dialogs) de CRUD por projeto — salvam direto no Supabase (escrita
 * exige sessão herdada do backoffice).
 *
 * - `ProjetoFormDialog`: cria/edita metadados + time + engenheiros (membros do time) + apagar.
 * - `RegistroFormDialog`: reporta o registro da semana corrente (edit-in-place por PK).
 */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initials } from "@/lib/people";
import {
  PRIORIDADE_LABEL,
  STATUS_META,
  STATUS_ORDER,
  ultimoRegistro,
} from "./derive";
import {
  fetchTeamMembers,
  fetchTeams,
  setEngenheiros,
  upsertProjeto,
  upsertRegistro,
  type ProjetoMeta,
} from "./data";
import type { Engenheiro, Projeto, ProjetoStatus, RegistroSemanal, Team } from "./types";

/** Segunda-feira (YYYY-MM-DD) da semana de uma data — chave do registro semanal. */
function mondayISO(d = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0 dom … 6 sáb
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * Próximo código incremental (`PRJ-<n>`) a partir dos existentes — usa o maior
 * número já usado + 1 (não reaproveita buracos deixados por projetos apagados).
 */
function nextCodigo(projetos: Projeto[]): string {
  let max = 0;
  for (const p of projetos) {
    const m = /^PRJ-(\d+)$/i.exec(p.codigo.trim());
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `PRJ-${max + 1}`;
}

/** Slug estável a partir do nome (id do projeto, usado na URL de detalhe). */
function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "projeto"
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MiniAvatar({ nome, avatarUrl }: { nome: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
      {initials(nome)}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── ProjetoFormDialog */

const VAZIO: ProjetoMeta = {
  id: "",
  codigo: "",
  nome: "",
  descricao: "",
  status: "in_progress",
  teamId: null,
  prioridade: 3,
  quarter: "",
  inicio: null,
  prazo: null,
  fechamento: null,
};

export function ProjetoFormDialog({
  open,
  onOpenChange,
  projeto,
  projetosExistentes,
  quarterAtual,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** `null` = novo projeto. */
  projeto: Projeto | null;
  /** Todos os projetos (qualquer quarter) — base do código incremental automático. */
  projetosExistentes: Projeto[];
  quarterAtual: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProjetoMeta>(VAZIO);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Engenheiro[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // (Re)inicializa o form + carrega os times ao abrir.
  useEffect(() => {
    if (!open) return;
    setErro(null);
    if (projeto) {
      const { engenheiros, registros: _r, ...meta } = projeto;
      void _r;
      setForm(meta);
      setSelectedIds(new Set(engenheiros.map((e) => e.id)));
    } else {
      setForm({ ...VAZIO, codigo: nextCodigo(projetosExistentes), quarter: quarterAtual });
      setSelectedIds(new Set());
    }
    fetchTeams()
      .then((ts) => {
        setTeams(ts);
        // Novo projeto: cai no primeiro time por padrão.
        setForm((f) => (f.teamId ? f : { ...f, teamId: ts[0]?.id ?? null }));
      })
      .catch((e) => setErro(e instanceof Error ? e.message : String(e)));
  }, [open, projeto, projetosExistentes, quarterAtual]);

  // Carrega os membros quando o time muda.
  useEffect(() => {
    if (!open || !form.teamId) {
      setMembers([]);
      return;
    }
    let alive = true;
    fetchTeamMembers(form.teamId)
      .then((m) => alive && setMembers(m))
      .catch(() => alive && setMembers([]));
    return () => {
      alive = false;
    };
  }, [open, form.teamId]);

  const patch = (p: Partial<ProjetoMeta>) => setForm((f) => ({ ...f, ...p }));

  const trocarTime = (teamId: string) => {
    // Trocar de time zera a seleção (engenheiros são membros do time).
    setForm((f) => ({ ...f, teamId }));
    setSelectedIds(new Set());
  };

  const toggle = (id: string, on: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const salvar = async () => {
    setErro(null);
    if (!form.nome.trim() || !form.codigo.trim() || !form.quarter.trim()) {
      setErro("Preencha nome, código e quarter.");
      return;
    }
    setSalvando(true);
    try {
      const id = projeto?.id || slugify(form.nome);
      const meta: ProjetoMeta = {
        ...form,
        id,
        inicio: form.inicio || null,
        prazo: form.prazo || null,
        fechamento: form.fechamento || null,
      };
      await upsertProjeto(meta);
      await setEngenheiros(id, [...selectedIds]);
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{projeto ? "Editar projeto" : "Novo projeto"}</DialogTitle>
          <DialogDescription>
            {projeto ? projeto.codigo : "Cadastre um projeto e seus engenheiros."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código">
            <Input
              value={form.codigo}
              readOnly
              tabIndex={-1}
              aria-describedby={!projeto ? "codigo-auto" : undefined}
              className="cursor-default bg-muted text-muted-foreground"
            />
            {!projeto && (
              <p id="codigo-auto" className="text-xs text-muted-foreground">
                Gerado automaticamente.
              </p>
            )}
          </Field>
          <Field label="Quarter (ex.: 2026-Q3)">
            <Input value={form.quarter} onChange={(e) => patch({ quarter: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Nome">
              <Input value={form.nome} onChange={(e) => patch({ nome: e.target.value })} />
            </Field>
          </div>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => patch({ status: v as ProjetoStatus })}
            >
              <SelectTrigger>
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
              value={String(form.prioridade)}
              onValueChange={(v) => patch({ prioridade: Number(v) })}
            >
              <SelectTrigger>
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
          <Field label="Início">
            <Input
              type="date"
              value={form.inicio ?? ""}
              onChange={(e) => patch({ inicio: e.target.value || null })}
            />
          </Field>
          <Field label="Previsão (prazo)">
            <Input
              type="date"
              value={form.prazo ?? ""}
              onChange={(e) => patch({ prazo: e.target.value || null })}
            />
          </Field>
          <Field label="Fechamento">
            <Input
              type="date"
              value={form.fechamento ?? ""}
              onChange={(e) => patch({ fechamento: e.target.value || null })}
            />
          </Field>
          <Field label="Time">
            <Select value={form.teamId ?? ""} onValueChange={trocarTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um time" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição">
              <Textarea
                value={form.descricao}
                onChange={(e) => patch({ descricao: e.target.value })}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Label>Engenheiros (membros do time)</Label>
            <div className="mt-1.5 grid gap-1.5 rounded-md border p-3 sm:grid-cols-2">
              {!form.teamId && (
                <p className="text-sm text-muted-foreground">Selecione um time primeiro.</p>
              )}
              {form.teamId && members.length === 0 && (
                <p className="text-sm text-muted-foreground">Time sem membros.</p>
              )}
              {members.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedIds.has(e.id)}
                    onCheckedChange={(v) => toggle(e.id, v === true)}
                  />
                  <MiniAvatar nome={e.nome} avatarUrl={e.avatarUrl} />
                  <span className="truncate">{e.nome}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────── RegistroFormDialog */

type MarcoOpt = "" | NonNullable<RegistroSemanal["marco"]>;

export function RegistroFormDialog({
  open,
  onOpenChange,
  projeto,
  semana: semanaEditar,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projeto: Projeto;
  /** Semana a editar (YYYY-MM-DD). Ausente = reportar a semana corrente. */
  semana?: string;
  onSaved: () => void;
}) {
  const [semana, setSemana] = useState(() => mondayISO());
  // Editando uma semana que já tem registro (muda o título/descrição e o pré-preenchimento).
  const editando = projeto.registros.some((r) => r.semana === semana);
  const [progresso, setProgresso] = useState(0);
  const [saude, setSaude] = useState(3);
  const [nota, setNota] = useState("");
  const [marco, setMarco] = useState<MarcoOpt>("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ao abrir: começa na semana pedida (edição do histórico) ou na semana corrente.
  useEffect(() => {
    if (!open) return;
    setSemana(semanaEditar ?? mondayISO());
  }, [open, semanaEditar]);

  // Pré-preenche os campos. Só carrega tudo (inclusive a nota) quando é uma
  // **edição** de um registro existente vinda do histórico (`semanaEditar`). Ao
  // **reportar** (botão Reportar), começa em branco: nota/marco vazios e progresso
  // herdado do último registro — é um reporte novo, não uma cópia do anterior.
  useEffect(() => {
    if (!open) return;
    setErro(null);
    const desta = projeto.registros.find((r) => r.semana === semana);
    const editandoHistorico = semanaEditar != null;
    if (desta && editandoHistorico) {
      setProgresso(desta.progresso);
      setSaude(desta.saude);
      setNota(desta.nota ?? "");
      setMarco((desta.marco as MarcoOpt) ?? "");
    } else {
      const anterior = ultimoRegistro(projeto);
      setProgresso(desta?.progresso ?? anterior?.progresso ?? 0);
      setSaude(desta?.saude ?? anterior?.saude ?? 3);
      setNota("");
      setMarco("");
    }
  }, [open, projeto, semana, semanaEditar]);

  // Qualquer data escolhida é ancorada na segunda-feira daquela semana (PK do registro).
  const trocarData = (v: string) => {
    if (!v) return;
    const [y, mo, d] = v.split("-").map(Number);
    setSemana(mondayISO(new Date(y, mo - 1, d)));
  };

  const salvar = async () => {
    setSalvando(true);
    setErro(null);
    try {
      const reg: RegistroSemanal = {
        semana,
        progresso,
        saude,
        nota: nota.trim(),
        ...(marco ? { marco } : {}),
      };
      await upsertRegistro(projeto.id, reg);
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar registro" : "Reportar semana"} · {projeto.codigo}
          </DialogTitle>
          <DialogDescription>
            {projeto.nome}
            {editando
              ? " — já existe registro nesta semana; será editado no lugar."
              : " — escolha a semana e preencha o reporte."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Semana (segunda-feira)">
            <Input type="date" value={semana} onChange={(e) => trocarData(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              A semana é ancorada na segunda-feira; qualquer data é ajustada para ela.
            </p>
          </Field>

          <Field label={`Progresso — ${progresso}%`}>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={progresso}
                onChange={(e) => setProgresso(Number(e.target.value))}
                className="h-2 flex-1 cursor-pointer accent-[#9b6afa]"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={progresso}
                onChange={(e) => setProgresso(Number(e.target.value))}
                className="w-20"
              />
            </div>
          </Field>

          <Field label="Marco (opcional)">
            <Select
              value={marco || "none"}
              onValueChange={(v) => setMarco(v === "none" ? "" : (v as MarcoOpt))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem marco (registro normal)</SelectItem>
                <SelectItem value="inicio">Início do projeto</SelectItem>
                <SelectItem value="fim">Fim do projeto</SelectItem>
                <SelectItem value="info">Informativo</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {!marco && (
            <Field label="On-tracking (saúde)">
              <Select value={String(saude)} onValueChange={(v) => setSaude(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 · On tracking</SelectItem>
                  <SelectItem value="4">4 · Bom</SelectItem>
                  <SelectItem value="3">3 · Atenção</SelectItem>
                  <SelectItem value="2">2 · Risco</SelectItem>
                  <SelectItem value="1">1 · Em perigo</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field label="Nota">
            <Textarea value={nota} onChange={(e) => setNota(e.target.value)} />
          </Field>
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
