# Findings & Restrições (V.L.A.E.G.)

## Restrições Iniciais
- **Diferença de Stacks:** O frontend/backend público do TrendScope opera inteiramente sobre Node.js e TS (Hono/React), sob a pasta `referencia.md/`.
- Os scripts de automação desta raiz obrigatoriamente rodam em Python (`tools/`).
- O ecossistema de Python nunca interage diretamente com o código Typescript; toda a sincronização acontecerá no ponto de encontro, que é o banco de dados MySQL ou endpoints REST.

## Descobertas e Limitações (Fase 2: Link)
1. Conexão ao MySQL (TiDB) configurada no `.env` está formatada corretamente.
2. **ERRO CRÍTICO DE INFRAESTRUTURA:** A máquina local host (Windows) não possui a linguagem Python disponível no `PATH` global (exceção nativa `CommandNotFoundException` no `pip` e no `python`). Isso paralisa a execução direta local da Camada 3 do V.L.A.E.G.
