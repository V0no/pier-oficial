---
id: ocr-finetune
title: Fine-Tuning do License Plate OCR
sidebar_label: Fine-Tuning OCR
sidebar_position: 1
---

# Fine-Tuning do License Plate OCR

&emsp;Esta documentação apresenta uma síntese do que foi implementado no notebook `train_plate_ocr`, com foco em demonstrar o conhecimento aplicado e registrar as escolhas técnicas do pipeline.

&emsp;O fluxo executado utiliza a arquitetura Compact Convolutional Transformer (CCT)[^1] e a biblioteca fast-plate-ocr[^2], cobrindo preparação dos dados, validação, treinamento (fine-tuning) e exportação do modelo conforme realizado no notebook.

## Preparação e Estruturação do Dataset

&emsp;O dataset foi organizado para manter as imagens recortadas das placas pareadas com um arquivo CSV de anotações. No notebook, as imagens selecionadas para treino e validação foram copiadas fisicamente para uma pasta de isolamento (`split/`), garantindo consistência dos caminhos utilizados durante o treino.

### Estrutura de Arquivos do Notebook

```text
notebook/
├── dataset/
│   └── split/
│       ├── train_annotations.csv
│       └── val_annotations.csv
└── ocr/
    ├── dataset/
    │   ├── plates/
    │   │   ├── plate_imgs/       # Imagens originais do dataset
    │   │   └── plates.csv         # Arquivo mestre de dados original
    │   └── split/
    │       └── plate_imgs/       # Imagens copiadas fisicamente pelo split
    ├── config/
    │   ├── model_config.yaml      # Configurações de camadas CCT
    │   └── plate_config.yaml      # Configurações do alfabeto e slots
    ├── modelos/
    │   └── base_model.keras       # Pesos pré-treinados para inicialização
    └── modelos_treinados/
        ├── best.keras             # Melhor checkpoint gerado
        └── best.onnx              # Modelo exportado final
```

### Divisão de Treino/Validação e Repadronização de Imagens

&emsp;Foi aplicada uma divisão 80% treino e 20% validação, com cópia física dos arquivos para `split/plate_imgs` e atualização dos caminhos nas planilhas de anotações, exatamente como no notebook.

```python
import shutil
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split

CSV_PATH = "ocr/dataset/plates/plates.csv"
IMG_DIR = "ocr/dataset/plates"

df = pd.read_csv(CSV_PATH)

# Cria o diretório de destino das imagens selecionadas
split_img_dir = Path("ocr/dataset/split/plate_imgs")
split_img_dir.mkdir(parents=True, exist_ok=True)

# Copia fisicamente as imagens e ajusta o caminho interno das anotações
def copy_and_repath(image_path):
    src = Path(IMG_DIR) / image_path
    filename = Path(image_path).name
    dst = split_img_dir / filename
    shutil.copy2(src, dst)
    return f"plate_imgs/{filename}"

df["image_path"] = df["image_path"].apply(copy_and_repath)

train_df, val_df = train_test_split(df, test_size=0.2, random_state=42)

print(f"Treino: {len(train_df)} | Validação: {len(val_df)}")

# Salva os arquivos de anotações separados
train_df.to_csv("dataset/split/train_annotations.csv", index=False)
val_df.to_csv("dataset/split/val_annotations.csv", index=False)
```

---

## Validação do Dataset

&emsp;No notebook, a validação das anotações foi executada antes do treinamento para garantir consistência do conjunto, evitando placas com número de caracteres acima de `max_plate_slots`, caracteres ausentes no alfabeto e arquivos corrompidos.

```bash
# Validar dataset de Treino
fast-plate-ocr validate-dataset \
    --annotations-file ocr/dataset/split/train_annotations.csv \
    --plate-config-file ocr/config/plate_config.yaml

# Validar dataset de Validação
fast-plate-ocr validate-dataset \
    --annotations-file ocr/dataset/split/val_annotations.csv \
    --plate-config-file ocr/config/plate_config.yaml
```

- `validate-dataset` (treino): verifica consistência do CSV de treino e dos caminhos das imagens.
- `validate-dataset` (validação): repete a checagem no CSV de validação.

---

## Treinamento e Fine-Tuning do Modelo

