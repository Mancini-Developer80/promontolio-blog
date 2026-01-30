import os
import time
from dotenv import load_dotenv
import google.generativeai as genai

# 1. Configurazione Iniziale
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Errore: GEMINI_API_KEY non trovata nel file .env")
    exit()

genai.configure(api_key=api_key)

# Modello aggiornato (Gemini 2.0 Flash)
model = genai.GenerativeModel('models/gemini-2.0-flash-001')

def analyze_file(path, content):
    """
    Invia il contenuto di un singolo file a Gemini con gestione degli errori di quota.
    """
    prompt = (
        f"Agisci come Senior AI Solution Architect esperto nel mercato Gourmet Tedesco.\n"
        f"Analizza questo file: {path}\n"
        f"Stack Tecnico: MERN/Django, Docker, pgvector.\n"
        f"Obiettivo Business: Vendita olio d'oliva premium (Promontolio).\n\n"
        f"Fornisci un'analisi concisa (max 3 punti) su:\n"
        f"1. UX/Design (Luxury feel)\n"
        f"2. SEO/Localizzazione per il mercato di Francoforte\n"
        f"3. Qualità del codice e scalabilità SaaS.\n\n"
        f"CODICE:\n{content}"
    )

    # Tentativi di retry in caso di errore di quota (429)
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            if "429" in str(e):
                wait_time = (attempt + 1) * 20  # Aspetta 20, 40... secondi
                print(f"⚠️ Quota raggiunta. Attendo {wait_time}s prima di riprovare...")
                time.sleep(wait_time)
            else:
                return f"❌ Errore durante l'analisi: {str(e)}"
    return "❌ Timeout: Impossibile completare l'analisi dopo 3 tentativi."

def start_audit(directories):
    print(f"🚀 Avvio Audit Professionale per {directories}...")
    
    found_files = False
    for directory in directories:
        if not os.path.exists(directory):
            print(f"⚠️ Cartella non trovata: {directory}")
            continue

        for root, _, files in os.walk(directory):
            for file in files:
                # Selezioniamo solo i file critici per il business
                if file.endswith(('.ejs', '.scss', '.js')):
                    found_files = True
                    path = os.path.join(root, file)
                    
                    print(f"\n--- 📄 ANALISI IN CORSO: {path} ---")
                    
                    try:
                        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            if not content.strip():
                                continue
                            
                            report = analyze_file(path, content)
                            print(report)
                            
                            print("💤 Pausa di sicurezza per la quota (60s)...")
                            time.sleep(60)
                    except Exception as e:
                        print(f"❌ Errore nella lettura del file {path}: {e}")

    if not found_files:
        print("❌ Nessun file supportato trovato nelle cartelle indicate.")

# --- ESECUZIONE ---
if __name__ == "__main__":
    # Puntiamo alle tue cartelle chiave
    start_audit(['views', 'sass'])