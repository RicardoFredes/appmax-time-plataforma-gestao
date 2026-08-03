# Entregas do 1º semestre de 2026 — Ricardo Fredes da Silveira

*Líder · Plataforma, Backoffice · `ricardo.silveira@appmax.com.br`*

**Documento separado por um motivo de método**: o perfil aqui não é comparável ao dos liderados. Além de
executar, ele refina o backlog, desenha as frentes que os outros executam e opera a promoção para produção.
Medir isso com a mesma régua de volume levaria à conclusão errada nos dois sentidos.

---

## Os números

**30 entregas** registradas no Jira como responsável · **176 issues criadas** (refino e desenho de frente),
das quais **123 já concluídas — 70% de conversão** · **50 PRs próprios** e **41 PRs de integração** ·
**1.431 commits diretos em 12 repositórios** · **+110.926/−89.289 linhas** · **PR mediano de 669 linhas**.

Duas leituras imediatas. A primeira: **é o maior volume individual de código do time**, com folga — mais
linhas movidas que qualquer liderado, enquanto lidera sete pessoas. A segunda: **as 30 entregas do Jira não
representam nem de longe o que ele fez**; é o caso mais extremo de trabalho não registrado do time inteiro.

Ritmo irregular e explicável: as entregas Jira concentram em março (10), abril (8) e julho (9), com maio e
junho quase vazios — período em que os PRs mostram que ele estava na migração do backoffice para React e na
validação de contas bancárias, trabalho que não virou ticket.

---

## As frentes que ele entregou

**Migração do site institucional para Astro · Boa — a entrega mais completa do semestre, de qualquer
pessoa.** Foi da POC em 27/04 ao cutover e go-live em 16/07, em doze subtarefas, e incluiu o que quase
nenhuma frente inclui: auditoria de Core Web Vitals, i18n, SEO, sitemap, mapa de redirects 301 do legado,
analytics com consentimento LGPD, formulários de captura sem backend, fontes self-hosted — e o
**decommission do site antigo**: desligar deploy, arquivar repositório, remover infra. **Nenhuma outra
frente do semestre tem o decommission fechado.** Normalmente o sistema velho fica ligado para sempre. O
código acompanha: a POC com +10.094/−3.563 linhas, a remoção do Alpine.js com +4.587/−4.454, sitemap e
correção de links quebrados.

**Migração do `max-backoffice-frontend` para React · Boa na consequência, com a pior ressalva deste
documento.** Ele fundou a base do backoffice novo — migração para React, o módulo de cabines, cartão de
crédito, pipelines na Cloudflare. É onde o Felipe depois entregou as treze integrações de chargeback e o
Bruno o extrato de transações; sem essa base, nenhuma das duas existiria. A ressalva é o **como**: a
migração saiu num único PR de 40 commits movendo **+31.887/−47.117 linhas**. É o PR mais irrevisável do
semestre, e ele mesmo o mergeou.

**Base do CRM · Boa, e quase invisível no registro.** Entre março e abril ele codou a fundação do CRM em
oito PRs somando cerca de 35.000 linhas: campanhas (três PRs), a parte 2, consistência de UI de clientes e
de resultados, integração WhatsApp, mudança de rotas. No Jira dele isso aparece como **um** item — o épico
de ajustes de menu. Ou seja: a frente que os documentos anteriores atribuem ao Bruno e ao Felipe tem
fundação dele, e o registro não mostra.

**Campanhas de Impulsionamento (CDI) · Boa, escopo fechado.** Sete frentes de frontend entregues e fechadas
em 31/03: upsell pós-compra em 1 click, recompra programada, campanha de reengajamento, Pix sem pagamento,
carrinho abandonado, vendas negadas e recuperação de chargeback.

**Validação de contas bancárias e saque · Boa, sem registro.** Oito PRs entre 08 e 12/05, atravessando
client e sistema: validação de conta, tratamento de pendências, contas de marketplace, modal de saque.
Nenhum ticket correspondente no Jira dele.

**Dívida técnica de frontend · Boa.** Migrou SCSS para Tailwind no client (+3.252/−3.486 — remoção da ordem
da adição, remoção real) e removeu o Alpine.js do site. Atualizou o PrimeVue no monorepo e evoluiu os
componentes compartilhados: card, filtro de data, checkbox de consentimento.

