import urllib.request
import json

SEARXNG_INSTANCES = [
    "https://priv.au",
    "https://search.rhscz.eu",
    "https://paulgo.io"
]

def ping_searxng():
    print("Iniciando Handshake com instâncias públicas SearXNG...")
    
    success_count = 0
    query = "Trendscope+landing+page"
    
    for instance in SEARXNG_INSTANCES:
        url = f"{instance}/search?q={query}&format=json"
        try:
            req = urllib.request.Request(
                url, 
                data=None, 
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                }
            )
            print(f"Pinging {instance}...")
            response = urllib.request.urlopen(req, timeout=8)
            if response.status == 200:
                data = json.loads(response.read().decode())
                resultados = len(data.get('results', []))
                print(f"  ✅ SUCESSO na instância {instance} - Retornou {resultados} resultados.")
                success_count += 1
        except Exception as e:
            print(f"  ❌ FALHA ao contactar {instance}: {str(e)}")
            
    if success_count > 0:
        print(f"\n🚀 Handshake SearXNG completo: Temos {success_count}/{len(SEARXNG_INSTANCES)} instâncias respondendo online.")
    else:
        print("\n❌ Nenhuma instância respondeu a tempo ou todas bloquearam o request.")

if __name__ == "__main__":
    ping_searxng()
