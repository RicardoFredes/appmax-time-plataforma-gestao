/**
 * Cliente REST do Jira Cloud (API v3) para o script de sync.
 * Usa Basic Auth com e-mail + API token (variáveis de ambiente).
 */
import type { Task, TaskSource } from "./types.ts";

export interface JiraCreds {
  baseUrl: string;
  email: string;
  token: string;
}

export function credsFromEnv(): JiraCreds {
  const baseUrl = (process.env.JIRA_BASE_URL || "").replace(/\/$/, "");
  const email = process.env.JIRA_EMAIL || "";
  const token = process.env.JIRA_API_TOKEN || "";
  if (!baseUrl || !email || !token) {
    throw new Error(
      "Faltam credenciais. Defina JIRA_BASE_URL, JIRA_EMAIL e JIRA_API_TOKEN no .env " +
        "(veja .env.sample).",
    );
  }
  return { baseUrl, email, token };
}

const FIELDS = [
  "summary",
  "description",
  "status",
  "issuetype",
  "assignee",
  "project",
  "parent",
  "priority",
  "labels",
  "created",
  "updated",
];

/** Extrai texto plano de um documento ADF (Atlassian Document Format). */
function adfToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; text?: string; content?: unknown[] };
  if (n.type === "text" && typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) {
    return n.content.map(adfToText).join(" ");
  }
  return "";
}

function shortText(raw: unknown, max = 280): string {
  const text = adfToText(raw).replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

interface RawIssue {
  key: string;
  fields: Record<string, any>;
}

export class JiraClient {
  constructor(private creds: JiraCreds) {}

  private get authHeader(): string {
    const raw = `${this.creds.email}:${this.creds.token}`;
    return "Basic " + Buffer.from(raw).toString("base64");
  }

  /** Busca todas as issues de uma JQL, paginando via nextPageToken. */
  async searchAll(jql: string, maxPerPage: number): Promise<RawIssue[]> {
    const out: RawIssue[] = [];
    let nextPageToken: string | undefined;
    do {
      const body: Record<string, unknown> = {
        jql,
        fields: FIELDS,
        maxResults: maxPerPage,
      };
      if (nextPageToken) body.nextPageToken = nextPageToken;

      const res = await fetch(`${this.creds.baseUrl}/rest/api/3/search/jql`, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Jira respondeu ${res.status} para JQL "${jql}": ${text.slice(0, 400)}`,
        );
      }

      const json = (await res.json()) as {
        issues?: RawIssue[];
        nextPageToken?: string;
        isLast?: boolean;
      };
      out.push(...(json.issues ?? []));
      nextPageToken = json.isLast ? undefined : json.nextPageToken;
    } while (nextPageToken);

    return out;
  }

  mapIssue(issue: RawIssue, sources: TaskSource[]): Task {
    const f = issue.fields;
    const parent = f.parent;
    const isEpicParent = parent?.fields?.issuetype?.name === "Epic";
    return {
      key: issue.key,
      url: `${this.creds.baseUrl}/browse/${issue.key}`,
      summary: f.summary ?? "",
      description: shortText(f.description),
      board: f.project?.name ?? "",
      projectKey: f.project?.key ?? "",
      issueType: f.issuetype?.name ?? "",
      status: f.status?.name ?? "",
      statusCategory: (f.status?.statusCategory?.key ?? "new") as Task["statusCategory"],
      priority: f.priority?.name ?? "",
      assigneeName: f.assignee?.displayName ?? "Não atribuída",
      assigneeEmail: f.assignee?.emailAddress ?? "",
      epicKey: isEpicParent ? parent.key : null,
      epicSummary: isEpicParent ? parent.fields?.summary ?? null : null,
      labels: Array.isArray(f.labels) ? f.labels : [],
      created: f.created ?? "",
      updated: f.updated ?? "",
      sources,
      urgency: null,
    };
  }
}
