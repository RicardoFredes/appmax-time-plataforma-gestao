# Entregas do 1º semestre de 2026 — por colaborador

**Período**: 01/02/2026 a 31/07/2026 · **Time**: Plataforma / Aplicativo / Backoffice
**Fontes**: Jira `tecnologia-appmax` (issues com `statusCategory = Done` e `resolutiondate` no período)
e Bitbucket `appmax-space` (PRs mergeados, extraídos dos clones locais).
**Gerado em**: 31/07/2026. Ver [Limitações](#limitações-da-coleta) antes de comparar números entre pessoas.

## Sumário do time

| Colaborador | Contextos | Entregas Jira | Projetos | PRs | Commits | Linhas + | Linhas − | Repos | PR mediano |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|
| **Bruno Schneider** | Plataforma, Backoffice | 49 | 8 | 56 | 330 | 31.005 | 3.606 | 4 | 100 |
| **Diogo Januário** | Aplicativo | 38 | 7 | 4 | 4 | 158 | 95 | 1 | 42 |
| **Felipe Carvalho** | Plataforma, Backoffice | 73 | 7 | 36 | 93 | 13.979 | 6.215 | 4 | 132 |
| **Ian Oliveira** | Aplicativo | 122 | 6 | 40 | 211 | 33.651 | 4.295 | 2 | 261 |
| **João Justo** | Plataforma, Backoffice | 29 | 8 | 50 | 356 | 17.458 | 5.336 | 4 | 74 |
| **José Chagury** | Plataforma | 17 | 2 | 22 | 160 | 18.683 | 5.494 | 5 | 88 |
| **Witerlland Silva** | Plataforma, Backoffice | 34 | 7 | 21 | 83 | 9.447 | 674 | 4 | 177 |

Total do time: **362 entregas** no Jira e **229 PRs** mergeados.

---

## Bruno Schneider

*Engenheiro · Plataforma, Backoffice*

**49 entregas** em 8 projetos · **56 PRs** em 4 repositórios · +31.005/−3.606 linhas · período ativo 2026-02-10 → 2026-07-24

### Leitura do semestre

Dono do frontend do **CRM** e do **Onboarding Unificado**. Entregou o BAC-48 (extrato de transações no backoffice) ponta a ponta — backend em Go no `banking-router` e frontend — incluindo um revert e a v2. Trabalha em ciclo curto: 56 PRs, mediana de 100 linhas. Fechou os épicos do CRM e levou à produção.

**Ponto de atenção.** Único dono do frontend do CRM. Muitos PRs de `fix/ajustes-*` em sequência no CRM sugerem retrabalho de especificação — vale olhar o refinamento antes de codar.

| Ritmo | Fev | Mar | Abr | Mai | Jun | Jul |
|---|--:|--:|--:|--:|--:|--:|
| Entregas Jira | 4 | 6 | 0 | 2 | 17 | 20 |
| PRs mergeados | 0 | 0 | 2 | 10 | 32 | 12 |

### Entregas por projeto

#### CRM · CRM — 23 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-23 | `CRM-2` | Task | CRM-1 [FRONT] CRM Ajustes de menu | Criar estrutura menu. Vue3 e Legado | Devemos implementar a nova estrutura de menu para CRM e Marketing. O menu deve estar funcionar nas versão Vue3, Vue2 e Legado. O mesmo deve conter uma variavel de ambiente para que seja habilitado ao… | — |
| 2026-02-24 | `CRM-6` | Task | CRM-3 [FRONT] Criação da Página de Resultado | Criação da tabela de estratégia | — | — |
| 2026-02-24 | `CRM-5` | Task | CRM-3 [FRONT] Criação da Página de Resultado | Criação do componente Resultados | — | — |
| 2026-03-09 | `CRM-8` | Task | CRM-3 [FRONT] Criação da Página de Resultado | [Layout] - Criação da modal de desativação e ativação da estratégia | O conteúdo da modal deve mudar conforme a estratégia que esta sendo ativada e desativada. A modal deve ser construida de forma genérica para termos uma única modal para todos os casos. Para mais deta… | — |
| 2026-03-10 | `CRM-53` | Task | CRM-3 [FRONT] Criação da Página de Resultado | [Layout] - Melhoria na tabela de estratégia | Criar a variação na linha quando a campanha estiver desativada. A linha deve ficar com seu conteúdo cinza conforme figma. Imagem abaixo. | — |
| 2026-03-11 | `CRM-51` | Task | CRM-33 [FRONT] Página de Clientes | [Layout] - Criar componente de Card genérico | Criar o componente genérico e montar a seção conforme o figma. | — |
| 2026-03-11 | `CRM-40` | História | CRM-33 [FRONT] Página de Clientes | [Layout] - Criar seção todos clientes | Imagem do componente: Figma: | — |
| 2026-03-19 | `CRM-28` | Task | CRM-3 [FRONT] Criação da Página de Resultado | [Integração] - com componente Resultado | O componente deve carregar as informações com base nos serviços de dados; | — |
| 2026-03-19 | `CRM-49` | Subtarefa | CRM-48 [Layout] - Criação seção Perfil do Clie… | [Componente] - Tabs | Criar o componente tabs com as opções igual ao figma. O componente deve ter a opção de ativar o mesmo ja com uma aba ativada a escolhe via param. | — |
| 2026-06-03 | `CRM-170` | Task | CRM-169 [Admin] Dashboard - Adicionar métricas… | [Admin] Dashboard Card de CRM — Discovery e estimativa de esforço | Contexto Existe uma proposta de produto para um novo dashboard de CRM na área admin (link da proposta: ). Antes de entrar em desenvolvimento, precisamos entender o que já temos disponível, o que prec… | — |
| 2026-06-09 | `CRM-3` | Epic | — | [FRONT] Criação da Página de Resultado | — | — |
| 2026-06-09 | `CRM-18` | Task | — | Homologação | Realizar testes da solução implementada em Homologação e documentar a mesma. | — |
| 2026-06-09 | `CRM-27` | Task | — | Publicar em Produção | — | — |
| 2026-06-09 | `CRM-175` | Task | CRM-171 Equipe Parceiro | [Sistema] Consumir eventos de auditoria do CRM e registrar no audits | Status: já existente (reaproveitado) O consumo dos eventos de auditoria e o registro no audits já estão prontos no sistema — estamos reaproveitando infra que já existe. Não há trabalho novo de desenv… | — |
| 2026-06-11 | `CRM-29` | Task | CRM-3 [FRONT] Criação da Página de Resultado | [Integração] - do componente de tabela de estratégia | O componente deve carregar as informações com base nos serviços de dados; | — |
| 2026-06-11 | `CRM-31` | Task | CRM-3 [FRONT] Criação da Página de Resultado | [Integração] - Modal de ativação e desativação da estratégia | O componente deve carregar as informações com base nos serviços de dados; | — |
| 2026-06-11 | `CRM-59` | Task | CRM-33 [FRONT] Página de Clientes | [Integração] - Seção todos clientes | — | — |
| 2026-06-11 | `CRM-30` | Task | CRM-3 [FRONT] Criação da Página de Resultado | [Integração] - do componente de oportunidades | O componente deve carregar as informações com base nos serviços de dados; | — |
| 2026-06-11 | `CRM-177` | Task | CRM-176 [CRM] Revisão | [CRM] Revisar e ajustar templates de Whatsapp nas estratégias e campanhas | Na parte de recuperação de cbk o primeiro template que aparece não faz sentido, ela não é uma mensagem de abordagem Parecem estar faltando templates no CRM. Neste documento tem todos: https://tecnolo… | — |
| 2026-06-11 | `CRM-178` | Task | CRM-176 [CRM] Revisão | [CRM FRONT] Remover a opção HOJE no filtro de data | A atualização dos dados é sempre em D-1? Acessei hoje e traz a info "atualizado em 08/06" e no FAQ temos que pode ocorrer um delay, mas gostaria de saber o máximo de delay, se possível Os dados são D… | — |
| 2026-06-11 | `CRM-176` | Epic | — | [CRM] Revisão | — | — |
| 2026-07-06 | `CRM-172` | Task | CRM-171 Equipe Parceiro | [Sistema] Expor empresas e permissões da equipe produtor para o CRM | Objetivo Expor, no sistema administrativo, as empresas/sites e as permissões que um usuário da equipe produtor ( producerTeam , ID 6) pode operar, garantindo que ele atue apenas dentro do seu escopo… | sistema#21228 |
| 2026-07-06 | `CRM-173` | Task | CRM-171 Equipe Parceiro | [Frontend] Permitir equipe produtor operar o CRM | Objetivo Liberar o acesso ao CRM para a equipe produtor ( producerTeam , ID 6), permitir que ela opere apenas dentro do escopo de empresas/permissões definido com o sistema (CRM-172) e enviar, via he… | appmax-client-vue3#1303 |

#### OU · Onboarding Unificado — 9 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-10 | `OU-136` | Subtarefa | OU-132 Erros de homologação | Botões da loja de app | Botões não funcionam | — |
| 2026-07-13 | `OU-11` | Epic | — | Modificações nos Termos de Uso | Contexto Atualizar layout e momento de exibição dos Termos de Uso e da modal “Já pode começar a vender”. Objetivo Melhorar a experiência de aceite e adequar à nova ordem do fluxo. | — |
| 2026-07-13 | `OU-1` | Epic | — | Nova Tela de Consulta de CPF | Contexto Criar uma nova tela para consulta de CPF no fluxo de Onboarding Unificado. Objetivo Permitir a validação de informações do CPF antes do início do processo de cadastro, integrando o backend s… | — |
| 2026-07-13 | `OU-5` | Epic | — | Step “Informe suas Informações” | Contexto Ajustar o fluxo do step “Informe suas informações” no Onboarding Unificado. Objetivo Garantir a integração com BrasilAPI, permitir preenchimento manual de CEP, ajustar ordem de steps e integ… | — |
| 2026-07-13 | `OU-55` | Subtarefa | OU-6 Manter integração com BrasilAPI para co… | [Frontend] - Garantir funcionamento atual. | — | — |
| 2026-07-13 | `OU-92` | Subtarefa | OU-28 Remover integração com Celcoin e integr… | [Frontend] - Adequar fluxo no frontend | — | — |
| 2026-07-13 | `OU-65` | Subtarefa | OU-13 Alterar ordem e momento da modal “Já po… | [Frontend] Ajustar template modal “Já pode começar a vender” | — | — |
| 2026-07-13 | `OU-194` | Subtarefa | OU-192 Deploy em Produção | Aprovação de PR vue3 | — | — |
| 2026-07-14 | `OU-58` | Subtarefa | OU-9 Ajustar integração com Hubspot | [Frontend] Garantir funcionamento de envio ao hubspot | — | — |

#### BAC · Backoffice — 6 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-06-23 | `BAC-48` | Task | — | Extrato completo de transações no detalhe da conta | Contexto Atualmente, o painel de back office exibe apenas os PIX recebidos dentro do detalhe de cada conta. Para facilitar a análise operacional e de suporte, é necessário centralizar todas as movime… | banking-router#1966, banking-router#1976, max-backoffice-frontend#58 |
| 2026-07-07 | `BAC-121` | Task | — | [2.9.1.] Inserção de filtro pelo identificador (pix) na página transações. | Conforme item 2.9.1 do documento [v0] Backoffice Max: Conta e Transações Nova possibilidade de filtro surge em perspectiva de agilização no trabalho de análise envolvendo transações. | banking-router#2201 |
| 2026-07-09 | `BAC-95` | Task | — | [2.6] Inserção do campo 'comentários' na tela do backoffice (contas) | Conforme item 2.6 do documento [v0] Backoffice Max: Conta e Transações Solicitação de visualização do campo de ‘comentários’ na tela de Backoffice > Banco > contas > cliente. Solicitação totalmente n… | banking-router#2207 |
| 2026-07-15 | `BAC-123` | Task | — | [2.5] Atualização do card "Chaves Pix" | Conforme item 2.5 do documento [v0] Backoffice Max: Conta e Transações O card de ‘Chaves Pix’ já existe no Backoffice atual. Porém, compreendemos que para realização de análises mais eficientes, é ne… | banking-router#2225 |
| 2026-07-16 | `BAC-130` | Task | — | [2.8] Implementação de extração de extrato para encaminhar ao cliente | Conforme item 2.8 do documento [v0] Backoffice Max: Conta e Transações Solicitação de implementação necessária para atendimento de demandas dos clientes Max. A criação do card economizará processos o… | — |
| 2026-07-17 | `BAC-132` | Task | — | [2.9.4] Extração de comprovante de pagamento simples em “Transações” | Conforme item 2.9.4 do documento [v0] Backoffice Max: Conta e Transações Torna-se necessário a possibilidade de criação e extração de comprovantes de pagamento referentes a transações de débito e cré… | — |

#### TIPL · Time Plataforma — 5 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-05-06 | `TIPL-122` | Task | TIPL-121 Appmax Checkout | Adicionar Fingerprint no checkout | Contexto Frente da Epic FRONT-121 (Appmax Checkout) na trilha de segurança / 3DS. Esta task cobre a Fase 1 da integração com 3-D Secure: o fluxo data-only , em que a SPA apenas coleta dados nativos d… | — |
| 2026-05-07 | `TIPL-124` | Task | TIPL-121 Appmax Checkout | Corrigir typo do campo de telefone em Customer/mutations.js | Contexto Pendência identificada pela Aria durante o refinamento do 3DS (FRONT-122): em spa-checkout-max/src/store/modules/Customer/mutations.js o campo de telefone está nomeado em português , enquant… | — |
| 2026-06-16 | `TIPL-145` | Task | TIPL-125 Solicitações dos times internos Appmax | [Admin] Troca de texto na página de criação de conta bancária | No projeto client-vue-3, trocar o texto do alerta em /v2/client/integration/bank-accounts/create para: Para garantir a segurança das transações, os dados da conta e a chave Pix cadastrada devem perte… | appmax-client-vue3#1261 |
| 2026-06-18 | `TIPL-139` | Task | TIPL-57 Melhorias internas | Adicionar props em json nas Features Flags | Hoje a gente já tem um um CRUD para Features Flags documentado aqui: A ideia é adicionar um novo campo do tipo jsonb para adicionar propriedades e customizações. Adicionar no frontend edição Incremen… | — |
| 2026-07-09 | `TIPL-175` | Sub-task | TIPL-135 CNPJ Alphanumerico | [Client Vue3] Fix - Ajustar mascara split pagamento CNPJ/CPF | Na tela "Novo Recebedor" do módulo Split de Pagamento ( /v2/client/integration/split-de-pagamento ), o campo CPF/CNPJ da seção "Informações da empresa" trava com 11 dígitos e não permite ao usuário c… | — |

#### SUS · Sustentação — 2 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-06-09 | `SUS-2898` | Bug | SUS-1336 Backoffice | [Frontend] Atualizar status autorizado da tela de pedidos | O status autorizado está com texto errado, trocar o texto da modal para: Quando a análise antifraude automática recusa um pedido, realizamos uma análise manual no intuito de recuperar sua venda. O pr… | — |
| 2026-06-23 | `SUS-4946` | Task | SUS-4623 Plataforma | Cashback | Bom dia, pessoal, tudo bem? Sobre a parceira: Maria Gabriela Monteiro 475699 newlive.loja@gmail.com Ela enviou o print onde mostra um desconto de cashback, a parceira relata que nunca ativou, mas olh… | — |

#### CEID · Canais & Integrações - Development — 2 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-24 | `CEID-240` | Story | CEID-239 Frontend - Validação Facial | Camada de integração em services + composables (remover mock do adapter) | Contexto: No POC, a lógica de sessão/captura/polling está inline em apps/demo-front/src/main.ts e o apps/adapter mocka dados. O padrão do time (web-security) é services/ + composables/ . Objetivo: Mi… | — |
| 2026-07-24 | `CEID-242` | Story | CEID-239 Frontend - Validação Facial | Orquestrar o ID do link (gerado pelo gateway) na entrada do front | Contexto: O gateway gera um link ( POST /links → GET /links/{id} ) que aponta pro próprio front , carregando o ID da sessão. O usuário chega ao front por essa URL (ex.: WhatsApp/e-mail). A captura co… | — |

#### AN · Antecipação por Pedido — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-13 | `AN-35` | Task | AN-24 Implementar ativação no System | Frontend - Adequar tela de Saque v2 nacional | Adequar tela de Saque v2 nacional Figma Mock Aceite Adicionar guia para Pedidos antecipados na conta Max Integrar mock back-end de filtro Integrar mock back-end de exportação | — |

#### MAXS · Max - Suporte — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-13 | `MAXS-942` | Task | MAXS-874 Conta | Divergência entre saldo na celcoin e backoffice | HubSpot linked tickets: Ticket nº 45608317227 (Ticket ID: 45608317227) (please, do not edit or duplicate in description) Divergência no saldo entre celcoin e Backoffice | — |

### Evidência em código — 56 PRs

**appmax-client-vue3** — 30 PRs, +6.912/−2.120 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-04-13 | #1021 | `feature/onboarding-unificado-frontend` | 43 | +2762/−29 | SUS-3128 |
| 2026-05-05 | #1145 | `feature/ativar-e-desativar-campanhas` | 8 | +1678/−856 | — |
| 2026-05-14 | #1190 | `fix/withdraw-pendencies-modal-login-as` | 2 | +34/−0 | — |
| 2026-05-14 | #1184 | `feature/crm-ajustes-integracoes` | 5 | +494/−264 | — |
| 2026-05-19 | #1201 | `fix/ajuste-integracao-sites-crm` | 2 | +40/−60 | — |
| 2026-05-21 | #1206 | `fix/crm-coupon-expires-at` | 1 | +10/−1 | — |
| 2026-05-22 | #1208 | `feat/crm-prod-whitelist` | 1 | +62/−1 | — |
| 2026-05-26 | #1213 | `fix/ajustes-crm-cupons` | 1 | +129/−17 | — |
| 2026-05-27 | #1218 | `fix/ajustes-contratos-crm` | 1 | +121/−37 | — |
| 2026-05-28 | #1220 | `fix/ajustes-ux-crm` | 1 | +64/−22 | — |
| 2026-06-03 | #1239 | `fix/ajustes-side-bar-menu-crm` | 1 | +14/−8 | — |
| 2026-06-03 | #1233 | `feature/add-crm-menu-para-beta-tester` | 4 | +47/−27 | — |
| 2026-06-05 | #1241 | `fix/remover-msg-whats-crm-carrinho-abandonado` | 2 | +57/−78 | — |
| 2026-06-09 | #1246 | `fix/ajustes-ativacao-crm` | 2 | +36/−9 | — |
| 2026-06-11 | #1249 | `fix/ajustes-template-whats-campanhas-crm` | 2 | +26/−21 | — |
| 2026-06-12 | #1254 | `feat/ajustes-integracao-crm` | 1 | +78/−42 | — |
| 2026-06-15 | #1251 | `feat/add-nova-estrutura-json-feature-flag` | 1 | +479/−67 | — |
| 2026-06-15 | #1258 | `fix/drawer-active-sites-recoveries` | 2 | +39/−7 | — |
| 2026-06-15 | #1256 | `feat/add-modal-reagendamento-de-pagamento` | 1 | +84/−63 | — |
| 2026-06-16 | #1261 | `feat/TIPL-145-Trocar-texto-pagina-criacao-conta-bancaria` | 1 | +2/−2 | TIPL-145 |
| 2026-06-17 | #1265 | `fix/ajustes-crm-core-integracoes` | 3 | +129/−74 | — |
| 2026-06-18 | #1269 | `fix/add-campaign-id-customers-endpoint-crm` | 1 | +5/−10 | — |
| 2026-06-19 | #1274 | `chore/remove-centralized-settlement-modal` | 1 | +1/−298 | — |
| 2026-06-19 | #1273 | `feat/add-modal-instabilidade-banco-xp` | 1 | +310/−0 | — |
| 2026-06-22 | #1276 | `fix/crm-detalhamento-paginacao-ver-mais` | 2 | +73/−10 | — |
| 2026-06-24 | #1286 | `fix/face-validation-pula-confirm-sem-fast-onboarding` | 1 | +15/−6 | — |
| 2026-06-25 | #1290 | `feat/crm-flag-homolog-api` | 1 | +22/−2 | — |
| 2026-06-26 | #1295 | `fix/face-validation-pula-confirm-sem-fast-onboarding` | 1 | +22/−1 | — |
| 2026-07-06 | #1303 | `feat/crm-173-back-como-fonte-verdade` | 1 | +77/−98 | CRM-173 |
| 2026-07-09 | #1315 | `fix/split-mascara-cnpj-alfanumerico` | 1 | +2/−10 | — |

**banking-router** — 10 PRs, +4.602/−89 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-05-19 | #1976 | `feature/bac-48-transactions` | 12 | +1309/−0 | BAC-48 |
| 2026-06-03 | #1966 | `feature/bac-48-transactions` | 20 | +1480/−0 | BAC-48 |
| 2026-06-12 | #2077 | `fix/transactions-listing-set-local-binding` | 1 | +4/−1 | — |
| 2026-06-23 | #2138 | `fix/transactions-listing-restore-total-pagination` | 1 | +35/−64 | — |
| 2026-06-23 | #2135 | `fix/transactions-listing-pix-sent-and-amount-cast` | 1 | +3/−1 | — |
| 2026-06-23 | #2133 | `fix/transactions-listing-pix-sent-and-amount-cast` | 1 | +11/−3 | — |
| 2026-07-07 | #2201 | `feature/BAC-121-transactions-identifier-filter` | 2 | +35/−0 | BAC-121 |
| 2026-07-08 | #2207 | `feature/BAC-95-account-comments` | 3 | +1166/−0 | BAC-95 |
| 2026-07-14 | #2225 | `feature/BAC-123-pix-keys-card` | 4 | +524/−16 | BAC-123 |
| 2026-07-15 | #2254 | `fix/pix-key-delete-provider-and-audit` | 3 | +35/−4 | — |

**sistema** — 9 PRs, +15.560/−78 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-04-23 | #20471 | `feature/crm-integration-service` | 8 | +252/−0 | — |
| 2026-06-05 | #20953 | `fix/ajuste-side-bar-menu` | 2 | +25/−2 | — |
| 2026-06-08 | #19798 | `feature/onboarding-unificado-frontend` | 144 | +14497/−28 | — |
| 2026-06-17 | #21002 | `feat/add-nova-estrutura-json-feature-flag` | 1 | +142/−8 | — |
| 2026-06-24 | #21142 | `hotfix/redirect-onboarding-unificado` | 3 | +30/−11 | — |
| 2026-06-24 | #21136 | `hotfix/redirect-onboarding-unificado` | 1 | +3/−3 | — |
| 2026-06-29 | #21192 | `feature/unificacao-notificacao-hubspot-phase-one` | 5 | +451/−5 | — |
| 2026-07-01 | #21202 | `feat/hubspot-lead-cnpj-pj` | 3 | +26/−5 | — |
| 2026-07-06 | #21228 | `feature/crm-172-producer-team-sites-recovery` | 3 | +134/−16 | CRM-172 |

**max-backoffice-frontend** — 7 PRs, +3.931/−1.319 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-06-12 | #58 | `fix/revert-bac-48-transactions-tab` | 1 | +37/−1153 | BAC-48 |
| 2026-06-12 | #56 | `feature/BAC-48_extrato-transacoes` | 5 | +1153/−37 | — |
| 2026-06-23 | #66 | `feature/BAC-48_extrato-transacoes-v2` | 7 | +1336/−37 | — |
| 2026-07-07 | #73 | `feature/BAC-121_filtro-identificador-transacoes` | 1 | +52/−4 | — |
| 2026-07-08 | #75 | `feature/BAC-95_comentarios-conta` | 1 | +628/−0 | — |
| 2026-07-14 | #81 | `feature/BAC-123_atualizacao-card-chaves-pix` | 1 | +710/−87 | — |
| 2026-07-15 | #83 | `fix/pix-key-removal-reason-label` | 1 | +15/−1 | — |

---

## Diogo Januário

*Engenheiro · Aplicativo*

**38 entregas** em 7 projetos · **4 PRs** em 1 repositórios · +158/−95 linhas · período ativo 2026-02-03 → 2026-07-31

### Leitura do semestre

Engenharia de plataforma mobile: **tooling, segurança e habilitação**. Conduziu praticamente sozinho o **TapToPay no iOS** (18 entregas), do SDK Apple à submissão para App Store Review em 31/07. Trouxe **Shorebird** (RFC → produção nos dois apps) e **Maestro** (testes E2E), além de segurança Pix e certificados. ⚠️ O volume de PR dele está subrepresentado — ver Limitações.

**Ponto de atenção.** Único dono do TapToPay, sem par. Risco de concentração de conhecimento em uma frente que está entrando em produção.

| Ritmo | Fev | Mar | Abr | Mai | Jun | Jul |
|---|--:|--:|--:|--:|--:|--:|
| Entregas Jira | 3 | 7 | 3 | 0 | 5 | 20 |
| PRs mergeados | 1 | 0 | 3 | 0 | 0 | 0 |

### Entregas por projeto

#### SEP · Melhorias e Performance — 18 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-06-26 | `SEP-404` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Implementar fee table de taxas da API | — | — |
| 2026-06-26 | `SEP-407` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Acompanhar aprovação do entitlement Apple | — | — |
| 2026-06-26 | `SEP-408` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Validar fluxo iOS via TestFlight (mock) | — | — |
| 2026-07-01 | `SEP-418` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Criar conta sandbox Apple e configurar no device de teste | — | — |
| 2026-07-01 | `SEP-419` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Habilitar capability Tap to Pay no iPhone no App Store Connect | — | — |
| 2026-07-01 | `SEP-420` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Regenerar provisioning profile de distribuição com entitlement iOS | — | — |
| 2026-07-06 | `SEP-405` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Compartilhar comprovante via WhatsApp | — | — |
| 2026-07-08 | `SEP-428` | Task | SEP-358 TapToPay Service | T2P] Mobile - Implementar exibição condicional da antecipação D0/D1 com base no can_antecipate | — | — |
| 2026-07-09 | `SEP-432` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Ajuste na tela de detalhes do pedido para aplicar a regra de não permitir estorno parcial para… | — | — |
| 2026-07-10 | `SEP-417` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Habilitar seller de staging no iOS Tap to Pay (Zoop) | — | — |
| 2026-07-10 | `SEP-416` | Task | SEP-358 TapToPay Service | Adicionar Estratégia de liberação parcial de usuário/empresas para demo | — | — |
| 2026-07-10 | `SEP-421` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Implementar Cardholder Education screen (obrigatória Apple) | — | — |
| 2026-07-10 | `SEP-401` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Integração do SDK com a Apple | — | — |
| 2026-07-15 | `SEP-433` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Ajustes na tela de detalhes do pedido para aplicar regra de solicitação de dados bancários no… | Quando é diferente de D0 o estorno manual depende do limite de tempo que a Rede trabalha. Está dentro do limite de tempo? Se sim: Formulário atual, igual ao do cartão de crédito Se não: Formulário de… | — |
| 2026-07-24 | `SEP-403` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Testes de integração do fluxo real com API | — | — |
| 2026-07-31 | `SEP-424` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Submeter build com entitlement Tap to Pay no iPhone para App Store Review | — | — |
| 2026-07-31 | `SEP-423` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Preparar notes for reviewer (conta de teste + fluxo Tap to Pay no iPhone) | — | — |
| 2026-07-31 | `SEP-422` | Task | SEP-358 TapToPay Service | [T2P] Mobile - Gravar e enviar 4 vídeos para Apple e solicitar Publishing Entitlement | — | — |

