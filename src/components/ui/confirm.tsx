/**
 * Diálogo de confirmação padrão do app (substitui `window.confirm`, que pode ser
 * bloqueado dentro do iframe sandbox do backoffice).
 *
 * Uso imperativo, lê como o `confirm` nativo:
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Apagar?", destructive: true })) { … }
 *
 * Monte o `<ConfirmProvider>` uma vez, na raiz da árvore (ver `main.tsx`).
 */
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmOptions {
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ação irreversível → botão de confirmar em vermelho. */
  destructive?: boolean;
}

type Confirm = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<Confirm | null>(null);

interface Pending extends ConfirmOptions {
  resolve: (v: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<Pending | null>(null);

  const confirm = React.useCallback<Confirm>(
    (options = {}) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  // Resolve a promessa e fecha (fechar sem confirmar → false).
  const close = (result: boolean) =>
    setPending((p) => {
      p?.resolve(result);
      return null;
    });

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={pending != null} onOpenChange={(open) => !open && close(false)}>
        {pending && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{pending.title ?? "Tem certeza?"}</DialogTitle>
              {pending.description != null && (
                <DialogDescription>{pending.description}</DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => close(false)}>
                {pending.cancelLabel ?? "Cancelar"}
              </Button>
              <Button
                variant={pending.destructive ? "destructive" : "default"}
                onClick={() => close(true)}
                autoFocus
              >
                {pending.confirmLabel ?? "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirm {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm precisa de um <ConfirmProvider> na árvore.");
  return ctx;
}
