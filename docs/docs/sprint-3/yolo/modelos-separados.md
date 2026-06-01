---
title: Pipeline YOLO em Dois Estágios
sidebar_position: 2
slug: /modelos-separados
---

# Pipeline YOLO em Dois Estágios para ANPR

&emsp; Como parte da nova estratégia de visão computacional da Sprint 3, foi desenvolvido um pipeline de detecção em dois estágios independentes. Em vez de um único modelo detectar a placa diretamente na cena completa capturada pelo drone, o sistema foi dividido em dois modelos YOLO especializados que operam em sequência, cada um treinado para uma tarefa específica.

## Motivação

&emsp; A detecção direta de placas em imagens completas de drone apresenta limitações relevantes: a placa ocupa uma fração muito pequena da imagem total, o que dificulta a detecção precisa. A separação em dois estágios resolve esse problema ao garantir que cada modelo receba imagens adequadas ao seu contexto[¹](#ref-1):

1. **Model 1 — Detecção de Veículo**: recebe a cena completa e retorna a localização do carro;
2. **Model 2 — Detecção de Placa**: recebe o recorte do carro e retorna a localização da placa dentro dele.

&emsp; Essa abordagem é análoga ao funcionamento de sistemas de reconhecimento facial em catracas, onde um primeiro modelo localiza o rosto na cena e um segundo modelo o analisa em detalhe.

## Datasets

&emsp; Ambos os modelos foram treinados a partir do dataset público *License-Plates-3*[²](#ref-2), disponível na plataforma Roboflow. Esse dataset contém imagens anotadas com duas classes: `license-plate` (classe 0) e `vehicle` (classe 1). A partir dele, dois novos datasets foram gerados por scripts Python localizados em `src/license-plate-detection/`.

### dataset_vehicle

&emsp; Gerado pelo script `generate_vehicle_dataset.py`, esse dataset filtra apenas as anotações de veículo do dataset original, renomeando-as para classe 0. As imagens completas da cena são mantidas. Ele é utilizado para treinar o Model 1.

- **Train**: 236 imagens
- **Valid**: 68 imagens
- **Test**: 32 imagens
- **Classe**: `vehicle`

### dataset_plate_crop

&emsp; Gerado pelo script `crop_dataset.py`, esse dataset recorta a região do veículo em cada imagem original e recalcula as coordenadas da placa em relação ao recorte. Uma margem de 2% é aplicada ao redor do recorte para evitar cortes nas bordas da placa. Ele é utilizado para treinar o Model 2.

- **Train**: 292 imagens
- **Valid**: 79 imagens
- **Test**: 38 imagens
- **Classe**: `license-plate`

&emsp; Os datasets não são versionados no repositório (ver `.gitignore` em `src/license-plate-detection/datasets/`). Para recriá-los, execute os scripts na ordem a partir da pasta `src/license-plate-detection/`:

```bash
python generate_vehicle_dataset.py
python crop_dataset.py
```

## Treinamento

&emsp; Ambos os modelos foram treinados no Google Colab com GPU Tesla T4, utilizando o modelo base `yolov8n.pt`[¹](#ref-1) da biblioteca Ultralytics. Os notebooks de treinamento estão em:

- `src/license-plate-detection/model-vehicle/train.ipynb` — Model 1
- `src/license-plate-detection/model-plate/train.ipynb` — Model 2

&emsp; Os hiperparâmetros utilizados foram:

| Hiperparâmetro | Valor | Justificativa |
|----------------|-------|---------------|
| `epochs` | 200 | Permite convergência completa, com parada antecipada via `patience` |
| `batch` | 32 | Aproveita a memória da GPU T4 (14GB) |
| `imgsz` | 640 | Padrão YOLO, equilibra detalhe e custo computacional |
| `patience` | 25 | Interrompe o treino se não houver melhora por 25 épocas consecutivas |
| `modelo base` | yolov8n.pt | Versão nano, mais leve para prototipagem inicial |

## Métricas

### Model 1 — Detecção de Veículo

| Métrica | Valor |
|---------|-------|
| mAP50 | 83,5% |
| Precision | 84,4% |
| Recall | 82,2% |

### Model 2 — Detecção de Placa

| Métrica | Valor |
|---------|-------|
| mAP50 | 84,6% |
| mAP50-95 | 62,3% |
| Precision | 89,6% |
| Recall | 77,2% |

&emsp; A Precision elevada do Model 2 (89,6%) indica que, quando o modelo detecta uma placa, ele está correto na grande maioria das vezes. O Recall de 77,2% indica que cerca de 23% das placas não são detectadas — esse índice pode ser melhorado com um dataset maior e mais diverso ou com um modelo de maior capacidade como o `yolov8s.pt`.

## Pipeline de Detecção

&emsp; O script `pipeline.py`, localizado em `src/license-plate-detection/`, conecta os dois modelos em sequência. O fluxo de processamento é:

```
Imagem de entrada
      ↓
Model 1 detecta o carro → recorta a região com margem de 2%
      ↓
Model 2 detecta a placa dentro do recorte
      ↓
Retorna coordenadas da placa na imagem original
```

### Como utilizar

&emsp; Os modelos precisam estar nos seguintes caminhos (não versionados no repositório):

- `src/license-plate-detection/model-vehicle/best.pt`
- `src/license-plate-detection/model-plate/best.pt`

```bash
cd src/license-plate-detection

# Detectar e salvar imagem com bounding boxes desenhados
python pipeline.py --image caminho/da/imagem.jpg --save

# Detectar e abrir janela com resultado visual
python pipeline.py --image caminho/da/imagem.jpg --show
```

## Próximos Passos

&emsp; Os pontos abaixo foram identificados como melhorias futuras para aumentar a precisão e a generalização do sistema:

- **Modelo maior**: substituir `yolov8n.pt` por `yolov8s.pt` ou `yolov8m.pt` para maior precisão com custo computacional moderado;
- **Dataset mais diverso**: adicionar imagens com condições variadas — noite, chuva, diferentes ângulos de drone, placas brasileiras no padrão Mercosul;
- **Integração com OCR**: conectar a saída do pipeline com o módulo de leitura de texto da placa (FastPlate) para completar o pipeline ANPR.

## Referências

<span id="ref-1">1.</span> JOCHER, G.; CHAURASIA, A.; QIU, J. Ultralytics YOLOv8. Disponível em: https://docs.ultralytics.com/. Acesso em: 28 maio 2026.

<span id="ref-2">2.</span> Roboflow. License-Plates-3 Dataset. Disponível em: https://universe.roboflow.com/samrat-sahoo/license-plates-f8vsn/dataset/3. Acesso em: 28 maio 2026.
