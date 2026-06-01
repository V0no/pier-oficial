from ultralytics import YOLO

# Dicionário com o caminho dos seus 3 modelos atuais
modelos_para_treinar = {
    "modelo_1": "yolo08-model/license_plate_detector.pt",
    "modelo_2": "yolo26-test-model/best.pt",
    "modelo_3": "yolo26-UFPR-ALPR-model/best.pt"
}

DATASET_CONFIG = "datasets/google_plates/google_plates.yaml"

for nome, caminho_pt in modelos_para_treinar.items():
    print(f"\n=========================================")
    print(f"Iniciando Fine-Tuning do {nome}...")
    print(f"=========================================")
    
    # Carrega os pesos de cada modelo específico
    model = YOLO(caminho_pt)
    
    # Treina o modelo
    model.train(
        data=DATASET_CONFIG,
        epochs=30,               # 30 épocas para cada um avaliar a curva de aprendizado
        imgsz=640,
        batch=16,
        lr0=0.001,               # Taxa baixa para não apagar o passado
        freeze=10,               # Congela a base
        project='runs/fine_tune',
        name=f"{nome}_tunado",
        device='cpu'             # Mude para 0 se tiver GPU dedicada da NVIDIA
    )
    
    print(f"{nome} finalizado! Resultados salvos em runs/fine_tune/{nome}_tunado/")