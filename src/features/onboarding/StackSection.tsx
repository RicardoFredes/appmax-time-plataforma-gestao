import { ArrowUpRight, ChevronRight, Layers, Link2, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GroupHeading, Section } from "./parts";
import { PANEL_LINKS, QUICK_LINKS, STACK, STACK_CATEGORIES } from "./stack";
import type { StackItem } from "./types";

function StackCard({ item }: { item: StackItem }) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2.5">
        {item.logo && (
          <img src={item.logo} alt="" className="h-6 w-6 shrink-0" aria-hidden />
        )}
        <span className="font-semibold">{item.label}</span>
        {item.deprecation && (
          <Badge variant="warning" className="ml-auto gap-1">
            <TrendingDown className="h-3 w-3" />
            {item.deprecation}
          </Badge>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {item.description}
      </p>

      {item.ecosystem && item.ecosystem.length > 0 && (
        <dl className="mt-1 space-y-1 border-t pt-2 text-[11px]">
          {item.ecosystem.map((e) => (
            <div key={e.label} className="flex gap-1.5">
              <dt className="font-medium text-foreground">{e.label}</dt>
              <dd className="truncate text-muted-foreground">{e.purpose}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

export function StackSection() {
  return (
    <Section
      id="stack"
      icon={<Layers className="h-5 w-5" />}
      title="Stack"
      subtitle="O que usamos e onde cada coisa se aplica"
    >
      <div className="space-y-8">
        {STACK_CATEGORIES.map((cat) => {
          const items = STACK.filter((s) => s.category === cat.id);
          return (
            <div key={cat.id}>
              <GroupHeading title={cat.label} count={items.length} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <StackCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/** Logo da ferramenta; sem asset, cai num quadrado com a inicial. */
function ToolLogo({ label, logo, mono }: { label: string; logo?: string; mono?: boolean }) {
  if (!logo) {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-semibold text-muted-foreground"
        aria-hidden
      >
        {label[0]}
      </div>
    );
  }
  return (
    <img
      src={logo}
      alt=""
      aria-hidden
      className={cn("h-8 w-8 shrink-0 object-contain", mono && "dark:invert")}
    />
  );
}

export function LinksSection() {
  return (
    <Section
      id="links"
      icon={<Link2 className="h-5 w-5" />}
      title="Onde as coisas ficam"
      subtitle="Os serviços que você vai abrir todo dia"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group flex gap-3 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:border-primary/50"
          >
            <ToolLogo label={link.label} logo={link.logo} mono={link.mono} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{link.label}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {link.description}
              </p>
            </div>
          </a>
        ))}
      </div>

      <h3 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide">
        As outras abas deste painel
      </h3>
      <ul className="divide-y rounded-lg border">
        {PANEL_LINKS.map((link) => (
          <li key={link.hash}>
            <a
              href={link.hash}
              className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-1 font-medium group-hover:text-primary">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                {link.label}
              </span>
              <span className="flex-1 text-sm text-muted-foreground">
                {link.description}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
