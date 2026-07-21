import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { devSignIn } from "./lib/dev-auth";
import "./styles/globals.css";

// Em dev standalone, loga com o usuário de dev (no-op em produção/embed).
void devSignIn();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