**Desbloqueio de infraestrutura · Boa.** Das dezessete solicitações de DevOps que abriu, quatorze foram
resolvidas: provisionamento de ambientes na Cloudflare Pages para três repositórios, correção da política
de cache do `index.html` no backoffice, hospedagem do site e do app, redirect do Help Center, acessos e VPN
para o time. É trabalho invisível que destrava outras pessoas.

**Ferramental interno · Boa, pontual.** Upload performático de vídeos e GIFs no Help Center, migração dos
assets da Cloudinary, embed do painel do time no backoffice, POC de frameworks Node.js, correção de erro
silencioso no import de squads e de CORS no upload.

**Sustentação (3 itens em março) · pontual.** Layout quebrado no admin, bug de clique no Safari iOS,
paginação de pedidos.

---

## O trabalho de liderança que não aparece como entrega

As **176 issues que ele criou** são a parte da função que nenhuma contagem de entrega captura. Distribuição:
101 no Time Plataforma, 22 no Backoffice, 17 em DevOps, 10 em TapToPay, 10 no CRM, 7 no Aplicativo, 7 em
Campanhas. Foram para 93 itens aos sete liderados, 27 para si, 24 sem responsável e cerca de 32 para gente
de fora do time. **70% já estão concluídas** — não é backlog decorativo.

E aqui está o achado que **muda a leitura dos outros documentos**: duas frentes que atribuí como mérito de
liderados foram desenhadas por ele.

O **Chargeback** — que creditei ao Felipe como "entrega ponta a ponta" — tem os tickets criados pelo
Ricardo: o épico de frontend, o padrão de roles e policies, o endpoint de timeline, e a estrutura toda do
BFF (criar repositório, boilerplate em Go, provisionar ambientes), além de ter delegado o lado de
integração com a Pomelo para fora do time. O Felipe executou muito bem uma frente que já vinha desenhada.

O **TapToPay** — que creditei ao Diogo como condução quase solo — tem o refino dele: a integração do SDK
com a Apple, as regras de estorno em D0 e fora do prazo, a estratégia de liberação parcial para demo, mais
a coordenação do lado sistema e do contrato de cálculo de taxas com outras duas pessoas. O mérito do Diogo
na cadeia de conformidade da Apple continua inteiro; o desenho da frente não era dele.

Isso não diminui ninguém — mas quem lê a avaliação dos dois precisa saber que a arquitetura veio daqui.

---

## Pontos de atenção

**Tamanho de lote é o problema técnico central, e é o dele.** O PR mediano é de **669 linhas — dois e meio
vezes o maior do time** (o Ian, com 261). E a migração para React moveu quase 80.000 linhas num PR só. Nos
documentos por colaborador eu apontei "tamanho de lote" como ponto a trabalhar do Bruno (144 commits), do
Ian (mediana 261) e do José (+12.841 num PR). **Ele é o caso extremo dos quatro.** O padrão que a
avaliação cobra do time é o que o líder menos pratica — e isso enfraquece a cobrança.

**Nenhum dos 50 PRs foi mergeado por outra pessoa.** Ele mesmo fechou 100% deles. Não afirmo que não houve
revisão — a aprovação pode estar registrada no Bitbucket fora do commit, e não tenho acesso à API para
verificar. Mas o dado bruto, combinado com PRs de dezenas de milhares de linhas, é o risco técnico mais
concreto deste documento. Vale checar a política de aprovação obrigatória nos repositórios que ele toca.

**Concentração operacional.** São 41 PRs de integração — a promoção de `develop` para `main` — em cinco
repositórios, mais 1.431 commits espalhados por doze. Ele é dependência ativa em boa parte da malha. Se
parar, a promoção para produção para com ele.

**O tempo de liderança está sendo consumido por execução.** Ser o maior contribuidor individual de código
enquanto lidera sete pessoas tem os dois lados: mantém a mão e desbloqueia o time rápido, mas os meses de
maio e junho — em que as entregas registradas caíram para 1 e 2 — são exatamente os meses em que ele estava
mergulhado na migração para React. Vale perguntar o que deixou de acontecer nesses dois meses do lado de
gente.

