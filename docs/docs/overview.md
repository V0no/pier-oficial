---
title: Overview Geral
sidebar_position: 1
slug: /
id: overview
sidebar_label: Overview
---

# Visão Geral do Documento

&emsp;Este documento apresenta a visão geral do projeto desenvolvido em parceria com a Pier Seguradora. O objetivo aqui é contextualizar a empresa parceira, detalhar o problema estrutural enfrentado na recuperação de veículos sinistrados e introduzir a proposta de solução tecnológica baseada em drones autônomos e visão computacional. As seções a seguir detalham o histórico da empresa, os limites do seu modelo de operação atual e o desafio proposto para a nossa equipe.

## Quem é a Pier Seguros?

&emsp;A **Pier Seguros** é uma seguradora digital brasileira fundada em 2018, reconhecida por ser a
primeira insurtech a obter autorização regulatória da Susep.[¹](#ref-1) A empresa se distingue
pela oferta de seguros por meio de aplicativo móvel, com foco em produtos voltados a smartphones
e automóveis.[²](#ref-2)

### Fundação e Fundadores

&emsp;A companhia foi fundada em janeiro de 2018 por **Igor Mascarenhas** (CEO), **Lucas Prado** e
**Rafael Oliveira**, com o propósito declarado de tornar os seguros mais acessíveis, confiáveis e
desburocratizados para os brasileiros.[³](#ref-3) A operação teve início com uma equipe de apenas
cinco colaboradores, estabelecendo desde o princípio um modelo orientado à simplicidade em um
mercado historicamente dominado por seguradoras tradicionais.[⁴](#ref-4)

### Produtos Oferecidos

&emsp;A Pier atua com dois produtos principais:

- **Seguro para celular** — oferece cobertura contra roubo, furto simples e qualificado, além de
  danos acidentais, com planos mensais e contratação flexível.[²](#ref-2)
- **Seguro para automóvel** — disponível em 19 estados e no Distrito Federal, contempla cobertura
  para roubo, furto, perda total, danos parciais e assistência 24 horas. Atende também motoristas
  de aplicativo, com contratação e cancelamento integralmente realizados de forma
  digital.[⁵](#ref-5)

### Diferenciais

&emsp;Os diferenciais da Pier em relação às seguradoras convencionais tem como foco o meio digital:

- **Reembolso automatizado por inteligência artificial**: 30% dos sinistros de celular são
  processados em menos de 1 segundo pela tecnologia Pier Bolt.[⁶](#ref-6)
- **Preços até 30% inferiores** aos praticados pelos concorrentes.[⁵](#ref-5)
- **Modelo de gestão diferenciado**: 28% dos colaboradores são sócios por meio de stock options,
  com regime de trabalho remoto adotado desde a fundação.[³](#ref-3)
- **Nota 7,5/10 no Reclame Aqui** (período out/2025–mar/2026), com 89,8% das reclamações
  solucionadas.[⁷](#ref-7)

### Crescimento e Solidez

&emsp;Em 2024, a Pier registrou um faturamento superior a **R$ 150 milhões**, com mais de **150 mil
membros ativos** e **R$ 200 milhões pagos em reembolsos**.[⁶](#ref-6) Ao longo de sua trajetória,
a empresa acumulou mais de **R$ 222 milhões em investimentos**, incluindo rodadas Série A (US$
14,5M), Série B (US$ 20M) e um aporte recente de R$ 108 milhões.[⁸](#ref-8) A companhia conta
ainda com uma rede de **1.500 corretores parceiros** e, para 2025, mantém estratégia de expansão
centrada no aprofundamento do uso de inteligência artificial no seguro auto e no fortalecimento do
canal corretor.[⁷](#ref-7)


## O Problema

&emsp;Mesmo com a agilidade que a Pier consolidou ao longo dos anos no processo de acionamento de
sinistros, há uma etapa da operação que ainda depende de maneira quase integral da capacidade
humana: **a recuperação de veículos roubados ou furtados**.

&emsp;O modelo vigente no mercado é o da chamada **pronta resposta**: a atividade é terceirizada para
empresas especializadas, cujos agentes percorrem as vias em busca de veículos com registro ativo
de roubo ou furto. Trata-se de um processo funcional, porém é precisamente nesse ponto que reside
o problema.

&emsp;Quando um agente localizava um veículo suspeito, a verificação da placa não era feita por um
sistema integrado — a consulta era enviada manualmente por um **bate-papo com a central**, que
precisava receber a mensagem, cruzar as informações com a base de sinistros e retornar o resultado
ao agente em campo. Cada etapa desse fluxo dependia da disponibilidade de um operador humano,
introduzindo atrasos, risco de falha na comunicação e uma fragilidade estrutural que nenhum
aumento de equipe seria capaz de eliminar por completo. O resultado prático é uma operação de
baixa escalabilidade, suscetível a erros e com cobertura restrita, fatores que se refletem
diretamente na taxa de recuperação. **Além disso, apenas cerca de 10% dos veículos roubados ou
furtados são efetivamente localizados**.

### Os limites do modelo atual

&emsp;Por mais que se invista na operação de pronta resposta, ela carrega restrições de natureza
estrutural que não se resolvem por meio de ampliação de quadro:

- **Cobertura geográfica restrita** — os agentes percorrem rotas fixas, o que deixa regiões
  inteiras sem monitoramento contínuo.
- **Janelas de operação limitadas** — a busca não ocorre de forma ininterrupta, o que permite que
  veículos sejam deslocados ou desmontados nos períodos em que não há cobertura ativa.
- **Custo proporcional à escala** — a ampliação da cobertura demanda a contratação de mais
  pessoas, tornando a operação financeiramente insustentável à medida que cresce.
- **Verificação de placas dependente de operação manual** — a ausência de integração direta com a
  base de sinistros obrigava os agentes a recorrer a um canal de mensagens para cada consulta,
  tornando o processo lento e vulnerável à indisponibilidade humana.

&emsp;Para a Pier, essas limitações se traduzem diretamente em resultados negativos: baixa taxa de
recuperação de veículos segurados, elevação da sinistralidade na carteira de seguros auto e um
volume de salvados aquém do potencial da companhia. Cada veículo não recuperado representa um
sinistro pago integralmente — e a ineficiência do processo vigente impacta tanto os indicadores
financeiros da Pier quanto a experiência do segurado, que espera que sua seguradora tenha esgotado
todos os recursos disponíveis.[¹](#ref-tapi-1)

### O desafio

&emsp;A Pier apresentou ao Inteli o seguinte desafio: ampliar, de forma significativa, a cobertura
geográfica e temporal da busca por veículos roubados ou furtados — sem que essa expansão dependa
exclusivamente da capacidade humana para se sustentar.


## Proposta de Solução

&emsp;A solução proposta integra três tecnologias complementares para transformar a operação de
recuperação de veículos da Pier: **drones autônomos**, **visão computacional** e **análise
preditiva geoespacial**.

&emsp;O sistema opera com drones sobrevoando regiões de alta incidência histórica de desova de
veículos — identificadas por meio de mapas de calor construídos a partir dos dados de sinistros da
Pier. Durante o patrulhamento, câmeras embarcadas capturam imagens de veículos em tempo real,
que são submetidas a um modelo de reconhecimento automático de placas (ALPR) treinado com placas
brasileiras. Quando o sistema identifica uma placa com sinistro ativo de roubo ou furto, uma
notificação contendo a localização do veículo é emitida imediatamente para as equipes internas da
companhia, que assumem o processo decisório a partir desse ponto.

&emsp;O objetivo não é substituir o julgamento humano — é garantir que a informação certa chegue às
pessoas certas no menor intervalo de tempo possível, cobrindo áreas e horários que nenhum agente
conseguiria monitorar de forma contínua.

&emsp;Para uma análise detalhada das evidências que sustentam a viabilidade desta proposta e o valor
que ela pode gerar para a Pier, consulte a [Proposta de Valor](./sprint-1/analiseDeValor.md).


# Conclusão

&emsp;Este documento apresentou o contexto que motivou o projeto: uma seguradora digital sólida, com
histórico de inovação e crescimento consistente, que identificou um gargalo estrutural em sua
operação de recuperação de veículos. O modelo de pronta resposta — funcional, mas dependente de
capacidade humana — atingiu seus limites naturais, e a Pier reconheceu que o próximo passo exige
uma mudança de abordagem.

&emsp;A proposta de solução delineada aqui — drones equipados com visão computacional, orientados por
análise preditiva de locais de desova — não surge como especulação tecnológica, mas como resposta
direta às restrições identificadas: cobertura geográfica limitada, janelas de operação
intermitentes e custo proporcional à escala. Cada elemento da solução endereça uma dessas
restrições de forma objetiva.

&emsp;O detalhamento das evidências que sustentam a viabilidade dessa abordagem — e do valor que ela
pode gerar para a Pier — está desenvolvido na [Proposta de Valor](./sprint-1/analiseDeValor.md).

---

## Referências

<span id="ref-1">1.</span> SONHO SEGURO. **Pier é a primeira insurtech a ser autorizada pela Susep.** Disponível em: https://www.sonhoseguro.com.br/2020/12/pier-e-a-primeira-insurtech-a-ser-autorizada-pela-susep/. Acesso em: 30 abr. 2026.

<span id="ref-2">2.</span> PIER SEGURADORA. **Pier Seguradora: a maior seguradora digital do Brasil.** Disponível em: https://pier.digital/sobre/pier. Acesso em: 30 abr. 2026.

<span id="ref-3">3.</span> PIER BLOG. **Os primeiros novos sócios da Pier.** Disponível em: https://blog.pier.digital/os-primeiros-novos-socios-da-pier/. Acesso em: 30 abr. 2026.

<span id="ref-4">4.</span> REVISTA COBERTURA. **Pier Seguradora alcança a marca de 100 mil membros.** Disponível em: https://www.revistacobertura.com.br/noticias/insurtech-inovacao/pier-seguradora-alcanca-a-marca-de-100-mil-membros-mudando-a-relacao-das-pessoas-com-o-mundo-dos-seguros/. Acesso em: 30 abr. 2026.

<span id="ref-5">5.</span> PIER SEGURADORA. **Seguro Auto Pier: Digital, Rápido e Econômico!** Disponível em: https://pier.digital/seguro-auto. Acesso em: 30 abr. 2026.

<span id="ref-6">6.</span> STARTUPI. **Pier fatura R$ 150 milhões em 2024 e amplia estratégia com corretores e seguro auto em 2025.** Disponível em: https://startupi.com.br/pier-fatura-r-150-milhoes/. Acesso em: 30 abr. 2026.

<span id="ref-7">7.</span> RECLAME AQUI. **Pier Seguradora.** Disponível em: https://www.reclameaqui.com.br/empresa/pier-digital/. Acesso em: 30 abr. 2026.

<span id="ref-8">8.</span> INSURTECH BRASIL. **Pier Seguradora: Confira todos os investimentos recebidos pela insurtech.** Disponível em: https://www.insurtech.com.br/guia/pier-seguradora-confira-todos-os-investimentos-recebidos-pela-insurtech/. Acesso em: 30 abr. 2026.

<span id="ref-tapi-1">TAPI-1.</span> INSTITUTO DE TECNOLOGIA E LIDERANÇA (INTELI). **TAPI — Termo de Abertura do Projeto Inteli: Pier Seguradora, ECMD6 - Robótica móvel e visão computacional.** São Paulo, 2025.