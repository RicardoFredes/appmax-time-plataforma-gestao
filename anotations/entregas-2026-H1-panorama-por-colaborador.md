# Panorama das entregas por colaborador — 1º semestre de 2026

**Base do julgamento.** Cada veredito se apoia em coisas verificáveis: se a frente (épico) chegou a `Done`
e quantos itens ficaram abertos nela; se existe PR correspondente; e se há sinal de retrabalho (revert,
sequência de correções, item fechado como despriorizado ou "WIP"). **O que não consigo julgar**: impacto em
produto, métrica de performance antes/depois, incidente pós-deploy e satisfação de quem pediu.

**Uma distinção que importa.** Aqui o veredito é sobre **a contribuição da pessoa**, não sobre o destino do
projeto. Onde um projeto falhou por desenho ou por dependência de terceiros, isso está dito — e não é
cobrado de quem executou.

Ordem alfabética, deliberadamente: a sequência não é ranking.

---

## Bruno Schneider

*49 entregas · 56 PRs em 4 repositórios · +31.005/−3.606 linhas · mediana de 100 linhas por PR*

**CRM (23 entregas) · Boa.** É dono da frente e ela fechou inteira: os seis épicos tocados chegaram a
`Done`, e foi ele quem fechou o ticket explícito de "Publicar em Produção" em 09/06 — poucas frentes do
semestre têm esse marco registrado. Tabela de estratégias, componente de Resultados, modais de
ativação/desativação, oportunidades, seção de clientes, Equipe Parceiro com permissões e auditoria: layout
e integração, com 30 PRs de contrapartida. **Ressalva real e atribuível a ele**: entre maio e junho há uma
dúzia de PRs em sequência de `fix/ajustes-*` — cupons, contratos, UX, templates de WhatsApp, sidebar,
paginação, integrações. O retrabalho foi absorvido no mesmo ciclo, mas o volume aponta que ele começa a
codar com o refinamento ainda aberto.

**Backoffice — extrato de transações (6 entregas) · Boa.** O mérito específico é raro: fez a entrega
**ponta a ponta atravessando linguagem e camada** — backend em Go no `banking-router` e frontend no
`max-backoffice-frontend`. Depois estendeu com filtro por identificador Pix, campo de comentários (+1.166),
card de chaves Pix e extração de comprovantes. Ressalva: precisou de revert em 12/06 antes de sair numa v2
em 23/06.

**Onboarding Unificado (9 entregas) · Parcial — construído, não entregue.** Migrou o frontend do onboarding
e fechou as subtarefas de frontend das frentes antigas: Celcoin → SDK Unico, CEP via BrasilAPI, envio ao
Hubspot, termos, modal de "já pode começar a vender". Não chamo de boa por dois motivos: a frente de
"Deploy em Produção" segue com 12 itens abertos (isso não é só dele), e o trabalho saiu num **PR de 144
commits e +14.497 linhas**, seguido de dois hotfixes de redirect logo depois do merge — PR monolítico
desse tamanho é irrevisável e o retrabalho imediato é o sintoma.

**Time Plataforma (5 entregas) · Boa, escopo curto.** Fingerprint no checkout, nova estrutura JSON de
feature flags (+479), máscara de CNPJ no split — sua parte da entrega coordenada de CNPJ alfanumérico.

**Canais & Integrações (2), Sustentação (2), Antecipação (1), Suporte (1) · pontuais.** A validação facial
(CEID) entrou em 24/07, cedo para julgar.

**Leitura.** O ponto forte é ownership real de full-stack — é o único, junto com o Felipe, que atravessa Go
e Vue na mesma entrega. Os dois pontos a trabalhar são do mesmo tipo: **tamanho de lote**. PRs de 144
commits e a fila de `fix/ajustes-*` no CRM apontam para começar antes de fechar o escopo e entregar em
blocos grandes demais para revisão.

---

## Diogo Januário

