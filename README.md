# 🔍 TrendScope
**Motor Full-Stack de Curadoria de Tendências com Tipagem Ponta a Ponta e Banco Distribuído.**

![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=for-the-badge&logo=trpc&logoColor=white) ![Hono](https://img.shields.io/badge/Hono-4-E36002?style=for-the-badge&logo=hono&logoColor=white) ![TiDB](https://img.shields.io/badge/TiDB-Serverless-FF4500?style=for-the-badge) ![Drizzle](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=for-the-badge)

🟢 **LIVE DEMO:** [Acesse o TrendScope Ao Vivo Aqui](https://trend-scope.vercel.app)

---

## 🛑 O Problema
Profissionais que precisam se manter atualizados — marketeiros, criadores de conteúdo, pesquisadores, founders — perdem tempo absurdo navegando entre dezenas de abas, feeds de redes sociais, newsletters e agregadores de notícias para encontrar o que realmente importa sobre um tema. Ferramentas de busca tradicionais retornam centenas de links irrelevantes, sem curadoria, sem imagens contextuais e sem nenhum tipo de inteligência na apresentação dos resultados.

## ✅ A Solução (TrendScope)
O TrendScope é um **motor de curadoria inteligente** que transforma uma simples pesquisa em um painel visual premium com os **5 resultados mais relevantes** sobre qualquer tema, enriquecidos com imagens OG extraídas automaticamente dos sites de origem.

Ele resolve o problema do "excesso de ruído" utilizando a **API Google via Serper.dev** como fonte primária de dados, combinada com um sistema de **cache em memória + persistência em banco distribuído (TiDB Serverless)** para respostas instantâneas em buscas recorrentes. A arquitetura é inteiramente tipada de ponta a ponta — do schema do banco (Drizzle ORM) até o frontend (tRPC + React Query) — eliminando qualquer possibilidade de desincronização entre API e interface. Tudo envelopado numa UI de luxo com Glassmorphism, skeleton loading, confetti animations e dark mode refinado.

---

## 🧠 Maior Desafio Técnico Superado
**Garantir que buscas em tempo real via API externa não degradassem a experiência do usuário, mesmo sob latência de rede, cold starts do banco serverless ou exaustão de créditos da API.**

Para resolver isso, implementei uma **Arquitetura de Resiliência em 3 Camadas de Fallback**:

1. **Camada 1 — In-Memory Cache (TTL 5 min):** Antes de qualquer chamada externa, o sistema verifica um Map em memória com TTL controlado. Se a query já foi pesquisada nos últimos 5 minutos, os resultados são devolvidos em **< 1ms**, sem tocar rede, API ou banco.
2. **Camada 2 — Serper.dev API + OG Image Extraction:** Se o cache não tem a query, o motor dispara uma chamada à API Google (via Serper.dev) com timeout de 4 segundos. Para cada resultado, um scraper paralelo (usando User-Agent de bot social) extrai as meta tags `og:image` dos sites em até 2.5 segundos cada, garantindo que nenhuma imagem trave a resposta principal.
3. **Camada 3 — Mock Engine Contextual:** Se a API estiver indisponível (sem créditos, offline ou timeout), o sistema gera **resultados de demonstração contextualizados** com a query real do usuário — nunca mostrando uma tela vazia ou erro bruto.

Adicionalmente, a persistência no banco (TiDB) opera com um **`Promise.race` de 2 segundos** — se o banco serverless estiver em cold start e não responder a tempo, a API retorna os resultados normalmente e ignora silenciosamente o salvamento. O usuário nunca percebe.

---

## 🔒 Protocolo de Segurança Enterprise
O TrendScope implementa defesas em múltiplas camadas, seguindo o mesmo rigor de projetos corporativos:

1. **Secure Headers (Hono):** `secureHeaders()` equivalente ao Helmet — configura X-Content-Type-Options, X-Frame-Options, HSTS, CSP e Referrer-Policy automaticamente.
2. **CORS Restrito:** O backend aceita requisições **exclusivamente** dos domínios autorizados (`trend-scope.vercel.app` + localhost dev). Qualquer outra origem é bloqueada.
3. **Rate Limiting por IP:** Limite de 30 requisições por minuto por IP com janela deslizante. Ao ultrapassar, o sistema retorna `RATE_LIMITED` sem processar a query.
4. **Input Sanitization (Zero Trust):** Toda query passa por sanitização rigorosa — remoção de tags HTML (`<>`), normalização de espaços, e truncamento em 200 caracteres — antes de ser processada.
5. **Body Limit (Anti Payload Bomb):** Requisições com body acima de 1MB são rejeitadas automaticamente.
6. **Validação de Schema (Zod):** Inputs validados com `z.string().min(1).max(200)` — impossível injetar payloads fora do formato esperado.

---

## ✨ Principais Funcionalidades

- **Busca em Tempo Real (Google via Serper.dev):** Motor de pesquisa que retorna os 5 resultados mais relevantes com título, descrição, link direto e data.
- **OG Image Extraction Automática:** Scraper inteligente que extrai thumbnails `og:image` e `twitter:image` dos sites de resultado, com fallback para screenshots via WordPress mShots.
- **Histórico Inteligente com Ranking:** Cada busca é persistida no banco distribuído com contador incremental. O dashboard exibe as "Tendências Populares" ordenadas por frequência.
- **Estatísticas em Tempo Real:** Painel de métricas mostrando total de buscas, queries únicas e uptime do sistema — alimentado por queries SQL agregadas (`SUM`, `COUNT`).
- **Cache Inteligente (TTL 5 min):** Sistema de cache em memória com eviction automático (limite de 500 entries) para respostas instantâneas.
- **UI Premium (Glassmorphism):** Interface de alta fidelidade com skeleton loading, micro-interações, confetti celebrations, painéis translúcidos e dark mode.

---

## 🛠️ Stack Tecnológico & Arquitetura

### 1. Frontend (SPA — CDN Vercel)
- **Framework:** React 19 + TypeScript + Vite 7.
- **Data Fetching:** tRPC Client (`@trpc/react-query`) + TanStack React Query para cache automático, invalidação e loading states.
- **Estilização & UI:** Tailwind CSS + shadcn/ui (Radix Primitives) para componentes acessíveis. Animações com Framer Motion.
- **Seções:** Hero com barra de busca animada, Features cards, How It Works (step-by-step), Results grid com cards visuais, Stats dashboard e Footer.

### 2. Backend (Servidor Hono — Serverless Ready)
- **Motor Lógico:** Hono v4 (framework ultrarrápido e leve, ~14KB) rodando sobre Node.js.
- **API Tipada:** tRPC v11 com SuperJSON como transformer — tipagem compartilhada entre servidor e cliente, eliminando a necessidade de codegen ou schemas manuais de API.
- **Procedures:** `search.search` (busca principal), `search.popular` (ranking de tendências), `search.stats` (métricas agregadas), `ping` (healthcheck).
- **Integração Externa:** Serper.dev API (Google Search) com AbortController (timeout 4s) e OG Image scraper paralelo.
- **Defesa Perimetral:** `secureHeaders()`, CORS restrito, Rate Limiting por IP, Input Sanitization e Body Limit (1MB).

### 3. Banco de Dados (Fonte da Verdade)
- **TiDB Serverless:** Banco MySQL distribuído e compatível com HTAP (Hybrid Transactional/Analytical Processing), oferecendo escalabilidade horizontal automática.
- **Drizzle ORM:** Schema tipado com `mysqlTable`, migrações versionadas (`drizzle-kit generate/migrate/push`), e queries type-safe com operadores `eq`, `sql`, `desc`.
- **Schema:** Tabela `searches` com campos: `id` (serial PK), `query` (varchar unique), `count` (int), `resultados_curados` (JSON), timestamps automáticos.

---

## 🚀 Como Executar Localmente

### 1. Requisitos
- Node.js (v18+)
- Conta no [TiDB Cloud](https://tidbcloud.com) (gratuito) ou MySQL local
- Chave de API do [Serper.dev](https://serper.dev) (gratuito — 2500 buscas)

### 2. Configuração
Clone o repositório e configure as variáveis de ambiente:
```bash
git clone https://github.com/jeanderson-silva8/TrendScope.git
cd TrendScope
npm install
```

Crie um arquivo `.env` na raiz com suas credenciais:
```env
DATABASE_URL=mysql://user:password@host:4000/database?ssl={"rejectUnauthorized":true}
SERPER_API_KEY=sua_chave_serper_aqui
```

### 3. Banco de Dados
Gere e aplique as migrações:
```bash
npm run db:generate
npm run db:push
```

### 4. Rodando
```bash
npm run dev
```
Acesse a aplicação em: `http://localhost:5173`

---

## 📂 Visão Geral da Estrutura

```text
├── server/
│   ├── boot.ts            # Hono app + Segurança (CORS, Headers, Body Limit)
│   ├── router.ts          # tRPC Router principal (merge de sub-routers)
│   ├── search.ts          # Motor de busca (Serper, Cache, Rate Limit, OG Scraper)
│   ├── middleware.ts       # initTRPC + SuperJSON transformer
│   ├── context.ts         # Contexto tRPC (req, env)
│   ├── lib/               # Utilitários (env validation, vite serving)
│   └── queries/           # Conexão com TiDB (Drizzle)
├── db/
│   ├── schema.ts          # Drizzle Schema (searches table)
│   ├── migrations/        # SQL migrations versionadas
│   └── seed.ts            # Script de seed para dados iniciais
├── src/
│   ├── pages/             # Home.tsx (página principal)
│   ├── sections/          # Hero, Features, HowItWorks, Results, Stats, Footer
│   ├── components/        # UI components (shadcn/ui + custom)
│   ├── hooks/             # React hooks customizados
│   ├── providers/         # tRPC Provider + React Query
│   └── lib/               # Utilitários frontend (trpc client, utils)
├── drizzle.config.ts      # Configuração do Drizzle Kit
├── Dockerfile             # Container para deploy self-hosted
└── vercel.json            # Deploy serverless na Vercel
```

---

## 🎯 Destaques Técnicos

- **Type-Safety E2E:** Do schema do banco (Drizzle) → tRPC Router → React Query hooks — zero `any`, zero runtime surprises.
- **Resiliência Total:** 3 camadas de fallback (Cache → API → Mocks) garantem que o usuário nunca veja uma tela de erro.
- **Cold Start Protection:** `Promise.race` de 2s protege contra latência de wake-up do TiDB Serverless.
- **OG Scraper Inteligente:** User-Agent de bot social (`facebookexternalhit`) para bypass de captchas em meta tags.
- **Zero Over-fetching:** tRPC elimina endpoints REST redundantes — cada procedure retorna exatamente os campos consumidos.

---

## 👑 Autor

**Jeanderson Silva** 🤓✍️

*Desenvolvedor Full-Stack | Engenheiro Frontend | Arquiteto de Software*

Construído desde a modelagem de dados com Drizzle ORM + TiDB Serverless até a integração de APIs de busca em tempo real, passando por tipagem ponta a ponta com tRPC e uma interface de curadoria visualmente premium.

Sinta-se à vontade para auditar a arquitetura tRPC, explorar as queries do Drizzle ORM ou testar a velocidade de busca da aplicação ao vivo!