#### PLCTV · Aplicativo MAX — 15 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-03 | `PLCTV-37` | Erro | PLCTV-16 Incidentes | [APLICATIVO] Dificuldade no acesso - bloqueio | — | — |
| 2026-02-23 | `PLCTV-135` | Task | PLCTV-19 Melhorias | Criar RFC para implantação da ferramenta Shorebird | — | — |
| 2026-03-02 | `PLCTV-20` | Task | PLCTV-17 Segurança | [Mobile] - Certificados do Max | Contexto O app utiliza certificate pinning para garantir que as conexões com os servidores da aplicação são seguras e não sofrem ataques de interceptação (MITM). Anteriormente, os hashes dos certific… | — |
| 2026-03-09 | `PLCTV-181` | Task | — | Acompanhamento da aprovação da RFC do Shorebird e planejamento de implementação | Monitorar status de aprovação da RFC junto à liderança. Alinhar eventuais dúvidas técnicas ou estratégicas. Realizar apresentação da ferramenta para stakeholders adicionais, caso necessário. Planejar… | — |
| 2026-03-19 | `PLCTV-177` | Task | PLCTV-19 Melhorias | Implementação do Shorebird | Realizar a implementação da ferramenta Shorebird no ambiente produtivo. Atividade de estudo referênciada: | — |
| 2026-03-19 | `PLCTV-145` | Task | PLCTV-19 Melhorias | Produção de Deeplink para principais rotas | Criar deeplink para: Pix Boleto Meus limites Configurações Chats Se possível criar sistema dinâmico de deeplink por param conforme o exemplo abaixo. max://router?link={} | — |
| 2026-03-24 | `PLCTV-142` | Épico | PLCTV-19 Melhorias | Aplicação do Maestro | — | — |
| 2026-03-27 | `PLCTV-201` | Task | — | Segurança Pix: detectar e bloquear serviços de acessibilidade suspeitos | Implementar verificação nativa no Android para detectar se há serviços de acessibilidade de terceiros ativos. Caso detectado, bloquear o acesso ao app ou exibir aviso ao usuário. | — |
| 2026-03-31 | `PLCTV-216` | Task | — | PIX - Corrigir valor pré-definido em QR Code | Ao escanear um QR Code PIX com valor pré-definido, o app exibe a tela de valor em branco e permite edição livre. O backend já retorna os campos amount e can_modify_final_amount no payload, porém eles… | — |
| 2026-04-02 | `PLCTV-214` | Task | — | Análise de módulo compartilhado entre Max e Appmax | Analisar a viabilidade de compartilhar o módulo Tap to Pay entre os apps Max e Appmax, avaliando impacto no tamanho do app e estratégia arquitetural. | — |
| 2026-04-13 | `PLCTV-219` | Task | — | Segurança Max | Quando um usuário com conta suspensa abre o app, ele consegue navegar normalmente sem ver nenhum aviso. Adicionar uma verificação no carregamento do app que, caso o usuário esteja suspenso, exiba a m… | — |
| 2026-07-10 | `PLCTV-186` | Subtarefa | PLCTV-177 Implementação do Shorebird | Implementação no app da Appmax | — | — |
| 2026-07-14 | `PLCTV-200` | Task | — | Implementar cobertura de testes Maestro por área do app | Implementação de testes automatizados com Maestro cobrindo os principais fluxos do app. Login completo (CPF + telefone + código + senha) Login com sessão salva (só senha) Login com biometria Visualiz… | — |
| 2026-07-14 | `PLCTV-169` | Subtarefa | PLCTV-142 Aplicação do Maestro | Realizar planejamento técnico de cobertura por área do aplicativo | — | — |
| 2026-07-14 | `PLCTV-143` | Subtarefa | PLCTV-142 Aplicação do Maestro | Implementar Maestro no Login | — | — |

#### MAXS · Max - Suporte — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-06 | `MAXS-415` | Task | MAXS-875 Onboarding | [APLICATIVO] Erro na validação facial | Estamos com um cliente que não consegue acessar o App devido há uma falha na validação facial. Está relatando que já tentou muitas vezes e segue com erro mesmos após os testes básicos. Esse cliente j… | — |

#### BEMM · Max - Bugs e Dívidas — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-04-01 | `BEMM-16` | Task | BEMM-62 mobile | [APP-16] PixTransferState permite combinacoes invalidas de flags | Documento completo: Documento de Bugs Descricao pix_transfer_state.dart: o estado permite isLoading, isSuccess e error todos como true simultaneamente. A UI pode mostrar estados conflitantes (loading… | — |

#### JIMEA · Jornada Inicial (Max e Appmax) — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-06-23 | `JIMEA-237` | Task | JIMEA-33 Link de Pagamento | [Aplicativo] Implementar o Select de Empresa no Link de Pagamentos | Contexto A feature de Link de Pagamentos já existe no aplicativo. Esta tarefa adiciona a seleção/filtro por empresa em dois pontos: no formulário de criação e na listagem (junto com a busca por nome… | — |

#### SUS · Sustentação — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-06-30 | `SUS-5024` | Bug | — | [Patrícia Rossato] Link de pgto no app \| Seletor de empresas incompleto | Bom dia! O parceiro 474087 - CLAUDIO FERNANDES FERREIRA não está conseguindo visualizar todas as suas empresas no link de pagamento via app, somente via web. Podem verificar, por favor? Obrigada! PS:… | — |

#### TIPL · Time Plataforma — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-16 | `TIPL-144` | Task | TIPL-143 NPS | [NPS] Aplicativo | Contexto Implementar a pesquisa de NPS no aplicativo Appmax (mobile), no fluxo de saque/antecipação, espelhando o comportamento já definido para o sistema web. O objetivo é medir a satisfação do loji… | — |

### Evidência em código — 4 PRs

**app-flutter** — 4 PRs, +158/−95 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-02-03 | #211 | `feature/PLCTV-23-pull-to-refresh` | 1 | +97/−68 | PLCTV-23 |
| 2026-04-01 | #239 | `feature/fix-pix-transfer-state-flags` | 1 | +17/−25 | — |
| 2026-04-01 | #234 | `feature/maestro-login-coverage` | 1 | +16/−1 | — |
| 2026-04-08 | #235 | `feature/accessibility-security-check` | 1 | +28/−1 | — |

---

## Felipe Carvalho

*Engenheiro · Plataforma, Backoffice*

**73 entregas** em 7 projetos · **36 PRs** em 4 repositórios · +13.979/−6.215 linhas · período ativo 2026-02-04 → 2026-07-29

### Leitura do semestre

Maior amplitude do time: Backoffice, Plataforma, Sustentação, Onboarding e CRM. Entregou o **Chargeback ponta a ponta** (13 integrações de frontend + 5 endpoints de BFF) e o **padrão de roles/policies com Casbin**. É quem tirou a **dívida de frontend do papel**: removeu o `ds-appmax-v3` e o Vuetify do client Vue 3, módulo a módulo. Também o maior contribuidor de sustentação de Plataforma no período. Rastreabilidade exemplar — quase todo PR nomeia o ticket.

**Ponto de atenção.** Único dono do Chargeback, sem par.

| Ritmo | Fev | Mar | Abr | Mai | Jun | Jul |
|---|--:|--:|--:|--:|--:|--:|
| Entregas Jira | 4 | 4 | 1 | 21 | 13 | 30 |
| PRs mergeados | 1 | 0 | 3 | 10 | 10 | 12 |

### Entregas por projeto

