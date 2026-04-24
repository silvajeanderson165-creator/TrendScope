import os
import pymysql
import ssl
from dotenv import load_dotenv
from urllib.parse import urlparse

def ping_database():
    print("Iniciando Handshake com MySQL (TiDB)...")
    
    # Load .env from the referencia path
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "referencia.md", ".env")
    load_dotenv(dotenv_path=env_path)
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[ERRO] DATABASE_URL nao encontrada no .env!")
        return False
        
    print(f"URL Detectada: {db_url.split('@')[1]}") # Escondendo credenciais

    try:
        # Parse the connection string
        parsed = urlparse(db_url)
        
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        
        # Conectar ao banco
        connection = pymysql.connect(
            host=parsed.hostname,
            user=parsed.username,
            password=parsed.password,
            port=parsed.port or 3306,
            database=parsed.path.lstrip('/'),
            ssl=ssl_ctx
        )
        
        with connection.cursor() as cursor:
            # Query simples para checar status
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"[SUCESSO] Conectado ao MySQL/TiDB. Versao: {version[0]}")
            
        connection.close()
        return True
    except Exception as e:
        print(f"[ERRO] Falha de conexao: {e}")
        return False

if __name__ == "__main__":
    ping_database()