&emsp;O treinamento foi realizado carregando os pesos iniciais de `ocr/modelos/base_model.keras`, com 50 épocas e batch size 8, seguindo a configuração usada no notebook.

```bash
fast-plate-ocr train \
    --model-config-file ocr/config/model_config.yaml \
    --plate-config-file ocr/config/plate_config.yaml \
    --annotations       ocr/dataset/split/train_annotations.csv \
    --val-annotations   ocr/dataset/split/val_annotations.csv \
    --epochs 50 \
    --batch-size 8 \
    --output-dir ocr/modelos_treinados/ \
    --weights-path ocr/modelos/base_model.keras \
    --label-smoothing 0.0 \
    --weight-decay 0.0005 \
    --lr 0.0005
```

- `--model-config-file`: define a arquitetura CCT utilizada no treino.
- `--plate-config-file`: define o alfabeto e os slots de caracteres para o OCR.
- `--annotations`: conjunto de treino usado no ajuste fino.
- `--val-annotations`: conjunto de validação para acompanhar a generalização.
- `--epochs`: número de épocas do ajuste fino.
- `--batch-size`: tamanho do batch ajustado à memória disponível.
- `--output-dir`: pasta de saída para checkpoints e logs.
- `--weights-path`: pesos iniciais do modelo pré-treinado.
- `--label-smoothing`: suaviza os targets para reduzir overconfidence.
- `--weight-decay`: regularização L2 para reduzir overfitting.
- `--lr`: taxa de aprendizado do ajuste fino.

:::important[Por que inicializar com base_model.keras?]
Se rodarmos o treinamento **sem** `--weights-path`, as camadas CCT iniciam com pesos puramente aleatórios. Em cenários de poucos dados, o gradiente falha em guiar o otimizador, travando a perda (_loss_) em patamares elevados e gerando **0%** de acurácia de placa. A inicialização com pesos pré-treinados é o que define o sucesso do ajuste fino.
:::

---

## Avaliação Comparativa Pós-Treinamento

&emsp;Após o treino, a validação de OCR foi executada para medir a acurácia do modelo ajustado sobre o conjunto de validação.

```bash
fast-plate-ocr valid \
  --model modelos_treinados/best.keras \
  --plate-config-file ocr/config/plate_config.yaml \
  --annotations dataset/split/val_annotations.csv
```

- `--model`: checkpoint avaliado na validação.
- `--plate-config-file`: alfabeto e slots usados na decodificação.
- `--annotations`: CSV de validação usado para medir acurácia.

### Resultados da Avaliação

&emsp;O modelo atingiu 0.9762 de acurácia por placa e 0.9952 de acurácia por caractere, indicando desempenho sólido para o conjunto de validação.

<div align="center">
        ![Resultados](/img/ocr/finetune/resultados.png)
</div>

---

## Seleção do Modelo

&emsp;Após o treinamento, o melhor checkpoint[^3] foi exportado para **ONNX**[^4], viabilizando o uso do modelo em inferência de forma otimizada.

### Seleção Inteligente do Checkpoint

&emsp;Para a seleção do checkpoint, foi utilizado um script que identifica a maior acurácia (prefixo `acc_`) ou recorre ao `best.keras`, evitando escolhas manuais inconsistentes e garantindo que o melhor desempenho registrado seja exportado, conforme praticado no notebook.

```python
import glob

checkpoints = glob.glob("ocr/modelos_treinados/**/*.keras", recursive=True)

# Filtra checkpoints salvos com métricas de acurácia no nome
acc_checkpoints = [p for p in checkpoints if "acc_" in p]

if acc_checkpoints:
    # Ordena para capturar o de maior acurácia
    best_model = sorted(acc_checkpoints, key=lambda p: float(p.split("acc_")[-1].replace(".keras", "")))[-1]
else:
    # Caso ausentes, recorre ao best padrão ou primeiro disponível
    best_checkpoints = [p for p in checkpoints if "best" in p]
    best_model = best_checkpoints[0] if best_checkpoints else checkpoints[0]

print(f"Usando modelo selecionado: {best_model}")
```

### Exportação para ONNX

