---
title: Avaliação do Modelo de OCR
sidebar_position: 2
id: avaliacao-ocr-v2
sidebar_label: Avaliação do Modelo de OCR
---

# Avaliação do Modelo de OCR em Larga Escala

&emsp;A etapa de seleção de modelo conduzida na [Sprint 1](../sprint-1/tese.mdx) comparou três abordagens de OCR — EasyOCR, PaddleOCR e Fast-Plate-OCR — utilizando apenas três imagens de placas para validar a viabilidade técnica inicial da solução. Embora suficiente para uma comparação de desempenho e velocidade, essa amostra é insuficiente para conclusões robustas sobre a qualidade do modelo em condições operacionais reais. Esta seção documenta a avaliação sistemática realizada com um dataset significativamente maior, cobrindo os dois padrões de placa presentes nas rodovias brasileiras.

## Dataset Utilizado

&emsp;O dataset utilizado foi obtido da plataforma Kaggle, sob o título *Brazilian License Plate OCR* (disponível em: https://www.kaggle.com/datasets/luisasr2/brazilian-license-plate-ocr). Ele é composto por 206 imagens de placas veiculares brasileiras já recortadas — ou seja, cada imagem contém exclusivamente a placa, sem o veículo ao redor — acompanhadas de um arquivo `plates.csv` com o texto correto de cada placa.

&emsp;É importante ressaltar uma limitação deste dataset em relação ao cenário real do projeto: as imagens avaliadas aqui são *croppeds* ideais da placa. No ambiente de produção (com o drone), o sistema processará o frame completo e exigirá uma etapa de detecção prévia (YOLO) para recortar a placa antes do envio ao OCR. Ainda assim, a validação neste dataset é essencial para avaliar isoladamente a capacidade de leitura do modelo de reconhecimento óptico.

&emsp;O dataset cobre os dois padrões de emplacamento vigentes no Brasil:

- **Padrão antigo** — três letras seguidas de quatro dígitos numéricos (ex: `PYP5727`). Representa 66 das 206 imagens.
- **Padrão Mercosul** — três letras, um dígito, uma letra e dois dígitos (ex: `EHJ9C82`). Representa 137 das 206 imagens.

&emsp;As três imagens restantes apresentam formatos que não se enquadram em nenhum dos dois padrões (possivelmente por variações atípicas de layout ou erros na base original) e foram mantidas no total do dataset como erros/incompatibilidades para fins de cálculo da acurácia.

## Metodologia

&emsp;A avaliação foi conduzida diretamente no modelo Fast-Plate-OCR com o checkpoint `cct-s-v2-global-model`. Este é um modelo global pré-treinado fornecido pelos criadores do repositório, projetado para suportar diversos padrões internacionais de placas de forma nativa — incluindo o brasileiro. 

&emsp;Para cada imagem do dataset, o modelo gerou uma predição de texto, que foi comparada ao gabarito presente no CSV. Antes da comparação, ambos os textos (predição e gabarito) foram normalizados: convertidos para letras maiúsculas e removidos espaços e hífens. Essa normalização evita que diferenças de formatação sejam contabilizadas como erros de reconhecimento, garantindo que a métrica reflita exclusivamente a capacidade do modelo de identificar os caracteres corretos.

&emsp;A métrica principal utilizada foi a **acurácia por placa completa**: uma placa é considerada correta apenas se todos os seus caracteres forem reconhecidos sem nenhum erro. Placas com erro em um único caractere são contabilizadas como 100% incorretas. Embora uma métrica de *acurácia por caractere* apresentasse um percentual de sucesso ainda maior, a métrica por placa completa é a que mais se alinha à realidade do negócio da Pier, onde um caractere divergente pode invalidar a busca pelo veículo no banco de dados.

## Resultados

&emsp;O Fast-Plate-OCR atingiu 95,1% de acurácia geral no dataset de 206 placas, com desempenho superior no padrão Mercosul em relação ao padrão antigo.

| Categoria | Acertos | Total | Acurácia |
|---|---:|---:|---:|
| Placas antigas | 62 | 66 | 93,9% |
| Placas Mercosul | 134 | 137 | 97,8% |
| **Geral** | **196** | **206** | **95,1%** |

&emsp;O resultado confirma a escolha do Fast-Plate-OCR como modelo principal, validando com uma base de dados expressiva o que havia sido observado inicialmente na primeira sprint.

## Análise de Erros

&emsp;Dos 10 erros registrados, a enorme maioria envolve a troca de um único caractere na placa. A análise dos casos incorretos revela um padrão consistente: o modelo confunde pares de caracteres visualmente similares, em especial `I` e `1`, `O` e `0`, e letras com formas próximas como `H`/`M` e `C`/`O`. Esses são erros clássicos em sistemas de OCR aplicados a placas veiculares, uma vez que as fontes utilizadas nas placas brasileiras reduzem intencionalmente a diferença visual entre alguns caracteres para fins estéticos (fontes *Mandatory* e *FE-Schrift*).

&emsp;Exemplos representativos dos erros identificados:

| Gabarito | Predição | Tipo | Erro |
|---|---|---|---|
| `CON1454` | `OCN1454` | Antiga | C → O |
| `SCH6B17` | `SCM6B17` | Mercosul | H → M |
| `RRR9I00` | `RRR9100` | Mercosul | I → 1 |
| `LQU2E51` | `LOU2E51` | Mercosul | Q → O |

&emsp;Esses padrões de confusão indicam que a precisão do sistema pode ser ainda mais otimizada por meio de fine-tuning específico para os pares de caracteres problemáticos em placas brasileiras.

## Exploração de Pós-Processamento

&emsp;Após a avaliação em larga escala, foi conduzida uma exploração adicional com o objetivo de aumentar a acurácia por meio de pós-processamento textual — sem retreinar o OCR. O princípio central é que o formato das placas brasileiras é rígido e conhecido: nas placas antigas, as três primeiras posições são sempre letras e as quatro últimas sempre números; nas Mercosul, há uma letra extra na quinta posição. Conhecendo essas restrições, é possível corrigir automaticamente caracteres que o OCR confundiu (por exemplo, `I` onde deveria haver `1`, ou `0` onde deveria haver `O`).

&emsp;Foram exploradas três abordagens em sequência:

**Abordagem 1 — Detecção de cor por visão computacional:** identificar o padrão (Antiga ou Mercosul) analisando a presença de pixels azuis na faixa superior da imagem (característica visual das placas Mercosul). A ideia é simples, mas a abordagem produziu regressões significativas na prática: variações de iluminação e compressão de imagem tornaram o limiar de cor instável, gerando classificações erradas que pioraram o resultado geral.

**Abordagem 2 — Classificador neural (MobileNetV2 com fine-tuning):** treinar uma rede neural leve para classificar cada placa como Antiga ou Mercosul a partir da imagem. O MobileNetV2 pré-treinado no ImageNet foi adaptado para a tarefa, substituindo a camada final por uma classificação binária. O modelo atingiu 100% de acurácia na validação. No entanto, revelou-se instável entre execuções — os pesos internos são sensíveis à inicialização aleatória com um dataset pequeno, e a confiança nas placas ambíguas variava significativamente a cada retreinamento. Os notebooks e pesos deste experimento estão preservados em `notebook/extra/` para referência futura.

**Abordagem 3 — Heurística textual pura (adotada):** determinar o formato diretamente pelo texto do OCR, sem depender da imagem. A função `pos_processar` aplica as substituições necessárias para ambos os formatos e só aceita a correção quando **apenas um** dos formatos produz um resultado válido — ou seja, quando a correção resolve a ambiguidade de forma inequívoca. Quando ambos os formatos seriam válidos após a correção, o texto original é mantido para evitar corrupção. Esta abordagem é determinística, não requer treinamento e generaliza para qualquer dataset de placas brasileiras.

&emsp;O resultado da heurística textual foi de **+0 placas corrigidas e 0 regressões**. A investigação dos casos que deveriam ter sido corrigidos revelou a causa: dois gabaritos no dataset estavam incorretos. A placa `FSA9I52` estava anotada como `FSA9152` (formato Antiga), quando a faixa azul na imagem confirma ser Mercosul — o quinto caractere deve ser letra. Da mesma forma, `AUF3100` estava anotada como `AUF3I00`, mas se trata de uma placa antiga (fundo branco, sem faixa azul), e no padrão antigo todos os quatro últimos caracteres são obrigatoriamente dígitos. Em ambos os casos, o OCR havia lido o texto correto desde o início — eram erros de anotação humana, não de reconhecimento. Após a correção dos dois gabaritos, a acurácia do baseline subiu de 194/206 (94,2%) para os 196/206 (95,1%) reportados nesta seção.

&emsp;A heurística textual permanece disponível em `notebook/extra/pos_processamento.ipynb` como pós-processamento de uso geral. Ela não melhora os 10 erros restantes porque esses envolvem confusões letra-por-letra que são ambíguas em ambos os formatos (ex: `C`→`O` na primeira posição, que é sempre letra). Resolver esses casos exigiria fine-tuning do próprio modelo de OCR.

## Conclusão e Próximos Passos

&emsp;A avaliação em larga escala confirmou a robustez do Fast-Plate-OCR para o contexto do projeto. A acurácia de 95,1% sobre 206 placas, com desempenho ainda superior no padrão Mercosul, fornece uma base quantitativa sólida para o MVP.

&emsp;Mais importante do que o percentual geral é a natureza dos erros. Como os erros encontrados seguem um padrão previsível e endereçável (basicamente confusão entre poucos caracteres visualmente semelhantes), os próximos passos de desenvolvimento tornam-se claros:

1. **Fine-tuning do OCR:** retreinar o Fast-Plate-OCR com exemplos específicos dos pares problemáticos (`H`/`M`, `C`/`O`, `Q`/`O`) em placas brasileiras — este é o caminho com maior potencial de ganho real nos 10 erros restantes.
2. **Heurística textual como fallback:** a função `pos_processar` já está disponível e pode ser ativada em produção para corrigir os casos em que o formato da placa torna a substituição inequívoca, sem custo de inferência adicional.
