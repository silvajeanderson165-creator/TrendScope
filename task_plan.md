# Task Plan Local (V.L.A.E.G.)

## Visão Geral
Construir o motor autônomo (Python) de curadoria e injeção de dados no projeto TrendScope mantendo o frontend em Node isolado.

## Fases e Checklists

- [ ] Fase 1: Link (Conectividade)
  - [ ] Validar script que pinga a base do MySQL.
  - [ ] Validar script mínimo que chama a API SearXNG via urllib/requests.

- [ ] Fase 2: Arquitetura
  - [ ] POP da pipeline principal `ingestion.md` detalhando cada função Python necessária.

- [ ] Fase 3: Construção (Tools)
  - [ ] Script para coletar dados (Scraper SearXNG).
  - [ ] Script para formatação de dados.
  - [ ] Script (MySQL injector) para conectar com a source of truth.

- [ ] Fase 4/5: Estilo e Gatilho
  - [ ] Limpeza de terminal / logs (usar formatação bonitas para output no cmd).
  - [ ] Executar scripts.
