"""
generate_vehicle_dataset.py

Gera o dataset para o Model 1 (detecção de carro na cena completa).
Usa o dataset original License-Plates-3 que já tem a classe:
  - 0: license-plate
  - 1: vehicle  ← vamos usar só essa

O resultado é um dataset YOLO com apenas a classe 'vehicle' (renomeada para classe 0),
pronto para treinar o primeiro YOLO do pipeline ANPR.

Pipeline:
  Imagem → [Model 1: detecta carro] → [Model 2: detecta placa no carro] → [OCR]
"""

import cv2
import shutil
import yaml
from pathlib import Path

# ─── Configuração ────────────────────────────────────────────────────────────

BASE_DIR   = Path(__file__).parent / "datasets" / "License-Plates-3"
OUTPUT_DIR = Path(__file__).parent / "datasets" / "dataset_vehicle"

SPLITS = ["train", "valid", "test"]

CLASS_VEHICLE = 1  # classe vehicle no dataset original

# ─── Funções ─────────────────────────────────────────────────────────────────

def process_split(split):
    img_dir = BASE_DIR / split / "images"
    lbl_dir = BASE_DIR / split / "labels"
    out_img = OUTPUT_DIR / split / "images"
    out_lbl = OUTPUT_DIR / split / "labels"
    out_img.mkdir(parents=True, exist_ok=True)
    out_lbl.mkdir(parents=True, exist_ok=True)

    images = list(img_dir.glob("*.jpg")) + list(img_dir.glob("*.png"))
    ok = 0
    skip = 0

    for img_path in images:
        lbl_path = lbl_dir / (img_path.stem + ".txt")
        if not lbl_path.exists():
            continue

        # Filtra só as linhas de vehicle (classe 1) e renomeia para classe 0
        vehicle_lines = []
        with open(lbl_path) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 5 and int(parts[0]) == CLASS_VEHICLE:
                    # Renomeia para classe 0 (vehicle será a única classe)
                    vehicle_lines.append("0 " + " ".join(parts[1:]))

        if not vehicle_lines:
            skip += 1
            continue

        # Copia a imagem
        shutil.copy(img_path, out_img / img_path.name)

        # Salva label só com vehicles
        with open(out_lbl / (img_path.stem + ".txt"), "w") as f:
            f.write("\n".join(vehicle_lines) + "\n")

        ok += 1

    print(f"[{split}] ✓ {ok} gerados | sem vehicle: {skip}")
    return ok

# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Gerando dataset de veículos para Model 1...\n")

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)

    total = 0
    for split in SPLITS:
        total += process_split(split)

    # Gera data.yaml
    data_yaml = {
        "train": "../train/images",
        "val":   "../valid/images",
        "test":  "../test/images",
        "nc":    1,
        "names": ["vehicle"],
        "source": "Gerado a partir de License-Plates-3 (samrat-sahoo/license-plates-f8vsn)"
    }
    with open(OUTPUT_DIR / "data.yaml", "w") as f:
        yaml.dump(data_yaml, f, default_flow_style=False, allow_unicode=True)

    print(f"\nPronto! {total} imagens geradas em: {OUTPUT_DIR}")
    print(f"data.yaml salvo em: {OUTPUT_DIR / 'data.yaml'}")
