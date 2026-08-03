# Panorama das entregas por projeto — 1º semestre de 2026

**Base do julgamento.** Cada veredito abaixo se apoia em três coisas verificáveis: se as frentes (épicos)
do projeto chegaram a `Done` e quantos itens ficaram abertos nelas; se existe código correspondente nos
PRs mergeados; e se há sinais de retrabalho (reverts, sequências de correção, itens fechados como
"despriorizado" ou "WIP"). **O que não consigo julgar**: impacto em produto, métrica de performance
antes/depois, volume de incidente pós-deploy e satisfação de quem pediu. Onde o veredito depende disso,
está dito.

---

**Time Plataforma (TIPL) — 56 entregas · Boa.** É a frente melhor evidenciada do semestre. Os dois épicos
de dívida técnica fecharam de verdade em 27/05, incluindo o ticket de *cleanup* final — remover a
dependência, não só parar de usá-la, o que quase nunca acontece nesse tipo de trabalho (Felipe). O CNPJ
alfanumérico fechou em 01/07 coordenado em quatro bases ao mesmo tempo: sistema, client Vue 3, backoffice
e mobile (João, Witerlland, Bruno, Ian). E o módulo de banners saiu completo — backend, endpoint público,
gestão no admin e consumo no client (José). Ressalva de higiene, não de entrega: o épico de NPS está sem
nenhum filho aberto mas continua parado em "Selected for Development".

**CRM — 37 entregas · Boa.** É o único projeto onde *todos* os épicos tocados chegaram a `Done`, e onde
existe um ticket explícito de "Publicar em Produção" fechado (09/06). Página de Resultado, Página de
Clientes, Detalhe da Estratégia, Perfil do Cliente, ajustes de menu e integração WhatsApp Business:
seis épicos, seis fechados (Bruno, Felipe, Witerlland). Ressalva real: entre maio e junho há uma dúzia de
PRs de `fix/ajustes-*` em sequência — cupons, contratos, UX, templates, sidebar, paginação. O retrabalho
foi absorvido dentro do mesmo ciclo, mas o volume dele aponta refinamento fraco antes de codar.

**Aplicativo MAX (PLCTV) — 56 entregas · Boa, com ressalva.** Extrato + Contestação + Devolução fechou
(16/07) e o ferramental do app fechou junto: Shorebird em produção nos dois apps e Maestro implantado
(Diogo). Há código pesado por trás — o PR do MED sozinho tem +9.363 linhas (Ian). A ressalva é de
processo: quatro itens foram fechados como `[WIP Design]` — área de gestão de notificações, ícones de
comprovante, onboarding de "Minhas chaves" e Pix + Boleto agendado. Fechar entrega cujo design ainda está
em andamento infla a contagem e cria retrabalho depois.

**Max - Suporte (MAXS) — 44 entregas · Não foi boa.** E a ressalva aqui é do projeto, não de quem
executou. Foram 44 tickets absorvidos, 41 deles pelo Ian, e o problema não diminuiu: o épico "Acesso"
segue em `To Do` com 5 itens abertos, "Pix" com 18, "Onboarding" com 8, "Conta" com 4 — 43 abertos no
projeto. Pior, há tickets idênticos sendo fechados repetidamente: três com o mesmo título sobre falha de
login depois da instabilidade de 11/04, dois iguais sobre validação facial em 03/07, dois iguais sobre
suspensão indevida de conta em 27/07. Isso é vazão de fila, não resolução. Falhas de login e validação
facial reaparecem de fevereiro a julho sem interrupção — precisa virar projeto com causa raiz, não
continuar como atendimento.

**Sustentação (SUS) — 28 entregas · Neutra, sem como chamar de boa.** Sustentação é fila contínua, então
"fechou" não é o critério. O que dá para elogiar é a rastreabilidade: praticamente todo item de
sustentação tem PR nomeando o ticket (`bugfix/SUS-5212-...`, `feature/SUS-4992-...`), o que torna o
trabalho auditável — mérito principalmente do Felipe e do Witerlland. O que impede o veredito positivo é
a escala do que sobrou: 212 itens abertos no projeto, com 23 na frente de Plataforma, 19 em Integrações e
15 em Exploração de melhorias. Não tenho série histórica para afirmar se o backlog cresceu ou encolheu —
só que ele é grande.

