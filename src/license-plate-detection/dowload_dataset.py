import fiftyone as fo
import fiftyone.zoo as foz
import os

# Define onde salvar na estrutura centralizada
EXPORT_DIR = "./datasets/google_plates"

print("Baixando e dividindo dados do Google Open Images...")

# 1. Baixa o lote de TREINO
train_split = foz.load_zoo_dataset("open-images-v7", split="train", label_types=["detections"],
    classes=["Vehicle registration plate"], max_samples=1500, seed=42, shuffle=True)

# 2. Baixa o lote de VALIDAÇÃO
val_split = foz.load_zoo_dataset("open-images-v7", split="validation", label_types=["detections"],
    classes=["Vehicle registration plate"], max_samples=300, seed=42, shuffle=True)

# 3. Baixa o lote de TESTE
test_split = foz.load_zoo_dataset("open-images-v7", split="test", label_types=["detections"],
    classes=["Vehicle registration plate"], max_samples=300, seed=42, shuffle=True)

# Exporta cada um para a pasta correta no formato YOLO
train_split.export(export_dir=os.path.join(EXPORT_DIR, "train"), dataset_type=fo.types.YOLOv5Dataset, label_field="ground_truth")
val_split.export(export_dir=os.path.join(EXPORT_DIR, "val"), dataset_type=fo.types.YOLOv5Dataset, label_field="ground_truth")
test_split.export(export_dir=os.path.join(EXPORT_DIR, "test"), dataset_type=fo.types.YOLOv5Dataset, label_field="ground_truth")

print("Download e divisão (Treino/Val/Teste) concluídos com sucesso!")