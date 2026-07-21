/**
 * Login **só em dev** (`pnpm dev` standalone), já que a leitura dos projetos exige
 * sessão (RLS authenticated). Em produção o painel roda embedado e herda a sessão do
 * backoffice via postMessage — este helper é no-op lá.
 *
 * Configure `VITE_DEV_EMAIL` / `VITE_DEV_PASSWORD` no `.env` com um usuário do
 * Supabase para desenvolver a tela logado.
 */
import { supabase } from "./supabase";

export async function devSignIn(): Promise<void> {
  if (!import.meta.env.DEV) return;
  const email = import.meta.env.VITE_DEV_EMAIL;
  const password = import.meta.env.VITE_DEV_PASSWORD;
  if (!email || !password) return;

  const { data } = await supabase.auth.getSession();
  if (data.session) return;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) console.warn("[dev-auth] login de dev falhou:", error.message);
}
