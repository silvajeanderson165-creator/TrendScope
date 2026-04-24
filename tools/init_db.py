import ssl
import pymysql
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv(r'c:\Users\pedro\OneDrive\Área de Trabalho\Projeto_google\referencia.md\.env')
db_url = os.getenv('DATABASE_URL')
parsed = urlparse(db_url)
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

conn = pymysql.connect(
    host=parsed.hostname,
    user=parsed.username,
    password=parsed.password,
    port=parsed.port or 3306,
    ssl=ssl_ctx
)
db_name = parsed.path.lstrip('/')

with conn.cursor() as cur:
    cur.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    cur.execute(f"USE {db_name}")
    cur.execute('''
    CREATE TABLE IF NOT EXISTS searches (
      id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      query      VARCHAR(255) NOT NULL UNIQUE,
      count      INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
    );
    ''')
    try:
        cur.execute('ALTER TABLE searches ADD COLUMN resultados_curados JSON;')
        print('Coluna json adicionada.')
    except Exception as e:
        print('Coluna ja existe ou erro:', e)
conn.commit()
conn.close()
print('Tabela criada com sucesso!')