**Backoffice (BAC) — 28 entregas · Boa.** O épico de frontend do Chargeback fechou em 02/07 com as onze
integrações mais testes, e tem contrapartida em código nos três lugares certos: frontend, BFF e o padrão
de roles/policies com Casbin no `banking-router` (+2.402 linhas, Felipe). Duas ressalvas honestas: o item
"Adicionar nota interna" foi fechado como `Done` carregando `[DESPRIORIZADO]` no título — despriorizar não
é entregar, e contaminou a contagem; e o extrato de transações precisou de revert em 12/06 antes de sair
numa v2 em 23/06 (Bruno).

**Max - Bugs e Dívidas (BEMM) — 21 entregas · Boa.** O épico `mobile` fechou inteiro em 16/04 e as
correções são concretas e bem escolhidas, não cosméticas: chave RSA sendo parseada a cada request,
SecureStorage lido a cada request, Firebase bloqueando o primeiro frame, cache do Firestore sem limite,
pré-carregamento no splash (Ian). É o tipo de dívida que raramente é priorizada. **A ressalva é o que me
falta**: não há nenhuma medição antes/depois registrada, então posso confirmar que as mudanças foram
feitas, não que o app ficou mais rápido. O épico de performance segue `In Progress` com 3 abertos.

**MED 2.0 (MM20) — 20 entregas · Boa, com assimetria.** Três sub-frentes fecharam com zero aberto —
Extrato no App, Detalhamento e Devolução — e há código robusto por trás (Ian). O problema é que a entrega
saiu torta em relação ao produto: o app está pronto e o **front-end do Backoffice segue `In Progress` com
5 itens abertos**. Feature de MED sem a ponta do backoffice significa que a operação interna não consegue
tratar o que o cliente abre pelo app.

**Melhorias e Performance / TapToPay (SEP) — 18 entregas · Boa.** Mérito específico: o difícil dessa
entrega não era código, era a cadeia de conformidade da Apple — entitlement, capability no App Store
Connect, provisioning profile regenerado, tela obrigatória de Cardholder Education, conta sandbox, vídeos
e *notes for reviewer*. Diogo levou tudo isso até a submissão para review em 31/07, praticamente sozinho.
Duas ressalvas: o desfecho depende da Apple, com 6 itens ainda abertos; e ele não tem par nessa frente,
o que é risco de concentração numa coisa que está entrando em produção agora. Não consigo medir o volume
de código dele porque o repositório do app está inacessível (ver nota final).

**Onboarding Unificado (OU) — 19 entregas · Parcial, não dá para chamar de boa ainda.** O White Label foi
construído — endpoint público de branding, plugin no design system, aplicação pós-login e no onboarding
(Felipe) — e o frontend do onboarding foi migrado num PR grande (144 commits, +14.497 linhas, Bruno). Mas
a frente **"Deploy em Produção" tem 12 itens abertos e "Homologar ponta a ponta" tem 7**: foi construído,
não foi entregue ao usuário. Reforça o diagnóstico o fato de terem sido necessários dois hotfixes de
redirect em 24/06, logo após o merge.

**Internet Banking (IB) — 9 entregas · Boa.** O sinal mais forte é o mais simples: o projeto tem só **6
itens abertos no total**, o menor backlog de todos — ele convergiu. As duas frentes de segurança fecharam
com zero aberto: CSP/Crypto/BFF (João) e filtragem de ActionTypes no Message Router (Witerlland). E há
código à altura, com o IB no client Vue 3 somando 111 commits e +10.199 linhas.

