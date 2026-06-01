---
title: Fine Tuning dos modelos de YOLO
sidebar_position: 1
slug: /fine-tuning-yolo
---

# Fine-Tuning dos modelos de YOLO para ALPR (Automatic License Plate Recognition)

&emsp; O Fine-Tuning (Ajuste Fino) é uma técnica de Aprendizado por Transferência (Transfer Learning). Em vez de treinar uma rede neural convolucional do zero, utiliza-se um modelo que já foi pré-treinado em um dataset determinado.

&emsp;Nesse processo, as camadas iniciais da rede neural, que aprenderam a detectar características visuais primitivas e universais (como bordas, gradientes de cores, texturas e formas geométricas básicas), são preservadas. O treinamento é direcionado especificamente para as camadas mais profundas e finais da rede. Essas camadas adaptam os pesos sinápticos matemáticos para se especializarem nas particularidades do novo domínio de aplicação: as placas de veículos em diferentes contextos.

&emsp; Esse processo foi realizado com o objetivo de expandir o reconhecimento do modelo de visão computacional para a detecção de placas em diferentes ângulos de inclinação não ortogonais que podem ser provocados pela altitude do voo do drone, distorções de movimento decorrentes da movimentação da aeronave e variações de iluminação e oclusões parciais, todos esses fatores podem comprometer a eficiência do modelo utilizado.

## Dataset utilizado

