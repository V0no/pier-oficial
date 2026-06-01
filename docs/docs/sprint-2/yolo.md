---
title: YOLO
sidebar_position: 1
---

&emsp; Para o desenvolvimento da visão computacional capaz de identificar placas de veículos[²](#ref-2), avaliamos a arquitetura YOLO (You Only Look Once)[¹](#ref-1) em duas versões diferentes e comparamos as métricas de cada uma. Esse fluxo de implementação permitiu a comparação de diferentes modelos e diferentes processamentos, determinando assim quais são as melhores métricas e o modelo mais viável para ser utilizado na solução.

Por isso, nessa etapa do projeto, o desenvolvimento foi dividido em duas frentes de validação:

- Modelo Pré-treinado: Utilização de uma rede especializada em *'License Plate Recognition'* para validar o fluxo de dados e a integração com o hardware do drone.

- Modelo Customizado: Desenvolvimento de um modelo treinado especificamente com bases de dados adaptadas ao cenário brasileiro[²](#ref-2) e às condições de captura aérea[³](#ref-3), visando otimizar a acurácia para os padrões de placas e ângulos de visão do projeto. Ainda não integrado ao drone.

Esta seção detalha as métricas de confiança obtidas e as características de cada modelo.

## Modelo pré-treinado

&emsp; A utilização de modelos pré-treinados é uma prática comum no desenvolvimentos de sistemas que utilizam visão computacional para estabelecer parâmetros iniciais de desempenho e de funcionamento do modelo. Esses modelos já passaram por um treinamento e permite que, caso seja o modelo escolhido, o foco do desenvolvimento seja na otimização, na customização e no aprimoramento do modelo.

### Como utilizar o modelo escolhido?

&emsp; O modelo utilizado (license_plate_detector.pt) foi extraido de um repositório público[⁵](#ref-5). Para utilizá-lo, seguimos o seguinte fluxo:
1. Acesse o repositório no seguinte link: [license_plate_detector](https://github.com/Muhammad-Zeerak-Khan/Automatic-License-Plate-Recognition-using-YOLOv8/blob/main/license_plate_detector.pt)
2. Faça download do arquivo (license_plate_detector.pt) qur contém a arquitetura do modelo.
3. Crie um ambiente virtual e instale as bibliotecas presente em *requirements.txt*.
4. Conecte com o drone via wi-fi.
5. Execute o código presente em *tello.py*, as imagens capturadas serão salvas em *outputs* (Lembre-se que o arquivo do modelo e o código em python, ambos devem estar na mesma instância de pasta).

&emsp; Com esses passos, o sistema será capaz de identificar e capturar as placas dos veículos presentes no campo de visão do drone, assim como demonstrado na figura demonstrativa abaixo.

<div style={{ textAlign: 'center' }}>

*Figura 1. Detecção da placa de um carro.*

<img
  src="/img/yolo_v08.jpg"
  alt="Detecção da placa de um carro."
  width="1000"
/>

*Fonte: produzido pelo grupo*

</div>

### Características do modelo escolhido

&emsp; Embora existam versões numericamente superiores de modelos de YOLO, algumas características da v8 fazem com que esse modelo seja o mais coerente para o desenvolvimento do projeto e comparação de métricas. Entre elas, destacam-se:
- **Estabilidade e Documentação**: A v8 é considerada a versão mais estável e amplamente documentada para uso comercial e acadêmico atual;
- **Ecossistema**: A compatibilidade com bibliotecas de exportação (para rodar em hardwares embarcados[¹](#ref-1)) é mais robusta na v8;
- **Balanceamento**: Oferece a melhor relação entre latência (velocidade) e precisão para dispositivos de borda, como o computador que processa os dados do drone.

&emsp; Enquanto o modelo pré-treinado serve para validar o fluxo, o modelo que estamos treinando internamente utiliza versões mais recentes e dados específicos de placas brasileiras (Mercosul e cinza), corrigindo falhas de generalização que modelos estrangeiros apresentam no nosso cenário.

### Estrutura de Arquivos

&emsp; A organização da pasta *src/license-plate-detection/yolo08-model/* foi estruturada para separar o ambiente de teste do desenvolvimento e operação do modelo:
- **images_test/**: Banco de imagens estáticas utilizado para validar a acurácia do modelo sem a necessidade de voo;
- **outputs_test/**: Resultados visuais dos testes em lote, permitindo auditoria das detecções;
- **outputs/**: Pasta operacional que armazena capturas em tempo real feitas pelo drone durante a missão;
- **license_plate_detector.pt**: Arquivo que contém os pesos da rede neural do modelo pré-treinado;
- **val/**: Pasta que contém as meétricas dos testes realizados no modelo;
- **requirements.txt**: Garante a reprodutibilidade do ambiente em qualquer máquina, contém as bibliotecas necessárias para o funcionamento do modelo.

&emsp; Ao rodar o ambiente de teste (*teste_images.py*), o sistema processa todas as imagens da pasta *images_test/* e gera um relatório detalhado na pasta *outputs_test/*. 

### Operação do modelo

&emsp; O script *tello.py* é o responsável pela operação do modelo, ele é responsável por conectar com o drone, capturar as imagens e processá-las com o modelo. Para maior otimização do sistema, alguns parâmetros foram utilizados:
- **Lógica de Cooldown**: Para que o modelo não detecte repetidamente a mesma placa, foi implementada uma lógica de cooldown que impede que o modelo detecte a mesma placa mais de uma vez dentro de 10 segundos;
- **Streamon & Frame Read**: Utiliza threads para garantir que a leitura do vídeo não trave o processamento da IA;
- **OpenCV em vez de Matplotlib**: Escolhemos o OpenCV para exibição porque ele utiliza aceleração de hardware, reduzindo o delay do vídeo para o operador[⁴](#ref-4);
- **Conf=0.5**: Definimos um limiar de confiança de 50%. Isso reduz "Falsos Positivos" (objetos que parecem placas, mas não são), garantindo que apenas dados de maior confiabilidade sejam considerados;
- **Separação de Outputs**: Criar pastas distintas para testes e operação real evita a poluição de dados e facilita a análise de métricas de sucesso da Sprint.

### Métricas

&emsp; A partir do modelo pré-treinado, foram analisadas métricas de desempenho para validar sua capacidade de generalização e definir parâmetros ideais de operação em ambiente real. As curvas geradas permitem entender o equilíbrio entre precisão, recall e desempenho geral do classificador.

#### Precisão (Precision)

&emsp; A métrica de precisão avalia quantas das detecções realizadas pelo modelo realmente correspondem a placas válidas. Conforme observado no gráfico, a precisão aumenta à medida que o limiar de confiança cresce, atingindo 100% de precisão em aproximadamente 77,4% de confiança. Isso indica que, em níveis mais altos de confiança, o modelo praticamente elimina falsos positivos.

<div style={{ textAlign: 'center' }}>

Figura 2. Curva Precision-Confidence.

<img src="/img/yolov8-metrics/BoxP_curve.png" alt="Curva Precision-Confidence" width="700" />

Fonte: produzido pelo grupo

</div>

#### Revocação (Recall)

&emsp; O recall mede a capacidade do modelo em encontrar todas as placas presentes nas imagens. O modelo apresentou 90% de recall em baixos níveis de confiança, porém essa taxa reduz conforme o limiar aumenta. Isso demonstra que filtros mais rigorosos diminuem a quantidade de detecções perdidas, mas podem deixar de identificar alguns objetos.

<div style={{ textAlign: 'center' }}>

Figura 3. Curva Recall-Confidence.

<img src="/img/yolov8-metrics/BoxR_curve.png" alt="Curva Recall-Confidence" width="700" />

Fonte: produzido pelo grupo

</div>

#### F1-Score

&emsp; O F1-Score representa o equilíbrio entre precisão e recall. O melhor resultado encontrado foi 0,87 com limiar de confiança em aproximadamente 27,8%, indicando o ponto de operação mais equilibrado para o sistema, reduzindo tanto falsos positivos quanto falsas negativas.

<div style={{ textAlign: 'center' }}>

Figura 4. Curva F1-Confidence.

<img src="/img/yolov8-metrics/BoxF1_curve.png" alt="Curva F1-Confidence" width="700" />

Fonte: produzido pelo grupo

</div>

#### Curva Precision-Recall e mAP

&emsp; A curva Precision-Recall mostra o comportamento do modelo considerando simultaneamente precisão e cobertura das detecções. O modelo obteve mAP@0.5 de 0,879, indicando que aproximadamente 87,9% das placas foram corretamente detectadas e localizadas dentro do critério de interseção adotado. Esse resultado demonstra boa capacidade de generalização para o cenário proposto.

<div style={{ textAlign: 'center' }}>

Figura 5. Curva Precision-Recall.

<img src="/img/yolov8-metrics/BoxPR_curve.png" alt="Curva Precision-Recall" width="700" />

Fonte: produzido pelo grupo

</div>

#### Matriz de Confusão Normalizada

&emsp; A matriz de confusão normalizada permite analisar o desempenho do modelo em relação às classes previstas e reais. Observa-se que a classe license_plate apresentou taxa de acerto de aproximadamente 83%, indicando que a maior parte das placas presentes nas imagens foi corretamente identificada. Entretanto, cerca de 17% das placas foram classificadas como background, representando casos de falso negativo.

<div style={{ textAlign: 'center' }}>

Figura 6. Matriz de Confusão Normalizada.

<img src="/img/yolov8-metrics/confusion_matrix_normalized.png" alt="Matriz de Confusão Normalizada" width="700" />

Fonte: produzido pelo grupo

</div>

&emsp; Com base nessas métricas, definiu-se a utilização de confidence threshold de 0.5 na operação com o drone, buscando equilíbrio entre confiabilidade das detecções e capacidade de identificar placas em tempo real.

## Modelos customizados

&emsp; Durante a Sprint 2 experimentamos com o treinamento de modelos customizados usando datasets públicos de imagens de veículos. O objetivo disso é desenvolver um modelo especializado capaz de reconhecer as placas brasileiras de forma mais precisa. Decidimos no uso do YOLO26, essa sendo a versão mais recente oficialmente lançada no momento de escrita[⁶](#ref-6); essa versão traz uma versão simplificada da pipeline vista em outros modelos como o YOLOv8, mas otimizada de maneira para não sacrificar a precisão no reconhecimento. Durante nossos testes não notamos redução significativa na precisão do reconhecimento ao usar essa versão, mas facilitou o processo de treinamento e validação devido à nova sintaxe e velocidade superior, especialmente lidando com datasets maiores.

&emsp; Usando o modelo *YOLO26n* como base inicial de treinamento, foram desenvolvidos dois modelos, treinados em cima de dois datasets distintos:
- **Modelo A**: Treinado em cima de um dataset público disponível na plataforma Roboflow[⁷](#ref-7). Dataset de apenas 350 imagens, mas com boa variedade de ângulos, veículos, iluminação, qualidade de imagem, etc. Placas internacionais.
- **Modelo B**: Treinado em cima do dataset UFPR-ALPR[⁸](#ref-8). Dataset de 4500 imagens de alta resolução anotadas de veículos em movimento, todos com placas brasileiras. Baixa variedade de ângulos e qualidade, todas as imagens são tiradas da vista de trás do veículo, com a câmera dentro de outro veículo.

### Estrutura de Arquivos

&emsp; Os modelos possuem pastas dedicadas, com o modelo A sendo armazenado na pasta *src/license-plate-detection/yolo26-test-model/*, e o modelo B na pasta *src/license-plate-detection/yolo26-UFPR-ALPR-model/*. Ambos possuem a exata mesma estrutura interna:
- **train.ipynb**: Jupyter Notebook com a lógica de treinamento do modelo, permitindo maior flexibilidade no processo;
- **validate.ipynb**: Jupyter Notebook com código que gera arquivos de métricas dos modelos;
- **val/ e variações**: Pasta que armazena as métricas geradas pelo notebook de validação;
- **best.pt**: Arquivo que contém os pesos da rede neural do melhor modelo treinado pela equipe.

&emsp; Ademais, os datasets utilizados são armazenados em *src/license-plate-detection/datasets/*, com arquivo *.gitignore* para evitar a publicação de dados sensíveis no repositório. Isso significa que o usuário deverá instalar os datasets por conta própria para re-treinar ou validar os modelos.
&emsp; A instalação do dataset do modelo A ocorre durante a execução do código, enquanto o modelo B possui o arquivo **format-dataset.ipynb**, que deve ser executado para reorganizar o dataset em formato compatível com o YOLO26.

### Instruções de uso

Crie um ambiente virtual e instale as bibliotecas presente em *requirements.txt*.

**Caso deseje utilizar o modelo A**, no arquivo *src/license-plate-detection/yolo26-test-model/train.ipynb* altere o valor da variável api-key para a chave API da sua conta do Roboflow;

**Caso deseje utilizar o modelo B**, extraia o arquivo *.zip* do dataset em *src/license-plate-detection/yolo26-UFPR-ALPR-model/* e execute a célula única do notebook *format-dataset.ipynb*. Depois disso, mova a pasta gerada para *src/license-plate-detection/datasets/*;

**Re-treinar**: Execute todas as células do notebook *train.ipynb* dentro da pasta do modelo condizente. O arquivo com os pesos resultantes será gerado em *runs/detect/train/weights/best.pt*. Se desejar validar esse novo modelo, substitua o arquivo *best.pt* por esse.

**Validar**: Execute todas as células do notebook *validate.ipynb* dentro da pasta do modelo condizente. Serão gerados diversos arquivos de métricas em *runs/detect/val*.

### Métricas

<div style={{ textAlign: 'center' }}>
Figura 7-12. Métricas de validação modelo A com dataset Roboflow.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/a/roboflow/BoxF1_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/a/roboflow/BoxP_curve.png" alt="Photo 2" />
    <img src="/img/yolo26-metrics/a/roboflow/BoxPR_curve.png" alt="Photo 3" />
    <img src="/img/yolo26-metrics/a/roboflow/BoxR_curve.png" alt="Photo 4" />
    <img src="/img/yolo26-metrics/a/roboflow/confusion_matrix.png" alt="Photo 5" />
    <img src="/img/yolo26-metrics/a/roboflow/confusion_matrix_normalized.png" alt="Photo 6" />
  </div>
  Fonte: produzido pelo grupo
</div>

<div style={{ textAlign: 'center' }}>
Figura 13-18. Métricas de validação modelo A com dataset UFPR-ALPR.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/a/ufpr-alpr/BoxF1_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/a/ufpr-alpr/BoxP_curve.png" alt="Photo 2" />
    <img src="/img/yolo26-metrics/a/ufpr-alpr/BoxPR_curve.png" alt="Photo 3" />
    <img src="/img/yolo26-metrics/a/ufpr-alpr/BoxR_curve.png" alt="Photo 4" />
    <img src="/img/yolo26-metrics/a/ufpr-alpr/confusion_matrix.png" alt="Photo 5" />
    <img src="/img/yolo26-metrics/a/ufpr-alpr/confusion_matrix_normalized.png" alt="Photo 6" />
  </div>
  Fonte: produzido pelo grupo
</div>

<div style={{ textAlign: 'center' }}>
Figura 19-25. Métricas de validação modelo B com dataset Roboflow.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/b/roboflow/BoxF1_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/b/roboflow/BoxP_curve.png" alt="Photo 2" />
    <img src="/img/yolo26-metrics/b/roboflow/BoxPR_curve.png" alt="Photo 3" />
    <img src="/img/yolo26-metrics/b/roboflow/BoxR_curve.png" alt="Photo 4" />
    <img src="/img/yolo26-metrics/b/roboflow/confusion_matrix.png" alt="Photo 5" />
    <img src="/img/yolo26-metrics/b/roboflow/confusion_matrix_normalized.png" alt="Photo 6" />
  </div>
  Fonte: produzido pelo grupo
</div>

<div style={{ textAlign: 'center' }}>
Figura 26-32. Métricas de validação modelo B com dataset UFPR-ALPR.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/b/ufpr-alpr/BoxF1_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/b/ufpr-alpr/BoxP_curve.png" alt="Photo 2" />
    <img src="/img/yolo26-metrics/b/ufpr-alpr/BoxPR_curve.png" alt="Photo 3" />
    <img src="/img/yolo26-metrics/b/ufpr-alpr/BoxR_curve.png" alt="Photo 4" />
    <img src="/img/yolo26-metrics/b/ufpr-alpr/confusion_matrix.png" alt="Photo 5" />
    <img src="/img/yolo26-metrics/b/ufpr-alpr/confusion_matrix_normalized.png" alt="Photo 6" />
  </div>
  Fonte: produzido pelo grupo
</div>

## Comparação de resultados

&emsp; Diante dos resultados obtidos, observa-se primeiramente um caso de overfitting no modelo B, pois atinge números espetaculares no seu próprio dataset de validação, mas no momento que enfrenta o dataset da Roboflow ele mostra sua fraqueza. O dataset no qual o modelo foi treinado não consta com esses casos, e por isso esse modelo se torna inviável para uso com imagens capturadas pelo drone. As imagens abaixo mostram predições do modelo B em cima de imagens do dataset UFPR-ALPR (figura 33) e dataset Roboflow (figura 34); note como ele performa excepcionalmente bem em ambiente controlado e falha completamente quando sai dele.

<div style={{ textAlign: 'center' }}>

Figura 33. Predições do **modelo B** com dataset UFPR-ALPR.

<img src="/img/yolo26-metrics/b/ufpr-alpr/val_batch0_pred.jpg" width="900" />

Fonte: produzido pelo grupo

</div>

<div style={{ textAlign: 'center' }}>

Figura 34. Predições do **modelo B** com dataset Roboflow.

<img src="/img/yolo26-metrics/b/roboflow/val_batch0_pred.jpg" width="900" />

Fonte: produzido pelo grupo

</div>

&emsp; Por outro lado, o modelo A não alcança números tão altos no seu dataset de validação próprio quanto o modelo B, mas ainda performa muito bem, especialmente considerando quão menor de um dataset ele usa. 

<div style={{ textAlign: 'center' }}>

Figura 35. Predições do **modelo A** com dataset Roboflow.

<img src="/img/yolo26-metrics/a/roboflow/val_batch0_pred.jpg" width="900" />

Fonte: produzido pelo grupo

</div>

&emsp; Ao validar o modelo A no dataset UFPR-ALPR, os números não são promissores, mas observando as imagens nota-se que o modelo é muito mais preciso do que parece, e um grande fator para a redução do cálculo da precisão se dá pelo modelo reconhecer o próprio veículo no qual a câmera está dentro, algo que o dataset original não considera.

<div style={{ textAlign: 'center' }}>

Figura 36. Predições do **modelo A** com dataset UFPR-ALPR.

<img src="/img/yolo26-metrics/a/ufpr-alpr/val_batch1_pred.jpg" width="900" />

Fonte: produzido pelo grupo

</div>

<div style={{ textAlign: 'center' }}>

Figura 37. Labels originais do dataset UFPR-ALPR.

<img src="/img/yolo26-metrics/a/ufpr-alpr/val_batch1_labels.jpg" width="900" />

Fonte: produzido pelo grupo

</div>

<div style={{ textAlign: 'center' }}>

Figura 17. Matriz de Confusão do modelo A com dataset UFPR-ALPR.

<img src="/img/yolo26-metrics/a/ufpr-alpr/confusion_matrix.png" width="900" />

Fonte: produzido pelo grupo

</div>

&emsp; Note como na matriz de confusão (figura 17) o modelo reconhece um veículo onde o dataset mostra que não existe nada, que mostra que esse caso de borda ocorre muito frequentemente (uma vez que todas as imagens do dataset são da visão do veículo).

&emsp; Por fim, observa-se a performance do modelo pré-treinado com o dataset da Roboflow, que traz ótimos resultados em cima desses dados. É capaz de reconhecer consistentemente as placas dos veículos. Nota-se que esse modelo não reconhece veículo, apenas as placas.

<div style={{ textAlign: 'center' }}>

Figura 38. Predições do **modelo pré-treinado** com dataset Roboflow.

<img src="/img/yolov8-metrics/val_batch1_pred.jpg" width="900" />

Fonte: produzido pelo grupo

</div>

&emsp; Contudo, a decisão fica entre o uso do modelo A e o modelo pré-treinado, já descartando o uso do modelo B, que demonstrou-se inapto para tal aplicação (porém o dataset ainda pode ser útil no desenvolvimento do algoritmo de OCR). Como próximo passo, a equipe deve capturar imagens do drone e avaliar ambos os modelos em cima delas.

## Referências

<span id="ref-1">1.</span> JOCHER, G.; CHAURASIA, A.; QIU, J. Ultralytics YOLOv8. Disponível em: https://docs.ultralytics.com/
. Acesso em: 13 maio 2026.

<span id="ref-2">2.</span> Rafael Laroca et al. An Efficient and Layout-Independent Automatic License Plate Recognition System Based on the YOLO Detector. Disponível em: https://arxiv.org/abs/1909.01754
. Acesso em: 13 maio 2026.

<span id="ref-3">3.</span> REIS, D. et al. Real-Time Flying Object Detection with YOLOv8. Disponível em: https://arxiv.org/abs/2305.09972
. Acesso em: 13 maio 2026.

<span id="ref-4">4.</span> Gary Bradski. The OpenCV Library. Disponível em: https://opencv.org/
. Acesso em: 13 maio 2026.

<span id="ref-5">5.</span> GitHub
. Automatic License Plate Recognition using YOLOv8. Disponível em: https://github.com/Muhammad-Zeerak-Khan/Automatic-License-Plate-Recognition-using-YOLOv8
. Acesso em: 13 maio 2026.

<span id="ref-6">6.</span> Ultralytics
. Documentação da Biblioteca YOLO. Disponível em: https://docs.ultralytics.com/models/yolo26
. Acesso em: 13 maio 2026.

<span id="ref-7">7.</span> Roboflow
. Dataset público de veículos e placas. Disponível em: https://universe.roboflow.com/samrat-sahoo/license-plates-f8vsn/dataset/3
. Acesso em: 13 maio 2026.

<span id="ref-8">8.</span> R. Laroca, E. Severo, L. A. Zanlorensi, L. S. Oliveira, G. R. Gonçalves, W. R. Schwartz, D. Menotti
. A Robust Real-Time Automatic License Plate Recognition Based on the YOLO Detector. Disponível em: https://web.inf.ufpr.br/vri/databases/ufpr-alpr/
. Acesso em: 13 maio 2026.