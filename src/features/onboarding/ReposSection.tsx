import { useState } from "react";
import { ArrowUpRight, FolderGit2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GroupHeading, Section, StackChip } from "./parts";
import { REPOS, REPO_GROUPS } from "./repos";
import { chipFor } from "./stack";
import type { Repo } from "./types";

const HOST_LABEL = { bitbucket: "Bitbucket", github: "GitHub" } as const;

function RepoRow({ repo }: { repo: Repo }) {
  return (
    <TableRow>
      <TableCell className="align-top">
        {repo.url ? (
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-start gap-1 font-mono text-sm font-medium text-foreground hover:text-primary"
          >
            <span className="break-words">{repo.name}</span>
            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </a>
        ) : (
          <span className="break-words font-mono text-sm font-medium">{repo.name}</span>
        )}
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {repo.host ? HOST_LABEL[repo.host] : "sem remote configurado"}
        </div>
      </TableCell>

      <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
        {repo.description}
      </TableCell>

      <TableCell className="align-top">
        <div className="flex flex-wrap gap-1">
          {repo.stack.map((id) => {
            const chip = chipFor(id);
            return <StackChip key={id} label={chip.label} logo={chip.logo} />;
          })}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ReposSection() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = (r: Repo) =>
    !q ||
    r.name.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.stack.some((s) => s.includes(q));

  const visible = REPOS.filter(matches);

  return (
    <Section
      id="repositorios"
      icon={<FolderGit2 className="h-5 w-5" />}
      title="Repositórios"
      subtitle={`${REPOS.length} repositórios`}
      action={
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar por nome ou stack…"
            className="h-8 w-56 pl-8 text-sm"
          />
        </div>
      }
    >
      {visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum repositório casa com “{query}”.
        </p>
      )}

      <div className="space-y-8">
        {REPO_GROUPS.map((group) => {
          const repos = visible.filter((r) => r.group === group.id);
          if (repos.length === 0) return null;
          return (
            <div key={group.id}>
              <GroupHeading
                title={group.label}
                count={repos.length}
                description={group.description}
              />
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[16rem]">Repositório</TableHead>
                      <TableHead>O que é</TableHead>
                      <TableHead className="w-[13rem]">Stack</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repos.map((r) => (
                      <RepoRow key={r.name} repo={r} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Badge variant="outline">acesso</Badge>
        Quase tudo vive no workspace{" "}
        <code className="rounded bg-muted px-1 font-mono">appmax-space</code> do
        Bitbucket. Peça acesso ao seu líder no primeiro dia: sem ele, metade dos
        links acima dá 404.
      </div>
    </Section>
  );
}
