import os
from ultralytics import YOLO

# Modelo pré-treinado
model = YOLO("yolo26n.pt")

config_path = '../datasets/License-Plate-Recognition-1/data.yaml'

# Apenas treinar em computador que aguente! Não recomendável fazer isso em um laptop!
results = model.train(data=config_path, epochs=200, patience=25, batch=32)

# Gera dados de validação
results = model.val()