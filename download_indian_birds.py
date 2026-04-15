import os
import requests
import pandas as pd
import time
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("XENO_CANTO_API_KEY")

if not API_KEY or API_KEY == "your_api_key_here":
    print("Please set a valid XENO_CANTO_API_KEY in your .env file.")
    exit(1)

# Ensure directories exist
OUTPUT_DIR = "data/indian_birds/audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 15 distinct and beautiful Indian bird species
species_list = [
    {"code": "indpea", "gen": "Pavo", "sp": "cristatus", "common": "Indian Peafowl"},
    {"code": "houcro", "gen": "Corvus", "sp": "splendens", "common": "House Crow"},
    {"code": "asikoe", "gen": "Eudynamys", "sp": "scolopaceus", "common": "Asian Koel"},
    {"code": "revbul", "gen": "Pycnonotus", "sp": "cafer", "common": "Red-vented Bulbul"},
    {"code": "commyn", "gen": "Acridotheres", "sp": "tristis", "common": "Common Myna"},
    {"code": "rorpar", "gen": "Psittacula", "sp": "krameri", "common": "Rose-ringed Parakeet"},
    {"code": "comtai", "gen": "Orthotomus", "sp": "sutorius", "common": "Common Tailorbird"},
    {"code": "ormrob", "gen": "Copsychus", "sp": "saularis", "common": "Oriental Magpie-Robin"},
    {"code": "whtkin", "gen": "Halcyon", "sp": "smyrnensis", "common": "White-throated Kingfisher"},
    {"code": "ruftre", "gen": "Dendrocitta", "sp": "vagabunda", "common": "Rufous Treepie"},
    {"code": "bladro", "gen": "Dicrurus", "sp": "macrocercus", "common": "Black Drongo"},
    {"code": "copbar", "gen": "Psilopogon", "sp": "haemacephalus", "common": "Coppersmith Barbet"},
    {"code": "pursun", "gen": "Cinnyris", "sp": "asiaticus", "common": "Purple Sunbird"},
    {"code": "rewlap", "gen": "Vanellus", "sp": "indicus", "common": "Red-wattled Lapwing"},
    {"code": "indrob", "gen": "Copsychus", "sp": "fulicatus", "common": "Indian Robin"},
]

MAX_RECORDINGS_PER_SPECIES = 40  # Keep it moderate so the download doesn't take hours
metadata_rows = []

def download_file(url, filepath):
    try:
        if os.path.exists(filepath):
            return True
        r = requests.get(url, stream=True, timeout=15)
        if r.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

for bird in species_list:
    print(f"\n--- Processing {bird['common']} ---")
    query = f"gen:{bird['gen']} sp:{bird['sp']} cnt:India"
    api_url = f"https://xeno-canto.org/api/3/recordings?query={query}&key={API_KEY}"
    
    try:
        response = requests.get(api_url, timeout=10)
        data = response.json()
        recordings = data.get("recordings", [])
        
        if not recordings:
            print(f"No recordings found for {bird['common']}")
            continue
            
        print(f"Found {len(recordings)} recordings (will download up to {MAX_RECORDINGS_PER_SPECIES})")
        
        download_count = 0
        for rec in recordings:
            if download_count >= MAX_RECORDINGS_PER_SPECIES:
                break
                
            rec_id = rec.get("id")
            if not rec_id: continue
                
            # Download URL. Sometimes the API file url doesn't include https:
            file_url = rec.get("file")
            if file_url and file_url.startswith("//"):
                file_url = "https:" + file_url
                
            file_ext = rec.get("file-name", ".mp3").split('.')[-1].lower()
            if file_ext not in ['mp3', 'wav', 'ogg']:
                file_ext = 'ogg'
            
            filename = f"{bird['code']}_{rec_id}.{file_ext}"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            if download_file(file_url, filepath):
                # We need features: primary_label, filename, class_name, etc. for train.csv
                metadata_rows.append({
                    "primary_label": bird["code"],
                    "secondary_labels": "[]",
                    "type": rec.get("type", ""),
                    "scientific_name": f"{bird['gen']} {bird['sp']}",
                    "common_name": bird["common"],
                    "class_name": bird["common"],
                    "filename": filename,
                    "rating": rec.get("q", "C"),
                    "url": rec.get("url", ""),
                })
                download_count += 1
                if download_count % 5 == 0:
                    print(f"Downloaded {download_count}...")
            time.sleep(0.5) # rate limit courtesy
            
    except Exception as e:
        print(f"Failed to fetch data for {bird['common']}: {e}")

# Save the metadata
df = pd.DataFrame(metadata_rows)
out_csv = "data/indian_birds/train.csv"
df.to_csv(out_csv, index=False)
print(f"\nDone! Metadata saved to {out_csv} with {len(df)} total recordings.")
