/**
 * Seed one-off dos projetos no Supabase (migração do JSON à mão → banco).
 *
 *   pnpm seed:projetos
 *
 * Lê `src/features/projetos/projetos.json` (shape antigo, engenheiro único) e o
 * `config.json` (roster do time), e faz upsert nas 4 tabelas usando a
 * **service_role key** (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no `.env`).
 * Idempotente — pode rodar de novo sem duplicar. Depois disso, a fonte passa a
 * ser o banco (o JSON fica só como registro).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROJETOS_FILE = path.resolve(ROOT, "src/features/projetos/projetos.json");
const CONFIG_FILE = path.resolve(__dirname, "config.json");

/** Carrega variáveis do `.env` na raiz (mesmo parser mínimo do sync.ts). */
function loadEnvFile(): void {
  const envPath = path.resolve(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

interface RawRegistro {
  data: string;
  progresso: number;
  saude: number;
  nota: string;
  marco?: "inicio" | "fim" | "info";
}
interface RawProjeto {
  id: string;
  codigo: string;
  nome: string;
  engenheiroEmail: string | null;
  engenheiroNome: string | null;
  inicio: string | null;
  prazo: string | null;
  fechamento: string | null;
  status: string;
  prioridade: number;
  quarter: string;
  descricao: string;
  registros: RawRegistro[];
}

async function main(): Promise<void> {
  loadEnvFile();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no `.env`.");
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { projetos } = JSON.parse(fs.readFileSync(PROJETOS_FILE, "utf8")) as {
    projetos: RawProjeto[];
  };
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")) as {
    users: { email: string; name: string }[];
  };

  // marco (pt, no JSON) → milestone (en, no banco).
  const MARCO_TO_DB: Record<string, string> = { inicio: "start", fim: "end", info: "info" };
  const TEAM_SLUG = "plataforma";
  const TEAM_NAME = "Time Plataforma";

  const check = (error: { message: string } | null, etapa: string) => {
    if (error) throw new Error(`${etapa}: ${error.message}`);
  };

  // Engenheiros são usuários do sistema (auth.users/profiles) — mapeia email → uuid.
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (usersErr) throw new Error(`auth.admin.listUsers: ${usersErr.message}`);
  const emailToId = new Map<string, string>();
  for (const u of usersData.users) {
    if (u.email) emailToId.set(u.email.toLowerCase(), u.id);
  }
  const idFor = (email: string | null): string | null =>
    email ? emailToId.get(email.toLowerCase()) ?? null : null;

  // Time (upsert por slug) e obtém o id.
  check(
    (
      await supabase
        .from("teams")
        .upsert({ slug: TEAM_SLUG, name: TEAM_NAME }, { onConflict: "slug" })
    ).error,
    "teams",
  );
  const { data: teamRow, error: teamErr } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", TEAM_SLUG)
    .single();
  if (teamErr) throw new Error(`teams select: ${teamErr.message}`);
  const teamId = (teamRow as { id: string }).id;

  // Membros do time = usuários do config.json que existem no auth.
  const semUser: string[] = [];
  const membros = config.users.flatMap((u) => {
    const id = idFor(u.email);
    if (!id) {
      semUser.push(u.email);
      return [];
    }
    return [{ team_id: teamId, user_id: id }];
  });
  if (membros.length) {
    check(
      (await supabase.from("team_members").upsert(membros, { onConflict: "team_id,user_id" }))
        .error,
      "team_members",
    );
  }

  check(
    (
      await supabase.from("projects").upsert(
        projetos.map((p) => ({
          id: p.id,
          code: p.codigo,
          name: p.nome,
          description: p.descricao ?? "",
          status: p.status,
          priority: p.prioridade,
          quarter: p.quarter,
          team_id: teamId,
          start_date: p.inicio,
          due_date: p.prazo,
          closed_date: p.fechamento,
        })),
        { onConflict: "id" },
      )
    ).error,
    "projects",
  );

  const vinculos = projetos.flatMap((p) => {
    const uid = idFor(p.engenheiroEmail);
    if (p.engenheiroEmail && !uid) semUser.push(p.engenheiroEmail);
    return uid ? [{ project_id: p.id, user_id: uid }] : [];
  });
  if (vinculos.length) {
    check(
      (
        await supabase
          .from("project_engineers")
          .upsert(vinculos, { onConflict: "project_id,user_id" })
      ).error,
      "project_engineers",
    );
  }

  const registros = projetos.flatMap((p) =>
    p.registros.map((r) => ({
      project_id: p.id,
      date: r.data,
      progress: r.progresso,
      health: r.saude,
      note: r.nota ?? "",
      milestone: r.marco ? MARCO_TO_DB[r.marco] : null,
    })),
  );
  if (registros.length) {
    check(
      (await supabase.from("weekly_reports").insert(registros)).error,
      "weekly_reports",
    );
  }

  if (semUser.length) {
    console.warn(
      `⚠ E-mails sem usuário no auth (ignorados): ${[...new Set(semUser)].join(", ")}`,
    );
  }
  console.log(
    `Seed ok: time "${TEAM_NAME}" com ${membros.length} membros, ${projetos.length} projects, ` +
      `${vinculos.length} vínculos, ${registros.length} weekly_reports.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
