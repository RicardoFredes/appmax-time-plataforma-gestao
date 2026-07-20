# Modelagem relacional dos Projetos (proposta)

> **Estado atual:** os projetos **não** estão em banco. A fonte é
> `src/features/projetos/projetos.json`, editada à mão e bundlada no build (ver
> [frontend.md](frontend.md) e o bloco *Projetos* do `CLAUDE.md`). Este documento é o
> esquema **proposto** para migrar esses dados a um banco relacional, caso o controle
> saia do JSON. As tabelas espelham 1:1 o contrato de `src/features/projetos/types.ts`.

## Visão geral

```
engenheiros ──1:N──> projetos ──1:N──> registros_semanais
                        │
                        └── status, prioridade, quarter
```

Duas entidades e uma tabela de histórico:

- **`engenheiros`** — o par `engenheiroEmail`/`engenheiroNome` se repete entre projetos;
  vira tabela própria com o e-mail como identidade (o mesmo critério do resto do painel:
  *time casado por e-mail*).
- **`projetos`** — os campos de topo de cada `Projeto`.
- **`registros_semanais`** — o array `registros[]` embutido, virado filhos 1:N. O
  progresso/saúde/nota "atuais" são o registro de maior `semana`.

## Tabelas

### `engenheiros`

```sql
CREATE TABLE engenheiros (
  email  TEXT PRIMARY KEY,         -- identidade (casa com sync/config.json)
  nome   TEXT NOT NULL             -- só exibição
);
```

### `projetos`

```sql
CREATE TABLE projetos (
  id          TEXT PRIMARY KEY,     -- slug da URL de detalhe (#/projetos/<id>)
  codigo      TEXT NOT NULL UNIQUE, -- ID estilo Jira ("PRJ-1")
  nome        TEXT NOT NULL,
  descricao   TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL
              CHECK (status IN ('discovery','refinamento','em_andamento',
                                'em_testes','bloqueado','pausado','concluido')),
  prioridade  SMALLINT NOT NULL CHECK (prioridade BETWEEN 1 AND 5), -- peso nas métricas
  quarter     TEXT NOT NULL,        -- "2026-Q3"
  engenheiro_email TEXT REFERENCES engenheiros(email), -- NULL = sem dono
  inicio      DATE,                 -- previsão/data de início    (nullable)
  prazo       DATE,                 -- previsão de término        (nullable)
  fechamento  DATE                  -- fechamento real; NULL enquanto aberto
);
```

- `engenheiro_email` **nullable** com FK cobre o "projeto sem dono" (`null` no JSON),
  sem linha fantasma.
- `status` e `prioridade` como `CHECK` inline — enums fechados e pequenos.

### `registros_semanais`

```sql
CREATE TABLE registros_semanais (
  projeto_id TEXT NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  semana     DATE NOT NULL,         -- segunda-feira da semana
  progresso  SMALLINT NOT NULL CHECK (progresso BETWEEN 0 AND 100), -- acumulado
  saude      SMALLINT NOT NULL CHECK (saude BETWEEN 1 AND 5),       -- 1 perigo … 5 on tracking
  nota       TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (projeto_id, semana)  -- no máx. 1 registro por projeto/semana
);
```

A PK composta `(projeto_id, semana)` aplica no banco o invariante que hoje é só
convenção: um registro por semana por projeto.

## Consultas típicas

Estado "atual" de cada projeto (o último registro, o que a UI mostra na lista):

```sql
SELECT DISTINCT ON (projeto_id) *
FROM registros_semanais
ORDER BY projeto_id, semana DESC;
```

Projetos do quarter corrente (a visão principal filtra pelo quarter do relógio):

```sql
SELECT * FROM projetos WHERE quarter = '2026-Q3';
```

## Decisões de modelagem

| Ponto | Escolha | Por quê |
|---|---|---|
| Engenheiro | tabela por e-mail, FK nullable | dedup + integridade; `null` = sem dono |
| `status`/`prioridade`/`saude` | `CHECK` inline | enums fechados e pequenos |
| `registros` | tabela filha, PK `(projeto,semana)` | 1:N natural; PK aplica "1 por semana" |
| `quarter` | coluna `TEXT` (denormalizada) | filtro barato; igual ao JSON de hoje |
| Datas | `DATE` nullable | `inicio`/`prazo`/`fechamento` já são opcionais |

## Se crescer

- **Lookups** para `status`/`prioridade`/`saude` (`codigo`, `rotulo`, `ordem`, `peso`) se
  quiser a ordem lógica e o peso das métricas — hoje em `src/features/projetos/derive.ts`
  (`SAUDE_META`, ordenação) — vivendo no banco em vez do código.
- **`quarters`** como tabela (`codigo`, `inicio`, `fim`) para validar/ordenar quarters no
  banco em vez de derivar do relógio.
- **`projetos_historico`** para auditar mudanças dos campos do próprio projeto (troca de
  prazo, de dono). Hoje o histórico semanal *é* `registros_semanais`; ele não rastreia
  edição de metadados do projeto.
