# POP: Pipeline de Ingestão Autônoma (TrendScope Back-Office)

## 📌 Objetivo Diário
Rastrear, curar e armazenar proativamente dados sobre as principais tendências de inovação e tecnologia da web utilizando instâncias do SearXNG. O objetivo final é preencher (pre-warm) o banco de dados MySQL do TrendScope de forma que a Landing Page apresente respostas otimizadas e ricas para os visitantes.

## 🔄 Fluxo Lógico (Camada de Ferramentas - `tools/`)

O bot Python `auto_ingestion.py` deve seguir o seguinte diagrama estrito de estados:

1. **Gatilho de Entrada (Seeds):** 
   - Lê uma lista fixa ou gerada de *queries* (ex: "Tendências Inteligência Artificial", "Melhores frameworks web 2026").
   
2. **Raspagem (SearXNG Fetcher):**
   - Roda nas instâncias públicas (`https://priv.au`, `https://search.rhscz.eu`).
   - Coleta os 5 melhores resultados por termo analisado.
   
3. **Conversão de Payload (Tratamento de Dados):**
   - Transforma a resposta bruta do SearXNG para o esquema do nosso sistema:
     ```json
     {
       "query": "[TERMO GERADO]",
       "count": 1,
       "resultados_curados": "[ARRAY JSON DOS LINKS]"
     }
     ```

4. **Injeção de Source of Truth (Database Injector):**
   - Estabelece conexão SSLCertificate com o banco TiDB usando a variável global `DATABASE_URL`.
   - Mapeia o JSON estritamente para a estrutura SQL nativa.
   - Aplica o `INSERT` de maneira segura e fecha a conexão.

## 🛡️ Casos de Borda e Autocorreção (Fail-Safes)

* O que acontece no caso do SearXNG enviar **Erro 429 (Too Many Requests)**?
  - Comportamento Exigido: **Pass-through Silencioso**. O script avança para o próximo servidor na piscina de instâncias sem travar o Loop principal.
  
* O que acontece no caso do **Banco de Dados TiDB recusar a Conexão (Timeout)**?
  - Comportamento Exigido: **Abortar Script**. Armazenar os logs da falha e não forçar gravação corrompida. Um banco offline exige intervenção humana da equipe.

* O que acontece com **Resultados Duplicados** de buscas (ex: duas fontes iguais)?
  - Comportamento Exigido: Realizar sanitização limpando arrays vazios e limitando estritamente em um `.slice(0,5)` (ou em Python `[:5]`) antes do Payload ser convertido em String para injeção.