**Contas-Ledger-Caixinhas (MIR) — 8 entregas · Boa no papel, não verificável.** O épico de integração do
front-end do Backoffice fechou em 21/07 (João). Mas as sete subtarefas foram todas fechadas no mesmo dia,
18/07, e **não encontrei nenhum PR correspondente nos repositórios que consegui ler**. Fechamento em lote
sem contrapartida de código visível pode ser trabalho real num repo que não tenho, ou pode ser ticket
marcado retroativamente. Não afirmo qual — só que não consigo confirmar.

**Canais & Integrações (CEID) — 5 entregas · Cedo para julgar.** A frente de validação facial está
`In Progress` com 5 abertos e o projeto tem 161 itens abertos. O que já existe é substancial: a
refatoração do `appmax-biometric-frontend` para React (José) é o maior PR isolado do semestre,
+12.841/−5.002 linhas. Ressalva de risco, não de mérito: uma reescrita desse tamanho num único PR é
praticamente irrevisável — o próximo desse tipo deveria ser fatiado.

**Antecipação por Pedido (AN) — 3 entregas · Boa, pequena.** Frente de ativação no System fechada com
zero aberto: tela de ativação, menu e descrição de taxas na visão do parceiro (Felipe, Bruno). Escopo
curto, entregue e encerrado.

**Giftmax (GIF) — 2 entregas · Boa, com ressalva de registro.** O projeto está com **zero itens abertos** e
a renomeação Giftmax → Cashback Max saiu (João). A ressalva é que o Jira subestima muito essa frente: o
trabalho real do semestre em Giftmax/cashback está em onze PRs no `sistema` — permissão de menu, status,
cálculo de taxas, notificações, web-scraping de site, feature flags — quase todos como `hotfix/*`. Ou
seja: a frente cobrou correção contínua, e isso não aparece na contagem de entregas dele.

**Engenharia de Software (ES) — 2 entregas · Exploratório, sem veredito.** POC de page builder e mapeamento
de rotas para autenticação JWT (Witerlland). São itens de investigação, com 138 abertos no projeto — não
há entrega fechada para julgar.

**Recuperação de Carrinho Recompra (RDCR) — 2 entregas · Pequena, entregue.** Ajustes no admin para
cobrança do serviço e um filtro novo na tela de pedidos (Witerlland).

**Pontuais — 4 entregas, uma cada · Sem veredito.** Max (MAX), Jornada Inicial (JIMEA), Cadastro de
Empresa (CDE) e Área Pix Regulatório (APR) tiveram um item cada. Volume insuficiente para avaliar
qualidade de entrega; servem só para mostrar dispersão de contexto.

---

## O que o panorama diz no agregado

Cinco projetos fecharam bem e com prova em código: **TIPL, CRM, BAC, IB e BEMM**. Dois foram construídos
mas **não chegaram ao usuário** — Onboarding Unificado, travado em deploy e homologação, e MED 2.0, com o
app pronto e o backoffice aberto. Um está **em falha declarada**: Max - Suporte, onde a fila é atendida e
o problema não diminui.

O padrão mais forte do semestre não é uma feature, é o **ataque à dívida técnica**: Vuetify e
`ds-appmax-v3` removidos com cleanup, performance mobile endereçada em 12 pontos concretos, Shorebird e
Maestro implantados, refatoração do biometric para React. Isso não aparece em roadmap de produto e é o que
mais reduz custo futuro — vale nomear na avaliação.

O padrão mais fraco é **fechar item sem entregar**: quatro `[WIP Design]` no app, um `[DESPRIORIZADO]` no
backoffice, sete subtarefas fechadas em lote sem PR no MIR, tickets duplicados fechados em série no MAXS.
Nada disso é má-fé, mas contamina exatamente o número que se usa para avaliar pessoas.

---

**Nota sobre o que falta.** O repositório `app-flutter` está inacessível (`does not exist or you do not
have access`) e o clone local para em 24/06 — então o julgamento das frentes mobile de julho se apoia só
no Jira, sem contrapartida de código. Isso afeta principalmente TapToPay e Aplicativo MAX. Com um API
token do Bitbucket eu fecho esse furo e reviso os vereditos afetados.