*38 entregas · 4 PRs visíveis (subcontado — ver nota final) · contextos: Aplicativo*

**TapToPay (18 entregas) · Boa.** O difícil dessa entrega não era código, era a cadeia de conformidade da
Apple, e é exatamente aí que ele entregou: entitlement, capability no App Store Connect, provisioning
profile regenerado, tela obrigatória de Cardholder Education, seller de staging, conta sandbox, validação
via TestFlight e, no fim, a submissão para review em 31/07 com vídeos e *notes for reviewer*. Levou isso
**praticamente sozinho**. Duas ressalvas que não são demérito: o desfecho depende da Apple, com 6 itens
ainda abertos; e ele não tem par na frente, o que é risco de concentração numa coisa entrando em produção
agora.

**Aplicativo MAX — ferramental e segurança (15 entregas) · Boa.** É a contribuição menos visível e mais
estrutural do semestre. Levou o **Shorebird** de RFC a produção **nos dois apps** (épico fechado em 19/03)
e o **Maestro** de zero a implantado com planejamento de cobertura por área (épico fechado em 24/03).
Somou deeplinks para as rotas principais, detecção e bloqueio de serviços de acessibilidade suspeitos no
fluxo Pix, certificados do Max e a análise de módulo compartilhado entre Max e Appmax. Trabalho de
habilitação: não aparece em roadmap de produto e muda a velocidade de todo mundo depois.

**Pontuais (5 entregas) · sem veredito.** NPS do aplicativo, select de empresa no Link de Pagamentos,
flags do PixTransferState, seletor de empresas no app.

**Leitura.** Perfil claro de **engenharia de plataforma mobile** — tooling, segurança e habilitação — e é
o único do time nesse papel. É também o caso onde os números enganam mais: os 4 PRs visíveis cobrem só
fevereiro a abril, porque o repositório do app está inacessível. **Não use volume de código para avaliá-lo
neste ciclo.** O ponto a trabalhar é consequência do acerto: formar par no TapToPay antes de a frente
entrar em produção.

---

## Felipe Carvalho

*73 entregas · 36 PRs em 4 repositórios · +13.979/−6.215 linhas · mediana de 132 linhas por PR*

**Dívida técnica de frontend (18 entregas em TIPL) · Boa — o melhor caso do semestre.** Removeu o
`ds-appmax-v3` e o Vuetify do client Vue 3, módulo a módulo, e os dois épicos fecharam em 27/05
**incluindo o ticket de cleanup final** — ou seja, a dependência saiu do projeto, não foi só abandonada.
Isso quase nunca acontece nesse tipo de trabalho, e o PR confirma: +3.051/−3.970, remoção da ordem da
adição. Somou a migração da tela de Tickets (+2.767) e as demos de Link e Split de pagamentos.

**Backoffice — Chargeback (21 entregas) · Boa.** O épico de frontend fechou em 02/07, e a entrega tem as
três camadas certas: 13 integrações de frontend, 5 endpoints de BFF e o **padrão de roles e policies com
Casbin** no `banking-router` (+2.402), incluindo reload pull-based. Ressalva de contagem, não de execução:
o item "Adicionar nota interna" foi fechado como `Done` carregando `[DESPRIORIZADO]` no título —
despriorizar não é entregar.

**Sustentação (12 entregas) · Boa na execução, neutra no resultado.** Foi o maior contribuidor de
sustentação de Plataforma no período, e o mérito é a **rastreabilidade**: todo item tem PR nomeando o
ticket (`bugfix/SUS-5212-...`, `feature/SUS-4992-...`), o que torna o trabalho auditável. O que impede
veredito melhor não é ele: a fila tem 212 abertos e não há como afirmar que encolheu.

**Onboarding White Label (10 entregas) · Parcial — construído, não entregue.** Construiu o branding
completo: endpoint público, plugin no design system, aplicação pós-login e no onboarding. Mas a frente de
deploy tem 12 abertos e a de homologação ponta a ponta tem 7 — não chegou ao usuário. A parte dele está
feita; a entrega não.