**Rastreabilidade.** Trinta itens registrados contra 50 PRs e 1.431 commits. A fundação do CRM, a migração
para React e a validação de contas bancárias não têm ticket. É o mesmo problema que os documentos apontam
no Bruno, no João e no Ian — em escala maior.

**Um dado sobre alocação, não sobre ele mesmo.** O Ian recebeu apenas **4** issues criadas por ele no
semestre, contra 21 do Felipe e 17 do Witerlland. Isso confirma o diagnóstico do panorama: o Ian não é
alimentado pelo líder, é alimentado pela fila de suporte. O dado mostra que a situação atravessou seis meses
sem ser endereçada.

---

## Leitura do semestre

Entregou a frente mais bem-acabada do período — a migração do site, com decommission incluído, coisa que
ninguém mais fez — e fundou as duas bases sobre as quais o time construiu no semestre: o backoffice em
React e o CRM. Como líder, converteu 70% de 176 refinamentos em entrega concluída e desenhou as duas
frentes mais complexas do time, Chargeback e TapToPay.

O contrapeso é honesto e é um só, em três formas: **ele opera como o engenheiro mais produtivo do time em
vez de como o líder dele**. Daí saem o PR de 80.000 linhas, o merge sem revisão de terceiro, a dependência
em doze repositórios, os dois meses de maio e junho sem entrega registrada, e o Ian seis meses numa fila
reativa sem que a alocação fosse mudada. Nenhum desses é problema de capacidade técnica — todos são de
alocação da própria atenção.

---

## Apêndice — evidência

**As 30 entregas registradas no Jira.** Time Plataforma (17): a migração do site em doze subtarefas, o
upload de vídeos no Help Center, a migração de assets da Cloudinary e o item-pai da migração. Campanhas de
Impulsionamento (7): as sete frentes de frontend fechadas em 31/03. Sustentação (3): layout do admin,
Safari iOS, paginação de pedidos. Backoffice (1): criação do repositório do BFF. CRM (1): épico de ajustes
de menu. Engenharia de Software (1): POC de frameworks Node.js.

**Os 50 PRs próprios**, por repositório: `appmax-client-vue3` 22 · `sistema` 10 · `appmax-site-frontend` 6 ·
`appmax-frontend-monorepo` 4 · `max-backoffice-frontend` 4 · `appmax-backoffice-frontend` 3 ·
`appmax-frontend-admin` 1.

**Os maiores**, em linhas movidas: `feature/react-migration` (+31.887/−47.117) · `poc/astro`
(+10.094/−3.563) · `feature/crm-part-2` (+5.832/−13.390) · `feature/crm-campaign` (+5.978/−95) ·
`refactor/crm-customers-ui-consistency` (+5.874/−1.401) · `feature/crm-campaign` (+4.724/−634) ·
`refactor/remove-alpinejs` (+4.587/−4.454) · `feature/crm-campaign` (+4.473/−75) ·
`feature/refactor/crm-results-ui-consistence` (+4.314/−6.492) · `feature/CRM-campaign-part-2`
(+4.011/−2.791) · `feature/change-scss-to-tailwind` (+3.252/−3.486).

**Commits diretos por repositório**: `appmax-client-vue3` 430 · `appmax-site-frontend` 200 ·
`appmax-app-frontend` 189 · `appmax-backoffice-frontend` 178 · `max-backoffice-frontend` 166 ·
`appmax-frontend-admin` 143 · `appmax-frontend-monorepo` 57 · `sistema` 55 · `app-flutter` 4 ·
`appmax-biometric-frontend` 3 · `banking-router` 3 · `frontend-otel-gateway` 3.

**Nota de método.** Ele commita com duas identidades — `ricardofredes@gmail.com` (1.385 commits) e
`ricardo.silveira@appmax.com.br` (46) — e as duas foram somadas. Ficaram **de fora** os commits sob
`maxter@ip-*` e `maxter@Appmax-*`: são de dev box compartilhada e aparecem também com nome de outras
pessoas, então atribuí-los seria erro. Como todos, é afetado pelo repositório `app-flutter` inacessível,
mas com impacto marginal — só 4 commits dele lá.
