import { useState } from "react";
import { Code2, GitBranch, LayoutGrid, Network, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Avatar, GroupHeading, RichText, Section, StackChip } from "./parts";
import { MEMBERS, TEAM_MISSION, TRACKS, displayName } from "./team";
import { chipFor } from "./stack";
import type { Member } from "./types";

function MemberCard({
  member,
  showSkills,
}: {
  member: Member;
  showSkills: boolean;
}) {
  const showFooter = showSkills && member.skills.length > 0;
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <Avatar name={member.name} seed={member.email} src={member.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold leading-tight">{displayName(member)}</span>
            {member.isNew && (
              <Badge variant="fuchsia" className="gap-1">
                <Sparkles className="h-3 w-3" />
                novo no time
              </Badge>
            )}
          </div>
          {member.nickname && (
            <div className="text-xs text-muted-foreground">{member.name}</div>
          )}
          <div className="mt-0.5 text-sm text-muted-foreground">
            {member.position ?? (
              <span className="italic">cargo a definir</span>
            )}
          </div>
          <a
            href={`mailto:${member.email}`}
            className="mt-1 block truncate text-xs text-primary hover:underline"
          >
            {member.email}
          </a>
        </div>
      </div>

      {showFooter && (
        <div className="flex flex-wrap items-center gap-1.5">
          {member.skills.map((id) => {
            const s = chipFor(id);
            return <StackChip key={id} label={s.label} logo={s.logo} />;
          })}
        </div>
      )}
    </Card>
  );
}

/** Nó compacto do organograma. */
function OrgNode({ member, lead = false }: { member: Member; lead?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-2",
        lead && "border-primary/50 bg-primary/5 px-3 py-2.5",
      )}
    >
      <Avatar
        name={member.name}
        seed={member.email}
        src={member.avatar}
        size={lead ? "md" : "sm"}
      />
      <div className="min-w-0">
        <div className={cn("truncate text-sm", lead ? "font-semibold" : "font-medium")}>
          {displayName(member)}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">
          {member.position ?? "cargo a definir"}
        </div>
      </div>
    </div>
  );
}

function OrgChart() {
  const lead = MEMBERS.find((m) => m.track === "manager");
  const tracks = TRACKS.filter((t) => t.id !== "manager");

  return (
    <div className="flex flex-col items-center">
      {lead && (
        <>
          <div className="w-full max-w-[16rem]">
            <OrgNode member={lead} lead />
          </div>
          <div className="h-6 w-px bg-border" aria-hidden />
        </>
      )}
      <div className="w-full border-t" aria-hidden />
      <div className="grid w-full grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
        {tracks.map((track) => {
          const people = MEMBERS.filter((m) => m.track === track.id);
          return (
            <div key={track.id} className="flex flex-col items-center gap-3">
              <Badge variant="default">
                {track.label} · {people.length}
              </Badge>
              <div className="h-3 w-px bg-border" aria-hidden />
              <div className="flex w-full flex-col gap-2">
                {people.map((m) => (
                  <OrgNode key={m.email} member={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TeamSection() {
  const [view, setView] = useState<"cards" | "org">("cards");
  // Skills poluem a leitura de quem é quem, então entram só sob demanda.
  const [showSkills, setShowSkills] = useState(false);

  return (
    <Section
      id="time"
      icon={<GitBranch className="h-5 w-5" />}
      title="O time"
      subtitle={`${MEMBERS.length} pessoas`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {view === "cards" && (
            <Button
              type="button"
              variant={showSkills ? "secondary" : "outline"}
              size="sm"
              aria-pressed={showSkills}
              onClick={() => setShowSkills((v) => !v)}
              className="gap-1.5"
            >
              <Code2 className="h-3.5 w-3.5" />
              Skills
            </Button>
          )}
          <Tabs value={view} onValueChange={(v) => setView(v as "cards" | "org")}>
            <TabsList>
              <TabsTrigger value="cards" className="gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="org" className="gap-1.5">
                <Network className="h-3.5 w-3.5" />
                Organograma
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      }
    >
      <div className="mb-6 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
        {TEAM_MISSION.map((paragraph, i) => (
          <p key={i}>
            <RichText>{paragraph}</RichText>
          </p>
        ))}
      </div>

      {view === "cards" ? (
        <div className="space-y-8">
          {TRACKS.map((track) => {
            const people = MEMBERS.filter((m) => m.track === track.id);
            if (people.length === 0) return null;
            return (
              <div key={track.id}>
                <GroupHeading title={track.label} count={people.length} />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {people.map((m) => (
                    <MemberCard key={m.email} member={m} showSkills={showSkills} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <OrgChart />
      )}
    </Section>
  );
}
