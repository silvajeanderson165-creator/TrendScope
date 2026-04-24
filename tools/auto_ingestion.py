import os
import pymysql
import ssl
import json
import urllib.request
from dotenv import load_dotenv
from urllib.parse import urlparse

# Seeds (termos para pre-warm nas trends)
SEEDS = ["Inteligência Artificial 2026", "React 19 Next.js", "TiDB Cloud AWS", "Hono vs tRPC"]

SEARXNG_INSTANCES = [
    "https://priv.au",
    "https://search.rhscz.eu"
]

def load_db_url():
    # Load .env
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "referencia.md", ".env")
    load_dotenv(dotenv_path=env_path)
    return os.getenv("DATABASE_URL")

def scrape_searxng(query):
    """ Tenta raspar as instancias de forma tolerante a falhas (Regras do POP) """
    query_encoded = query.replace(" ", "+")
    for instance in SEARXNG_INSTANCES:
        url = f"{instance}/search?q={query_encoded}&format=json"
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            response = urllib.request.urlopen(req, timeout=5)
            if response.status == 200:
                data = json.loads(response.read().decode())
                # Curar limitando ao top 5
                top_5 = data.get('results', [])[:5]
                if top_5:
                    print(f"  [+] Scrape efetuado via {instance}")
                    return top_5
        except Exception:
            # Pass-through silencioso como manda o POP
            pass
    return None

def inject_database(seed_query, count_increment):
    """ Insere no MySQL de forma direta usando Drizzle Schema """
    db_url = load_db_url()
    if not db_url:
        return
        
    parsed = urlparse(db_url)
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    
    try:
        connection = pymysql.connect(
            host=parsed.hostname,
            user=parsed.username,
            password=parsed.password,
            port=parsed.port or 3306,
            database=parsed.path.lstrip('/'),
            ssl=ssl_ctx
        )
        with connection.cursor() as cursor:
            # Upsert Pattern: Se a query existir, incrementa o count, senão cria com count
            sql = """
            INSERT INTO searches (query, count) 
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE count = count + %s
            """
            cursor.execute(sql, (seed_query, count_increment, count_increment))
            connection.commit()
            print(f"  [OK] Dados da seed '{seed_query}' injetados no MySQL.")
    except Exception as e:
        print(f"  [ERRO CRITICO] O banco de dados recusou a conexao/injecao: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

def main():
    print("Iniciando Ingestão Autônoma (TrendScope V.L.A.E.G. Motor)...")
    for seed in SEEDS:
        print(f"\n=> Processando Seed: {seed}")
        # Fase 1: Raspar
        results = scrape_searxng(seed)
        
        # Fase 2: Injetar (Aqui contamos o quao popular a seed foi pela qt de resultados achados)
        # O banco atual armazena apenas "query" e "count" no MySQL
        incremento = len(results) if results else 1
        inject_database(seed_query=seed, count_increment=incremento)
        
    print("\n[OK] Ciclo de ingestao concluido.")

if __name__ == "__main__":
    main()