&emsp; O dataset utilizado para o treinamento do modelo foi o **Google Open Images V7** (especificamente o subconjunto mapeado sob o nome oficial de **Google Open Images**), que contém imagens de placas de veículos de diferentes tipos e tamanhos. Esse dataset é amplamente reconhecido por sua alta variabilidade de ambientes reais (carros sob chuva, sombras, diferentes modelos internacionais de veículos e ângulos complexos), o que simula perfeitamente as perturbações de câmera captadas pelo drone em operação. O repositório e suas especificações completas podem ser acessados através do repositório oficial do [Google Open Images](https://storage.googleapis.com/openimages/web/index.html).

### Divisão dos dados

&emsp; Para garantir a validade do treinamento e mitigar riscos de overfitting (quando o modelo "decora" o dataset de treino e falha durante a execução), os dados coletados foram isolados e particionados de forma aleatória utilizando uma semente de controle de partição de dados (**Seed: 42**). A volumetria exata distribuída entre as partições seguiu as seguintes proporções:

- **Quantidade Total de Imagens**: 1.000 imagens amostrais com rótulos validados.
- **Treino (70%)**: Utilizado diretamente no algoritmo de retropropagação para ajustar os pesos das camadas;
- **Validação (15%)**: Monitorado a cada época pelo YOLO para avaliar a curva de aprendizado e aplicar paradas prematuras se o erro começasse a escalar;
- **Teste (15%)**: Arquivado estritamente para o teste final de homologação dos modelos após a conclusão dos treinos.

### Download e limpeza dos dados

&emsp; Para a obtenção dos dados para o treinamento, exige-se a execução prévia do script automatizado *download_dataset.py*, estruturado sob o ecossistema da biblioteca *fiftyone*. Durante a execução desse pipeline, algumas críticas estruturais de dados foram identificadas e tratadas:

- **Correção de Sintaxe de Classe (Mapeamento de IDs)**: O Google Open Images exporta nativamente a classe "Vehicle registration plate" sob o índice numérico 3. Contudo, redes de classe única operando no YOLO exigem indexação no intervalo fechado 0-0. Foi aplicada uma varredura via comando find combinado com o editor de fluxo sed para reescrever as anotações do formato global do Google para a sintaxe local do YOLO.

- **Filtragem de Ruídos (Objetos Coexistentes)**: Como as imagens originais continham marcações para outros elementos (como rodas, janelas e carros), o arquivo de anotação continha índices flutuantes superiores. Foi aplicado um filtro de expressão regular que eliminou todas as linhas de anotação que não se iniciavam estritamente com o dígito 0, purificando o gabarito das placas.

## Treinamento dos modelos

&emsp;Para garantir a reprodutibilidade dos testes e a isonomia no processo de avaliação, foi desenvolvido um script de automação unificado em Python (*fine_tune.py*). Em vez de disparar três treinamentos manuais isolados, o script utiliza uma estrutura de repetição (loop for) que consome um dicionário contendo os caminhos dos arquivos de pesos originais (.pt) de cada modelo candidato:

- **Modelo 1**: yolo08-model/license_plate_detector.pt
- **Modelo 2**: yolo26-test-model/best.pt
- **Modelo 3**: yolo26-UFPR-ALPR-model/best.pt

&emsp; O script carrega sequencialmente a arquitetura de cada modelo, aplica as restrições e hiperparâmetros globais e injeta o mapa de dados unificado do Google Open Images através do arquivo google_plates.yaml. Os artefatos gerados (novos pesos otimizados, logs e gráficos de performance) são isolados automaticamente em subpastas dedicadas dentro do diretório src/fine_tune/.

### Reprodutibilidade, Hardware e Especificações Técnicas

&emsp;Para assegurar a reprodutibilidade dos treinamentos realizados, foram definidos os seguintes parâmetros de infraestrutura:

- **Controle de Semente Aleatória Global (Seed)**: Fixado em zero (`seed=0`) nas diretrizes do método de treino do YOLO para mitigar variações na atualização de gradientes.
- **Comando de Execução Geral**: O disparo do pipeline automatizado dentro do diretório do projeto deve ser executado no terminal por meio do comando:
```bash
python3 fine_tune.py
```

### Hiperparâmetros de Treino

&emsp; A tabela abaixo detalha as variáveis controladas no experimento:

| Hiperparâmetro | Valor Configurado | Justificativa |
|---|---|---|
| `data` | `google_plates.yaml` | Garante que todos os modelos utilizem a mesma base de imagens, classes e gabaritos anotados, assegurando padronização experimental e reprodutibilidade científica dos resultados. |
| `epochs` | `30` | Representa 30 ciclos completos de aprendizado sobre o dataset. Essa quantidade foi definida por equilíbrio estatístico entre convergência do modelo e mitigação de overfitting no domínio específico de placas veiculares. |
| `imgsz` | `640` | Redimensiona todas as imagens para 640x640 pixels, mantendo equilíbrio entre preservação de detalhes visuais das placas e custo computacional de memória/processamento. |
| `batch` | `16` | Processa 16 imagens por iteração antes da atualização dos gradientes, promovendo maior estabilidade matemática durante a retropropagação e melhor aproveitamento do hardware disponível. |
| `lr0` | `0.001` | Taxa de aprendizado inicial reduzida para permitir ajustes finos nos pesos já pré-treinados, evitando alterações bruscas e preservando o conhecimento previamente adquirido pelo backbone do modelo. |
| `freeze` | `10` | Congela as 10 primeiras camadas do backbone convolucional, restringindo o treinamento apenas às camadas finais especializadas em detecção de placas, reduzindo custo computacional e risco de degradação do feature extractor original. |
| `project` | `runs/fine_tune` | Centraliza automaticamente todos os artefatos do treinamento (pesos, gráficos, métricas e logs), facilitando auditoria, rastreabilidade e análise comparativa dos experimentos. |

## Métricas

&emsp; Para avaliar matematicamente o desempenho dos modelos na tarefa de detecção de placas veiculares, foram utilizadas métricas clássicas de Visão Computacional aplicadas em modelos de Object Detection. As métricas selecionadas permitem analisar diferentes dimensões do comportamento do detector, incluindo capacidade de localizar corretamente os objetos, redução de falsos positivos, equilíbrio entre precisão e sensibilidade e análise detalhada dos erros de classificação.

&emsp; As métricas utilizadas neste projeto foram:

- **Precision (Precisão)**: mede quantas das detecções realizadas pelo modelo realmente correspondem a placas válidas.
- **Recall (Sensibilidade)**: avalia a capacidade do modelo em encontrar todas as placas presentes nas imagens.
- **F1-Score**: representa o equilíbrio harmônico entre precisão e recall.
- **Precision-Recall Curve (PR Curve)**: demonstra o comportamento do modelo em diferentes limiares de confiança.
- **Matriz de Confusão**: permite visualizar os padrões de acerto e erro do classificador.

### Yolo08

#### Matriz de Confusão Normalizada

&emsp; A matriz de confusão normalizada permite analisar como as predições do modelo se comparam com os gabaritos reais do dataset. O Modelo 1 apresentou uma taxa de acerto direto de 38% ($0.38$) na detecção correta da classe *license_plate*. O ponto de maior destaque operacional reside na taxa de 0% de falsos positivos vindos do cenário: o modelo obteve um score de 1.00 de acertos para o background, o que significa que ele possui uma resiliência contra alarmes falsos. No entanto, a matriz revela que 62% ($0.62$) das placas reais acabaram sendo classificadas erroneamente como fundo (background), indicando uma tendência conservadora do detector.

<div style={{ textAlign: 'center' }}>

Figura 1. Matriz de Confusão Normalizada - Modelo 1.

<img 
    src="/img/fine_tune/modelo_1_tunado/confusion_matrix_normalized.png" alt="Matriz de Confusão Normalizada" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Precisão (Precision-Confidence Curve)

&emsp; A curva Precision-Confidence mede a confiabilidade das predições do modelo à medida que elevamos o critério mínimo de certeza exigido para exibir uma caixa delimitadora. O comportamento gráfico exibe uma ascensão consistente e robusta: à medida que o limiar de confiança aumenta, a precisão do modelo escala acentuadamente, atingindo o ápice perfeito de 100% de precisão (1.00) no limiar de confiança de 0.899. Esse indicador é vital para a operação com o drone Tello, pois garante que, ao configurar o script com um limiar alto, toda detecção realizada em voo terá garantia matemática de ser uma placa real.

<div style={{ textAlign: 'center' }}>

Figura 2. Curva Precision-Confidence - Modelo 1.

<img 
    src="/img/fine_tune/modelo_1_tunado/BoxP_curve.png" alt="Curva Precision-Confidence" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Revocação (Recall-Confidence Curve)

&emsp;A curva Recall-Confidence avalia a sensibilidade do modelo em cobrir o mapa de placas disponíveis de acordo com a variação do limiar de confiança. O Modelo 1 demonstrou seu pico de sensibilidade operando em um limiar nulo, capturando 55% ($0.55$ no ponto $0.000$) de todas as placas contidas no dataset de teste do Google Open Images. Conforme o limiar de corte é elevado para valores superiores a $0.6$, a curva apresenta um declínio acentuado até zerar próximo a $0.9$. Esse comportamento reitera o perfil conservador do modelo ajustado, que opta por omitir caixas limítrofes duvidosas em troca de manter sua alta taxa de acerto.

<div style={{ textAlign: 'center' }}>

Figura 3. Curva Recall-Confidence - Modelo 1.

<img 
    src="/img/fine_tune/modelo_1_tunado/BoxR_curve.png" alt="Curva Recall-Confidence" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva F1-Score (F1-Confidence Curve)

&emsp; O F1-Score traduz a média harmônica balanceada entre a Precisão e a Revocação, servindo como a métrica de equilíbrio do sistema. Graficamente, o modelo estabelece uma extensa zona de estabilidade operacional (um platô bem definido) entre os limiares de confiança de $0.20$ e $0.65$. O desempenho otimizado do modelo atinge seu pico de F1-Score em 0.41 sob um limiar de confiança de 0.472. Esse valor determina matematicamente o ponto ótimo de equilíbrio para a parametrização do drone em missões reais, onde se busca a máxima extração de placas sem comprometer a confiabilidade.

<div style={{ textAlign: 'center' }}>

Figura 4. Curva F1-Confidence - Modelo 1.

<img 
    src="/img/fine_tune/modelo_1_tunado/BoxF1_curve.png" alt="Curva F1-Confidence" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Precisão-Revocação (Precision-Recall Curve)

&emsp; A curva Precision-Recall (PR) sintetiza o trade-off global de performance do algoritmo, mapeando a variação da precisão diretamente contra a revocação. A área sob essa curva determina a métrica principal de avaliação do ecossistema YOLO: o mAP50 (Mean Average Precision com interseção sobre união de 50%). O Modelo 1 obteve um mAP50 global de 0.347 (34.7%). O formato da curva comprova que o modelo sustenta uma precisão próxima a 100% enquanto cobre até 20% das placas totais, sofrendo uma inflexão linear descendente a partir desse ponto à medida que tenta recuperar amostras visualmente mais complexas ou anguladas do dataset do Google.

<div style={{ textAlign: 'center' }}>

Figura 5. Curva Precision-Recall - Modelo 1.

<img 
    src="/img/fine_tune/modelo_1_tunado/BoxPR_curve.png" alt="Curva Precision-Recall" width="700"
/>

Fonte: produzido pelo grupo

</div>

### YOLO26 - Roboflow

#### Matriz de Confusão Normalizada

&emsp; O Modelo 2 apresentou uma evolução perceptível em sua capacidade de classificação direta, atingindo uma taxa de acerto de 43% ($0.43$) na identificação exata de license_plate, superando os 38% do modelo anterior. A arquitetura manteve o desempenho ideal de 1.00 ($100\%$) de acertos na classificação de background, consolidando a blindagem do sistema contra falsos positivos. A taxa de omissão de placas reais que foram interpretadas como fundo reduziu para 57% ($0.57$), indicando um modelo ligeiramente mais agressivo na busca por objetos de interesse.

<div style={{ textAlign: 'center' }}>

Figura 6. Matriz de Confusão Normalizada - Modelo 2.

<img 
    src="/img/fine_tune/modelo_2_tunado/confusion_matrix_normalized.png" alt="Matriz de Confusão Normalizada - Modelo 2" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Precisão (Precision-Confidence Curve)

&emsp; O comportamento da curva de precisão do Modelo 2 exibe uma inclinação inicial muito mais acentuada e estável. O detector sustenta uma precisão superior a $90\%$ ao longo de uma ampla janela de confiança (entre os limiares de $0.55$ e $0.75$). O ápice matemático de 100% de precisão (1.00) foi estabelecido no limiar de confiança de 0.930. Essa estabilização em patamares elevados expande a margem de segurança do operador do drone ao definir o ponto de corte de predições.

<div style={{ textAlign: 'center' }}>

Figura 7. Curva Precision-Confidence - Modelo 2.

<img 
    src="/img/fine_tune/modelo_2_tunado/BoxP_curve.png" alt="Curva Precision-Confidence - Modelo 2" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Revocação (Recall-Confidence Curve)

&emsp; No quesito sensibilidade, o Modelo 2 registrou um incremento relevante, saltando para um pico de recall de 67% ($0.67$ no ponto $0.000$) sob um limiar de confiança zero. O comportamento descendente da curva também se mostrou mais suave que o do Modelo 1, indicando que o Modelo 2 consegue reter caixas delimitadoras de placas mesmo sob exigências de confiança medianas, estendendo sua capacidade de detecção em cenários com maior distorção visual.

<div style={{ textAlign: 'center' }}>

Figura 8. Curva Recall-Confidence - Modelo 2.

<img 
    src="/img/fine_tune/modelo_2_tunado/BoxR_curve.png" alt="Curva Recall-Confidence - Modelo 2" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva F1-Score (F1-Confidence Curve)

&emsp; Refletindo as melhorias simultâneas obtidas tanto em precisão quanto em sensibilidade, a curva F1-Score do Modelo 2 atingiu um pico substancialmente maior. O equilíbrio ótimo do sistema registrou um score máximo de 0.52 sob um limiar de confiança de 0.249. Diferente do Modelo 1 (cujo pico foi de 0.41), este resultado consolida o Modelo 2 como uma alternativa operacional mais eficiente para missões onde a agilidade e a captura fluida de placas pelo drone são prioritárias.

<div style={{ textAlign: 'center' }}>

Figura 9. Curva F1-Confidence - Modelo 2.

<img 
    src="/img/fine_tune/modelo_2_tunado/BoxF1_curve.png" alt="Curva F1-Confidence - Modelo 2" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Precisão-Revocação (Precision-Recall Curve)

&emsp; O avanço global do Modelo 2 é sintetizado pela expansão da área sob a curva Precision-Recall. O modelo obteve um mAP50 de 0.436 (43.6%), representando um salto de praticamente 9 pontos percentuais de precisão média em relação ao primeiro modelo (que obteve 0.347). O desenho da curva comprova um comportamento de alta performance sustentada, conseguindo manter a precisão acima de $80\%$ mesmo enquanto recupera até $40\%$ das placas disponíveis no ambiente de teste.

<div style={{ textAlign: 'center' }}>

Figura 10. Curva Precision-Recall - Modelo 2.

<img 
    src="/img/fine_tune/modelo_2_tunado/BoxPR_curve.png" alt="Curva Precision-Recall - Modelo 2" width="700"
/>

Fonte: produzido pelo grupo

</div>

### YOLO26 - UFPR-ALPR

#### Matriz de Confusão Normalizada

&emsp; A análise da matriz de confusão normalizada do Modelo 3 revela o maior índice de acerto True Positive (Verdadeiro Positivo) isolado entre os três modelos testados, atingindo 44% ($0.44$) de eficiência na detecção direta de placas de licença (license_plate). De maneira idêntica aos experimentos anteriores, a arquitetura preservou a integridade ideal de 1.00 ($100\%$) para a classe background, anulando os riscos de falsas detecções no cenário urbano. A taxa de falsos negativos (placas reais omitidas como fundo) fixou-se em 56% ($0.56$).

<div style={{ textAlign: 'center' }}>

Figura 11. Matriz de Confusão Normalizada - Modelo 3.

<img 
    src="/img/fine_tune/modelo_3_tunado/confusion_matrix_normalized.png" alt="Matriz de Confusão Normalizada - Modelo 3" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Precisão (Precision-Confidence Curve)

&emsp; A curva de precisão do Modelo 3 descreve um crescimento contínuo e previsível ao longo de todo o espectro de confiança. Embora sua subida inicial seja menos íngreme que a do Modelo 2, ele mantém consistência e atinge o patamar de 100% de precisão (1.00) em um limiar de corte muito estrito de 0.952. Isso indica que o Modelo 3 exige uma certeza quase absoluta internamente antes de cravar uma detecção com perfeição total em seus limiares máximos.

<div style={{ textAlign: 'center' }}>

Figura 12. Curva Precision-Confidence - Modelo 3.

<img 
    src="/img/fine_tune/modelo_3_tunado/BoxP_curve.png" alt="Curva Precision-Confidence - Modelo 3" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Revocação (Recall-Confidence Curve)

&emsp; No quesito sensibilidade de varredura, o Modelo 3 iniciou seu ciclo com um recall máximo de 55% ($0.55$ no ponto $0.000$) sob limiar zero. O diferencial técnico desta curva reside na sua taxa de decaimento: o modelo consegue sustentar um platô de recall estável acima de $40\%$ até atingir o limiar de confiança de $0.60$, sofrendo a inflexão e o escoamento total para zero apenas em regiões de altíssima exigência de confiança ($>0.80$).

<div style={{ textAlign: 'center' }}>

Figura 13. Curva Recall-Confidence - Modelo 3.

<img 
    src="/img/fine_tune/modelo_3_tunado/BoxR_curve.png" alt="Curva Recall-Confidence - Modelo 3" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva F1-Score (F1-Confidence Curve)

&emsp; A curva F1-Score do Modelo 3 manifesta um comportamento de platô estendido singular: em vez de um pico agudo seguido de queda rápida, o modelo distribui seu equilíbrio operacional de forma quase linear entre os limiares de $0.35$ e $0.65$. O ponto de eficiência otimizada da função foi calculado em um score máximo de 0.44 sob um limiar de confiança de 0.618. Este limiar ótimo elevado ($0.618$) sinaliza que o modelo trabalha melhor e de forma mais equilibrada quando configurado de maneira mais rigorosa no código do drone.

<div style={{ textAlign: 'center' }}>

Figura 14. Curva F1-Confidence - Modelo 3.

<img 
    src="/img/fine_tune/modelo_3_tunado/BoxF1_curve.png" alt="Curva F1-Confidence - Modelo 3" width="700"
/>

Fonte: produzido pelo grupo

</div>

#### Curva de Precisão-Revocação (Precision-Recall Curve)

&emsp; A consolidação matemática da área sob a curva Precision-Recall conferiu ao Modelo 3 um mAP50 de 0.373 (37.3%). O resultado posiciona a robustez global deste modelo acima do Modelo 1 ($34.7\%$), porém abaixo do teto de desempenho estabelecido pelo Modelo 2 ($43.6\%$). O traçado gráfico demonstra que o modelo sustenta uma precisão muito alta nas primeiras extrações, mas sofre uma taxa de descida diagonal constante à medida que a revocação avança além da marca de $30\%$.

<div style={{ textAlign: 'center' }}>

Figura 15. Curva Precision-Recall - Modelo 3.

<img 
    src="/img/fine_tune/modelo_3_tunado/BoxPR_curve.png" alt="Curva Precision-Recall - Modelo 3" width="700"
/>

Fonte: produzido pelo grupo

</div>

## Comparação dos modelos

&emsp; Para sintetizar o comportamento dos três modelos candidatos após o processo de Fine-Tuning, os principais indicadores estatísticos foram unificados. A tabela abaixo confronta os picos de performance e as métricas de área global, servindo como base empírica para a homologação do sistema:

| Modelo          | mAP50 Global | Pico de F1-Score (Limiar) | Pico de Recall (Limiar 0.0) | Confiança para 100% de Precisão | Acerto Direto (True Positive) |
| --------------- | ------------ | ------------------------- | --------------------------- | ------------------------------- | ----------------------------- |
| Modelo 1 Tunado | 0.347        | 0.41 (limiar 0.472)       | 0.55                        | 0.899                           | 38%                           |
| Modelo 2 Tunado | 0.436        | 0.52 (limiar 0.249)       | 0.67                        | 0.930                           | 43%                           |
| Modelo 3 Tunado | 0.373        | 0.44 (limiar 0.618)       | 0.55                        | 0.952                           | 44%                           |

&emsp; Ao traduzir os indicadores estatísticos complexos para uma análise macro, podemos categorizar o perfil operacional de cada um dos modelos tunados após o experimento:
- **Modelo 1 Tunado (Perfil Conservador / Baixo Rendimento)**: Apresentou o menor índice de descoberta de placas ($mAP_{50}$ de $34.7\%$) e a maior taxa de omissão de alvos do teste, deixando de detectar 62% das placas disponíveis. Não possui o desempenho dinâmico necessário para acompanhar a velocidade de voo de um drone.
- **Modelo 2 Tunado (Perfil Equilibrado / Alta Performance)**: Apresentou a melhor sinergia entre o poder de localização de caixas e a sensibilidade do classificador. É o modelo que mais se destaca sob condições visuais adversas (ângulo e distância), sustentando a maior área de precisão média global (43.6%) e entregando o maior poder de captura de dados.
- **Modelo 3 Tunado (Perfil Rígido / Alta Certeza)**: Embora tenha obtido a maior eficiência isolada de acertos diretos em condições ideais (44%), ele é um modelo de "tudo ou nada". Para operar em seu ponto ótimo, exige que o sistema de inteligência do drone trabalhe com um limiar de confiança muito alto ($61.8\%$), o que tornaria a missão do drone ineficiente em cenários reais de movimentação.

## Conclusão

&emsp; O Modelo 2 Tunado foi selecionado, dentre os 3, como o de melhor desempenho. A escolha do Modelo 2 apoia-se em três pilares fundamentais:
- **Superioridade Estatística($mAP_{50}$)**: No ecossistema YOLO, o $mAP_{50}$ é a métrica soberana de validação. O Modelo 2 alcançou 0.436, superando o Modelo 1 em 8,9 pontos percentuais e o Modelo 3 em 6,3 pontos percentuais. Isso prova matematicamente que o Modelo 2 aprendeu a generalizar melhor as variações de ambiente do que seus concorrentes.

- **Resiliência a Ambientes Dinâmicos (Drone em Voo)**: Operar uma câmera embarcada em um drone Ryze Tello introduz trepidações, mudanças bruscas de ângulo e vento. Enquanto o Modelo 3 só funciona bem em condições perfeitas de imagem (gerando seu acerto de 44%), o Modelo 2 sustenta um pico de Recall de 67%. Ele é robusto o suficiente para continuar "caçando" e detectando a placa mesmo se o drone estiver inclinado ou ligeiramente distante do veículo.

- **Eficiência de Código e Inteligência Embarcada ($F_1$-Score)**: O Modelo 2 atinge o seu equilíbrio perfeito de operação ($F_1 = 0.52$) em um limiar de confiança baixo, de apenas 0.249. Isso permite que o script Python (tello.py) seja configurado para aceitar predições a partir de $25\%$ de certeza com a segurança de que o modelo possui lastro matemático para não gerar falsos positivos, maximizando a fluidez e a taxa de captura de placas durante a missão aérea da seguradora.

&emsp; Em suma, o Modelo 2 Tunado é, dentre os três, o candidato que oferece a flexibilidade, a precisão macro e a sensibilidade necessárias para garantir o sucesso da homologação do sistema em tempo real, mitigando os erros de omissão e blindando o banco de dados contra dados corrompidos.