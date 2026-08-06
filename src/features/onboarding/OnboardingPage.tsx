/**
 * Aba Onboarding: página estática de boas-vindas ao time. Todo o conteúdo é
 * hardcoded em `team.ts` / `repos.ts` / `contexts.ts` / `stack.ts` e não
 * depende de Jira, Supabase nem do `sync`.
 *
 * O conteúdo é longo demais pra uma página corrida, então é dividido em
 * seções navegadas por um menu lateral: **uma seção por vez**, com sub-rota
 * própria (`#/onboarding/<seção>`) pra ser linkável e sobreviver ao reload.
 */
import { useEffect, useState, type ComponentType } from "react";
import { CalendarDays, Compass, FolderGit2, Layers, Link2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamSection } from "./TeamSection";
import { ReposSection } from "./ReposSection";
import { ContextsSection } from "./ContextsSection";
import { LinksSection, StackSection } from "./StackSection";
import { MEMBERS, TEAM_NAME } from "./team";
import { REPOS } from "./repos";
import { CONTEXTS } from "./contexts";
import { STACK } from "./stack";

interface SectionDef {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  count?: number;
  render: () => JSX.Element;
}

const SECTIONS: SectionDef[] = [
  {
    id: "time",
    label: "O time",
    icon: Users,
    count: MEMBERS.length,
    render: () => <TeamSection />,
  },
  {
    id: "repositorios",
    label: "Repositórios",
    icon: FolderGit2,
    count: REPOS.length,
    render: () => <ReposSection />,
  },
  {
    id: "contextos",
    label: "Contextos",
    icon: Compass,
    count: CONTEXTS.length,
    render: () => <ContextsSection />,
  },
  {
    id: "stack",
    label: "Stack",
    icon: Layers,
    count: STACK.length,
    render: () => <StackSection />,
  },
  {
    id: "links",
    label: "Onde as coisas ficam",
    icon: Link2,
    render: () => <LinksSection />,
  },
];

const DEFAULT_SECTION = SECTIONS[0].id;

/** Seção aberta, lida do hash `#/onboarding/<seção>`. */
function useSectionRoute(): [string, (id: string) => void] {
  const read = (): string => {
    const parts = window.location.hash.replace(/^#\/?/, "").split("/");
    const seg = parts[0] === "onboarding" ? parts[1] : undefined;
    return SECTIONS.some((s) => s.id === seg) ? seg! : DEFAULT_SECTION;
  };
  const [id, setId] = useState<string>(read);
  useEffect(() => {
    const on = () => setId(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const navigate = (next: string) => {
    window.location.hash = `/onboarding/${next}`;
    setId(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return [id, navigate];
}

function Hero() {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-card to-card p-6">
      <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <CalendarDays className="h-3 w-3" />
        Primeiros dias
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Bem-vindo ao {TEAM_NAME}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Esta é a página de partida: quem é quem, o que cada repositório faz, quais
        contextos sustentamos e onde ficam as ferramentas. Não substitui conversa
        com o time; serve pra você não precisar perguntar as mesmas cinco coisas.
      </p>
    </div>
  );
}

function SideNav({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Seções do onboarding"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {SECTIONS.map(({ id, label, icon: Icon, count }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onNavigate(id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors lg:w-full",
              selected
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {count !== undefined && (
              <span className="shrink-0 text-xs tabular-nums opacity-60">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function OnboardingPage() {
  const [active, navigate] = useSectionRoute();
  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <div className="space-y-6">
      <Hero />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
        <SideNav active={active} onNavigate={navigate} />
        <div className="min-w-0">{section.render()}</div>
      </div>
    </div>
  );
}
