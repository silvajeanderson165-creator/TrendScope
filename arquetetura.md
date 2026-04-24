TrendScope — Documentacao de Arquitetura
1. Objetivo Principal
TrendScope e uma landing page profissional de descoberta de conteudo. O usuario pesquisa qualquer tema e recebe os 5 conteudos mais relevantes da internet, cada um com imagem, titulo e resumo objetivo. O projeto foi construido para demonstrar competencia tecnica de nivel senior em desenvolvimento full-stack moderno.
Proposta de valor: Curadoria inteligente de conteudo em segundos, sem cadastro, sem custo.
2. Stack Tecnologico
Frontend
Table
Tecnologia	Versao	Funcao
React	19	UI library com StrictMode
TypeScript	5.x	Tipagem estatica end-to-end
Vite	7.x	Bundler e dev server com HMR
Tailwind CSS	3.4	Utility-first CSS framework
shadcn/ui	latest	Componentes base (Button, Input, Card)
Framer Motion	11.x	Animacoes declarativas e gestos
react-router	7	Roteamento SPA
Sonner	latest	Toast notifications
canvas-confetti	latest	Efeitos de confete celebratorio
Lucide React	latest	Biblioteca de icones
Backend
Table
Tecnologia	Versao	Funcao
Hono	4.x	Framework HTTP ultraleve
tRPC	11.x	APIs type-safe end-to-end
Drizzle ORM	latest	ORM type-safe para MySQL
MySQL	8.x	Banco de dados relacional
Zod	3.x	Validacao de schemas
esbuild	latest	Bundle do servidor Node.js
3. Estrutura de Pastas
plain
Copy
/mnt/agents/output/app/
|-- api/                          # Backend (Hono + tRPC)
|   |-- boot.ts                   # Entry point do servidor
|   |-- router.ts                 # Registro de todos os routers tRPC
|   |-- middleware.ts             # Procedimentos (publicQuery, etc.)
|   |-- context.ts                # Contexto das requisicoes
|   |-- search.ts                 # Router de busca (core do produto)
|   |-- queries/
|   |   |-- connection.ts         # Conexao Drizzle + MySQL
|   |-- kimi/                     # Auth SDK (auto-gerado)
|   |-- lib/                      # Framework internals
|
|-- contracts/                    # Tipos compartilhados front/back
|
|-- db/                           # Database schema e migrations
|   |-- schema.ts                 # Tabelas (searches)
|   |-- relations.ts              # Relacoes entre tabelas
|   |-- seed.ts                   # Script de seed
|
|-- public/                       # Assets estaticos
|   |-- hero-bg.jpg               # Imagem de fundo do hero
|   |-- favicon.svg               # Favicon customizado
|   |-- manifest.json             # PWA manifest
|
|-- src/                          # Frontend (React + TypeScript)
|   |-- main.tsx                  # Entry point (TRPCProvider + Router)
|   |-- App.tsx                   # Rotas (Home + 404)
|   |-- index.css                 # Tailwind + custom CSS + keyframes
|   |-- pages/
|   |   |-- Home.tsx              # Pagina principal (composicao de sections)
|   |
|   |-- sections/                 # Secoes da landing page
|   |   |-- HeroSection.tsx       # Hero com particles + typewriter
|   |   |-- FeaturesSection.tsx   # 6 cards de recursos
|   |   |-- HowItWorksSection.tsx # 3 passos do processo
|   |   |-- StatsSection.tsx      # Metricas com contadores animados
|   |   |-- ResultsSection.tsx    # Grid de 5 resultados
|   |   |-- Footer.tsx            # Footer com social links
|   |
|   |-- components/               # Componentes reutilizaveis
|   |   |-- SpotlightCard.tsx     # Card com efeito de luz (spotlight)
|   |   |-- SearchBar.tsx         # Input de busca com glow
|   |   |-- ResultCard.tsx        # Card de resultado com spotlight
|   |   |-- SkeletonCard.tsx      # Skeleton loading com shimmer
|   |   |-- ScrollProgress.tsx    # Barra de progresso no topo
|   |   |-- ParticlesBackground.tsx # Canvas com 80 particulas
|   |   |-- TypeWriter.tsx        # Efeito de digitacao
|   |   |-- ErrorBoundary.tsx     # Tratamento de erros
|   |
|   |-- providers/
|   |   |-- trpc.tsx              # Cliente tRPC + QueryClient
|   |
|   |-- hooks/                    # Custom hooks (reservado)
|   |-- types/                    # Tipos TypeScript globais
|   |-- components/ui/            # Componentes shadcn/ui (40+)
|
|-- index.html                    # HTML com SEO completo
|-- vite.config.ts                # Config Vite (aliases, proxy)
|-- tailwind.config.js            # Config Tailwind + tema custom
|-- tsconfig.json                 # TypeScript paths (@/, @db/, @contracts/)
|-- drizzle.config.ts             # Config Drizzle ORM
|-- .env                          # Variaveis de ambiente
4. Arquitetura do Backend
4.1 Router tRPC — api/search.ts
O router search expoe 3 procedimentos:
plain
Copy
search.search  — Recebe query, retorna 5 resultados
search.popular — Retorna termos mais buscados (do DB)
search.stats   — Retorna metricas agregadas (do DB)
Fluxo da busca (search.search):
Rate Limiting — Verifica IP (30 req/min por janela deslizante)
Sanitizacao — Remove tags HTML, normaliza espacos, limita a 200 chars
Cache Check — Verifica cache in-memory (TTL: 5 minutos)
SearXNG — Tenta buscar em 5 instancias publicas de forma sequencial
Fallback — Se falhar, gera resultados mock realisticos
Persistencia — Salva/atualiza contagem no MySQL via Drizzle
Retorno — Devolve resultados com metadados (source, notice)
4.2 Rate Limiting
plain
Copy
Map<string, { count: number; resetAt: number }>
MAX: 30 requisicoes
JANELA: 60 segundos
Implementacao simples em memoria, sem dependencias externas. Cada IP tem um contador que reseta a cada minuto.
4.3 Cache Layer
plain
Copy
Map<string, { results: SearchResult[]; ts: number }>
TTL: 5 minutos (300.000ms)
LIMITE: 500 entradas (LRU eviction)
Cache em memoria para evitar chamadas repetidas ao mesmo termo. Reduz latencia e evita rate limiting dos servicos externos.
4.4 Schema do Banco — db/schema.ts
sql
Copy
CREATE TABLE searches (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  query      VARCHAR(255) NOT NULL,
  count      INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
A tabela armazena cada termo buscado e quantas vezes foi pesquisado. Usada pelos endpoints popular e stats.
4.5 Integracao SearXNG
SearXNG e um meta-motor de busca open-source que agrega resultados de Google, Bing, DuckDuckGo, Yahoo e outros. O backend tenta 5 instancias publicas:
plain
Copy
searx.tiekoetter.com
priv.au
search.rhscz.eu
paulgo.io
search.inetol.net
Cada requisicao tem timeout de 8 segundos e usa AbortController para cancelamento.
5. Arquitetura do Frontend
5.1 Comunicacao API
plain
Copy
Frontend (React) 
  → tRPC Client (httpBatchLink)
    → Vite Dev Proxy (/api → localhost:3000)
      → Hono Server
        → tRPC Router
          → Drizzle Query → MySQL
A comunicacao e totalmente type-safe. O frontend importa o tipo AppRouter do backend via @/providers/trpc, garantindo que toda chamada de API seja validada em tempo de compilacao.
5.2 Estado Global
Nao ha biblioteca de estado global. O estado e gerenciado via:
tRPC + TanStack Query — Cache de server state (buscas, popular, stats)
React useState — Estado local (query atual, loading, hasSearched)
URL SearchParams — Estado sincronizado com a URL (?q=termo)
5.3 Secoes da Landing Page
plain
Copy
HeroSection
  → SearchBar → tRPC search.search
  → ParticlesBackground (Canvas API)
  → TypeWriter (React hooks)
  → Popular chips → tRPC search.popular

ResultsSection (condicional: hasSearched)
  → Loading: SkeletonCard x5
  → Sucesso: ResultCard x5 (SpotlightCard)
  → Erro: Empty state

FeaturesSection
  → SpotlightCard x6 (useInView para animar)

HowItWorksSection
  → SpotlightCard x3 + connecting line

StatsSection
  → SpotlightCard x4 + AnimatedNumber

Footer
5.4 Componente SpotlightCard
O efeito de luz nos cards e construido em 5 camadas CSS:
plain
Copy
Camada 1: Fundo gradiente (navy escuro)
Camada 2: Top spotlight estatico (radial-gradient no topo)
Camada 3: Spotlight interativo (segue o mouse via onMouseMove)
Camada 4: Border glow (mix-blend-mode: screen)
Camada 5: Inner shadow e borda externa
A posicao do mouse e calculada via getBoundingClientRect() e aplicada como porcentagem no radial-gradient do CSS.
5.5 Canvas Particles
Sistema de particulas vanilla Canvas API (sem bibliotecas):
plain
Copy
80 particulas com velocidade aleatoria
Conexoes entre particulas proximas (max 3 por particula)
Cor: rgba(56, 189, 248, opacity) — ciano
Distancia de conexao: 120px
Renderizado a 60fps via requestAnimationFrame. Usa devicePixelRatio para suporte a telas retina.
6. Passo a Passo da Construcao
Fase 1: Infraestrutura
Inicializar projeto React + Vite + TypeScript via webapp-building
Graft do backend backend-building com feature db
Instalar dependencias: framer-motion, canvas-confetti, sonner
Configurar aliases TypeScript (@/, @db/, @contracts/)
Fase 2: Backend
Criar schema db/schema.ts com tabela searches
Criar router api/search.ts com 3 endpoints
Implementar rate limiting e cache in-memory
Integrar SearXNG com fallback para mock data
Push do schema para MySQL via npm run db:push
Fase 3: Frontend Core
Criar SpotlightCard (componente base reutilizavel)
Criar SearchBar com keyboard shortcuts (/, ESC)
Criar HeroSection com particles + typewriter
Criar ResultsSection com skeleton e empty states
Criar ResultCard com spotlight interativo
Fase 4: Secoes Complementares
Criar FeaturesSection com 6 cards
Criar HowItWorksSection com 3 passos
Criar StatsSection com contadores animados
Criar Footer com social links
Fase 5: Polish
Adicionar ErrorBoundary, ScrollProgress, toast notifications
Implementar SEO completo (OG, Twitter Cards, manifest)
Gerar hero image na tematica ciano-azul
Atualizar toda a paleta de cores (violeta → ciano)
Type check + Build + Deploy
7. Decisoes Tecnicas
Por que SearXNG em vez de Google Search API?
SearXNG e gratuito, open-source e nao requer API key. Agrega multiplos motores de busca. O fallback para mock data garante que a demo funcione em qualquer ambiente.
Por que cache in-memory em vez de Redis?
Para o volume de uma landing page demo, um Map em memoria e suficiente. Reduz dependencias de infraestrutura e mantem o projeto facilmente deployavel.
Por que Canvas em vez de CSS animations para particulas?
80 particulas com conexoes dinamicas exigem performance. Canvas API oferece controle total de renderizacao a 60fps sem forcar reflows do DOM.
Por que tRPC em vez de REST?
tRPC elimina a necessidade de definir interfaces manualmente. O tipo AppRouter e inferido automaticamente, propagando type-safety do backend para o frontend sem geracao de codigo.
Por que spotlight com CSS e nao WebGL?
O efeito de spotlight pode ser alcancado com radial-gradient + mix-blend-mode, que e mais leve, mais compativel e nao requer bibliotecas 3D. A interatividade e obtida via tracking de mouse posicion.
8. Endpoints da API
Table
Endpoint	Metodo	Input	Output
search.search	Query	{ query: string }	{ results, query, source, notice? }
search.popular	Query	—	{ searches: [{ query, count }] }
search.stats	Query	—	{ totalSearches, uniqueQueries, uptimeDays }
ping	Query	—	{ ok: true, ts: number }
9. Variaveis de Ambiente
env
Copy
DATABASE_URL=mysql://user:pass@host:3306/db
VITE_API_URL=/api           # Proxy do Vite
VITE_APP_ID=                # Kimi Auth (se habilitado)
VITE_KIMI_AUTH_URL=         # Kimi Auth (se habilitado)
10. Scripts Disponiveis
Table
Comando	Descricao
npm run dev	Servidor de desenvolvimento com HMR
npm run build	Build de producao (dist/)
npm run check	Type check completo
npm run db:push	Sincroniza schema com MySQL
npm run db:generate	Gera migrations SQL
npm run db:migrate	Aplica migrations pendentes
npm start	Inicia servidor de producao
Documentacao gerada em 25 de Abril de 2026.
TrendScope v4 — Spotlight Edition.