**CRM (9) · Boa, escopo curto.** Página de Resultado e de Clientes: filtro de loja e data, seção de
oportunidades, gráficos genéricos e de TPV por dia da semana — layout e integração.

**Antecipação (2), Cadastro de Empresa (1) · pontuais.**

**Leitura.** A maior amplitude do time — sete projetos — sem que a qualidade caísse, e a **melhor
rastreabilidade**: quase todo PR nomeia o ticket, o que é o oposto do padrão do time. É também quem tirou
a dívida técnica do papel. O ponto a observar não é desempenho, é risco: **é o único dono do Chargeback**.

---

## Ian Oliveira

*122 entregas · 40 PRs em 2 repositórios · +33.651/−4.295 linhas · mediana de 261 linhas por PR*

**Aplicativo MAX (41 entregas) · Boa.** Cobre a feature dos dois lados — Flutter no app e o backend em Go
no `banking-router` — e isso apareceu com força em julho: enriquecimento do `/auth/me` com DDA e dados da
conta, QR Code Pix estático de recebimento, endpoint de dados cadastrais, exposição do motivo de bloqueio.
Todos esses PRs **nomeiam o ticket** (`feature/PLCTV-266-pix-receive-qrcode`), então essa metade do
trabalho dele é rastreável. Somou a observabilidade do app: dashboards e alertas de autenticação e de
saldo no BigQuery, Crashlytics, tagueamento das rotinas críticas do Pix, e a POC antiroot da AppDome.
**Ressalvas atribuíveis a ele**: fechou quatro itens marcados `[WIP Design]` — área de notificações,
ícones de comprovante, onboarding de "Minhas chaves" e Pix + Boleto agendado — e as branches dele no app
não referenciam ticket (`med`, `credit_card`, `cache_home`), o que torna essa metade não rastreável.

**MED 2.0 — mobile (18 entregas) · Boa.** Três sub-frentes fecharam com zero aberto (Extrato,
Detalhamento, Devolução) e o código é robusto: o PR do MED sozinho tem +9.363 linhas, mais +4.023 de
melhorias, +1.868 no cancelamento e +1.649 nas notificações. A assimetria que restou — app pronto e
front-end do backoffice ainda aberto — não é da parte dele.

**Bugs e Dívidas — performance mobile (20 entregas) · Boa.** O épico `mobile` fechou inteiro em 16/04 e as
correções são concretas e bem escolhidas, não cosméticas: chave RSA parseada a cada request, SecureStorage
lido a cada request, Firebase bloqueando o primeiro frame, cache do Firestore sem limite, pré-carregamento
no splash, skeleton no saldo. É dívida que raramente é priorizada. **Ressalva de evidência**: não há
medição antes/depois registrada — posso confirmar que as mudanças foram feitas, não que o app ficou mais
rápido.

**Max - Suporte (41 entregas) · A execução foi consistente; o resultado não.** Absorveu 41 tickets e o
problema não diminuiu: o épico "Acesso" segue em `To Do` com 5 abertos, e falhas de login e validação
facial reaparecem sem interrupção de fevereiro a julho. Há tickets idênticos fechados em série — três com
o mesmo título sobre a instabilidade de 11/04, dois iguais sobre validação facial em 03/07, dois iguais
sobre suspensão indevida em 27/07. **A falha aqui é de desenho, não dele**: ninguém resolve recorrência
atendendo fila. O ponto que **é** dele, e é de senioridade: viu o mesmo padrão dezenas de vezes ao longo
de seis meses e não o transformou em diagnóstico de causa raiz nem escalou como projeto.

**Time Plataforma (1), Área Pix Regulatório (1) · pontuais.**

