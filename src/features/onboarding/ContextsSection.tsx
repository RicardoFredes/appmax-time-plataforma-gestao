import { Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, GroupHeading, Section } from "./parts";
import { CONTEXTS, CONTEXT_GROUPS } from "./contexts";
import { MEMBER_BY_EMAIL, displayName } from "./team";
import type { Context } from "./types";

/**
 * Linha de responsável. O dono pode ser de outro time (contexto compartilhado),
 * então quando o e-mail não está em `MEMBERS` o nome sai do próprio e-mail.
 */
function OwnerRow({ level, email }: { level: "N1" | "N2"; email?: string }) {
  const member = email ? MEMBER_BY_EMAIL.get(email) : undefined;
  const name = member
    ? displayName(member)
    : email
      ? email.split("@")[0].replace(/\./g, " ")
      : undefined;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 shrink-0 text-[11px] font-semibold text-muted-foreground">
        {level}
      </span>
      {name && email ? (
        <>
          <Avatar name={name} seed={email} size="sm" />
          <span className="min-w-0 flex-1 truncate capitalize">{name}</span>
        </>
      ) : (
        <span className="italic text-muted-foreground">
          {level === "N1" ? "sem dono definido" : "sem backup definido"}
        </span>
      )}
    </div>
  );
}

function ContextCard({ context }: { context: Context }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="min-w-0">
        <div className="truncate font-semibold">{context.name}</div>
        <div className="truncate font-mono text-[11px] text-muted-foreground">
          {context.slug}
        </div>
      </div>
      <div className="space-y-1.5 border-t pt-3">
        <OwnerRow level="N1" email={context.n1} />
        <OwnerRow level="N2" email={context.n2} />
      </div>
    </Card>
  );
}

export function ContextsSection() {
  return (
    <Section
      id="contextos"
      icon={<Compass className="h-5 w-5" />}
      title="Contextos"
      subtitle={`${CONTEXTS.length} fatias de domínio que o time sustenta, com dono (N1) e backup (N2)`}
    >
      <div className="space-y-8">
        {CONTEXT_GROUPS.map((group) => {
          const contexts = CONTEXTS.filter((c) => c.group === group.id);
          if (contexts.length === 0) return null;
          return (
            <div key={group.id}>
              <GroupHeading title={group.label} count={contexts.length} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {contexts.map((c) => (
                  <ContextCard key={c.slug} context={c} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
