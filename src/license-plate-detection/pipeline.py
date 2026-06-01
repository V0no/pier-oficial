"""
pipeline.py

Pipeline ANPR: detecta carro → detecta placa dentro do carro.

Uso:
    python pipeline.py --image foto.jpg
    python pipeline.py --image foto.jpg --show        # abre janela com resultado
    python pipeline.py --image foto.jpg --save        # salva imagem com bbox desenhado

Modelos esperados (na mesma pasta):
    model-vehicle/best.pt   ← Model 1 (detecta carro)
    model-plate/best.pt     ← Model 2 (detecta placa no carro)
"""

import argparse
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO


# ─── Configuração ─────────────────────────────────────────────────────────────

BASE_DIR        = Path(__file__).parent
MODEL_VEHICLE   = BASE_DIR / "model-vehicle" / "best.pt"
MODEL_PLATE     = BASE_DIR / "model-plate"   / "best.pt"

VEHICLE_CONF    = 0.4   # confiança mínima para detectar carro
PLATE_CONF      = 0.3   # confiança mínima para detectar placa
MARGIN          = 0.02  # margem ao recortar o carro (evita cortar bordas)


# ─── Funções ──────────────────────────────────────────────────────────────────

def add_margin(x1, y1, x2, y2, margin, img_w, img_h):
    """Adiciona margem percentual ao redor de um bounding box."""
    w = x2 - x1
    h = y2 - y1
    mx = int(w * margin)
    my = int(h * margin)
    x1 = max(0, x1 - mx)
    y1 = max(0, y1 - my)
    x2 = min(img_w, x2 + mx)
    y2 = min(img_h, y2 + my)
    return x1, y1, x2, y2


def run_pipeline(image_path: str, show: bool = False, save: bool = False):
    """
    Executa o pipeline completo:
      1. Detecta carro na imagem original
      2. Recorta o carro
      3. Detecta placa no carro recortado
      4. Retorna as coordenadas da placa na imagem original

    Retorna lista de dicts com:
        {
            'vehicle_bbox': (x1, y1, x2, y2),   # carro na imagem original
            'plate_bbox':   (x1, y1, x2, y2),   # placa na imagem original
            'plate_crop':   np.ndarray,           # imagem recortada da placa
            'vehicle_conf': float,
            'plate_conf':   float,
        }
    """
    print(f"\n📷 Imagem: {image_path}")

    # Carrega modelos
    model_vehicle = YOLO(MODEL_VEHICLE)
    model_plate   = YOLO(MODEL_PLATE)

    # Carrega imagem
    img = cv2.imread(str(image_path))
    if img is None:
        raise FileNotFoundError(f"Imagem não encontrada: {image_path}")

    img_h, img_w = img.shape[:2]
    results_out = []

    # ── Etapa 1: detecta carros ───────────────────────────────────────────────
    vehicle_results = model_vehicle(img, conf=VEHICLE_CONF, verbose=False)[0]
    vehicles = vehicle_results.boxes

    if len(vehicles) == 0:
        print("❌ Nenhum carro detectado na imagem.")
        return []

    print(f"🚗 {len(vehicles)} carro(s) detectado(s)")

    # ── Etapa 2: para cada carro, detecta placa ───────────────────────────────
    for i, vbox in enumerate(vehicles):
        vx1, vy1, vx2, vy2 = map(int, vbox.xyxy[0])
        vconf = float(vbox.conf[0])

        # Adiciona margem ao recorte do carro
        vx1m, vy1m, vx2m, vy2m = add_margin(vx1, vy1, vx2, vy2, MARGIN, img_w, img_h)
        car_crop = img[vy1m:vy2m, vx1m:vx2m]

        # Detecta placa dentro do recorte
        plate_results = model_plate(car_crop, conf=PLATE_CONF, verbose=False)[0]
        plates = plate_results.boxes

        if len(plates) == 0:
            print(f"  Carro {i+1}: placa não encontrada (conf veículo: {vconf:.2f})")
            continue

        # Pega a placa com maior confiança
        best_plate = max(plates, key=lambda b: float(b.conf[0]))
        px1, py1, px2, py2 = map(int, best_plate.xyxy[0])
        pconf = float(best_plate.conf[0])

        # Converte coordenadas da placa de volta para a imagem original
        px1_orig = vx1m + px1
        py1_orig = vy1m + py1
        px2_orig = vx1m + px2
        py2_orig = vy1m + py2

        plate_crop = img[py1_orig:py2_orig, px1_orig:px2_orig]

        print(f"  Carro {i+1}: ✅ placa encontrada | "
              f"veículo conf={vconf:.2f} | placa conf={pconf:.2f}")

        results_out.append({
            'vehicle_bbox': (vx1, vy1, vx2, vy2),
            'plate_bbox':   (px1_orig, py1_orig, px2_orig, py2_orig),
            'plate_crop':   plate_crop,
            'vehicle_conf': vconf,
            'plate_conf':   pconf,
        })

    # ── Visualização ──────────────────────────────────────────────────────────
    if (show or save) and results_out:
        vis = img.copy()
        for r in results_out:
            vx1, vy1, vx2, vy2 = r['vehicle_bbox']
            px1, py1, px2, py2 = r['plate_bbox']

            # Desenha carro (azul)
            cv2.rectangle(vis, (vx1, vy1), (vx2, vy2), (255, 100, 0), 2)
            cv2.putText(vis, f"vehicle {r['vehicle_conf']:.2f}",
                        (vx1, vy1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 100, 0), 2)

            # Desenha placa (verde)
            cv2.rectangle(vis, (px1, py1), (px2, py2), (0, 220, 0), 2)
            cv2.putText(vis, f"plate {r['plate_conf']:.2f}",
                        (px1, py1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 220, 0), 2)

        if save:
            out_path = Path(image_path).stem + "_pipeline_result.jpg"
            cv2.imwrite(out_path, vis)
            print(f"\n💾 Resultado salvo em: {out_path}")

        if show:
            cv2.imshow("Pipeline ANPR", vis)
            cv2.waitKey(0)
            cv2.destroyAllWindows()

    return results_out


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline ANPR: carro → placa")
    parser.add_argument("--image", required=True, help="Caminho da imagem de entrada")
    parser.add_argument("--show",  action="store_true", help="Mostra resultado numa janela")
    parser.add_argument("--save",  action="store_true", help="Salva imagem com resultado")
    args = parser.parse_args()

    detections = run_pipeline(args.image, show=args.show, save=args.save)

    print(f"\n📊 Resumo: {len(detections)} placa(s) detectada(s)")
    for i, d in enumerate(detections):
        print(f"  Placa {i+1}: bbox={d['plate_bbox']} | conf={d['plate_conf']:.2f}")