**Leitura.** Maior volume de código do time e a maior amplitude técnica real — Flutter e Go na mesma
feature. Dois pontos a trabalhar: **tamanho de PR** (mediana de 261 linhas, a maior do time, com PRs de
+9.363 — risco de revisão) e **rastreabilidade no app**, onde as branches não citam ticket. E um ponto que
é meu, não dele: **metade da capacidade dele está numa fila reativa** — isso é decisão de alocação a
rever.

---

## João Justo

*29 entregas · 50 PRs em 4 repositórios · +17.458/−5.336 linhas · mediana de 74 linhas por PR*

**Atenção antes de ler: ele tem mais PRs (50) do que entregas no Jira (29).** Avaliá-lo pelo Jira o
subestima — boa parte do trabalho dele não está registrada como ticket.

**Internet Banking (4 entregas no Jira, muito mais em código) · Boa.** O sinal mais forte é do projeto
inteiro: **o IB tem só 6 itens abertos no total**, o menor backlog de todos — a frente convergiu. A parte
dele: o IB no client Vue 3 num PR de 111 commits e +10.199 linhas, o fluxo de limites de transação, o
CSP/Crypto no client (épico fechado com zero aberto), DDA com role e user, batch de usuários, ambiente de
HML e QR Code na etapa de autenticação.

**Giftmax / Cashback · Boa, mas quase invisível no Jira.** O projeto GIF está com **zero itens abertos** e
a renomeação Giftmax → Cashback Max saiu. O trabalho real, porém, está em **onze PRs no `sistema`** —
permissão de menu, lógica de status, cálculo de taxas, notificações no momento certo, web-scraping de
site, feature flags — quase todos como `hotfix/*`. Ele estabilizou a frente; o registro não mostra isso.
Ressalva sobre a frente, não sobre ele: quatro bugs de cashback no semestre (duplicidade, valor de estorno
divergente) indicam que ela cobra correção contínua.

**Fallback Pix na recuperação de vendas · Boa, sem ticket.** Seis PRs em junho, incluindo a decisão na mão
do lojista e as flags de liberação. Evidência só em código — não achei ticket correspondente.

**Contas-Ledger-Caixinhas (8 entregas) · Boa no papel, não verificável.** O épico de integração do
front-end do Backoffice fechou em 21/07. Mas as sete subtarefas foram **todas fechadas no mesmo dia**,
18/07, e **não encontrei PR correspondente** nos repositórios que consigo ler. Pode ser trabalho num repo
que não tenho, pode ser ticket marcado retroativamente. Não afirmo qual — só que não consigo confirmar, e
isso vale conversar com ele.

**Sustentação (8 entregas) · Neutra.** Cashback e acessos, dentro da fila contínua.

**Time Plataforma (4) · Boa.** Sua parte do CNPJ alfanumérico, no sistema e no client Vue 3. **Backoffice
(1) · Boa, pequena**: bloqueio e desbloqueio judicial de chaves Pix (+810/−86).

**Leitura.** Perfil de **estabilizador**: PRs pequenos e frequentes (mediana de 74 linhas, a menor do
time) e peso alto de hotfix. Entregou a frente que mais convergiu no semestre. Dois pontos a trabalhar:
**registro** — o Jira não reflete o que ele faz, e num ciclo de avaliação isso o prejudica; e o
**fechamento em lote** do MIR, que precisa de explicação.

---

## José Chagury

*17 entregas · 22 PRs em 5 repositórios · entrou na fila em 26/05 — os números cobrem ~2 meses*

**Time Plataforma (14 entregas) · Boa, considerando a janela.** O caso mais completo é o **módulo de
banners**: backend, endpoint público de consulta, gestão no admin interno e consumo dinâmico no client —
frente inteira, das quatro pontas, fechada em 05/06. Somou o NPS no sistema e no client, invalidação de
cache do Cloudflare Worker ao publicar artigo no Help Center, atualização dos termos de uso do site,
colunas novas no export do relatório de pedidos, a reorganização da página de configurações (+733) e o
início da plataforma de envios ao BACEN.

