import os
import re
from bs4 import BeautifulSoup

def fast_extract_pure_text(directories):
    output_path = "testi_puliti_promontolio.txt"
    with open(output_path, "w", encoding="utf-8") as out:
        for folder in directories:
            if not os.path.exists(folder): continue
            
            for root, _, files in os.walk(folder):
                for file in files:
                    if file.endswith('.ejs'):
                        full_path = os.path.join(root, file)
                        content = ""
                        
                        # Gestione codifiche (come prima)
                        for encoding in ['utf-8', 'utf-16', 'latin-1']:
                            try:
                                with open(full_path, 'r', encoding=encoding) as f:
                                    content = f.read()
                                break
                            except UnicodeError:
                                continue
                        
                        if content:
                            # 1. Rimuoviamo la logica EJS prima che BeautifulSoup si confonda
                            content = re.sub(r'<%.*?%>', '', content, flags=re.DOTALL)
                            
                            # 2. Usiamo BeautifulSoup per estrarre solo il testo
                            soup = BeautifulSoup(content, 'html.parser')
                            
                            # Rimuoviamo tag che non contengono testo utile al brand
                            for script_or_style in soup(['script', 'style', 'head', 'title', 'meta']):
                                script_or_style.decompose()

                            # 3. Pulizia finale degli spazi
                            pure_text = soup.get_text(separator=' ')
                            lines = [line.strip() for line in pure_text.splitlines() if line.strip()]
                            final_text = "\n".join(lines)
                            
                            out.write(f"\n--- PAGINA: {file} ---\n")
                            out.write(final_text + "\n")
                            
    print(f"✅ Estrazione PURE TEXT completata!")
    print(f"📂 File generato: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    fast_extract_pure_text(['views'])