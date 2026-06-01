import os
import time
import requests
import numpy as np
import cv2
from ultralytics import YOLO

# configurações
SERVER_URL = "http://localhost:8000"  # endereço do servidor
INTERVALO = 2  # segundos entre cada verificação
MODEL_PATH = "../model-plate/best.pt"
OUTPUT_DIR = "output/plates"

# setup
os.makedirs(OUTPUT_DIR, exist_ok=True)
model = YOLO(MODEL_PATH)
ultimo_frame_id = None

# funções
def salvar_recorte(recorte, frame_id):
    caminho = f"{OUTPUT_DIR}/placa_{frame_id}.jpg"
    cv2.imwrite(caminho, recorte)
    print(f"Recorte salvo em: {caminho}")

def verificar_frame_novo():
    resposta = requests.get(f"{SERVER_URL}/vision/latest-frame/meta")
    if resposta.status_code != 200:
        return None
    return resposta.json()
    
def baixar_imagem():
    resposta = requests.get(f"{SERVER_URL}/vision/latest-frame")
    if resposta.status_code != 200:
        return None
    return resposta.content  # retorna os bytes da imagem

def detectar_placa(imagem_bytes):
    # converte bytes para imagem
    array = np.frombuffer(imagem_bytes, dtype=np.uint8)
    img = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if img is None:
        return None, None
    
    # roda o YOLO
    resultados = model(img, conf=0.3, verbose=False)[0]
    
    if len(resultados.boxes) == 0:
        return None, None
    
    # pega a detecção com maior confiança
    melhor = max(resultados.boxes, key=lambda b: float(b.conf[0]))
    x1, y1, x2, y2 = map(int, melhor.xyxy[0])
    
    # recorta a placa
    recorte = img[y1:y2, x1:x2]
    confiança = float(melhor.conf[0])
    
    return recorte, confiança

#loop
while True:
    meta = verificar_frame_novo()
    
    if meta and meta["frame_id"] != ultimo_frame_id:
        print(f"Frame novo detectado: {meta['frame_id']}")
        ultimo_frame_id = meta["frame_id"]
        imagem_bytes = baixar_imagem()
        if imagem_bytes:
            print(f"Imagem baixada: {len(imagem_bytes)} bytes")
            recorte, confiança = detectar_placa(imagem_bytes)
            if recorte is not None:
                salvar_recorte(recorte, meta["frame_id"])
                print(f"Placa detectada! Confiança: {confiança:.2f}")
            else:
                print("Placa não encontrada na imagem.")
    else:
        print("Sem frame novo.")
    
    time.sleep(INTERVALO)