**Canais & Integrações — validação facial (3 entregas) · Cedo para julgar, evidência forte.** A frente
está `In Progress` com 5 abertos. Mas o que ele já pôs de pé é o **maior PR isolado do semestre**: a
refatoração do `appmax-biometric-frontend` para React, +12.841/−5.002 linhas, mais os módulos componíveis
de captura e as melhorias de design. **Ressalva de risco, não de mérito**: uma reescrita desse tamanho num
único PR é praticamente irrevisável — o próximo desse tipo deve ser fatiado.

**Leitura.** Ramp-up rápido: **cinco repositórios em dois meses**, com uma frente completa de quatro
camadas entregue. É o perfil de quem atende solicitações internas e não trava. Duas ressalvas de método:
a base de comparação é curta — não o compare em volume com quem teve seis meses — e o hábito de PR
gigante precisa ser endereçado antes de virar padrão.

---

## Witerlland Silva

*34 entregas · 21 PRs em 4 repositórios · +9.447/−674 linhas · mediana de 177 linhas por PR*

**Melhorias CS (13 entregas em TIPL) · Boa.** É dono da frente e ela tem a característica mais difícil de
achar: **entregas que quem usa sente no dia seguinte**. Filtro por empresa e por data na tela de pedidos,
países atendidos (+1.578 em dois repos), motivo de recusa bancária exibido em notificação, "Ver taxas" em
todos os status, estornos movidos para a tab principal, número do pedido clicável, feature flag do filtro
de sites, chave Pix na aprovação de saque, e o inventário completo dos templates de e-mail para revisão.
Ressalva: o épico segue em `Backlog` com 12 abertos — a frente é maior do que o entregue.

**Internet Banking (5 entregas) · Boa.** Contribuiu para o projeto que mais convergiu (6 abertos no
total): filtragem de ActionTypes no Message Router com épico fechado a zero, modal e flows no chat,
melhorias de usabilidade e o controle de sessão e single tab. Também o login do Max no monorepo.

**Sustentação — IB no saque (5 entregas) · Boa.** O SUS-4242 é a entrega dele mais substancial:
**atravessou três repositórios** (sistema, client Vue 3, backoffice) somando cerca de 5.000 linhas. Somou
alteração na criação do token JWT, painel TPV e ajuste na dashboard do GiftMax.

**CRM (5 entregas) · Boa, escopo curto.** A integração **WhatsApp Business** — componente inicial e tela
de conectado com a Meta — com épico fechado em 19/03, mais a página de detalhes da estratégia.

**MED 2.0 — backoffice (2 entregas) · Parcial.** Alterou o visual do backoffice e definiu os contratos dos
serviços da API. Essa é justamente a ponta que ficou aberta do MED: a frente segue `In Progress` com 5
itens. O app está pronto e o backoffice não — a parte que falta é esta.

**Recuperação de Carrinho (2) · pequena, entregue.** **Engenharia de Software (2) · exploratório**: POC de
page builder e mapeamento de rotas para JWT, sem entrega fechada para julgar.

**Leitura.** Boa rastreabilidade — quase todo PR nomeia o ticket, junto com o Felipe é o padrão que o
resto do time deveria seguir. O perfil é de melhoria incremental próxima do usuário interno, e o
`SUS-4242` mostra que ele dá conta de entrega multi-repositório. Dois pontos: a relação **+9.447/−674** é
quase pura adição, com pouca evidência de refactor ou remoção de dívida — vale exposição a esse tipo de
trabalho; e a ponta do MED no backoffice está aberta sob o nome dele.

---

## Nota sobre o que falta

O repositório `app-flutter` está inacessível (`does not exist or you do not have access`) e o clone local
para em 24/06 — então os vereditos das frentes mobile de julho se apoiam só no Jira, sem contrapartida de
código. **Isso afeta principalmente Diogo e Ian**, e no caso do Diogo torna o volume de PR inutilizável
para avaliação. Com um API token do Bitbucket eu fecho o furo e reviso o que for afetado.
