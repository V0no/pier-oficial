---
title: Proposta de Valor
sidebar_position: 3
id: value-proposition
sidebar_label: Proposta de Valor
---

# Existe alguma maneira de implementar uma solução que agregue valor real?

&emsp;Sim — e essa afirmação não decorre de uma suposição, mas de um conjunto de evidências levantadas
ao longo das pesquisas conduzidas pelo grupo. Para sustentar essa conclusão, foram desenvolvidas
três teses de pesquisa, cada uma endereçando uma camada distinta do problema: como identificar o
veículo, onde ele provavelmente se encontra e como chegar até ele.

## Visão computacional aplicada ao reconhecimento de placas

&emsp;A primeira tese investiga se a tecnologia de visão computacional é capaz de identificar placas de
veículos com precisão suficiente para ser aplicável em um contexto operacional real.

&emsp;Os resultados obtidos são positivos. Soluções de reconhecimento automático de placas — conhecidas
pela sigla ALPR (*Automatic License Plate Recognition*) — já são utilizadas em sistemas de
pedágio, controle de acesso e monitoramento urbano em diversos países, incluindo o Brasil.
Algoritmos como YOLO e redes neurais convolucionais (CNNs) são amplamente empregados para essa
finalidade, com bases de dados abertas disponíveis para treinamento, como a
[UFPR-ALPR](https://web.inf.ufpr.br/vri/databases/ufpr-alpr/), desenvolvida pela Universidade
Federal do Paraná especificamente com placas brasileiras.

**Por que representa um avanço em relação ao modelo atual?**

&emsp;Enquanto um agente humano depende de memória e atenção visual para reconhecer uma placa, um
sistema de visão computacional processa imagens em tempo real, sem fadiga e sem limitação de
horário. Cada placa identificada é cruzada automaticamente contra a base de dados de sinistros da
Pier em um curto período de tempo.

## Mapeamento de locais de desova

&emsp;A segunda tese parte de uma hipótese mais específica: veículos roubados não são abandonados de
forma aleatória.

&emsp;Há padrões geográficos nos locais em que veículos furtados ou roubados são descartados, e esses
padrões podem ser mapeados. A partir de dados históricos de sinistros e recuperações anteriores, é
possível construir mapas de calor que concentrem o esforço de busca nas regiões com maior
probabilidade de localização de um veículo.

&emsp;Esse tipo de análise já foi explorado em contextos de policiamento preditivo e logística urbana, e
os dados necessários para sua aplicação ao caso da Pier existem — ainda que demandem tratamento e
anonimização adequados.

&emsp;**O principal desafio identificado** é a mutabilidade desses padrões: os locais de desova se
alteram ao longo do tempo, o que exige atualização contínua do modelo para que ele preserve sua
relevância.

## Uso de drones para cobertura autônoma de área

&emsp;A terceira tese investiga o vetor que torna toda a proposta operacionalmente viável: o drone.

&emsp;A utilização de drones para mapeamento e monitoramento de áreas é uma realidade consolidada em
aplicações como inspeção de infraestrutura, agricultura de precisão e segurança patrimonial. No
âmbito deste projeto, o drone é o elemento que viabiliza a cobertura contínua de regiões que
nenhuma equipe de campo conseguiria monitorar com a mesma eficiência de custo e tempo.

**Limitações identificadas:**

- Autonomia de voo restrita ao modelo educacional/comercial disponível.
- Operação em ambiente controlado para fins de prova de conceito — não em vias públicas reais.
- Restrições regulatórias da ANAC para voos comerciais em espaço aéreo urbano.

&emsp;Nenhuma dessas limitações invalida a solução — mas todas delimitam o que é viável entregar dentro
do escopo deste projeto. A questão de se o modelo de visão computacional será capaz de reconhecer
placas a partir de imagens capturadas por drone em condições reais de voo será respondida
empiricamente ao longo do desenvolvimento.

## A soma das partes

&emsp;Isoladamente, cada uma dessas teses já representa um avanço em relação ao modelo vigente.
Combinadas, constituem uma solução coesa: drones que sobrevoam regiões com alta incidência
histórica de desova, capturam imagens de veículos e submetem as placas identificadas a um sistema
de visão computacional que cruza os dados automaticamente com a base de sinistros da Pier. O
resultado é um sistema que amplia o alcance da operação, reduz a dependência de terceiros e
fornece informação acionável às equipes internas, gerando valor tanto para a operação quanto para
o segurado.

## Fontes de valor identificadas

&emsp;Em atividade feita na aula de negócios, o grupo mapeou as principais fontes de valor que a solução
pode gerar para a Pier. Todas foram classificadas como de **alto impacto**:

&emsp;**Maior eficiência na busca de veículos roubados** — o sistema opera de forma contínua, cobrindo
áreas e horários que o modelo de pronta resposta não alcança, aumentando diretamente a taxa de
recuperação de veículos.

&emsp;**Redução de custos operacionais a longo prazo** — a automação da busca reduz a dependência de
mão de obra terceirizada e, à medida que mais veículos são recuperados como salvados, os custos
com indenizações integrais diminuem. O impacto financeiro incide simultaneamente sobre dois
vetores de custo.

&emsp;**Maior posicionamento competitivo no mercado de seguradoras** — uma seguradora que emprega
drones e inteligência artificial na recuperação de veículos não apenas resolve um problema
operacional, mas inaugura uma tendência. Ser a primeira a adotar essa abordagem posiciona a Pier
como referência de inovação no setor insurtech brasileiro.

&emsp;**Atração de investidores** — projetos com tecnologia de ponta e impacto mensurável tendem a
atrair a atenção do mercado de capitais. A solução pode funcionar como diferencial concreto em
futuras rodadas de investimento.

&emsp;**Menor emissão de gases** — a substituição de veículos automotores por drones elétricos no
patrulhamento representa, no longo prazo, uma redução nas emissões de CO₂ associadas à operação
de pronta resposta.


# Conclusão

&emsp;As três teses apresentadas neste documento constroem, em conjunto, um argumento consistente: a
pergunta que dá título a esta seção tem resposta afirmativa, e essa resposta é sustentada por
evidências concretas, não por suposições.
 
&emsp;A visão computacional demonstrou eficácia no reconhecimento de placas em condições operacionais
reais. Os padrões geográficos de desova de veículos existem, podem ser mapeados e permitem
concentrar o esforço de busca onde ele tem maior probabilidade de resultado. Os drones viabilizam
a cobertura contínua de áreas que nenhuma equipe de campo conseguiria monitorar com a mesma
eficiência de custo e tempo. A integração dessas três camadas gera um sistema coeso, com fontes de
valor mensuráveis tanto para a operação da Pier quanto para o segurado.

&emsp;Além do ganho operacional, há um ganho financeiro estimado: na [Análise Financeira](/analise-financeira), mesmo no cenário conservador de apenas 2 recuperações adicionais por mês, o payback projetado fica entre 3,38 e 4,89 meses, indicando retorno rápido sobre o investimento inicial.
 
&emsp;Há incertezas que ainda serão respondidas ao longo do desenvolvimento — em especial, o desempenho
do modelo de reconhecimento de placas em condições reais de voo. Mas essas incertezas dizem
respeito à calibração da solução, não à sua viabilidade de princípio. O argumento central desta
seção permanece: existe uma maneira de implementar uma solução que agregue valor real, e as
evidências que a sustentam estão sistematizadas aqui.

---

## Referências

<span id="ref-tapi-1">TAPI-1.</span> INSTITUTO DE TECNOLOGIA E LIDERANÇA (INTELI). **TAPI — Termo de Abertura do Projeto Inteli: Pier Seguradora, ECMD6 - Robótica móvel e visão computacional.** São Paulo, 2025.