#### BAC · Backoffice — 21 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-05-26 | `BAC-78` | Subtarefa | BAC-62 [Backoffice] BFF | Padronizar e refatorar os erros existentes enviandos pelo Gin | Essa tarefa tem como objetivo implementar o padrão de erros conforme a RFC ( ) e refatorar os pontos existentes na aplicação que contenham os erros fora dessa padrão. | — |
| 2026-05-26 | `BAC-67` | Subtarefa | BAC-62 [Backoffice] BFF | Implementação do endpoint de listagem de chargebacks (Operador) | — | — |
| 2026-05-28 | `BAC-82` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Listagem de chargebacks | Integração do frontend com GET /api/v1/chargebacks — listagem paginada de chargebacks com filtros (search, status, dispute_type, reason_code, responsible_party, opened_channel, assigned_operator, per… | — |
| 2026-05-28 | `BAC-83` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Criação manual de chargeback | Integração do frontend com POST /api/v1/chargebacks — criação manual de chargeback pelo operador (canais offline: call center, Procon, ouvidoria). Inclui formulário com seleção de transação, tipo (FR… | — |
| 2026-05-29 | `BAC-86` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Resolução interna (aprovação) | Integração do frontend com POST /api/v1/chargebacks/:id/internal-approve — aprovação interna do chargeback pelo Supervisor (dispara refund via financeiro). Inclui dialog de confirmação com campo de j… | max-backoffice-frontend#49 |
| 2026-05-29 | `BAC-87` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Resolução interna (reprovação) | Integração do frontend com POST /api/v1/chargebacks/:id/internal-reject — reprovação interna do chargeback pelo Supervisor (reverte crédito de confiança se houver). Inclui dialog de confirmação com c… | — |
| 2026-05-29 | `BAC-98` | Subtarefa | BAC-62 [Backoffice] BFF | Refinar listagem de chargebacks: alinhar contrato com o front (BAC-82) | Refinamento do endpoint GET /chargebacks (entregue na BAC-67) para alinhar contrato com o frontend (BAC-82), conforme RFC oficial Chargeback - Cartão Max . Escopo cresceu durante a implementação (ite… | — |
| 2026-06-01 | `BAC-89` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Escalação ao CreditCardCore/Pomelo | Integração do frontend com POST /api/v1/chargebacks/:id/escalate — escalação do chargeback para a Pomelo via CreditCardCore (gera ARN, transiciona para MAX_ESCALATED). Inclui dialog de confirmação co… | — |
| 2026-06-01 | `BAC-103` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Auth via banking-router | Adequar o auth do frontend pra integrar com o novo fluxo do BFF (BAC-100, já mergeado em develop). Novo fluxo de autenticação FE → banking-router : POST /backoffice/v1/credentials/login (email + pass… | — |
| 2026-06-02 | `BAC-88` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Cancelamento de chargeback | Integração do frontend com POST /api/v1/chargebacks/:id/cancel — cancelamento de chargeback pelo Operador (caso inválido, desistência, duplicidade). Inclui dialog de confirmação com campo de justific… | — |
| 2026-06-02 | `BAC-85` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Crédito de confiança (concede/reverte) | Integração do frontend com POST /api/v1/chargebacks/:id/grant-provisional-credit e POST /api/v1/chargebacks/:id/reverse-provisional-credit — concessão e reversão manual do crédito de confiança. Inclu… | — |
| 2026-06-03 | `BAC-92` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Upload de anexos | Integração do frontend com POST /api/v1/chargebacks/:id/attachments (multipart) — upload de evidências pelo operador. Inclui drop zone com whitelist de tipos (PDF/JPG/TIFF, PNG não aceito pelas bande… | max-backoffice-frontend#52 |
| 2026-06-05 | `BAC-91` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Timeline de eventos | Integração do frontend com GET /api/v1/chargebacks/:id/events — listagem dos eventos do chargeback (timeline) com filtros por event_type, actor_type e visibility. Inclui componente ChargebackTimeline… | max-backoffice-frontend#53 |
| 2026-06-05 | `BAC-110` | Subtarefa | BAC-62 [Backoffice] BFF | Criar endpoint para listagem da timeline/histórico de trocas de status | Devolver as duas visões: time interno e cliente interno: MAX_PENDENTE → EXCALETED -> POMELO_PENDENTE → POMELO_OUTRO_STATUS cliente: Aguardando (histórico do cliente deriva do progresso interno) Clien… | — |
| 2026-06-10 | `BAC-99` | Subtarefa | BAC-62 [Backoffice] BFF | Criar endpoint que lista os operadores | Criar um endpoint no baking router que filtra por role Criar a role de chargeback e suas policies (pedir para o Daniel Endringer do time de risco ajudar a definir) | — |
| 2026-06-10 | `BAC-84` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Atribuição de chargeback | Integração do frontend com POST /api/v1/chargebacks/:id/assign — atribuição/reatribuição de chargeback a um operador pelo Supervisor. Inclui modal de seleção de operador disponível na tela de detalhe… | — |
| 2026-06-23 | `BAC-108` | Task | BAC-61 Cartão de crédito | [Backoffice] Propor um padrão para nomenclatura para roles e policies | Criar documentação no confluence para essa decisão. | banking-router#2148, banking-router#2044, max-backoffice-frontend#65 |
| 2026-07-02 | `BAC-118` | Task | BAC-114 [Quick-wins] Eliminando Gargalos de Sup… | [Contas] Tratar empty state quando o data retorna null | quando o objeto data retorna null , o frontend está apresentando como status de erro, mas deveria ser apenas um empty state. | max-backoffice-frontend#68 |
| 2026-07-02 | `BAC-80` | Subtarefa | BAC-81 [Backoffice] Frontend | Testes e validações - Frontend Chargeback | Cobertura de testes do frontend de chargeback e validação ponta a ponta da integração FE ↔ BE. Escopo Testes unitários dos hooks de consumo da API (TanStack Query) — listagem, detalhe, mutações de tr… | — |
| 2026-07-02 | `BAC-81` | Task | BAC-61 Cartão de crédito | [Backoffice] Frontend | — | — |
| 2026-07-21 | `BAC-90` | Subtarefa | BAC-81 [Backoffice] Frontend | Integração FE — Adicionar nota interna [DESPRIORIZADO] | Integração do frontend com POST /api/v1/chargebacks/:id/notes — adição de nota interna (visibility=INTERNAL) ao chargeback. Inclui seção de notas internas na tela de detalhe (listagem + formulário de… | — |

#### TIPL · Time Plataforma — 18 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-05-07 | `TIPL-86` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Migrar base e compartilhados (App.vue, main.ts, src/components/) | Contexto Arquivos no nível raiz e componentes compartilhados que sustentam o resto do projeto. Migrar primeiro pra desbloquear o resto. Pastas / arquivos afetados src/App.vue src/main.ts (chamada con… | — |
| 2026-05-07 | `TIPL-93` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Migrar módulos long-tail (anticipation, bank-accounts, deliveryTrackingImport, main, withdraw) | Contexto Cinco módulos com apenas 1 arquivo consumindo @appmax_npm/ds-appmax-v3 cada. Agrupados em uma sub-task pra evitar fragmentação excessiva. Pastas / arquivos afetados src/modules/anticipation/… | — |
| 2026-05-07 | `TIPL-87` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Migrar módulo appstore | Contexto Maior concentração de uso de @appmax_npm/ds-appmax-v3 (10 arquivos), majoritariamente modais e listagens da App Store. Pastas / arquivos afetados src/modules/appstore/components/molecules/Ap… | — |
| 2026-05-07 | `TIPL-89` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Migrar módulo paymentSplit | Contexto 9 arquivos, segundo maior consumidor — formulários, listas e modais de regras de split. Pastas / arquivos afetados src/modules/paymentSplit/components/CreateReceiver/CreateReceiver.vue src/m… | — |
| 2026-05-07 | `TIPL-90` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Migrar módulo paymentsLinks | Contexto 6 arquivos — formulário em steps + listagem de links. Pastas / arquivos afetados src/modules/paymentsLinks/components/form/CompanyStep.vue src/modules/paymentsLinks/components/form/PaymentSt… | — |
| 2026-05-07 | `TIPL-91` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Migrar módulo orders | Contexto 3 arquivos — listagem, modal de exportação e modal de visitas no detalhe. Pastas / arquivos afetados src/modules/orders/details/partials/OrdersDetailsVisits/OrdersDetailsVisitModal.vue src/m… | — |
| 2026-05-27 | `TIPL-83` | Sub-task | TIPL-81 Remover Vuetify do projeto | [Vuetify] Migrar componentes compartilhados em src/components/ | Contexto Dois componentes wrapper internos ainda usam Vuetify diretamente. Eles são consumidos por outros módulos, então a migração deles desbloqueia mais consumidores indiretos. Pastas / arquivos af… | — |
| 2026-05-27 | `TIPL-84` | Sub-task | TIPL-81 Remover Vuetify do projeto | [Vuetify] Migrar módulo catalog | Contexto Único módulo de feature com uso direto de Vuetify em runtime. Pastas / arquivos afetados src/modules/catalog/components/ProductTable.vue Objetivo Substituir tags v-* deste arquivo pelos equi… | — |
| 2026-05-27 | `TIPL-85` | Sub-task | TIPL-81 Remover Vuetify do projeto | [Vuetify] Cleanup final: remover dependência e setup | Contexto Após as duas sub-tasks anteriores, Vuetify deixa de ter consumidores em código de produção. Permanecem a dep no package.json e imports em testes ( *.spec.ts em chargeback e appstore importam… | — |
| 2026-05-27 | `TIPL-81` | Task | TIPL-57 Melhorias internas | Remover Vuetify do projeto | Contexto O appmax-client-vue3 ainda carrega vuetify@3.3.9 como dependência, com superfície de uso mínima em runtime: apenas 3 arquivos consomem componentes Vuetify diretamente. Vuetify entrou no proj… | — |
| 2026-05-27 | `TIPL-88` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Migrar módulo catalog | Contexto 7 arquivos com uso de @appmax_npm/ds-appmax-v3 em filtros, listagens e tabela de produtos. Pastas / arquivos afetados src/modules/catalog/components/ProductFilters.vue src/modules/catalog/co… | — |
| 2026-05-27 | `TIPL-92` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Migrar módulo recurring-subscription | Contexto 3 arquivos — informações do cliente, tabela e filtro de status. Pastas / arquivos afetados src/modules/recurring-subscription/components/SubscriptionClientInfo.vue src/modules/recurring-subs… | — |
| 2026-05-27 | `TIPL-94` | Sub-task | TIPL-82 Remover @appmax_npm/ds-appmax-v3 do pro… | [ds-appmax-v3] Cleanup final: remover configureAppmaxDS e dependência | Contexto Após as demais sub-tasks de FRONT-82, @appmax_npm/ds-appmax-v3 deixa de ter consumidores em código de produção. Resta o setup configureAppmaxDS no src/main.ts e a dep no package.json . Pasta… | — |
| 2026-05-27 | `TIPL-82` | Task | TIPL-57 Melhorias internas | Remover @appmax_npm/ds-appmax-v3 do projeto | Contexto O appmax-client-vue3 ainda depende de @appmax_npm/ds-appmax-v3@0.222.0 em paralelo a @appmax_npm/ds-prime (DS oficial). 47 arquivos importam da v3, distribuídos em 11 módulos de feature + ar… | — |
| 2026-07-14 | `TIPL-178` | Task | TIPL-57 Melhorias internas | Migração da tela de Tickets para o client Vue 3 (navegação unificada no sidebar) | Contexto Hoje a tela de Chamados/Tickets vive no monolito (Vue 2), enquanto a navegação principal já roda no client Vue 3. Ao acessar Tickets pelo sidebar, o usuário troca de aplicação (Vue 3 → Vue 2… | appmax-client-vue3#1323, sistema#21306 |
| 2026-07-23 | `TIPL-183` | Task | TIPL-125 Solicitações dos times internos Appmax | [Investigação] Audit events e níveis de permissão na tela de Configurações de Empresa | Objetivos Auditoria: Investigar os eventos de audit gerados na tela de configurações de empresa, com foco na troca de status de Monitoramento. Permissões: Investigar e relatar os níveis de permissão… | — |
| 2026-07-28 | `TIPL-184` | Task | TIPL-57 Melhorias internas | [Demo] Link de Pagamentos | É preciso atualizar com dados mocados o LINK de pagamentos para demonstração da funcionalidade em totens para o evento de até às 13hs. Contato com a Atualizar a branch feature/mock-server do repositó… | — |
| 2026-07-28 | `TIPL-185` | Task | TIPL-57 Melhorias internas | [Demo] Split de pagamentos | É preciso atualizar com dados mocados o SPLIT de pagamentos para demonstração da funcionalidade em totens para o evento de até às 13hs. Contato com a Atualizar a branch feature/mock-server do reposit… | — |

#### SUS · Sustentação — 12 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-04-20 | `SUS-4289` | Bug | — | [Admin] Erro ao solicitar saque em empresa descredenciada | Contexto : realizando testes de saque em empresas descredenciadas vimos que o ao solicitar o saque pelo botão de antecipar na dashboard a tela redirecionada termina em 402. Problema: Teste realizado… | — |
| 2026-07-13 | `SUS-2601` | Sub-task | SUS-1793 Criação dos testes no módulo - appstore | [APPSTORE] Refactor: Separação das camadas (services, helpers, hooks, components, view). | — | — |
| 2026-07-13 | `SUS-4505` | Task | — | [Patrícia Rossato] SLC - Crossborder está visualizando a modal de atualização de conta | Boa noite! Favor revisar perfis de cross e outros não elegíveis que podem estar visualizando a modal de atualização de conta. Exemplo que estava com essa visão: MARTIN ANDRES HERNANDEZ PEREZ - 132635 | appmax-client-vue3#1187, sistema#20731 |
| 2026-07-14 | `SUS-5212` | Bug | SUS-4623 Plataforma | Descrição dos pedidos não aparece para EP | EP informa que no acesso dela não aparece mais o nome do produto e para o produtor da empresa aparece. Ela só consegue ver a descrição do pedido pelo acesso da Shopfy. Houve alguma alteração? Podem v… | sistema#21316 |
| 2026-07-15 | `SUS-5205` | Bug | SUS-4623 Plataforma | Parceiro perdeu seu acesso admin, trocou senha e não esta conseguindo logar | Parceiro perdeu seu acesso admin, trocou senha e não esta conseguindo logar | — |
| 2026-07-15 | `SUS-5131` | Bug | SUS-4623 Plataforma | Sem opção de cadastro de empresa na tela de saque | Parceiro deseja cadastrar uma nova empresa, mas não aparece a opção de cadastrar a nova empresa na tela de saques dele. Podem verificar o motivo? ID user: 460711 Parceiro: Ramon Santos da Silva | — |
| 2026-07-16 | `SUS-4992` | Story | SUS-4103 Exploração de melhorias | Criar fila RabbitMQ "pix_enrichments" | Estamos montando um projeto de enriquecimento de Pix, que futuramente pode se tornar um enriquecimento geral. Como a fila "safe_purchase_transactions", que hoje recebe todos os pedidos pagos (incluin… | sistema#21347 |
| 2026-07-16 | `SUS-5082` | Bug | SUS-4623 Plataforma | Filtragem é exibida corretamente, mas a exportação aplica outra regra | O parceiro queria filtrar os pedidos que tiveram chargeback aberto em junho, independentemente do mês em que o pedido foi criado. Ao filtrar no admin dele, por: data 01 jun. à 30 jun. estornado em (q… | sistema#21371 |
| 2026-07-23 | `SUS-5334` | Task | SUS-4623 Plataforma | Acesso a página de vendas de todos os usuários. | Uma nova parceira consegue visualizar absolutamente todas as páginas de vendas de afiliados cadastradas na plataforma acessando a seguinte URL: https://admin.appmax.com.br/producer/offer/page O camin… | sistema#21454 |
| 2026-07-28 | `SUS-5211` | Bug | SUS-4623 Plataforma | Lista de usuários | Parceiro quer a lista completo dos usuários(EP) que possuem acesso a sua conta. Podem verificar? ID user: 491299 Parceiro: ERICK CAMPOS DE MOURA | — |
| 2026-07-28 | `SUS-5110` | Task | SUS-1330 Integrações | Lista de EP | Preciso da lista de EP do parceiro 12338 Renny Eduardo Delmaestro Valim Firmes Maia renny@ivend.com.br | — |
| 2026-07-29 | `SUS-4907` | Task | SUS-4623 Plataforma | Dashboard sem pedidos | O parceiro Mateo (cross) está realizando vendas diariamente, porém elas não contabilizam na dash inicial da plataforma. Ao acessar a dash inicial, filtrando todas as lojas e até mesmo aplicando o fil… | sistema#21553 |

#### OU · Onboarding Unificado — 10 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-04 | `OU-198` | Subtarefa | OU-192 Deploy em Produção | Aprovação de PR websecurity | — | — |
| 2026-02-10 | `OU-132` | Erro | — | Erros de homologação | — | — |
| 2026-07-14 | `OU-203` | Subtarefa | OU-192 Deploy em Produção | Mergear branches websecurity | — | — |
| 2026-07-14 | `OU-191` | Subtarefa | OU-144 Homologar ponta a ponta | [Frontend Websecurity] Unico SDK | — | — |
| 2026-07-14 | `OU-151` | História | OU-149 Onboarding White Label | Endpoint público controlado de Branding | Como frontend (Onboarding/Login/Plataforma) Quero consumir um endpoint único de branding Para aplicar o tema correto por PaaS Critérios de aceite Endpoint GET /branding?franchise_id={id} Retorna bran… | — |
| 2026-07-14 | `OU-156` | História | OU-149 Onboarding White Label | Aplicação de Branding após Login | Como usuário autenticado Quero navegar pela plataforma com o branding do PaaS Para manter consistência visual Critérios de aceite Verifica vínculo do usuário com PaaS Busca branding após autenticação… | — |
| 2026-07-14 | `OU-152` | História | OU-149 Onboarding White Label | Plugin de Branding no Design System | Como time de frontend Quero um plugin centralizado de branding Para garantir consistência visual em toda a plataforma Critérios de aceite Plugin expõe applyBranding(config) Valida schemaVersion Norma… | — |
| 2026-07-14 | `OU-188` | Subtarefa | OU-144 Homologar ponta a ponta | [Frontend Backoffice] Aprovação/Recusa de propostas | — | — |
| 2026-07-14 | `OU-200` | Subtarefa | OU-192 Deploy em Produção | Aprovação de PR Backoffice | — | — |
| 2026-07-21 | `OU-154` | História | OU-149 Onboarding White Label | Aplicação de Branding no Onboarding | Como usuário final Quero ver o onboarding já com a identidade do parceiro Para ter uma experiência consistente desde o início Critérios de aceite Consome endpoint com franchise_id Bloqueia render até… | — |

#### CRM · CRM — 9 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-19 | `CRM-4` | Task | CRM-3 [FRONT] Criação da Página de Resultado | Inclusão do filtro superior de Loja e Data | Desenvolver o componente e incluir o mesmo na página. Sempre devemos iniciar o componente de loja com a loja default do cliente selecionada. | — |
| 2026-02-20 | `CRM-7` | Task | CRM-3 [FRONT] Criação da Página de Resultado | Criação da sessão de oportunidades | Produzir a sessão e modelo de cards reutilizavel para cada oportunidade. | — |
| 2026-03-19 | `CRM-10` | Task | CRM-3 [FRONT] Criação da Página de Resultado | [Integração] - do componente superior Loja e Data | O componente deve carregar as informações com base nos serviços de dados e realizar filtro das informações para o restante da visualização da página. | — |
| 2026-03-19 | `CRM-50` | Subtarefa | CRM-48 [Layout] - Criação seção Perfil do Clie… | [Componente] - Gráfico Genérico | Criar um componente de gráfico genérico que se ajuste conforme os dados informados. O componente deve conter uma prop para o tipo de gráfico e suas variações conforme o figma. | — |
| 2026-03-19 | `CRM-48` | História | CRM-33 [FRONT] Página de Clientes | [Layout] - Criação seção Perfil do Cliente | Imagem da seção que pode ser encontrada no figma. | — |
| 2026-03-19 | `CRM-55` | Task | CRM-33 [FRONT] Página de Clientes | [Layout] - Gráfico TPV por dia da semana | — | — |
| 2026-06-11 | `CRM-54` | História | CRM-26 [FRONT] Página de Detalhe da Estratégia | [Integração] - Página de detalhes da estratégia | — | — |
| 2026-06-11 | `CRM-60` | Task | CRM-33 [FRONT] Página de Clientes | [Integração] - Gráfico Genéricos | — | — |
| 2026-06-11 | `CRM-56` | Task | CRM-33 [FRONT] Página de Clientes | [Integração] - Gráfico TPV por dia da semana | — | — |

#### AN · Antecipação por Pedido — 2 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-14 | `AN-27` | Task | AN-24 Implementar ativação no System | Frontend - Adequar menu e criar tela de ativação de recurso | Adequar menu e criar tela de ativação de recurso Validar com o as rotas de ativação e desativação Figma Contratos de payload Aceite Adequar menu do admin Criar página de ativação dos serviços por emp… | — |
| 2026-07-14 | `AN-39` | Task | — | [Front end] Acrescentar descrição das taxas à visão do parceiro "minhas taxas" | Em alinhamento com o time jurídico, fomos aconselhados pela Giulia a mostrar as taxas de Antecipação por Pedido na visão do parceiro, o que engloba a tela “minhas taxas” dentro do system (v2/client/i… | — |

#### CDE · Cadastro de Empresa — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-14 | `CDE-10` | Task | — | [Frontend] Desenvolvimento dos testes unitarios | — | — |

### Evidência em código — 36 PRs

**max-backoffice-frontend** — 13 PRs, +3.481/−1.567 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-05-28 | #48 | `feature/BAC-82_integracao-listagem-chargebacks` | 1 | +73/−29 | — |
| 2026-06-03 | #49 | `feature/BAC-86-87_integracao-resolucao-interna` | 1 | +18/−36 | BAC-86 |
| 2026-06-03 | #51 | `fix/spi-infraction-reports-duplicate-case-status` | 1 | +0/−42 | — |
| 2026-06-05 | #53 | `feature/BAC-91-timeline-de-eventos` | 1 | +138/−3 | BAC-91 |
| 2026-06-05 | #52 | `feature/BAC-92-upload-de-anexos` | 1 | +653/−68 | BAC-92 |
| 2026-06-09 | #54 | `feature/BAC-84_integracao-atribuicao-chargeback` | 1 | +264/−15 | — |
| 2026-06-19 | #63 | `feature/chargeback-gating-por-policy` | 2 | +149/−96 | — |
| 2026-06-23 | #65 | `feature/BAC-108-ajustes-padrao-roles-e-policies` | 2 | +970/−553 | BAC-108 |
| 2026-07-02 | #70 | `feature/admin-permissions-ux` | 1 | +679/−373 | — |
| 2026-07-02 | #68 | `bugfix/BAC-118-tratar-empty-state-data-null` | 1 | +16/−16 | BAC-118 |
| 2026-07-09 | #77 | `bugfix/chargeback-status-interno-pomelo-escalated` | 2 | +212/−132 | — |
| 2026-07-23 | #89 | `feature/MIR-156-exibir-nome-contas-migradas` | 1 | +38/−7 | MIR-156 |
| 2026-07-29 | #91 | `bugfix/status-pomelo-dispute-not-processed` | 1 | +271/−197 | — |

**appmax-client-vue3** — 12 PRs, +6.518/−4.402 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-02-26 | #1032 | `teste-future-receipts-tab` | 2 | +19/−28 | — |
| 2026-04-15 | #1115 | `fix/crm-review-adjustments` | 3 | +210/−223 | — |
| 2026-04-20 | #1130 | `fix/ajuste-redirect-saque-dashboard` | 1 | +1/−2 | — |
| 2026-04-30 | #1139 | `hotfix/ajuste-config-cropper` | 1 | +4/−5 | — |
| 2026-05-04 | #1144 | `hotfix/ajustes-colorpicker-e-preview` | 2 | +55/−40 | — |
| 2026-05-08 | #1168 | `feature/bcb-regulatory-announcement-modal` | 1 | +209/−0 | — |
| 2026-05-08 | #1161 | `bugfix/pendencie-msg-bank-accounts` | 1 | +93/−14 | — |
| 2026-05-11 | #1172 | `fix/bank-account-destroy-pending-withdraw-error` | 1 | +82/−8 | — |
| 2026-05-12 | #1175 | `feature/withdraw-detail-settlement-layout` | 1 | +5/−108 | — |
| 2026-05-14 | #1187 | `feature/SUS-4505-has-international-company-flag` | 1 | +22/−3 | SUS-4505 |
| 2026-05-27 | #1199 | `feature/remove-dependencia-ds-vue3` | 39 | +3051/−3970 | — |
| 2026-07-14 | #1323 | `feature/TIPL-178-migracao-tela-tickets-vue3` | 1 | +2767/−1 | TIPL-178 |

**sistema** — 8 PRs, +773/−64 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-05-15 | #20731 | `feature/SUS-4505-has-international-company-flag` | 1 | +2/−1 | SUS-4505 |
| 2026-05-27 | #20798 | `feature/remove-vuetify-from-spa-templates` | 1 | +0/−4 | — |
| 2026-07-14 | #21306 | `TIPL-178-migracao-tela-tickets-vue3` | 1 | +90/−19 | TIPL-178 |
| 2026-07-14 | #21316 | `bugfix/SUS-5212-descricao-dos-pedidos` | 1 | +14/−7 | SUS-5212 |
| 2026-07-16 | #21371 | `bugfix/SUS-5082-sync-filtro-tela-export` | 2 | +72/−1 | SUS-5082 |
| 2026-07-16 | #21347 | `feature/SUS-4992-criar-fila-rabbitmq-pix-enrichments` | 2 | +346/−1 | SUS-4992 |
| 2026-07-23 | #21454 | `bugfix/SUS-5334-acesso-pagina-de-vendas` | 1 | +137/−11 | SUS-5334 |
| 2026-07-29 | #21553 | `SUS-4907-dashboard-sem-pedidos` | 2 | +112/−20 | SUS-4907 |

**banking-router** — 3 PRs, +3.207/−182 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-06-23 | #2044 | `BAC-108-padrao-roles-policies` | 8 | +2402/−29 | BAC-108 |
| 2026-06-25 | #2142 | `feature/operadores-chargeback-por-role` | 1 | +100/−141 | — |
| 2026-06-29 | #2148 | `feature/BAC-108-casbin-reload-pull-based` | 3 | +705/−12 | BAC-108 |

---

## Ian Oliveira

*Engenheiro · Aplicativo*

**122 entregas** em 6 projetos · **40 PRs** em 2 repositórios · +33.651/−4.295 linhas · período ativo 2026-02-02 → 2026-07-30

### Leitura do semestre

Cobre o **App Max de ponta a ponta**: Flutter no `app-flutter` e o backend das features no `banking-router`. Dono da **performance mobile** (12 itens do épico `mobile-performance`) e de todo o **mobile do MED 2.0**. Faz os maiores PRs do time (mediana de 261 linhas). ⚠️ Metade do volume dele é **fila reativa de suporte** (41 tickets, 26 só de login/validação facial) — ver Limitações e Pontos de atenção.

**Ponto de atenção.** Um terço das entregas é suporte reativo e o épico **MAXS-876 (Acesso)** não fecha — falhas de login e validação facial reaparecem de fevereiro a julho. Vale tratar a causa raiz como projeto, não como fila. Além disso, as branches dele no `app-flutter` não referenciam ticket (`med`, `credit_card`, `cache_home`), o que impede rastrear ticket → código.

| Ritmo | Fev | Mar | Abr | Mai | Jun | Jul |
|---|--:|--:|--:|--:|--:|--:|
| Entregas Jira | 14 | 6 | 29 | 26 | 19 | 28 |
| PRs mergeados | 3 | 7 | 11 | 3 | 4 | 12 |

### Entregas por projeto

#### MAXS · Max - Suporte — 41 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-02 | `MAXS-402` | Task | MAXS-872 Pix | [APLICATVO] Max não está respondendo á comandos no aplicativo | O cliente relata que não consegue realizar transações pelo aplicativo, pois o Max não está retornando. Ele já realizou a atualização do app, porém segue da mesma forma. Após a atualização, além de o… | — |
| 2026-04-14 | `MAXS-688` | Task | MAXS-872 Pix | [APLICATIVO] Erro ao cadastrar chave pix | Estamos com um cliente que é parceiro Appmax e ele não está conseguindo cadastrar a chave pix CNPJ na conta PJ pois hpa um erro. Ele alega que ao selecionar o tipo de chave pix CNPJ, já vem com os da… | — |
| 2026-04-17 | `MAXS-634` | Task | MAXS-876 Acesso | [APLICATIVO] Erro na validação facial | Estamos com uma cliente que é parceira Appmax e não está conseguindo realizar o login no App devido a falha na validação facial mesmo após todos os testes básicos. Já orientamos a realizar a validaçã… | — |
| 2026-04-20 | `MAXS-710` | Task | MAXS-876 Acesso | [APLICATIVO] Erro ao realizar login após instabilidade em 11/04 | Estamos com alguns cliente que não estão conseguindo acessar o aplicativo após a instabilidade no Max que ocorreu em 11/04. CPF: 00748777040 Nome: Mara Rejane da Silva Bom Help desk \| Ticket nº 4438… | — |
| 2026-05-06 | `MAXS-702` | Task | MAXS-876 Acesso | [APLICATIVO] Erro ao realizar login após instabilidade em 11/04 | Estamos com alguns cliente que não estão conseguindo acessar o aplicativo após a instabilidade no Max que ocorreu em 11/04. CPF: 48005414846 Nome: Michael Sena Xavier de Castro número: 5511958048161… | — |
| 2026-05-06 | `MAXS-707` | Task | MAXS-876 Acesso | [APLICATIVO] Erro ao realizar login após instabilidade em 11/04 | Estamos com alguns cliente que não estão conseguindo acessar o aplicativo após a instabilidade no Max que ocorreu em 11/04. CPF: 03356694251 Nome: Jorge Bruno Maia Número: 69993264462 Help desk \| Ti… | — |
| 2026-05-06 | `MAXS-795` | Task | — | [APLICATIVO] Problema ao validar facial (Conta PF) | HubSpot linked tickets: Ticket nº 44976320539 (Ticket ID: 44976320539) (please, do not edit or duplicate in description) PF 08846520173, está tentando usar o app e não está conseguindo validar a faci… | — |
| 2026-05-06 | `MAXS-636` | Task | — | [SORTEIOS] Cliente não recebeu código por baixar aplicativo | Cliente PF 12316982760 informa que não recebeu o código por ter baixado o App. Atendimento: https://app.hubspot.com/help-desk/6717628/view/342968399/ticket/43870050219/thread/10598988085#notes Aguard… | — |
| 2026-05-06 | `MAXS-404` | Task | MAXS-872 Pix | [APLICATIVO] Problema ao fazer PIX | Ontem tivemos alguns casos sobre este problema, resolvi centralizar aqui na task para acompanhamento. Foi falado na thread: OBS: os clientes estão operando no WhatsApp normalmente, só abri a task aqu… | — |
| 2026-05-06 | `MAXS-431` | Task | — | [APLICATIVO] Registrar chave PIX: Max mostra na chave CNPJ o CPF | Cliente PJ 48070493000162, ao tentar cadastrar chave PIX CNPJ o Max mostra somente a chave CPF (sendo que a conta dele é CNPJ e ele quer registrar PIX CNPJ). Atendimento: https://app.hubspot.com/help… | — |
| 2026-05-06 | `MAXS-445` | Task | MAXS-872 Pix | [APLICATIVO] Cliente não consegue fazer PIX (App atualizado já) | Cliente PF 91362504653, ao tentar fazer PIX fica desta forma e não avança: Obs: ele está acessando conta Max do seu número 5531997198984 e ele disse que já atualizou o aplicativo também e segue mesmo… | — |
| 2026-05-06 | `MAXS-390` | Task | MAXS-876 Acesso | [APLICATIVO] Não avança quando coloca senha (Algo deu errado) | Cliente PF 00712331050 , número telefone 5548988373264 está tentando acessar o aplicativo e ao colocar a senha o Max retorna que algo deu errado, o cliente altera a senha e tenta logar novamente e pe… | — |
| 2026-05-20 | `MAXS-712` | Task | MAXS-876 Acesso | [APLICATIVO] Falha no login - Aparelho não compatível | Cliente PF está tentando a cessar a conta no App, porém o mesmo retorna que o aparelho não é compatível. cpf 04858839613 Eronilson Guedes Carvalho Telefone 5591982590146 Android 16 | — |
| 2026-05-20 | `MAXS-758` | Task | MAXS-876 Acesso | [APLICATIVO] Aplicativo não abre no IOS | HubSpot linked tickets: Ticket nº 44622884114 (Ticket ID: 44622884114) Alteração de dados - 1 - Max (Ticket ID: 44620256825) (please, do not edit or duplicate in description) O cliente informou que,… | — |
| 2026-05-22 | `MAXS-928` | Task | MAXS-876 Acesso | Falha na validação facial | HubSpot linked tickets: Ticket nº 45572928780 (Ticket ID: 45572928780) (please, do not edit or duplicate in description) O cliente está com dificuldades para realizar o login pelo aplicativo pois não… | — |
| 2026-05-22 | `MAXS-904` | Task | MAXS-876 Acesso | [APLICATIVO] Falha no login | HubSpot linked tickets: Ticket nº 45345221250 (Ticket ID: 45345221250) (please, do not edit or duplicate in description) Cliente pf está tentando logar na conta, porém o app retorna com o erro inform… | — |
| 2026-05-27 | `MAXS-757` | Task | MAXS-876 Acesso | [APLICATIVO] Falha no login do App | HubSpot linked tickets: Infos aplicativo - 1 - Max (Ticket ID: 44623347307) (please, do not edit or duplicate in description) Cliente PF e PJ, está tentando realizar login no App, porém o mesmo só fi… | — |
| 2026-05-27 | `MAXS-768` | Task | MAXS-876 Acesso | [APLICATIVO] Cliente não está conseguindo validar | HubSpot linked tickets: Validação facial - 1 - Max (Ticket ID: 44680718230) (please, do not edit or duplicate in description) PF 01377665720, telefone 21991191870, possui conta no Max e não está cons… | — |
| 2026-06-01 | `MAXS-699` | Task | MAXS-885 Comunicação | [APLICATIVO] Cliente não consegue abrir o app | Cliente PF 12546034685, não está conseguindo abrir o app. Ele usa um Moto G30. Relatos em anexo: Atendimento: https://app.hubspot.com/help-desk/6717628/view/342968399/ticket/44390011722/thread/106511… | — |
| 2026-06-01 | `MAXS-755` | Task | MAXS-874 Conta | Aplicativo informa sobre bloqueio mas conta está ativa | Estamos com uma cliente que não está conseguindo acessar o aplicativo devido a um aviso de conta bloqueada, mas a conta dela está ativa. Ela desisntalou o aplicativo e instalou novamente e o erro per… | — |
| 2026-06-01 | `MAXS-868` | Task | MAXS-876 Acesso | [APLICATIVO] Falha no login - App não reconhece a conta | HubSpot linked tickets: Ticket nº 45275861624 (Ticket ID: 45275861624) (please, do not edit or duplicate in description) Cliente PF está tentando logar na conta, porém o aplicativo não reconhece a me… | — |
| 2026-06-08 | `MAXS-780` | Story | MAXS-876 Acesso | Dispositivo desconhecido logado a conta | HubSpot linked tickets: Conta suspensa - 1 - Max (Ticket ID: 44894289515) (please, do not edit or duplicate in description) Bom dia! Pessoal, estamos com uma cliente aqui no suporte informando que te… | — |
| 2026-06-08 | `MAXS-966` | Task | MAXS-876 Acesso | [APLICATIVO] Falha na validação para acesso à conta | HubSpot linked tickets: Ticket nº 45639292076 (Ticket ID: 45639292076) (please, do not edit or duplicate in description) Cliente está tentando logar na conta, porém a validação não finaliza. Validou… | — |
| 2026-06-09 | `MAXS-998` | Task | MAXS-876 Acesso | [APLICATIVO] Falha na validação facial para login | HubSpot linked tickets: Validação facial - 1 - Max (Ticket ID: 45684002170) (please, do not edit or duplicate in description) Cliente está tentando logar no aplicativo, porém a validação facial não c… | — |
| 2026-06-09 | `MAXS-1001` | Task | MAXS-876 Acesso | [APLICATIVO] Falha na validação | HubSpot linked tickets: Ticket nº 45714546803 (Ticket ID: 45714546803) (please, do not edit or duplicate in description) Cliente não consegue logar na conta, pois a validação não reconhece o rosto. V… | — |
| 2026-06-11 | `MAXS-957` | Task | MAXS-876 Acesso | [APLICATIVO] Parceira não consegue acessar | CNPJ 24132630000188, telefone (31) 99989-6839. Foi orientada a parceira a atualizar, desinstalar e instalar novamente o app. Ela já redefiniu a senha do Max e, ainda assim, não consegue entrar (nunca… | — |
| 2026-06-17 | `MAXS-892` | Task | MAXS-872 Pix | [APLICATIVO] Não consegue cadastrar chave PIX PJ, pois é sinalizado somente CPF | HubSpot linked tickets: Infos aplicativo - 1 - Max, Cadastro PIX - 1 - Max (Ticket ID: 45297239560) (please, do not edit or duplicate in description) CNPJ 62915578000125, telefone 13955412008. Obs: O… | — |
| 2026-06-30 | `MAXS-893` | Task | — | [Aplicativo] não carrega | HubSpot linked tickets: Infos aplicativo - 1 - Max (Ticket ID: 45320205495) (please, do not edit or duplicate in description) CNPJ 41877574000120, telefone 55991275381. Informei a cliente para desins… | — |
| 2026-06-30 | `MAXS-1084` | Task | MAXS-876 Acesso | Falha na validação facial - Login | HubSpot linked tickets: Ticket nº 46334154886 (Ticket ID: 46334154886) (please, do not edit or duplicate in description) A cliente informa que não consegue realizar o login no aplicativo pois a valid… | — |
| 2026-07-03 | `MAXS-1103` | Task | MAXS-876 Acesso | [APLICATIVO] Cliente não consegue validar facial | HubSpot linked tickets: Infos aplicativo - 1 - Max (Ticket ID: 46676224948) (please, do not edit or duplicate in description) CNPJ 65.982.668/0001-27, telefone (15) 99608-4270. Ele validou no Legitim… | — |
| 2026-07-03 | `MAXS-1093` | Task | MAXS-876 Acesso | [APLICATIVO] Cliente não consegue validar facial | HubSpot linked tickets: Infos Max - 1 - Outros (Ticket ID: 46467180087) (please, do not edit or duplicate in description) CNPJ 55271705000135, telefone (44) 99738-4324. Cliente validou no Legitimuz.… | — |
| 2026-07-06 | `MAXS-891` | Task | — | [Aplicativo] não carrega | HubSpot linked tickets: Infos aplicativo - 1 - Max (Ticket ID: 45290624017) (please, do not edit or duplicate in description) CNPJ 62727494000168, telefone 81981473674. Informei a cliente para desins… | — |
| 2026-07-06 | `MAXS-1108` | Task | MAXS-876 Acesso | [APLICATIVO] Falha na validação facial para acesso à conta | HubSpot linked tickets: Ticket nº 46665882284 (Ticket ID: 46665882284) (please, do not edit or duplicate in description) Cliente está tentando logar na conta, porém consta uma falha na validação e a… | — |
| 2026-07-06 | `MAXS-995` | Task | — | [APLICATIVO] Cliente não consegue logar | HubSpot linked tickets: Infos aplicativo - 1 - Max (Ticket ID: 45679806805) (please, do not edit or duplicate in description) CPF 04997785458, telefone (71) 98855-7265. Cliente diz que o aplicativo n… | — |
| 2026-07-14 | `MAXS-1073` | Task | MAXS-876 Acesso | [APLICATIVO] Cliente não consegue entrar no aplicativo (validação, permissões ok) | HubSpot linked tickets: Infos aplicativo - 1 - Max (Ticket ID: 46189436682) (please, do not edit or duplicate in description) CPF 05349687328, telefone (98) 98498-3953. Cliente está aprovando todas a… | — |
| 2026-07-14 | `MAXS-1005` | Task | MAXS-876 Acesso | Cliente não consegue acessar o aplicativo (tela branca) | HubSpot linked tickets: Infos Max - 1 - Outros, Exclusão PIX - 1 - Max (Ticket ID: 45726790992) (please, do not edit or duplicate in description) CPF 97338060800, telefone (15) 99656-6703. Já o orien… | — |
| 2026-07-21 | `MAXS-977` | Task | MAXS-876 Acesso | [APLICATIVO] App não abre | HubSpot linked tickets: Abertura de conta - 1 - Max (Ticket ID: 45558938288) (please, do not edit or duplicate in description) Estamos com um cliente tentanto realizar o login na plataforma mas o app… | — |
| 2026-07-24 | `MAXS-1250` | Task | MAXS-876 Acesso | [APLICATIVO] Falha na validação para acesso à conta | HubSpot linked tickets: Ticket nº 47132105784 (Ticket ID: 47132105784) (please, do not edit or duplicate in description) Cliente está tentando acessar o Max, porém não consegue realizar a validação f… | — |
| 2026-07-27 | `MAXS-1265` | Task | MAXS-874 Conta | No aplicativo aparece suspensão da conta, Celcoin e Backoffice conta ativa | HubSpot linked tickets: Ticket nº 47194818598 (Ticket ID: 47194818598) (please, do not edit or duplicate in description) Cliente ao tentar acessar o aplicativo aparece a seguinte mensagem: Olhando no… | — |
| 2026-07-27 | `MAXS-1264` | Task | MAXS-874 Conta | No aplicativo aparece suspensão da conta, Celcoin e Backoffice conta ativa | HubSpot linked tickets: Ticket nº 47197699661 (Ticket ID: 47197699661) (please, do not edit or duplicate in description) Cliente ao tentar acessar o aplicativo aparece a seguinte mensagem: Olhando no… | — |
| 2026-07-30 | `MAXS-1275` | Task | MAXS-876 Acesso | Deslogar o aplicativo de dispositivos conectados | HubSpot linked tickets: Ticket nº 47295081785 (Ticket ID: 47295081785) (please, do not edit or duplicate in description) O cliente nos contatou solicitando o bloqueio da conta pois acredita que a con… | — |

#### PLCTV · Aplicativo MAX — 41 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-13 | `PLCTV-147` | Subtarefa | PLCTV-128 Análise GA | Melhoria no crashlytics no Max | — | — |
| 2026-02-13 | `PLCTV-148` | Subtarefa | PLCTV-128 Análise GA | Colocar tags de analytics no fluxo autenticação do Max | — | — |
| 2026-02-13 | `PLCTV-9` | Task | PLCTV-17 Segurança | [Mobile] Análise de Solução Antiroot (MAX) | — | — |
| 2026-02-13 | `PLCTV-128` | Task | PLCTV-62 [App] Melhorias | Análise GA | — | — |
| 2026-02-23 | `PLCTV-150` | Task | PLCTV-19 Melhorias | [GA] - Criar alertas (Slack e Email) e um dashboard para métricas de autenticação | Contexto Precisamos monitorar eventos de autenticação do aplicativo MAX para detectar falhas, quedas e comportamentos anômalos, bem como disponibilizar uma visão consolidada para o time de produto/en… | — |
| 2026-02-24 | `PLCTV-130` | Subtarefa | PLCTV-115 Extrato + Contestação + Devolução | Criar tela de listagem de Extrato | Criar a tela de listagem de Extrato no aplicativo MAX, permitindo que o usuário visualize o histórico de movimentações financeiras de forma clara e organizada, conforme o layout definido no protótipo. | — |
| 2026-02-25 | `PLCTV-131` | Subtarefa | PLCTV-115 Extrato + Contestação + Devolução | Criar componente de exportar extrato com filtros | Desenvolver o componente de exportação de extrato com filtros no aplicativo MAX, permitindo que o usuário gere um arquivo de extrato (por exemplo, PDF/CSV) a partir da tela de extrato, conforme o lay… | — |
| 2026-02-26 | `PLCTV-170` | Subtarefa | PLCTV-115 Extrato + Contestação + Devolução | Criar Tela de detalhes das transações | — | — |
| 2026-02-26 | `PLCTV-171` | Subtarefa | PLCTV-115 Extrato + Contestação + Devolução | Fluxo de telas de contestações | — | — |
| 2026-02-26 | `PLCTV-161` | Task | PLCTV-19 Melhorias | Adicionar actions dos sorteios no chat do aplicativo | Implementar e integrar, no chat do Aplicativo Max, as ações relacionadas ao sistema de sorteios da feature “Sorteios” , permitindo que o usuário: Seja informado sobre o funcionamento dos sorteios; Vi… | — |
| 2026-02-26 | `PLCTV-146` | Subtarefa | PLCTV-83 Analisar soluções e melhorar mecanismo… | Criação da POC para validar a solução antiroot da AppDome | Escopo Configurar o projeto no AppDome com as proteções de Escopo de Defesas: ONEShield, TOTALCode Obfuscation, OS Integrity, Prevent MitM Attacks, Certificate Pinning, Prevent Screen Sharing Scams &… | — |
| 2026-02-27 | `PLCTV-172` | Subtarefa | PLCTV-115 Extrato + Contestação + Devolução | Fluxo de telas de notificações | — | — |
| 2026-02-27 | `PLCTV-115` | Task | PLCTV-105 Extrato + Contestação + Devolução | Extrato + Contestação + Devolução | Destrinchar épico | — |
| 2026-03-06 | `PLCTV-176` | Task | PLCTV-19 Melhorias | [GA] - Configuração de threshold para o monitoramento atual da autenticação no bigquery | Próximos passos Configuração de threshold para o monitoramento atual Observabilidade das rotinas críticas Monitoramento via BigQuery Alertas via email e slack #alertas-monitoramento-aplicativo-max Pa… | — |
| 2026-03-11 | `PLCTV-182` | Subtarefa | PLCTV-177 Implementação do Shorebird | Implementação no app do Max | — | — |
| 2026-03-12 | `PLCTV-178` | Task | PLCTV-19 Melhorias | [GA] - Mapeamento de rotinas críticas do fluxo do pix para tagueamento | Fluxo de pix tagueado com o analytics Monitoramento via BigQuery Alertas via email e slack #alertas-monitoramento-aplicativo-max Painel de observabilidade no Looker | — |
| 2026-03-17 | `PLCTV-144` | Task | PLCTV-19 Melhorias | Implementar CodeMagic em Prod | — | — |
| 2026-03-26 | `PLCTV-199` | Task | PLCTV-19 Melhorias | [GA] - Configuração de alertas para o monitoramento do saldo no bigquery | Fluxo de saldo tagueado com o analytics Monitoramento via BigQuery Alertas via email e slack #alertas-monitoramento-aplicativo-max Painel de observabilidade no Looker | — |
| 2026-03-31 | `PLCTV-202` | Task | — | Implementação de componentes do fluxo de cartões no chat similiar ao whatsapp | Desenvolvimento dos componentes necessários para o fluxo de cartão dentro do MAX. Garantir que, no momento da implementação das telas com API, os componentes já estejam prontos e padronizados. | — |
| 2026-04-01 | `PLCTV-215` | Task | — | Revisão de Latencia do Aplicativo : Aplicações | — | — |
| 2026-04-06 | `PLCTV-213` | Task | — | [GA] - Revisão de thresholds em alertas de autenticação | Revisão e ajuste dos thresholds configurados nos alertas relacionados a eventos de autenticação. | — |
| 2026-04-07 | `PLCTV-132` | Task | PLCTV-14 Pix Regulatório | [WIP Design] Área de gestão de notificações | Criar, dentro do menu de configurações, uma área de setup de notificações: | — |
| 2026-04-07 | `PLCTV-110` | Task | PLCTV-14 Pix Regulatório | [WIP Design] Adicionar ícones nos comprovantes para diferenciar pagamento e agendamento | Adicionar ícones visuais nos comprovantes Pix para facilitar a identificação do tipo de comprovante, diferenciando pagamentos realizados de pagamentos agendados , melhorando clareza e leitura para o… | — |
| 2026-04-09 | `PLCTV-212` | Task | — | Ajuste de ao pedir senha pra visualização do cartão | Ajustar o fluxo de solicitação de senha ao acessar os dados do cartão, garantindo que a validação ocorra corretamente. Melhorar a segurança e a experiência do usuário, evitando falhas na autenticação… | — |
| 2026-04-17 | `PLCTV-220` | Task | — | Remover bottom sheet dos boletos e tranformar em tela | Ao clicar em pagar boleto era super lento, então a solução foi cachear a listagem e remover a bottom sheet transformando em tela cheia igual no Pix. | — |
| 2026-05-07 | `PLCTV-184` | História | — | Adicionar cartão nas carteiras | Implementar a integração de tokenização de cartões com Google Pay e Apple Pay na solução de Cards, seguindo as especificações da Pomelo. Escopo Google Pay Com base na documentação: Escopo Apple Pay C… | — |
| 2026-07-10 | `PLCTV-217` | Task | — | Área Pix | A área Pix reúne as principais funcionalidades para movimentar valores de forma rápida e segura. Isso inclui enviar dinheiro utilizando chave Pix, QR Code, dados bancários ou código “copia e cola”, a… | — |
| 2026-07-10 | `PLCTV-221` | Task | PLCTV-105 Extrato + Contestação + Devolução | Alterações no fluxo de contestação | Prototipo: Notificações Exibição no extrato Criação de contestação dentro da área Pix Criar a contestação dentro da área pix, selecionando uma transação conforme listagem do extrato | — |
| 2026-07-13 | `PLCTV-112` | Task | PLCTV-14 Pix Regulatório | [WIP Design] Criar tela de onboarding no primeiro acesso a “Minhas chaves” | Criar uma tela de onboarding exibida obrigatoriamente no primeiro acesso à funcionalidade “Minhas chaves” , com o objetivo de informar o usuário sobre o que é uma chave Pix e suas principais regras,… | — |
| 2026-07-13 | `PLCTV-173` | Subtarefa | PLCTV-83 Analisar soluções e melhorar mecanismo… | Aplicação da solução validada | — | — |
| 2026-07-14 | `PLCTV-265` | Task | — | [Backend] - Enriquecer /auth/me com dados de DDA, código de indicação e detalhes da conta | Expor no endpoint GET /app/v1/auth/me os dados que os novos layouts do app (telas "Dados da conta" e "Boletos") passaram a exigir e que o backend ainda não entregava. Todos os dados já existiam no ba… | banking-router#2223, banking-router#2226, banking-router#2218 |
| 2026-07-14 | `PLCTV-120` | Task | PLCTV-105 Extrato + Contestação + Devolução | Disponibilizar comprovante de devolução Pix | Disponibilizar ao usuário o comprovante da devolução Pix, acessível durante o período estabelecido pela regulação do Banco Central, contendo todos os campos mínimos obrigatórios definidos para esse t… | — |
| 2026-07-16 | `PLCTV-267` | Task | — | MED: tratar contestação duplicada com erro específico e atalho para contestação existente (backend + app) | Em 15/07/2026, um cliente tentou abrir uma contestação Pix (MED) no app e recebeu a mensagem genérica "Não foi possível abrir a contestação. Tente novamente em instantes." A investigação (Firebase +… | — |
| 2026-07-16 | `PLCTV-105` | Epic | — | Extrato + Contestação + Devolução | Objetivo Criar a experiência completa de consulta de extrato , detalhamento de transações e fluxos de devolução e contestação , cobrindo Pix, TED e Boleto, conforme fluxos definidos no Figma. Link de… | — |
| 2026-07-21 | `PLCTV-266` | Task | — | [Backend] - Gerar QR Code Pix estático de recebimento (cash-in) para o app | Contexto Hoje o usuário só consegue gerar um QR Code de cobrança Pix pelo chat de IA (data-intelligence-middleware), que monta o EMV consultando o banco diretamente e devolve imagem via S3. Não exist… | banking-router#2332, banking-router#2329, banking-router#2328 |
| 2026-07-22 | `PLCTV-36` | Task | PLCTV-111 Pix e Boleto Agendado [Design WIP] | PIX + Boleto agendado [WIP Design] | Destrinchar épico | — |
| 2026-07-23 | `PLCTV-183` | Épico | — | [Max] Cartões | — | — |
| 2026-07-27 | `PLCTV-268` | Task | — | [Backend] - Endpoint de dados cadastrais do usuário (tela "Seus dados") | A tela "Seus dados" do app (Dados pessoais, Endereço, Contatos) precisa de um endpoint que devolva os dados cadastrais do usuário logado. Hoje o /app/v1/auth/me só retorna dados de sessão/conta (nome… | banking-router#2395, banking-router#2351 |
| 2026-07-28 | `PLCTV-269` | Task | PLCTV-62 [App] Melhorias | [Backend + App] - Expor motivo do bloqueio de conta e provedor bancário no /auth/me | O app exibe uma mensagem genérica de "possível violação das diretrizes de uso" sempre que a conta é bloqueada por segurança ( user_role.status_id = SecurityBlocked ), mesmo quando a causa real é apen… | banking-router#2400, banking-router#2398 |
| 2026-07-30 | `PLCTV-264` | Task | PLCTV-262 Flows do chat | [App Flow] Mapeamento geral e revisão | Listar todos os flows publicados e usado no fluxo de chat de WhatsApp e documentar isso no confluence. Revisar se cada flow possui um equivalente no aplicativo e se está devidamente atualizado. Criar… | — |
| 2026-07-30 | `PLCTV-225` | Erro | — | [Android] NON_FATAL - MultiaccountDatasource.getApprovalLimit crash: type Null is not a subtype of type Map<S… | Descrição Crash NON_FATAL no Android em MultiaccountDatasource.getApprovalLimit. Quando o endpoint app/v1/multiaccount/requests/approval-limit retorna resposta sem o campo data (null), a linha Approv… | — |

#### BEMM · Max - Bugs e Dívidas — 20 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-04-01 | `BEMM-17` | Task | BEMM-66 mobile-performance | [PERF-01] Chave RSA parseada do PEM em cada requisicao HTTP | Documento completo: Auditoria de Performance Flutter Descricao encrypt_adapter.dart linhas 116-164 e decrypt_adapter.dart linhas 49-61: A chave RSA publica e privada e parseada da string PEM (base64… | — |
| 2026-04-01 | `BEMM-18` | Task | BEMM-66 mobile-performance | [PERF-02] SecureStorage lido em cada requisicao HTTP pelo interceptor | Documento completo: Auditoria de Performance Flutter Descricao authorization_interceptor.dart linha 12 e login_repository.dart linhas 407-417: O interceptor chama processRefreshToken() e depois le kA… | — |
| 2026-04-01 | `BEMM-20` | Task | BEMM-66 mobile-performance | [PERF-04] Header Authorization sobrescrito com IV da criptografia (bug funcional) | Documento completo: Auditoria de Performance Flutter Descricao message_route_datasource.dart linhas 30-34: O datasource passa Authorization: encryptedData['iv'] no header manual, sobrescrevendo o Bea… | — |
| 2026-04-01 | `BEMM-21` | Task | BEMM-66 mobile-performance | [PERF-05] Firestore cache sem limite de tamanho | Documento completo: Auditoria de Performance Flutter Descricao main.dart linhas 34-37: cacheSizeBytes definido como Settings.CACHE_SIZE_UNLIMITED. O cache pode crescer indefinidamente. Para um app ba… | — |
| 2026-04-01 | `BEMM-22` | Task | BEMM-66 mobile-performance | [PERF-06] Inicializacao do Firebase bloqueia o primeiro frame | Documento completo: Auditoria de Performance Flutter Descricao main.dart linhas 9-28: Future.wait com 6 tarefas incluindo _configureFirebase() bloqueia ate todas terminarem antes do runApp. No primei… | — |
| 2026-04-01 | `BEMM-9` | Task | BEMM-62 mobile | [APP-09] DateTime.parse sem tratamento pode crashear ao processar mensagem | Documento completo: Documento de Bugs Descricao message_route_model.dart linha 39: DateTime.parse(createdAt) sem try-catch. Se createdAt for string malformada ou timestamp numerico nao convertido, la… | — |
| 2026-04-01 | `BEMM-19` | Task | BEMM-62 mobile | [PERF-03] Multiplas instancias de SecureStorageAdapter (15+) em modulos diferentes | Documento completo: Auditoria de Performance Flutter Descricao app_module.dart:41, auth_module.dart:30, home_module.dart:27, chat_module.dart:21, shared_module.dart:12, liveness_module.dart:21, e mai… | — |
| 2026-04-01 | `BEMM-61` | Task | BEMM-62 mobile | [BUG-28] AppCheckInterceptor loga token sem verificar modo de build | Documento completo: Auditoria de Bugs - Jornada do Usuario MAX Descricao App Flutter - app_checker_interceptor.dart linha 12: Log.i loga AppCheck token em plaintext. Log.i verifica apenas Environment… | — |
| 2026-04-01 | `BEMM-11` | Task | BEMM-62 mobile | [APP-11] Saldo pode exibir valor negativo sem tratamento visual | Documento completo: Documento de Bugs Descricao pix_transfer_cubit.dart linhas 19-28: a mensagem de erro mostra o saldo retornado pela API sem validar se e positivo. Se a API retornar saldo negativo,… | — |
| 2026-04-01 | `BEMM-5` | Task | BEMM-62 mobile | [APP-05] Cast forcado para List em getPixContacts sem verificacao de null | Documento completo: Documento de Bugs Descricao home_repository.dart linha 71: (result.payload?['contacts'] as List) lanca excecao se contacts for null. Correcao: verificar tipo antes do cast e retor… | — |
| 2026-04-01 | `BEMM-6` | Task | BEMM-62 mobile | [APP-06] Acesso nested sem null safety em getPixDetails | Documento completo: Documento de Bugs Descricao home_repository.dart linhas 170-176: responseApi.payload?['dict_response']['key'] protege apenas payload. Se dict_response for null, null['key'] lanca… | — |
| 2026-04-01 | `BEMM-4` | Task | BEMM-62 mobile | [APP-04] Null pointer ao acessar balance da API quando payload e null | Documento completo: Documento de Bugs Descricao home_repository.dart linha 20: (response.payload?['balance']) + .0 causa TypeError se payload for null. Correcao: (response.payload?['balance'] as num?… | — |
| 2026-04-01 | `BEMM-15` | Task | BEMM-62 mobile | [APP-15] Paginacao do chat sem limite maximo pode acumular centenas de mensagens em memoria | Documento completo: Documento de Bugs Descricao chat_cubit.dart linha 43: cada paginacao carrega mais 200 mensagens sem limite total. Historicos longos podem acumular milhares de mensagens na memoria… | — |
| 2026-04-08 | `BEMM-70` | Task | BEMM-66 mobile-performance | [APP] Mostrar skeleton no saldo em vez de R$ 0,00 enquanto carrega | O saldo inicia em 0.0 no HomeState e o widget MaxBalance renderiza R$ 0,00 enquanto a API carrega. O usuario ve um flash de saldo zero por 500ms-2s antes do valor real aparecer. A correcao e mostrar… | — |
| 2026-04-09 | `BEMM-74` | Task | BEMM-66 mobile-performance | [APP] Cancelar stream do Siri Intelligence no dispose da home page (iOS) | No home_page.dart, o _initSiri() (linhas 95-98) cria um listener em Intelligence().selectionsStream().listen() sem guardar o StreamSubscription. O dispose (linha 386-389) nao cancela esse stream. Cad… | — |
| 2026-04-13 | `BEMM-73` | Task | BEMM-66 mobile-performance | [APP] Substituir setState vazio por ValueListenableBuilder na busca do chat | No chat_page.dart, o _onTextChanged (linha 151) chama setState((){}) vazio a cada caractere digitado na busca. Isso reconstroi toda a arvore de widgets do chat a cada keystroke, mesmo que a busca rea… | — |
| 2026-04-13 | `BEMM-71` | Task | BEMM-66 mobile-performance | [APP] Remover chamada duplicada de getPixDetails no botao proximo da busca PIX | No pix_transfer_page.dart, o onSubmitted (linha 130) chama getPixDetails() quando o usuario digita e aperta enter. Depois, o botao proximo onNext (linha 282) chama getPixDetails() de novo com o mesmo… | — |
| 2026-04-14 | `BEMM-69` | Task | BEMM-66 mobile-performance | [APP] Cachear saldo, contatos, PIX keys e perfil localmente no SecureStorage | Hoje toda vez que o usuario abre o app, a home mostra tela vazia ate a API responder (500ms-2s). Nenhum dado de negocio e guardado localmente. A ideia e salvar o ultimo valor conhecido no SecureStora… | — |
| 2026-04-23 | `BEMM-72` | Task | BEMM-66 mobile-performance | [APP] Uniformizar goToChatMultiples para nao bloquear navegacao aguardando API | No bank_slip_bottom_sheet.dart, o fluxo de boleto unico (goToChat, linha 473) usa fire-and-forget no sendMessage e navega imediatamente. Mas o fluxo de multiplos boletos (goToChatMultiples, linha 460… | — |
| 2026-04-23 | `BEMM-75` | Task | BEMM-66 mobile-performance | [APP] Pre-carregar dados da home durante o splash screen | Hoje o splash apenas verifica autenticacao e navega. O home_cubit.initialize() so roda depois que a home page aparece, causando 500ms-2s de tela vazia. Correcao: no splash_cubit, apos confirmar que o… | — |

#### MM20 · Max - MED 2.0 — 18 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-05-07 | `MM20-35` | Task | MM20-8 Extrato no App | Mobile - Exportar Extrato | — | — |
| 2026-05-08 | `MM20-34` | Task | MM20-8 Extrato no App | Mobile - Listagem de Extrato | — | — |
| 2026-05-08 | `MM20-36` | Task | MM20-28 Recuperação de valores no App | Mobile - Fluxo de Listagem de MED | — | — |
| 2026-05-11 | `MM20-37` | Task | — | Mobile - Nova area Pix | — | — |
| 2026-05-11 | `MM20-43` | Task | MM20-9 Detalhamento no App | Mobile - Detalhamento de movimentações do Extrato | — | — |
| 2026-05-12 | `MM20-39` | Task | MM20-29 Devolução no App | Mobile - Fluxo de devolução de valores | Eventos obrigatórios do MED 2.0 Destacamos abaixo os eventos obrigatórios que passam a compor o ecossistema: pix-infraction: Notifica o recebimento ou processamento de uma infração. Sinaliza que a ch… | — |
| 2026-05-12 | `MM20-38` | Task | MM20-8 Extrato no App | Mobile - Listagem de comprovante | Listar comprovante | — |
| 2026-05-20 | `MM20-48` | Task | MM20-8 Extrato no App | Mobile - Ajuste na busca do extrato usando a API de Search | — | — |
| 2026-05-21 | `MM20-44` | Task | MM20-9 Detalhamento no App | Mobile - Fluxo de detalhamento de um MED | — | — |
| 2026-05-27 | `MM20-104` | Task | — | Mobile - Cancelar uma contestação | — | — |
| 2026-05-29 | `MM20-113` | Task | — | Novos ajustes de layout no fluxo do MED | — | — |
| 2026-06-08 | `MM20-128` | Task | MM20-28 Recuperação de valores no App | Mobile - Implementar rota de criar recuperação de valores | — | — |
| 2026-06-10 | `MM20-129` | Task | MM20-28 Recuperação de valores no App | Mobile - Implementar rota de Listagem de recuperação de valores enviadas | — | — |
| 2026-06-12 | `MM20-141` | Task | MM20-28 Recuperação de valores no App | Mobile - Implementar rota de ver detalhes de recuperação de valores enviadas | — | — |
| 2026-06-17 | `MM20-144` | Task | MM20-28 Recuperação de valores no App | Mobile - Implementar rota de cancelar recuperação de valores | — | — |
| 2026-06-18 | `MM20-140` | Task | MM20-116 Notificação de infrações no Backoffice | Mobile - Implementar rota de Listagem de recuperação de valores recebidas | — | — |
| 2026-06-19 | `MM20-142` | Task | MM20-116 Notificação de infrações no Backoffice | Mobile - Implementar rota de detalhar notificação de infrações recebida | — | — |
| 2026-06-23 | `MM20-45` | Task | MM20-116 Notificação de infrações no Backoffice | Mobile - Listagem de notificações do MED | — | — |

#### TIPL · Time Plataforma — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-06-24 | `TIPL-142` | Sub-task | TIPL-135 CNPJ Alphanumerico | Mobile - CNPJ Alphanumerico | — | — |

#### APR · Área Pix Regulatório — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-16 | `APR-10` | Task | — | adicionar função de Fazer um Pix com agendamento | — | — |

### Evidência em código — 40 PRs

**app-flutter** — 28 PRs, +29.988/−4.233 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-02-05 | #214 | `improvements_crashlytics` | 5 | +836/−132 | — |
| 2026-02-09 | #215 | `fix_cnpj_key` | 1 | +138/−123 | — |
| 2026-02-26 | #220 | `sorteios` | 3 | +41/−4 | — |
| 2026-03-04 | #222 | `share_campaign` | 1 | +13/−20 | — |
| 2026-03-05 | #223 | `analytics_pix` | 6 | +572/−31 | — |
| 2026-03-09 | #226 | `fix_events_login` | 1 | +29/−8 | — |
| 2026-03-11 | #227 | `shorebird` | 2 | +158/−2 | — |
| 2026-03-12 | #228 | `fix_auth_analytics` | 3 | +89/−37 | — |
| 2026-03-17 | #230 | `workflow` | 30 | +391/−43 | — |
| 2026-03-23 | #232 | `balance_analytics` | 1 | +31/−6 | — |
| 2026-04-01 | #243 | `fix_erros` | 1 | +13/−6 | — |
| 2026-04-01 | #242 | `paginated_chat` | 1 | +1/−1 | — |
| 2026-04-01 | #241 | `paginated_chat` | 1 | +9/−3 | — |
| 2026-04-01 | #237 | `Improvements_latence` | 6 | +190/−169 | PERF-03, PERF-04 |
| 2026-04-07 | #247 | `icon_payments` | 1 | +12/−1 | — |
| 2026-04-08 | #249 | `cache_home` | 1 | +23/−7 | — |
| 2026-04-15 | #255 | `bankslip_page` | 2 | +512/−554 | — |
| 2026-04-15 | #254 | `cache_contacts` | 6 | +250/−63 | — |
| 2026-04-23 | #263 | `fix_goToChat` | 2 | +6/−12 | — |
| 2026-04-23 | #258 | `chat_new_scroll` | 5 | +220/−85 | — |
| 2026-04-29 | #268 | `user_force_logout` | 2 | +166/−0 | — |
| 2026-05-14 | #279 | `wallet_extension` | 6 | +2585/−59 | — |
| 2026-05-14 | #278 | `med` | 37 | +9363/−785 | — |
| 2026-05-21 | #280 | `improvements_med` | 6 | +4023/−251 | — |
| 2026-06-08 | #275 | `credit_card` | 39 | +6679/−177 | — |
| 2026-06-22 | #281 | `cancel_med` | 14 | +1868/−977 | — |
| 2026-06-23 | #287 | `MED---Notifications` | 2 | +1649/−610 | — |
| 2026-06-24 | #288 | `cnpj_alphanumerico` | 2 | +121/−67 | — |

**banking-router** — 12 PRs, +3.663/−62 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-07-10 | #2218 | `feature/PLCTV-265-auth-me-dda-indicacao-dados-conta` | 1 | +263/−0 | PLCTV-265 |
| 2026-07-13 | #2226 | `feature/PLCTV-265-auth-me-dda-indicacao-dados-conta` | 1 | +28/−19 | PLCTV-265 |
| 2026-07-14 | #2223 | `feature/PLCTV-265-auth-me-dda-indicacao-dados-conta` | 2 | +275/−3 | PLCTV-265 |
| 2026-07-15 | #2247 | `feature/med-funds-recovery-error-codes` | 1 | +61/−19 | — |
| 2026-07-16 | #2251 | `feature/med-funds-recovery-error-codes` | 1 | +61/−19 | — |
| 2026-07-21 | #2329 | `feature/PLCTV-266-pix-receive-qrcode` | 1 | +5/−0 | PLCTV-266 |
| 2026-07-21 | #2328 | `feature/PLCTV-266-pix-receive-qrcode` | 4 | +1113/−0 | PLCTV-266 |
| 2026-07-22 | #2351 | `feature/PLCTV-268-dados-cadastrais-me` | 2 | +350/−1 | PLCTV-268 |
| 2026-07-24 | #2332 | `feature/PLCTV-266-pix-receive-qrcode` | 5 | +1118/−0 | PLCTV-266 |
| 2026-07-27 | #2398 | `PLCTV-269-expor-motivo-bloqueio-e-provider-no-auth-me` | 1 | +16/−0 | PLCTV-269 |
| 2026-07-27 | #2395 | `feature/PLCTV-268-dados-cadastrais-me-clean` | 3 | +352/−1 | PLCTV-268 |
| 2026-07-28 | #2400 | `PLCTV-269-expor-motivo-bloqueio-e-provider-no-auth-me` | 2 | +21/−0 | PLCTV-269 |

---

## João Justo

*Engenheiro · Plataforma, Backoffice*

**29 entregas** em 8 projetos · **50 PRs** em 4 repositórios · +17.458/−5.336 linhas · período ativo 2026-02-13 → 2026-07-21

### Leitura do semestre

Referência em **Giftmax/Cashback** e **Internet Banking**. Entregou o IB no client Vue 3 (111 commits, +10.199 linhas), o fluxo de limites de transação, DDA, e o **fallback Pix** na recuperação de vendas. Integrou o frontend do backoffice da **migração de contas (Ledger)** em julho. Perfil de PRs pequenos e frequentes (mediana de 74 linhas), com peso alto de hotfix.

**Ponto de atenção.** Volume de hotfix alto (mediana de 74 linhas, muitos `hotfix/*` em cashback/Giftmax) — sinal de que a frente cobra correção contínua.

| Ritmo | Fev | Mar | Abr | Mai | Jun | Jul |
|---|--:|--:|--:|--:|--:|--:|
| Entregas Jira | 3 | 7 | 3 | 0 | 1 | 15 |
| PRs mergeados | 6 | 13 | 15 | 7 | 6 | 3 |

### Entregas por projeto

#### SUS · Sustentação — 8 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-03-23 | `SUS-3958` | Bug | — | Pedido com cashback está com o valor total para estornar diferente do valor total do pedido | Foi solicitado um estorno de R$190,17 do pedido 109369906 ( https://admin.appmax.com.br/order/21758162023041-1773525432-0605336001773525432 ), mas na adquirente o valor do pedido está como R$163,17,… | — |
| 2026-03-24 | `SUS-3795` | Task | — | Cashback | Time, O parceiro ativou cashback no painel. O cliente realizou um pedido e ganhou 10% de cashback para a próxima compra. Ao tentar finalizar um novo pedido (em duas tentativas), o desconto não foi ap… | — |
| 2026-03-31 | `SUS-4099` | Task | — | [Patrícia Rossato] Inserir Site ID na lista de lojas do menu Recuperar Vendas | Boa tarde! Favor incluir na lista de lojas indicada abaixo o Site ID para facilitar a seleção ao parceiro, pois muitos parceiros possuem lojas com o mesmo nome vinuculadas a empresas ou integrações d… | — |
| 2026-04-01 | `SUS-3981` | Bug | — | Cashback em duplicidade | Time, Identificamos um problema na exibição e aplicação do cashback no pedido 109710679 . Na tela de pedidos, o cashback está sendo apresentado como taxa interna , o que é correto. Porém, também é po… | — |
| 2026-04-06 | `SUS-4000` | Bug | — | Cashback | Time, O parceiro ativou cashback no painel. O cliente realizou um pedido e ganhou para a próxima compra. Ao tentar finalizar um novo pedido o desconto não foi apresentado, ele finalizou sem igual. Ve… | — |
| 2026-04-14 | `SUS-4187` | Task | — | MAYKEL ALMEIDA RAMOS | Parceiro teve um pedido que não foi devidamente processado com o cashback, sendo assim, gerou reclamações do cliente. Conseguimos entender por que deste erro e entender também se houve em outros pedi… | — |
| 2026-06-01 | `SUS-4665` | Task | SUS-4623 Plataforma | Cashback | Time, o parceiro configurou o prazo para 30 dias, porém, na mensagem que está sendo enviada, aparece o prazo de 7 dias. Existe algum campo que podemos ajustar para refletir essa configuração? Ou a me… | — |
| 2026-07-03 | `SUS-5028` | Task | SUS-4623 Plataforma | LETICIA MAYARA DE ALENCAR FRAZAO 20024 | Time estamos tentando configurar o cashback da parceira porem apresenta esse erro. Nao identifiquei bloqueios e aparentemente a integracao ta correta | — |

#### MIR · Max - Contas-Ledger-Caixinhas — 8 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-18 | `MIR-146` | Subtarefa | MIR-141 Integrar front-end do Backoffice | Integrar programação de migração de conta isolada | — | — |
| 2026-07-18 | `MIR-145` | Subtarefa | MIR-141 Integrar front-end do Backoffice | Integrar detalhamento de migrações | — | — |
| 2026-07-18 | `MIR-148` | Subtarefa | MIR-141 Integrar front-end do Backoffice | Integrar exibição de provedor no detalhamento de contas | — | — |
| 2026-07-18 | `MIR-147` | Subtarefa | MIR-141 Integrar front-end do Backoffice | Integrar exibição de provedor na listagem de contas | — | — |
| 2026-07-18 | `MIR-143` | Subtarefa | MIR-141 Integrar front-end do Backoffice | Integrar upload de CSV de lote | — | — |
| 2026-07-18 | `MIR-144` | Subtarefa | MIR-141 Integrar front-end do Backoffice | Integrar listagem de migrações | — | — |
| 2026-07-18 | `MIR-142` | Subtarefa | MIR-141 Integrar front-end do Backoffice | Integrar listagem de lotes | — | — |
| 2026-07-21 | `MIR-141` | Task | MIR-99 Migração - Backoffice | Integrar front-end do Backoffice | — | — |

#### IB · Internet Banking — 4 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-16 | `IB-44` | Task | — | Configuração de ambiente de HML para testes | — | — |
| 2026-03-03 | `IB-20` | Task | IB-9 Segurança Web / CSP / Crypto + BFF | Configurar CSP (Content-Security Policy) no appmax-client-vue3 para BFF e Firebase | Repositório: sistema Objetivo: adicionar/ajustar Content-Security-Policy permitindo requests para rota do BFF Critérios de aceite: Policy documentada (script-src, connect-src, img-src). Build homolog… | — |
| 2026-03-10 | `IB-42` | Task | — | Testes ponta a ponta em HML | — | — |
| 2026-03-10 | `IB-53` | Task | — | Implementação de QR Code na etapa de autenticação | Implementar a geração de QR Code dinâmico e temporário como etapa de autenticação nos fluxos de redefinição de senha e alteração de limites. Após a confirmação inicial dos dados, o backend deve gerar… | — |

#### TIPL · Time Plataforma — 4 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-01 | `TIPL-137` | Sub-task | TIPL-135 CNPJ Alphanumerico | [Sistema] CNPJ Alphanumero | — | — |
| 2026-07-01 | `TIPL-135` | Task | TIPL-125 Solicitações dos times internos Appmax | CNPJ Alphanumerico | Com a mudança do CNPJ para alphanumérico, é preciso ajustar a formatação e normalização desse valor em todo o Admin (Sistema e Client Vue3) e no Backoffice. Esse novo formato entra em vigor a partir… | — |
| 2026-07-01 | `TIPL-138` | Sub-task | TIPL-135 CNPJ Alphanumerico | [Client Vue3] CNPJ Alphanumero | — | — |
| 2026-07-10 | `TIPL-176` | Task | TIPL-125 Solicitações dos times internos Appmax | [Internet Banking] Liberar acesso para o user_id 383881 | Liberar o internet banking para o Parceiro: Elements - 383881 - Rafael Seifert Dutra | — |

#### GIF · Giftmax — 2 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-13 | `GIF-9` | Subtarefa | GIF-4 Fluxo para o Giftmax na tela de Pedidos | Verificar alteração do payload do elastic para listagem do giftmax na tela de pedidos | — | — |
| 2026-02-13 | `GIF-38` | Task | — | Aplicar ajuste de nomenclatura: Giftmax → Cashback Max | A partir deste momento, o nome Giftmax não deve mais ser utilizado em nenhum ponto da plataforma ou comunicação. Novo nome oficial: Cashback Max Realizar a substituição de todas as menções a “Giftmax… | — |

#### MAX · Max — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-03-27 | `MAX-1551` | Epic | — | [Eng] Melhorias front-end | — | — |

#### MAXS · Max - Suporte — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-14 | `MAXS-1087` | Task | MAXS-874 Conta | Parceiro não consegue acessar a conta no banking (Max não localiza a conta) | HubSpot linked tickets: Abertura de conta - 1 - Max (Ticket ID: 46377696621) (please, do not edit or duplicate in description) CNPJ 48348509000237, telefone (47) 98837-9616. Olhando nas empresas dele… | — |

#### BAC · Backoffice — 1 entrega

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-14 | `BAC-120` | Task | BAC-119 Max - Contas bancárias | [Frontend] Implementar bloqueio/desbloqueio judicial de Chaves Pix na tela de Contas Bancárias | Contexto Atualmente a listagem de Chaves Pix (tela de Contas Bancárias) não permite sinalizar nem gerenciar bloqueios judiciais de chaves. É necessário implementar esse fluxo consumindo a API de Back… | — |

### Evidência em código — 50 PRs

**sistema** — 40 PRs, +4.993/−4.586 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-02-11 | #19906 | `fix/ajuste-sniffer` | 1 | +1/−1 | — |
| 2026-02-11 | #19897 | `fix/giftmax_ajuste-permissao-menu` | 1 | +12/−5 | — |
| 2026-02-13 | #19939 | `hotfix/ajusta-logica-status-cashback` | 1 | +1/−1 | — |
| 2026-02-13 | #19937 | `hotfix/atualiza-lista-de-status-de-pedido-para-giftmax` | 1 | +1/−1 | — |
| 2026-02-13 | #19929 | `hotfix/giftmax_listagem-de-campanhas` | 1 | +9/−0 | — |
| 2026-02-23 | #19947 | `fix/add_filtro-pedidos_giftmax` | 7 | +138/−4 | — |
| 2026-03-10 | #20099 | `feature/habilita-giftmax-para-base` | 1 | +0/−2 | — |
| 2026-03-12 | #20123 | `hotfix/internet-banking-sidebar-permission` | 2 | +2/−6 | — |
| 2026-03-12 | #20117 | `hotfix/internet-banking-sidebar-permission` | 3 | +23/−3 | — |
| 2026-03-17 | #20152 | `hotfix/corrije-envio-notificacao-giftmax` | 1 | +4/−1 | — |
| 2026-03-17 | #20148 | `hotfix/move-notificacao-giftmax-pagamento-efetivo` | 1 | +3/−3 | — |
| 2026-03-20 | #20176 | `hotfix/giftmax-taxes-calculation` | 2 | +5/−11 | — |
| 2026-03-24 | #20175 | `feature/transaction-limits-flow` | 28 | +549/−110 | — |
| 2026-03-25 | #20207 | `hotfix/ajusta-validacao-nova-senha-para-ib` | 9 | +70/−4 | — |
| 2026-03-27 | #20242 | `fix/cashback-aplicacao-giftmax` | 2 | +20/−52 | — |
| 2026-04-01 | #20274 | `hotfix/ajuste-compra-protegida-nao-desativando` | 1 | +1/−1 | — |
| 2026-04-13 | #20379 | `feature/giftmax-add-offer-page-url-field` | 2 | +92/−0 | — |
| 2026-04-13 | #20346 | `fix/SUS-4187_melhora-a-busca-de-usuario-para-integracoes` | 1 | +10/−44 | — |
| 2026-04-13 | #20373 | `feature/giftmax-notification-site-url` | 1 | +52/−6 | — |
| 2026-04-15 | #20411 | `fix/add-feature-flag-para-analise-de-site-no-giftmax` | 1 | +39/−20 | — |
| 2026-04-15 | #20297 | `feature/web-scrapping-giftmax` | 40 | +816/−19 | — |
| 2026-04-20 | #20415 | `feature/internet-banking-add-route-get-user-info` | 3 | +196/−1 | — |
| 2026-04-20 | #20437 | `fix/add-menu-no-permissions` | 2 | +30/−4 | — |
| 2026-04-30 | #20548 | `revert/pr-20547-develop-merge` | 1 | +347/−2585 | PR-20547 |
| 2026-04-30 | #20540 | `feature/add-batch-de-users-no-IB` | 1 | +80/−0 | — |
| 2026-05-05 | #20576 | `feature/libera-internet-banking` | 1 | +4/−18 | — |
| 2026-05-06 | #20605 | `feature/muda-consulta-site-giftmax-para-pooling` | 2 | +73/−80 | — |
| 2026-05-08 | #20645 | `hotfix/criacao-e-consulta-campanha-giftmax` | 1 | +0/−2 | — |
| 2026-05-13 | #20717 | `hotfix/minifica-assets` | 1 | +4/−1415 | — |
| 2026-05-15 | #20767 | `hotfix/adiciona-ispb-no-retorno-de-withdraw-pendency` | 2 | +388/−10 | — |
| 2026-05-15 | #20764 | `hotfix/adiciona-ispb-no-retorno-de-withdraw-pendency` | 1 | +17/−6 | — |
| 2026-05-20 | #20807 | `feat/add-verificacao-de-company-no-saque-para-atualizacao-de-conta-ba…` | 8 | +457/−0 | — |
| 2026-06-12 | #21019 | `feature/fallback-pix` | 2 | +384/−28 | — |
| 2026-06-12 | #20862 | `fix/upload-s3` | 11 | +256/−19 | — |
| 2026-06-12 | #20981 | `feature/fallback-pix` | 2 | +383/−5 | — |
| 2026-06-19 | #21095 | `fix/fallback-pix` | 1 | +165/−0 | — |
| 2026-06-22 | #21110 | `feat(sale-recovery)fallback-pix-em-qualquer-erro-de-cartao-no-ponto-d…` | 1 | +126/−75 | — |
| 2026-06-23 | #21114 | `hotfix/decisao-na-mao-do-lojista` | 4 | +190/−33 | — |
| 2026-07-09 | #21278 | `feat/adiciona-novas-flags-para-fallback-pix` | 1 | +44/−10 | — |
| 2026-07-16 | #21362 | `fix/atualiza-npmrc-token-npm` | 1 | +1/−1 | — |

**banking-router** — 7 PRs, +633/−32 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-03-24 | #1668 | `feature/transaction-limits-flow` | 9 | +219/−2 | — |
| 2026-03-25 | #1694 | `fix--melhora-os-logs-para-telemetria` | 2 | +120/−18 | — |
| 2026-03-27 | #1708 | `fix/pending-appprovals` | 2 | +2/−2 | — |
| 2026-04-08 | #1767 | `fix/melhora-logs-q-erros-reportados-ao-ib` | 2 | +128/−2 | — |
| 2026-04-22 | #1857 | `fix/add-role-id-na-listagem-de-dda` | 3 | +12/−8 | — |
| 2026-04-22 | #1854 | `fix/envia-user-id-para-dda` | 1 | +5/−0 | — |
| 2026-04-22 | #1851 | `fix/add-user-role-id-no-fluxo-de-dda` | 3 | +147/−0 | — |

**appmax-client-vue3** — 2 PRs, +11.022/−632 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-03-09 | #1051 | `feature/internet_banking` | 111 | +10199/−344 | — |
| 2026-04-24 | #1132 | `feature/crm-campaigns-integration` | 67 | +823/−288 | — |

**max-backoffice-frontend** — 1 PRs, +810/−86 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-07-09 | #72 | `feature/bac-120_adiciona-bloquei-e-desbloqueio-judicial-de-chaves-pix` | 3 | +810/−86 | — |

---

## José Chagury

*Engenheiro · Plataforma*

**17 entregas** em 2 projetos · **22 PRs** em 5 repositórios · +18.683/−5.494 linhas · período ativo 2026-05-26 → 2026-07-29

### Leitura do semestre

Entrou na fila em **26/05** — os números cobrem ~2 meses. Atende **solicitações dos times internos** e já circula por 5 repositórios. Entregou o **módulo de banners** completo (backend + endpoint público + admin + consumo no client), o **NPS**, a reorganização das configurações e a **refatoração do `appmax-biometric-frontend` para React** — o maior PR isolado do semestre (+12.841/−5.002).

**Ponto de atenção.** Base de comparação curta (2 meses). Avaliar ritmo com essa ressalva.

| Ritmo | Fev | Mar | Abr | Mai | Jun | Jul |
|---|--:|--:|--:|--:|--:|--:|
| Entregas Jira | 0 | 0 | 0 | 1 | 9 | 7 |
| PRs mergeados | 0 | 0 | 0 | 5 | 12 | 5 |

### Entregas por projeto

#### TIPL · Time Plataforma — 14 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-05-26 | `TIPL-129` | Sub-task | TIPL-128 [Marketing] Banners internos | Substituir banner do Sorteio na dashboard | Resumo Substituir o banner atual do Sorteio na dashboard pela nova arte da mesma campanha, atualizando também o link/UTMs para os definidos pelo marketing. Contexto técnico Componente: src/modules/ad… | — |
| 2026-06-05 | `TIPL-132` | Sub-task | TIPL-128 [Marketing] Banners internos | Banners: módulo de gestão no admin interno | Resumo Criar o módulo no appmax-frontend-admin para o time de marketing gerenciar autonomamente as campanhas/banners (CRUD, upload de imagens, controle de janela de exibição). Depende do backend e co… | — |
| 2026-06-05 | `TIPL-133` | Sub-task | TIPL-128 [Marketing] Banners internos | Banners: consumo dinâmico no client-vue3 | Resumo Refatorar os componentes de banner do appmax-client-vue3 para consumir o endpoint público de campanhas em vez de manterem objeto data hardcoded no componente. Depende do endpoint definido na s… | — |
| 2026-06-05 | `TIPL-131` | Sub-task | TIPL-128 [Marketing] Banners internos | Banners: backend e endpoint público de consulta | Resumo Definir a arquitetura de backend para o gerenciamento de banners da plataforma e implementar o endpoint público que será consumido pelo appmax-client-vue3 . Esta sub-task entrega o contrato de… | — |
| 2026-06-05 | `TIPL-130` | Sub-task | TIPL-128 [Marketing] Banners internos | [Contexto] Gestão de banners da plataforma — visão geral | Status Esta sub-task não é implementável. Foi quebrada em 3 sub-tasks irmãs sob FRONT-128: Backend + endpoint público de consulta Módulo de gestão no admin interno Consumo dinâmico no client-vue3 Man… | — |
| 2026-06-05 | `TIPL-128` | Task | TIPL-125 Solicitações dos times internos Appmax | [Marketing] Banners internos | Resumo Task guarda-chuva da iniciativa do time de Frontend para suportar o time de Marketing na publicação e gestão de banners da plataforma ( appmax-client-vue3 ). Cobre tanto demandas recorrentes (… | — |
| 2026-06-11 | `TIPL-141` | Task | TIPL-125 Solicitações dos times internos Appmax | [Admin Help Center] Invalidação de cache do Cloudflare Worker ao publicar artigo | Problema Atualmente, ao editar e publicar um artigo, o cache do Cloudflare Worker não é invalidado automaticamente. Isso faz com que as alterações não sejam refletidas para o cliente até que o cache… | — |
| 2026-06-24 | `TIPL-140` | Task | TIPL-143 NPS | [NPS] Sistema | Contexto Implementar a pesquisa de NPS no sistema , no fluxo de saque ou antecipação, coletando nota e comentário opcional antes de prosseguir. Documentação Regras de negócio + telas (desktop e mobil… | — |
| 2026-06-25 | `TIPL-170` | Task | TIPL-125 Solicitações dos times internos Appmax | [Site] Atualizar termos de uso | Contexto Com o lançamento da funcionalidade "Decisão na Mão do Lojista", os parceiros ganham poder de aprovar pedidos rejeitados pelo Antifraude. Tarefa Atualizar Termos de Uso para dar respaldo jurí… | — |
| 2026-06-30 | `TIPL-169` | Task | TIPL-146 Melhorias CS | [Link de pagamentos] Remover confirmação de criação de link de pagamentos | No formulário de novo Link de pagamentos, remover a modal de confirmação. | — |
| 2026-07-17 | `TIPL-174` | Task | TIPL-125 Solicitações dos times internos Appmax | [Pedidos] Adicionar mais dados ao export do relatório | Contexto Na tela de pedidos o usuário exporta o relatório, que é enviado por e-mail (processo assíncrono), porém esse CSV não possuiu todas as informações que os parceiros desejam, logo, muitos chama… | — |
| 2026-07-20 | `TIPL-182` | Task | TIPL-125 Solicitações dos times internos Appmax | [Demo] Ajustar dados no dashboard e remover CRM da sidebar | Atualizar a branch do PR e fazer o deploy para a demo usando a pipeline custom: demo-deploy Usar os números da dashboard conforme a imagem abaixo Remover o CRM da listagem da sidebar https://appmax-a… | — |
| 2026-07-28 | `TIPL-187` | Task | TIPL-125 Solicitações dos times internos Appmax | [Regulatórios] Criação da plataforma de envios BACEN | — | — |
| 2026-07-29 | `TIPL-157` | Task | TIPL-146 Melhorias CS | [Admin] Reorganizar página de configurações | A página de configurações concentra muitos links sem organização, prejudicando a usabilidade. Melhorar a experiência com filtro, histórico de acessos e agrupamento de links. Tarefas Adicionar campo d… | — |

#### CEID · Canais & Integrações - Development — 3 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-24 | `CEID-247` | Story | CEID-239 Frontend - Validação Facial | Limpeza e refatoração do frontend para React | — | — |
| 2026-07-27 | `CEID-241` | Story | CEID-239 Frontend - Validação Facial | Módulos de captura independentes: facial e documento (componíveis) | Contexto: O provider hoje só faz selfie/liveness ( SelfieCameraTypes.SMART em packages/sdk/src/providers/unico.ts ); o captureType?: "selfie" \| "document" existe, mas documento não está no fluxo. Qu… | — |
| 2026-07-29 | `CEID-260` | Story | CEID-239 Frontend - Validação Facial | Melhorias no design e usabilidade | — | — |

### Evidência em código — 22 PRs

**appmax-client-vue3** — 10 PRs, +2.239/−204 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-05-13 | #1178 | `feat/ajustes-tema-franquia` | 3 | +27/−27 | — |
| 2026-05-18 | #1195 | `feature/substituicao-banner-campanha` | 3 | +4/−4 | — |
| 2026-05-19 | #1198 | `feature/substituicao-banner-campanha` | 1 | +1/−1 | — |
| 2026-06-03 | #1212 | `feature/adiciona-campanhas-dinamicas` | 21 | +292/−62 | — |
| 2026-06-10 | #1245 | `feature/visualizacao-unica-modalcentral` | 6 | +147/−12 | — |
| 2026-06-24 | #1279 | `feature/adiciona-novo-nps` | 23 | +983/−29 | — |
| 2026-06-26 | #1293 | `fix/adiciona-nps-attenton` | 1 | +18/−0 | — |
| 2026-06-26 | #1289 | `refactor/redesign-nps-helper` | 3 | +32/−15 | — |
| 2026-06-30 | #1298 | `feature/remover-confirmacao-link-de-pagamentos` | 2 | +2/−30 | — |
| 2026-07-29 | #1335 | `feature/reorganizacao-pagina-de-configuracoes` | 14 | +733/−24 | — |

**appmax-backoffice-frontend** — 5 PRs, +2.434/−152 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-06-03 | #3 | `feature/adiciona-modulo-de-banners` | 25 | +2060/−58 | — |
| 2026-06-10 | #4 | `feature/adiciona-link-modalcentral` | 5 | +88/−0 | — |
| 2026-06-11 | #6 | `fix/arruma-logout-com-dns-novo` | 2 | +135/−6 | — |
| 2026-06-22 | #8 | `feature/adiciona-permissionamento-de-visualizacao` | 1 | +139/−80 | — |
| 2026-06-22 | #7 | `fix/arruma-permissionamento-com-novo-endpoint` | 4 | +12/−8 | — |

**sistema** — 4 PRs, +258/−21 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-05-04 | #20565 | `hotfix/ajusta-fallback-logo` | 5 | +8/−9 | — |
| 2026-05-04 | #20563 | `hotfix/ajuste-no-fallback-de-branding` | 7 | +50/−11 | — |
| 2026-07-14 | #21291 | `feature/adiciona-colunas-relatorio-pedidos` | 3 | +55/−1 | — |
| 2026-07-29 | #21428 | `feature/menu/adiciona-categorizacao-nos-menus` | 3 | +145/−0 | — |

**appmax-biometric-frontend** — 2 PRs, +13.743/−5.113 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-07-24 | #1 | `feature/adiciona-react-e-refatoracao-sem-adapter` | 23 | +12841/−5002 | — |
| 2026-07-29 | #4 | `feature/refatoracao-frontend-design-e-handlers-de-erro` | 4 | +902/−111 | — |

**appmax-site-frontend** — 1 PRs, +9/−4 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-06-25 | #43 | `feature/atualiza-termos-de-uso` | 1 | +9/−4 | — |

---

## Witerlland Silva

*Engenheiro · Plataforma, Backoffice*

**34 entregas** em 7 projetos · **21 PRs** em 4 repositórios · +9.447/−674 linhas · período ativo 2026-02-06 → 2026-07-20

### Leitura do semestre

Dono das **Melhorias CS** (10 entregas na tela de Pedidos e Estornos: filtros, motivo de recusa bancária, taxas, países atendidos). Levou o **SUS-4242 (IB no saque)** por 3 repositórios. Também **Internet Banking** (Message Router, flows no chat, sessão/single tab) e a integração **WhatsApp Business** no CRM. Boa rastreabilidade: quase todo PR nomeia o ticket. Perfil de adição (+9.447/−674) — pouco refactor.

**Ponto de atenção.** Relação adição/remoção muito assimétrica; pouca evidência de refactor ou remoção de dívida.

| Ritmo | Fev | Mar | Abr | Mai | Jun | Jul |
|---|--:|--:|--:|--:|--:|--:|
| Entregas Jira | 4 | 4 | 1 | 1 | 13 | 11 |
| PRs mergeados | 0 | 1 | 2 | 3 | 8 | 7 |

### Entregas por projeto

#### TIPL · Time Plataforma — 13 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-06-03 | `TIPL-134` | Task | TIPL-125 Solicitações dos times internos Appmax | [Appmax admin] Tela de pedidos - Filtro por data | Aplicar melhorias no filtro por data dos pedidos. Adicionar filtro por “data de criação” ou “data de atualização”, para pegar o caso de data do chargeback Melhorar os textos: Data → Data de criação | — |
| 2026-06-19 | `TIPL-136` | Sub-task | TIPL-135 CNPJ Alphanumerico | [Backoffice] CNPJ Alphanumero | — | — |
| 2026-06-23 | `TIPL-161` | Task | TIPL-146 Melhorias CS | [Pedidos] Adicionar link para "Minhas Taxas" na modal de taxas | Adicionar link para a página de Minhas Taxas ( /v2/client/integration/fees ) dentro da modal que abre ao clicar em "Ver taxas" nos detalhes do pedido. Critérios de Aceitação Link aparece na modal de… | — |
| 2026-06-26 | `TIPL-154` | Task | TIPL-146 Melhorias CS | [Estornos] Tornar número do pedido clicável na listagem | Adicionar link clicável no número do pedido na listagem de estornos que redirecione para o detalhe do pedido. Critérios de Aceitação Número do pedido é clicável Link redireciona para detalhe do pedid… | — |
| 2026-06-30 | `TIPL-152` | Task | TIPL-146 Melhorias CS | [Pedidos] Exibir "Ver taxas" para todos os status do pedido | O botão "Ver taxas" não aparece em alguns status (ex: Recusado pelo banco) porque o endpoint retorna 403. Disponibilizar o botão e a modal de taxas para todos os status. Tarefas Remover restrição de… | — |
| 2026-06-30 | `TIPL-151` | Task | TIPL-146 Melhorias CS | [Pedidos] Mover "Estornos" para tab principal | Contexto O link para Estornos fica escondido no dropdown "Mais opções", dificultando o acesso. Promover para tab principal na tela de Pedidos. Tarefas Adicionar tab "Estornos" com link para tela de E… | — |
| 2026-06-30 | `TIPL-149` | Task | TIPL-146 Melhorias CS | [Pedidos] Exibir motivo de recusa bancária em notificação | Contexto Quando um pedido é recusado pelo banco, o motivo só é acessível clicando em "Informações de pagamento". Adicionar uma notificação (AmNotificação) na tela de pedidos que exiba o motivo imedia… | appmax-client-vue3#1300 |
| 2026-06-30 | `TIPL-150` | Task | TIPL-146 Melhorias CS | [Pedidos] Adicionar filtro por empresa na tela de pedidos | Contexto O filtro global por sites no header não é intuitivo. Adicionar um filtro dedicado por empresas na tela de Pedidos para facilitar o acesso. Tarefas Adaptar endpoint de orders para receber fil… | — |
| 2026-07-07 | `TIPL-171` | Task | TIPL-146 Melhorias CS | [CS] Inventariar todos os templates de e-mail do sistema para revisão | — | — |
| 2026-07-08 | `TIPL-159` | Task | TIPL-146 Melhorias CS | [CS] Inventariar todos os templates de e-mail | Listar todos os templates de e-mail para revisão do time de CS. Tarefas Inventariar todos os templates de e-mail de chargeback Compartilhar com time de CS para revisão | — |
| 2026-07-13 | `TIPL-148` | Task | TIPL-146 Melhorias CS | [Pedidos] Filtrar países atendidos na tela de pedidos | Contexto A tela de pedidos atualmente exibe no filtro vários países, incluindo países que não são atendidos pela operação. Objetivo Restringir o filtro de países na tela de pedidos apenas aos países… | — |
| 2026-07-14 | `TIPL-167` | Task | TIPL-146 Melhorias CS | [Admin] Adicionar Feature Flag para filtro de sites no Header | Implementar Feature Flag para controlar a visibilidade do filtro de sites no header, permitindo ocultar conforme análise de uso. Tarefas Criar Feature Flag show_sites_filter_header Implementar lógica… | — |
| 2026-07-16 | `TIPL-173` | Task | TIPL-172 Saque | [Admin] Adicionar informação de chave Pix da empresa na tela de aprovação de saque | Contexto Na tela de listagem de aprovação de saque, é preciso mostrar também a chave Pix. Rota: https://admin.appmax.com.br/cash-out/admin-requests-by-company | — |

#### IB · Internet Banking — 5 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-06 | `IB-32` | Task | IB-12 Filtragem de ActionTypes (Message Route… | Filtrar ActionTypes no Message Router | Repositório: domínio Max (Message Router) — atividade coordenada pelo time Max. Objetivo: backend rejeitar ActionTypes fora da whitelist quando origem for WEB_IB . Critérios de aceite: Retorno com er… | — |
| 2026-02-09 | `IB-46` | Task | — | Melhorias na usabilidade do IB | Após o desenvolvimento inicial do max foram encontrados pontos de melhoria na usabilidade geral do projeto. Devido aos testes estes pontos devem ser resolvidos antes da conclusão do projeto. Pontos p… | — |
| 2026-02-10 | `IB-47` | Task | — | Adicionar chamada da tela de configuração para flow no chat | Adicionar redirecionamento das opções existentes na tela de configuração para o chat, permitindo abrir o modal de Flow com as ações necessárias. | — |
| 2026-03-10 | `IB-48` | Task | — | Modal de flow no chat do IB | Adicionar as ações necessárias que passam pelo flow do chat. Atualmente o modal já foi adicionado assim como a validação para abertura do mesmo em mensagens que serão necessárias (Ex: Troca de senha)… | — |
| 2026-07-14 | `IB-8` | Epic | — | Controle de Sessão e Single Tab | — | — |

#### CRM · CRM — 5 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-02-25 | `CRM-12` | Task | CRM-11 [FRONT] Integração - WhatsApp Business | Criar componente inicial para WhatsApp Business | — | — |
| 2026-03-19 | `CRM-9` | Task | CRM-3 [FRONT] Criação da Página de Resultado | [Integração] - Criar um service para recuperar as informações do backend | Essa service deve ser responsável para chamar as APIS do CRM e tratar os dados para camada de componente. Alinhar com o time de dados os endpoint para recuperação das informações. | — |
| 2026-03-19 | `CRM-14` | Task | CRM-11 [FRONT] Integração - WhatsApp Business | Criar tela de conectado com a Meta | — | — |
| 2026-03-19 | `CRM-11` | Epic | — | [FRONT] Integração - WhatsApp Business | — | — |
| 2026-06-11 | `CRM-19` | História | CRM-26 [FRONT] Página de Detalhe da Estratégia | [Layout] - Página de detalhes da estratégia | Essa história contem o agrupamento das atividades para o desenvolvimento da tela de detalhe dos resultados. Figma: | — |

#### SUS · Sustentação — 5 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-04-13 | `SUS-4185` | Task | — | Alterar criação do token JWT | Remoção de Dados Sensíveis do Payload do Token JWT Contexto Durante testes de segurança (security testing), foi identificada uma vulnerabilidade no processo de geração do token JWT (JSON Web Token) d… | — |
| 2026-06-08 | `SUS-4752` | Task | SUS-1336 Backoffice | CSM 4 - João Pedro Casagrande - Painel TPV | Bom dia time! Parceiro está com quase 1 milhão de TPV e para ele, está aparecendo assim. Conseguem verificar por favor? Obrigada! | — |
| 2026-06-08 | `SUS-4242` | Task | — | Adicionar botões de ação do IB Max no saque | — | — |
| 2026-06-11 | `SUS-4794` | Task | — | Voltando para o perfil | HubSpot linked tickets: 492693 Suporte Integração (Ticket ID: 45731850000) Suporte Silver - Outras dúvidas (Ticket ID: 45730603524) 133493 Duvidas - Conquistamax - Outros (Ticket ID: 45734175299) Sup… | sistema#21007 |
| 2026-06-30 | `SUS-4457` | Task | SUS-1336 Backoffice | [GiftMax] Ajuste na dashboard inicial | Contexto : Conforme reportado pelo time de CS/CX a exibição dos valores de ROI na dashboard do cashbackmax não está muito clara, pois esta apresentando um valor em porcentagem muito alto e gera confu… | — |

#### MM20 · Max - MED 2.0 — 2 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-05-08 | `MM20-30` | Task | MM20-10 Front-end do Backoffice | Front-End - Alterar visual do back office | — | — |
| 2026-07-20 | `MM20-156` | Task | MM20-10 Front-end do Backoffice | Contratos dos serviços da API - BackOffice | Será necessário criar os contratos dos serviços que serão utilizados pelo Back Office no ambiente MEDS, sendo baseados na API do DICT. Temos atualmente 28 end-points sendo consumidos em formato de mo… | — |

#### RDCR · Recuperação de Carrinho Recompra — 2 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-14 | `RDCR-11` | Task | — | Ajustes no admin para cobrança do serviço de recompra | Para iniciarmos a cobrança do serviço de recompra, será necessário realizar algumas implementações no admin. Inclusão do serviço da tela de ativação Essa tela possibilita o serviço ser ativado ou des… | — |
| 2026-07-14 | `RDCR-9` | Task | — | [Front-End] - Adicionar novo filtro a tela de pedidos | Será necessário adicionar um novo filtro a tela de pedidos, permitindo com que o parceiro possa filtrar pela nova origem de recompra por um clique. | — |

#### ES · Engenharia de Software — 2 entregas

| Data | Chave | Tipo | Frente (épico) | Entrega | Descrição | PR |
|---|---|---|---|---|---|---|
| 2026-07-14 | `ES-79` | Task | ES-63 Projeto Frontend Apartado | [Sistema] Mapear e migrar rotas de api para usarem autenticação com JWT | Como a nossa aplicação Frontend está dentro do sistema, sendo instanciada dentro de um template blade.php, muitas das rotas que dependem de autenticação não utilizam o token JWT para isso. A partir d… | — |
| 2026-07-14 | `ES-103` | Task | — | [Frontend] POC page builder | Essa POC consiste em encontrar uma ferramenta pronta e open source para construção de sites e landing pages: As ferramentas testadas serão: Grape JS Wordpress com o plugin Elementor Pontos a verifica… | — |

### Evidência em código — 21 PRs

**sistema** — 11 PRs, +3.554/−304 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-04-13 | #20335 | `feature/SUS-4185_Alterar-criação-do-token-jwt` | 1 | +1/−5 | — |
| 2026-05-06 | #20593 | `feature/SUS-4242_Adicionar-ib-ao-saque` | 13 | +2470/−79 | — |
| 2026-06-03 | #20918 | `feature/FRONT-134_Adiciona-filtro-atualizado-pedidos` | 1 | +20/−16 | — |
| 2026-06-11 | #21007 | `bugfix/SUS-4794-voltando-para-o-perfil` | 1 | +3/−3 | SUS-4794 |
| 2026-06-26 | #21173 | `TIPL-154_Estornos-link-para-pedidos` | 5 | +109/−6 | — |
| 2026-06-30 | #21198 | `TIPL-152_Remover-validacao-ver-taxas` | 5 | +84/−15 | — |
| 2026-06-30 | #21197 | `bugfix/SUS-4457_GiftMax-dashboard-card` | 1 | +62/−26 | — |
| 2026-07-13 | #21279 | `feature/TIPL-148_Tela-paises` | 2 | +506/−8 | — |
| 2026-07-14 | #21318 | `feature/TIPL-167_Feature-flag-sites-filter` | 4 | +46/−10 | — |
| 2026-07-16 | #21346 | `feature/TIPL-173_Adiciona-pix-aprovacao-saque` | 1 | +200/−12 | — |
| 2026-07-30 | #21625 | `fix/Remove-mascara-pix-aprovacao-saque` | 1 | +53/−124 | — |

**appmax-client-vue3** — 6 PRs, +4.098/−311 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-04-30 | #1141 | `feature/SUS-4242_Adiciona-ib-ao-saque` | 5 | +732/−106 | — |
| 2026-05-06 | #1147 | `feature/SUS-4242_Adiciona-ib-ao-saque` | 12 | +1796/−170 | — |
| 2026-06-03 | #1227 | `feature/FRON-134_Adicionar-filtro-por-data` | 1 | +6/−3 | — |
| 2026-06-30 | #1300 | `feature/TIPL-151_Adicionar-redirecionamento-estorno` | 11 | +445/−26 | TIPL-149 |
| 2026-07-13 | #1313 | `feature/TIPL-148_Tela-paises` | 1 | +1072/−0 | — |
| 2026-07-14 | #1312 | `feature/TIPL-167_Feature-flag-sites-filter` | 1 | +47/−6 | — |

**max-backoffice-frontend** — 3 PRs, +1.206/−58 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-05-08 | #43 | `feature/MM20-30_Adicionar-menu` | 4 | +708/−34 | — |
| 2026-06-19 | #61 | `feature/FRONT-136-backoffice-cnpj-alphanumero` | 4 | +488/−16 | FRONT-136 |
| 2026-07-15 | #85 | `feat/Melhorias-SPI` | 2 | +10/−8 | — |

**appmax-frontend-monorepo** — 1 PRs, +589/−1 linhas

| Data | PR | Branch | Commits | Linhas | Ticket |
|---|---|---|--:|--:|---|
| 2026-03-13 | #49 | `feature/IB-3_Login-max` | 7 | +589/−1 | — |

---

## Limitações da coleta

Leia antes de comparar números entre pessoas — dois deles são artefato de coleta, não desempenho.

| # | Limitação | Efeito na avaliação |
|---|---|---|
| 1 | **`app-flutter` inacessível.** `git ls-remote` retorna *does not exist or you do not have access* — repo renomeado, movido de workspace ou acesso revogado. O clone local para em **24/06/2026**. | Todo o mobile de julho está fora. **O número de PRs do Diogo (4) não representa o trabalho dele** — o TapToPay (18 entregas Jira em jun/jul) não aparece em PR nenhum. Ian também está subcontado. |
| 2 | `appmax-frontend-admin` e `gateway-facial-sdk` também falharam no fetch (mesmo erro). | PRs nesses repos estão fora. |
| 3 | Só foram lidos os **16 repositórios clonados localmente**. O workspace `appmax-space` provavelmente tem mais. | PRs em repos não clonados estão fora, para todos. |
| 4 | O commit de merge do Bitbucket é autorado por **quem clicou em merge**, não pelo autor do PR. A autoria foi inferida pelo **autor dominante dos commits que o merge trouxe**. | Precisão alta: só 5 dos 229 PRs tiveram autoria ambígua (<60% dos commits de um autor). |
| 5 | PRs de integração (`develop`→`main` e similares, 1.325 no período) foram **excluídos**. | Evita creditar promoção de release como entrega própria. |
| 6 | **Contagem ≠ esforço.** Um ticket de suporte de 10 minutos e um épico de 3 semanas contam 1 cada. Épicos fechados pela pessoa também aparecem como linha. | Use as colunas de PR, commits e linhas como contrapeso ao número de entregas. |
| 7 | Das 362 entregas, só **25 têm PR rastreável** pela chave do ticket no nome da branch. | Não é falta de PR — é que boa parte das branches não referencia ticket. A coluna *PR* das tabelas fica `—` na maioria dos casos; use a seção *Evidência em código* de cada pessoa. |

### Ação de processo sugerida

Padronizar o nome da branch com a chave do Jira (`feature/ABC-123-descricao`). Felipe e Witerlland já fazem; Bruno, João e Ian usam nomes descritivos. Sem isso não há rastreabilidade automática ticket → código, e avaliações futuras continuam dependendo de inferência.

---

### Arquivos de apoio

| Arquivo | Conteúdo |
|---|---|
| `entregas-2026-H1-detalhe.md` | As 362 entregas agrupadas por pessoa → projeto → épico |
| `entregas-2026-H1.json` | Dados crus do Jira |
| `prs-2026-H1-detalhe.md` | Os 229 PRs por pessoa → repositório |
| `prs-2026-H1.json` | Os 2.961 PRs crus do período (inclui outros times e os de integração) |
