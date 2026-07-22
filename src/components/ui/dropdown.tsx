/**
 * Menu dropdown leve (sem dependência nova) — construído sobre um botão gatilho
 * e uma lista posicionada em `absolute`. Fecha ao clicar fora ou apertar Esc.
 *
 *   <DropdownMenu trigger={<Button size="icon"><MoreVertical /></Button>}>
 *     <DropdownItem onSelect={editar}>Editar</DropdownItem>
 *     <DropdownItem destructive onSelect={apagar}>Apagar</DropdownItem>
 *   </DropdownMenu>
 */
import * as React from "react";
import { cn } from "@/lib/utils";

const CloseContext = React.createContext<() => void>(() => {});

export function DropdownMenu({
  trigger,
  children,
  align = "end",
}: {
  /** Elemento gatilho (ex.: um `<Button>`); recebe o handler de abrir/fechar. */
  trigger: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const gatilho = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen((o) => !o);
    },
  });

  return (
    <div className="relative" ref={ref}>
      {gatilho}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-1 min-w-[9rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <CloseContext.Provider value={() => setOpen(false)}>
            {children}
          </CloseContext.Provider>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onSelect,
  destructive,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
}) {
  const close = React.useContext(CloseContext);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        close();
        onSelect?.();
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent focus:bg-accent",
        destructive
          ? "text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
          : "text-foreground",
      )}
    >
      {children}
    </button>
  );
}
