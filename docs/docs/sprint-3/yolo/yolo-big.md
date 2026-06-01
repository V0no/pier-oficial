---
title: YOLO - Modelo BIG Plate
sidebar_position: 2
---

# YOLO - Modelo BIG Plate

&emsp; Essa página detalha sobre um dos modelos YOLO desenvolvidos na Sprint 3, especificamente para detecção de placas.

&emsp; Durante a Sprint 2, o grupo foi capaz de treinar e validar modelos YOLO capazes de detectar placas de veículos, adquirindo boa taxa de acertos no processo. Isso incentivou o grupo a investir nos modelos já treinados e tentar aprimorá-los por meio de uma etapa de *fine-tuning*. Porém, o grupo também passou a buscar por outras alternativas para aumentar a performance da detecção, com o treinamento de novos modelos que buscam ultrapassar o limite teorético da performance dos modelos anteriores por outros meios.

&emsp; Um grande obstáculo para o aumento na performance dos modelos se deu pelos dados limitados; o dataset UFPR-ALPR se provou impróprio para essa aplicação, então o desenvolvimento todo aconteceu em cima do dataset "Roboflow"[¹](#ref-1), que consiste apenas de aproximadamente 300 imagens, o que já foi suficiente para treinar o Modelo A para alcançar ótima performance, e foi extremamente útil para a validação de todos os modelos em geral. Dito isso, o grupo optou por tentar encontrar um dataset maior, e não demorou muito para encontrar outro dataset na plataforma Roboflow, consistido por 10126 imagens com labels apontando as placas correspondentes[²](#ref-2). Tentamos usar o dataset para fazer fine-tuning do Modelo A, mas devido à inconsistência com as classes (Modelo A foi treinado com classes de placas e veículos, porém o novo dataset contém apenas labels para placas), optamos por tentar treinar um novo modelo. Por fins de registro, denomina-se esse dataset como o *Dataset BIG*.

<div style={{ textAlign: 'center' }}>

Figura 1. Coletânea de imagens do Dataset BIG.

<img src="/img/datasetbig.png" width="900" />

Fonte: Roboflow Universe, 2026

</div>

**Split do Dataset BIG:**
- *70%* - Set de treino (7058 imagens)
- *20%* - Set de validação (2048 imagens)
- *10%* - Set de teste (1020 imagens)

&emsp; O dataset é consideravelmente extenso e variado, bem mais do que os outros datasets utilizados até o momento, contendo imagens de placas de carros, de motocicletas, caminhões, de dia, de noite, close-up, de cima, de longe, etc. Nota-se que esse dataset novamente não é exclusivamente de placas Mercosul.

&emsp; Utilizando novamente os pesos do *YOLO26n* como base, o modelo foi treinado utilizando a partição de treinamento novo dataset 

### Estrutura de Arquivos

&emsp; O modelo BIG é armazenado na pasta *src/license-plate-detection/yolo26-big-model/*. Ele possui a seguinte estrutura interna:
- **train.py**: Script Python com a lógica de treinamento do modelo;
- **validate.ipynb**: Jupyter Notebook com código que gera arquivos de métricas dos modelos;
- **val/ e variações**: Pasta que armazena as métricas geradas pelo notebook de validação;
- **best.pt**: Arquivo que contém os pesos da rede neural do melhor modelo treinado pela equipe.

&emsp; O dataset utilizado pode ser instalado automaticamente usando o script *src/license-plate-detection/download_roboflow_datasets.ipynb*, que instala ambos datasets do Roboflow e os armazena em *src/license-plate-detection/datasets/*. O usuário deve inserir a chave de API de sua conta no script para fazer a instalação.

&emsp; Diferente dos modelos da Sprint 2, esse modelo utiliza um script dedicado para o treinamento ao invés de um Jupyter Notebook; devido ao tempo de treinamento elevado, o uso de um script dedicado permitiu que o modelo fosse treinado remotamente em um supercomputador, utilizando um tmux (Terminal Multiplexer) para manter o código rodando em um terminal avulso até que o treinamento finalizasse. Isso não é necessário para validação, que por sua vez ainda é um processo muito rápido, e continua como um notebook.

### Instruções de uso

Crie um ambiente virtual e instale as bibliotecas presente em *requirements.txt*.

**Baixar datasets**: No arquivo *src/license-plate-detection/download_roboflow_datasets.ipynb* altere o valor da variável api-key para a chave API da sua conta do Roboflow;

**Re-treinar**: Em uma máquina potente, execute o arquivo *train.py* em terminal, até que ele finalize por conta própria. O arquivo com os pesos resultantes será gerado em *runs/detect/train/weights/best.pt*. Se desejar validar esse novo modelo, substitua o arquivo *best.pt* por esse.

**Validar**: Execute todas as células do notebook *validate.ipynb* dentro da pasta do modelo condizente. Serão gerados diversos arquivos de métricas em *runs/detect/val*.

### Métricas

<div style={{ textAlign: 'center' }}>
Figura 2-7. Métricas de validação modelo BIG com dataset BIG.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/big/big/BoxF1_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/big/big/BoxP_curve.png" alt="Photo 2" />
    <img src="/img/yolo26-metrics/big/big/BoxPR_curve.png" alt="Photo 3" />
    <img src="/img/yolo26-metrics/big/big/BoxR_curve.png" alt="Photo 4" />
    <img src="/img/yolo26-metrics/big/big/confusion_matrix.png" alt="Photo 5" />
    <img src="/img/yolo26-metrics/big/big/confusion_matrix_normalized.png" alt="Photo 6" />
  </div>
  Fonte: produzido pelo grupo
</div>

<div style={{ textAlign: 'center' }}>
Figura 8-13. Métricas de validação modelo BIG com dataset Roboflow.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/big/roboflow/BoxF1_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/big/roboflow/BoxP_curve.png" alt="Photo 2" />
    <img src="/img/yolo26-metrics/big/roboflow/BoxPR_curve.png" alt="Photo 3" />
    <img src="/img/yolo26-metrics/big/roboflow/BoxR_curve.png" alt="Photo 4" />
    <img src="/img/yolo26-metrics/big/roboflow/confusion_matrix.png" alt="Photo 5" />
    <img src="/img/yolo26-metrics/big/roboflow/confusion_matrix_normalized.png" alt="Photo 6" />
  </div>
  Fonte: produzido pelo grupo
</div>

<div style={{ textAlign: 'center' }}>
Figura 14-19. Métricas de validação modelo BIG com dataset Roboflow.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/big/ufpr-alpr/BoxF1_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/big/ufpr-alpr/BoxP_curve.png" alt="Photo 2" />
    <img src="/img/yolo26-metrics/big/ufpr-alpr/BoxPR_curve.png" alt="Photo 3" />
    <img src="/img/yolo26-metrics/big/ufpr-alpr/BoxR_curve.png" alt="Photo 4" />
    <img src="/img/yolo26-metrics/big/ufpr-alpr/confusion_matrix.png" alt="Photo 5" />
    <img src="/img/yolo26-metrics/big/ufpr-alpr/confusion_matrix_normalized.png" alt="Photo 6" />
  </div>
  Fonte: produzido pelo grupo
</div>


## Comparação de resultados

&emsp; O modelo BIG alcançou precisão alta em todos os datasets, performando levemente melhor do que modelo A e modelo pré-treinado na validação com dataset Roboflow, conseguindo captar placas com sucesso em ângulos e distâncias mais variadas.

<div style={{ textAlign: 'center' }}>
Figura 20-21. Predições do **modelo A** (esquerda) e **modelo BIG** (direita) com dataset Roboflow.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '40px',
    }}
  >
    <img src="/img/yolo26-metrics/a/roboflow/val_batch2_pred.jpg" alt="Photo 1" />
    <img src="/img/yolo26-metrics/big/roboflow/val_batch2_pred.jpg" alt="Photo 2" />
  </div>
  Fonte: produzido pelo grupo
</div>

<div style={{ textAlign: 'center' }}>
Figura 22-24. Curva Precisão-Recall **modelo BIG** (esquerda), **modelo A** (meio) e **modelo pré-treinado** (direita) com dataset Roboflow.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/big/roboflow/BoxPR_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/a/roboflow/BoxPR_curve.png" alt="Photo 2" />
    <img src="/img/yolov8-metrics/BoxPR_curve.png" alt="Photo 2" />
  </div>
  Fonte: produzido pelo grupo
</div>

&emsp; Mas algo surpreendente foi que o modelo BIG performou relativamente bem até mesmo no dataset UFPR-ALPR[³](#ref-3). Por mais que esse dataset não representa muito as situações onde o drone se encontrará, o novo modelo performou consideravelmente melhor do que os outros dois modelos, comprovando mais a sua versatilidade devido ao dataset maior.

<div style={{ textAlign: 'center' }}>
Figura 25-26. Métricas de validação modelo BIG com dataset UFPR-ALPR.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 3fr)',
      gap: '0px',
    }}
  >
    <img src="/img/yolo26-metrics/big/ufpr-alpr/BoxPR_curve.png" alt="Photo 1" />
    <img src="/img/yolo26-metrics/a/ufpr-alpr/BoxPR_curve.png" alt="Photo 2" />
  </div>
  Fonte: produzido pelo grupo
</div>

## Próximos Passos

&emsp; É evidente que o modelo BIG é um avanço no âmbito de visão computacional do projeto, visto que trouxe precisão ainda maior na detecção de placas do que modelos anteriores. Dito isso, faz sentido o grupo prosseguir com os pesos gerados por esse modelo para as próximas etapas do projeto.

&emsp; Podemos replicar o processo de fine-tuning realizado com os modelos anteriores nesse novo modelo, possivelmente alcançando resultados ainda melhores. Ademais, com a nova proposta de pipeline de processamento das imagens enviadas pelo drone, faz sentido favorecer a nova estrutura e avaliar a performance desse modelo com as imagens dos veículos já individualmente cortadas por um modelo de detecção de veículos (contudo, devemos considerar que o modelo deverá primeiro detectar o veículo para então detectar uma placa, o que evita falso positivos, mas também pode resultar em precisão menor caso menos placas sejam detectadas como resultado).

## Referências

<span id="ref-1">1.</span> Roboflow
. Dataset público de veículos e placas. Disponível em: https://universe.roboflow.com/samrat-sahoo/license-plates-f8vsn/dataset/3
. Acesso em: 27 maio 2026.

<span id="ref-2">2.</span> Roboflow
. Dataset público de placas de veículos. Disponível em: https://universe.roboflow.com/roboflow-universe-projects/license-plate-recognition-rxg4e/dataset/1
. Acesso em: 27 maio 2026.

<span id="ref-3">3.</span> R. Laroca, E. Severo, L. A. Zanlorensi, L. S. Oliveira, G. R. Gonçalves, W. R. Schwartz, D. Menotti
. A Robust Real-Time Automatic License Plate Recognition Based on the YOLO Detector. Disponível em: https://web.inf.ufpr.br/vri/databases/ufpr-alpr/
. Acesso em: 27 maio 2026.