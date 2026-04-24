import time
import datetime
from auto_ingestion import main

# Define a cada quantos segundos o robô vai dar uma volta e coletar mais dados
# 1 hora = 3600 segundos. (Vou colocar 4 horas para não estourar os limites da API SearXNG)
INTERVALO_SEGUNDOS = 3600 * 4 

def run_daemon():
    print("="*60)
    print(" [DAEMON INICIADO] Motor TrendScope operando 24/7")
    print("="*60)
    
    ciclos = 1
    while True:
        agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n[DAEMON] Iniciando CICLO #{ciclos} as {agora}")
        
        try:
            # Chama a função principal do arquivo original
            main()
        except Exception as e:
            print(f"[DAEMON] ❌ Erro não tratado capturado no Loop Principal: {e}")
            print("[DAEMON] O robô sobreviveu ao erro e tentará novamente no próximo ciclo.")
            
        proxima_execucao = (datetime.datetime.now() + datetime.timedelta(seconds=INTERVALO_SEGUNDOS)).strftime("%H:%M:%S")
        print(f"\n[DAEMON] Ciclo #{ciclos} concluído. Dormindo. Próxima varredura às {proxima_execucao}...")
        
        ciclos += 1
        time.sleep(INTERVALO_SEGUNDOS)

if __name__ == "__main__":
    run_daemon()
