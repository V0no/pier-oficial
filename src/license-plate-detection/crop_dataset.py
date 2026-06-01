"""
crop_dataset.py

Gera um novo dataset YOLO a partir do dataset original (License-Plates-3).
O dataset original tem duas classes:
  - 0: license-plate
  - 1: vehicle

Este script:
  1. Recorta a região do carro (classe 1) de cada imagem
  2. Recalcula o bounding box da placa (classe 0) relativo ao carro recortado
  3. Salva o novo dataset em datasets/dataset_plate_crop/

Resultado: imagens de carros com label indicando onde está a placa —
perfeito para treinar o segundo modelo YOLO do pipeline ANPR.
"""

import cv2
import numpy as np
from pathlib import Path
import shutil
import yaml

# ─── Configuração ────────────────────────────────────────────────────────────

BASE_DIR    = Path(__file__).parent / "datasets" / "License-Plates-3"
OUTPUT_DIR  = Path(__file__).parent / "datasets" / "dataset_plate_crop"

SPLITS = ["train", "valid", "test"]

CLASS_PLATE   = 0
CLASS_VEHICLE = 1

# Margem extra ao recortar o carro (evita cortar a placa na borda)
MARGIN = 0.02  # 2% da dimensão da imagem

# ─── Funções ─────────────────────────────────────────────────────────────────

def yolo_to_pixels(box, img_w, img_h):
    """Converte bbox YOLO (cx, cy, w, h) normalizados para pixels (x1, y1, x2, y2)."""
    cx, cy, bw, bh = box
    x1 = int((cx - bw / 2) * img_w)
    y1 = int((cy - bh / 2) * img_h)
    x2 = int((cx + bw / 2) * img_w)
    y2 = int((cy + bh / 2) * img_h)
    return x1, y1, x2, y2


def pixels_to_yolo(x1, y1, x2, y2, crop_w, crop_h):
    """Converte pixels (x1, y1, x2, y2) para bbox YOLO normalizado relativo ao crop."""
    cx = ((x1 + x2) / 2) / crop_w
    cy = ((y1 + y2) / 2) / crop_h
    bw = (x2 - x1) / crop_w
    bh = (y2 - y1) / crop_h
    # Clamp para [0, 1]
    cx = max(0.0, min(1.0, cx))
    cy = max(0.0, min(1.0, cy))
    bw = max(0.0, min(1.0, bw))
    bh = max(0.0, min(1.0, bh))
    return cx, cy, bw, bh


def process_split(split):
    img_dir   = BASE_DIR / split / "images"
    lbl_dir   = BASE_DIR / split / "labels"
    out_img   = OUTPUT_DIR / split / "images"
    out_lbl   = OUTPUT_DIR / split / "labels"
    out_img.mkdir(parents=True, exist_ok=True)
    out_lbl.mkdir(parents=True, exist_ok=True)

    images = list(img_dir.glob("*.jpg")) + list(img_dir.glob("*.png"))
    ok = 0
    skip_no_vehicle = 0
    skip_no_plate   = 0
    skip_plate_outside = 0

    for img_path in images:
        lbl_path = lbl_dir / (img_path.stem + ".txt")
        if not lbl_path.exists():
            continue

        img = cv2.imread(str(img_path))
        if img is None:
            continue
        h, w = img.shape[:2]

        # Lê todas as anotações
        vehicles = []
        plates   = []
        with open(lbl_path) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) != 5:
                    continue
                cls = int(parts[0])
                box = list(map(float, parts[1:]))
                if cls == CLASS_VEHICLE:
                    vehicles.append(box)
                elif cls == CLASS_PLATE:
                    plates.append(box)

        if not vehicles:
            skip_no_vehicle += 1
            continue
        if not plates:
            skip_no_plate += 1
            continue

        # Para cada carro, encontra a placa mais próxima (caso haja vários carros)
        for v_idx, vehicle_box in enumerate(vehicles):
            vx1, vy1, vx2, vy2 = yolo_to_pixels(vehicle_box, w, h)

            # Aplica margem
            margin_x = int(MARGIN * w)
            margin_y = int(MARGIN * h)
            vx1 = max(0, vx1 - margin_x)
            vy1 = max(0, vy1 - margin_y)
            vx2 = min(w, vx2 + margin_x)
            vy2 = min(h, vy2 + margin_y)

            crop_w = vx2 - vx1
            crop_h = vy2 - vy1
            if crop_w <= 0 or crop_h <= 0:
                continue

            # Recorta o carro
            car_crop = img[vy1:vy2, vx1:vx2]

            # Encontra a placa que melhor se encaixa dentro desse carro
            best_plate = None
            best_overlap = 0.0
            for plate_box in plates:
                px1, py1, px2, py2 = yolo_to_pixels(plate_box, w, h)
                # Calcula sobreposição com o carro
                ix1 = max(vx1, px1)
                iy1 = max(vy1, py1)
                ix2 = min(vx2, px2)
                iy2 = min(vy2, py2)
                inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
                plate_area = (px2 - px1) * (py2 - py1)
                if plate_area > 0:
                    overlap = inter / plate_area
                    if overlap > best_overlap:
                        best_overlap = overlap
                        best_plate = plate_box

            # Aceita apenas se a placa está majoritariamente dentro do carro
            if best_plate is None or best_overlap < 0.5:
                skip_plate_outside += 1
                continue

            # Recalcula coordenadas da placa relativas ao crop do carro
            px1, py1, px2, py2 = yolo_to_pixels(best_plate, w, h)
            px1_rel = px1 - vx1
            py1_rel = py1 - vy1
            px2_rel = px2 - vx1
            py2_rel = py2 - vy1

            new_box = pixels_to_yolo(px1_rel, py1_rel, px2_rel, py2_rel, crop_w, crop_h)

            # Nome do arquivo de saída
            suffix = f"_v{v_idx}" if len(vehicles) > 1 else ""
            out_name = img_path.stem + suffix

            # Salva imagem recortada
            cv2.imwrite(str(out_img / (out_name + img_path.suffix)), car_crop)

            # Salva label (só classe 0 = license-plate)
            with open(out_lbl / (out_name + ".txt"), "w") as f:
                f.write(f"0 {new_box[0]:.6f} {new_box[1]:.6f} {new_box[2]:.6f} {new_box[3]:.6f}\n")

            ok += 1

    print(f"[{split}] ✓ {ok} gerados | sem carro: {skip_no_vehicle} | sem placa: {skip_no_plate} | placa fora: {skip_plate_outside}")
    return ok


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Gerando dataset de carros recortados com label de placa...\n")

    # Limpa output anterior se existir
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
        "names": ["license-plate"],
        "source": "Gerado a partir de License-Plates-3 (samrat-sahoo/license-plates-f8vsn)"
    }
    with open(OUTPUT_DIR / "data.yaml", "w") as f:
        yaml.dump(data_yaml, f, default_flow_style=False, allow_unicode=True)

    print(f"\nPronto! {total} imagens geradas em: {OUTPUT_DIR}")
    print(f"data.yaml salvo em: {OUTPUT_DIR / 'data.yaml'}")
