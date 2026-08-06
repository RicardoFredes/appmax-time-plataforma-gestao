/**
 * Contextos que o time sustenta, com N1 (dono) e N2 (backup). Vem da planilha
 * "Domínios e contextos" (Appmax / Max), mantida no controle interno do time.
 *
 * Nem todo N1/N2 está no `sync/config.json`: contexto compartilhado pode ter
 * dono de outro time (ex.: o Site, com a Mayara). Por isso a UI resolve o nome
 * pelo e-mail e não exige que a pessoa esteja em `MEMBERS`.
 */
import type { Context, ContextGroup } from "./types";

export const CONTEXT_GROUPS: ContextGroup[] = [
  { id: "appmax", label: "Appmax" },
  { id: "max", label: "Max" },
  { id: "rec-vendas", label: "Recuperação de vendas" },
  { id: "mobile", label: "Mobile" },
];

export const CONTEXTS: Context[] = [
  // Appmax
  {
    slug: "appmax-admin-frontend",
    name: "Admin",
    group: "appmax",
    n1: "felipe.carvalho@appmax.com.br",
  },
  {
    slug: "appmax-backoffice",
    name: "Backoffice",
    group: "appmax",
    n1: "jose.chagury@appmax.com.br",
  },
  {
    slug: "appmax-paas",
    name: "PaaS",
    group: "appmax",
    n1: "felipe.carvalho@appmax.com.br",
    n2: "jose.chagury@appmax.com.br",
  },
  {
    slug: "appmax-reports-frontend",
    name: "Relatórios",
    group: "appmax",
    n1: "jose.chagury@appmax.com.br",
  },
  {
    slug: "appmax-login-frontend",
    name: "Login",
    group: "appmax",
    n1: "joao.justo@appmax.com.br",
  },
  {
    slug: "appmax-help-center",
    name: "Central de Ajuda",
    group: "appmax",
    n1: "jose.chagury@appmax.com.br",
  },
  {
    slug: "appmax-site",
    name: "Site",
    group: "appmax",
    n1: "mayara.castro@appmax.com.br",
  },
  {
    slug: "appmax-tickets",
    name: "Tickets",
    group: "appmax",
  },

  // Max
  {
    slug: "max-internet-banking",
    name: "Internet Banking",
    group: "max",
    n1: "joao.justo@appmax.com.br",
    n2: "witerlland.silva@appmax.com.br",
  },
  {
    slug: "max-backoffice",
    name: "Backoffice",
    group: "max",
    n1: "witerlland.silva@appmax.com.br",
    n2: "bruno.schneider@appmax.com.br",
  },

  // Recuperação de vendas
  {
    slug: "appmax-rec-vendas-chargebacks",
    name: "Chargeback",
    group: "rec-vendas",
    n1: "joao.justo@appmax.com.br",
  },
  {
    slug: "appmax-giftmax",
    name: "Giftmax",
    group: "rec-vendas",
    n1: "joao.justo@appmax.com.br",
  },
  {
    slug: "appmax-crm",
    name: "CRM",
    group: "rec-vendas",
    n1: "bruno.schneider@appmax.com.br",
    n2: "felipe.carvalho@appmax.com.br",
  },

  // Mobile
  {
    slug: "max-app-mobile",
    name: "App Max",
    group: "mobile",
    // Era N2 do Jardiano; com a saída dele, assumiu como dono.
    n1: "ian.oliveira@appmax.com.br",
  },
  {
    slug: "appmax-app-mobile",
    name: "App Appmax",
    group: "mobile",
    n1: "diogo.januario@appmax.com.br",
  },
];