```bash
!fast-plate-ocr export \
    --format onnx \
    --plate-config-file ocr/config/plate_config.yaml \
    --simplify \
    --model {best_model}
```

- `--format onnx`: exporta o modelo no formato ONNX.
- `--plate-config-file`: garante o uso do alfabeto e dos slots corretos na exportacao.
- `--simplify`: aplica a simplificacao do grafo para facilitar a inferencia.
- `--model`: checkpoint selecionado para exportacao.

```python
exported_onnx = best_model.replace(".keras", ".onnx")
print(f"Modelo ONNX exportado: {exported_onnx}")
```

---

## Visualização com Matplotlib

&emsp;Com o ONNX exportado, foi executado um teste de inferência em uma imagem de validação para visualizar a predição usando OpenCV e Matplotlib, conforme o fluxo do notebook.

```python
from fast_plate_ocr import LicensePlateRecognizer
import cv2
from matplotlib import pyplot as plt

recognizer = LicensePlateRecognizer(
    onnx_model_path=exported_onnx,
    plate_config_path="ocr/config/plate_config.yaml",
)

TEST_IMAGE = "dataset/plates/plate_imgs/plate_1.jpg"

img = cv2.imread(TEST_IMAGE)
result = recognizer.run(img)
print("Predicted plate:", result)

# Converte canais BGR para RGB para renderização correta do Matplotlib
plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
plt.title(f"Prediction: {result}")
plt.axis("off")
plt.show()
```

<div align="center">
    ![Visualização](/img/ocr/finetune/deteccao_resultado.png)
</div>

## Uso do Modelo

&emsp;Após a exportação, o modelo ONNX pode ser carregado com `LicensePlateRecognizer` para executar a leitura de placas conforme o notebook:

```python
from fast_plate_ocr import LicensePlateRecognizer
import cv2

recognizer = LicensePlateRecognizer(
    onnx_model_path="ocr/modelo/modelo.onnx",
    plate_config_path="ocr/config/plate_config.yaml",
)

TEST_IMAGE = "dataset/plates/plate_imgs/plate_1.jpg"

img = cv2.imread(TEST_IMAGE)
result = recognizer.run(img)
```

## Conclusão e Próximos Passos

&emsp;Comparado aos resultados de avaliação do Fast-Plate-OCR na sprint anterior, a etapa de fine-tuning elevou a acurácia por placa para 0.9762 e a acurácia por caractere para 0.9952, indicando ganho consistente sobre o baseline descrito na [avaliacao-ocr](../sprint-2/avaliacao-ocr.md).

&emsp;Ainda assim, é importante testar o modelo com datasets adicionais, pois o treino foi realizado com apenas 164 imagens, o que introduz um risco residual de overfitting. Como próximo passo, recomenda-se validar o desempenho em conjuntos maiores e mais diversos.

## Referências

ANKANDREW. **fast-plate-ocr Documentation**. Versão 2.x. Disponível em: https://ankandrew.github.io/fast-plate-ocr/latest/. Acesso em: 28 mai. 2026.

ANKANDREW. **Tutorial: Fine-tune Plate OCR Model**. Disponível em: https://github.com/ankandrew/fast-plate-ocr/blob/master/examples/tutorial_fine_tune_plate_model.ipynb. Acesso em: 28 mai. 2026.

[^1]: CCT (Compact Convolutional Transformer) combina convoluções para extrair padrões locais com camadas Transformer para capturar contexto global, equilibrando custo computacional e acurácia em OCR de placas.

[^2]: A escolha do Fast-Plate-OCR foi consolidada na avaliação comparativa do projeto: [avaliacao-ocr](../sprint-2/avaliacao-ocr.md).

[^3]: Checkpoint é um snapshot dos pesos do modelo salvo durante o treinamento, usado para retomar o treino ou selecionar a melhor versão. O ONNX facilita portabilidade e inferência otimizada em diferentes runtimes, reduzindo dependência do backend de treino, além de ser o formato recomendado pelo Fast-Plate-OCR para uso em produção.

[^4]: O ONNX facilita portabilidade e inferência otimizada em diferentes runtimes, reduzindo dependência do backend de treino, além de ser o formato recomendado pelo Fast-Plate-OCR para uso em produção.
