---
title: Publicação das Rotas no Render
sidebar_position: 5
id: deploy-render
sidebar_label: Deploy no Render
---

# Tomada de Decisão para Publicação das Rotas no Render

&emsp;Esta seção documenta a decisão de publicar as rotas do backend no Render, tornando o serviço acessível por uma URL pública. A principal motivação dessa escolha foi permitir que os módulos do projeto consumam as rotas de transmissão e consulta de frames sem depender da execução local do servidor em uma máquina específica. Esta documentação complementa a seção de [envio de imagem em bytes](./imagem-byte.md), que explica primeiro como os frames passaram a ser transmitidos e retornados pelo backend.

&emsp;O uso do Render já estava previsto desde o início do desenvolvimento, pois o backend precisava ser acessível fora da máquina local. Em um primeiro momento, esse deploy foi realizado a partir de um repositório pessoal, no qual era possível configurar livremente o serviço do Render. Posteriormente, houve a tentativa de anexar essa configuração ao repositório oficial do projeto, mas isso não foi possível devido às limitações de acesso e configuração associadas ao repositório privado. Com autorização do orientador, foi mantido um repositório externo, de responsabilidade do integrante, usado especificamente para hospedar o servidor na nuvem.


## Contexto da decisão

&emsp;O fluxo atual do projeto utiliza um backend em FastAPI para receber imagens enviadas pelo cliente mobile via WebSocket. O celular atua como gateway de captura, enviando os metadados e os bytes da imagem para a rota `/ws/frames`. Em seguida, o backend mantém os frames em um buffer e disponibiliza rotas HTTP para consulta da imagem mais recente, dos metadados e da quantidade de frames armazenados.

&emsp;Mesmo com o Render já sendo utilizado como solução de hospedagem, existiam duas limitações diferentes que precisavam ser consideradas. A primeira era a limitação técnica do ambiente local: quando o servidor roda apenas na máquina do desenvolvedor, o celular precisa estar na mesma rede e apontar para o IP correto. A segunda era a limitação de integração com o repositório oficial: como o repositório do projeto é privado, não foi possível conectar a configuração de deploy ao Render da mesma forma que já estava funcionando no repositório pessoal.

&emsp;Dessa forma, a decisão não foi criar um repositório externo para substituir o repositório do projeto, mas sim manter um repositório separado apenas para viabilizar a hospedagem do servidor. O repositório oficial continua sendo a referência principal do projeto, enquanto o repositório externo funciona como uma base operacional para o deploy no Render.

&emsp;A publicação no Render foi mantida como uma forma de reduzir as barreiras de teste, facilitar a integração entre dispositivos e aproximar o backend de um cenário mais realista de operação.

## Objetivo do deploy

&emsp;O objetivo principal do deploy no Render é transformar o backend em um serviço remoto acessível por URL pública. Dessa forma, o cliente mobile, os módulos de visão computacional e outros consumidores podem utilizar as mesmas rotas sem precisar executar o projeto localmente.

&emsp;Com isso, o backend passa a cumprir três funções principais no ambiente remoto:

1. receber frames enviados pelo celular por meio do WebSocket;
2. disponibilizar a imagem mais recente para consumo por outras partes do sistema;
3. expor rotas auxiliares de status, metadados e contagem de frames.

&emsp;Essa decisão também facilita a validação do MVP, pois permite testar o envio de imagens e o consumo das rotas a partir de dispositivos e ambientes diferentes.


## Rotas disponibilizadas

&emsp;Após o deploy, as rotas deixam de depender de `localhost` e passam a ser acessadas pelo domínio público gerado pelo Render. Assim, uma rota que antes era acessada localmente como:

```text
http://localhost:8000/vision/latest-frame
```

&emsp;passa a ser acessada remotamente com a estrutura:

```text
https://pier-oficial.onrender.com/vision/latest-frame
```

&emsp;As principais rotas consideradas nesta etapa são:

| Rota | Finalidade |
|---|---|
| `/` | Verifica se o backend está online e lista algumas rotas disponíveis |
| `/health` | Retorna o status do serviço e informações do buffer |
| `/ws/frames` | Recebe os frames enviados pelo cliente mobile via WebSocket |
| `/frames/latest` | Retorna os metadados dos últimos frames recebidos |
| `/frames/latest/image` | Retorna a imagem mais recente em bytes |
| `/vision/latest-frame` | Disponibiliza a imagem mais recente para o módulo de visão computacional |
| `/vision/latest-frame/meta` | Retorna apenas os metadados do frame mais recente |
| `/vision/frames/count` | Informa a quantidade de frames armazenados no buffer |
| `/vision/frames/{frame_id}` | Retorna a imagem de um frame específico |
| `/sinistros/{placa}` | Consulta mockada de sinistros por placa |

&emsp;Para conexões WebSocket, a URL também muda de ambiente local para remoto. A estrutura esperada passa a ser:

```text
wss://pier-oficial.onrender.com/ws/frames
```

&emsp;O uso de `wss` é necessário porque o serviço publicado no Render utiliza HTTPS, e navegadores modernos exigem WebSocket seguro quando a página é carregada em contexto seguro.


## Configuração do serviço no Render

&emsp;O backend foi preparado para ser executado como um Web Service no Render. Como o código principal está dentro da pasta `src/web-socket-test`, essa pasta deve ser utilizada como diretório raiz do serviço.

| Configuração | Valor utilizado |
|---|---|
| Tipo de serviço | Web Service |
| Ambiente | Python |
| Root Directory | `src/web-socket-test` |
| Arquivo principal | `main.py` |
| Framework | FastAPI |
| Servidor ASGI | Uvicorn |

&emsp;A aplicação também considera que os arquivos estáticos estão dentro da pasta `static`, pois, no ambiente do Render, o serviço é iniciado a partir de `src/web-socket-test`. Por isso, o backend monta a pasta estática diretamente como:

```python
app.mount("/static", StaticFiles(directory="static"), name="static")
```

&emsp;Essa configuração permite que páginas auxiliar, como o cliente mobile, possam ser servidas pelo próprio backend quando necessário.


## Impacto na arquitetura

&emsp;Com o deploy no Render, o backend passa a funcionar como um ponto central de comunicação entre o dispositivo de captura e os consumidores dos frames. O celular não precisa mais descobrir o IP da máquina local, e o módulo de visão computacional pode consultar a imagem mais recente diretamente por uma rota HTTP pública.

O fluxo esperado passa a ser:

```text
Celular gateway
   └── envia metadados e imagem por WebSocket
       └── Backend no Render
           ├── armazena o frame mais recente no buffer
           ├── expõe metadados por rotas HTTP
           └── entrega imagem em bytes para visão computacional
```

&emsp;Essa mudança não altera a lógica principal de envio dos frames, mas altera o ambiente em que essa lógica está disponível. A mesma API desenvolvida localmente passa a ser consumida remotamente.


## Benefícios esperados

&emsp;A publicação das rotas no Render traz benefícios importantes para a continuidade do desenvolvimento:

- **Acesso remoto:** as rotas podem ser consumidas de qualquer lugar com acesso à internet;
- **Menor dependência do ambiente local:** não é necessário manter o servidor rodando manualmente na máquina de desenvolvimento;
- **Integração mais simples:** celular, backend e visão computacional podem estar em ambientes diferentes;
- **Demonstrações mais previsíveis:** a URL pública facilita testes e apresentações;
- **Evolução gradual do MVP:** o backend remoto cria uma base para futuras integrações com autenticação, banco de dados, filas e serviços externos.


## Limitações e riscos da estratégia

&emsp;Apesar de resolver a necessidade de disponibilizar o backend na nuvem, o uso de um repositório externo e público também cria limitações que precisam ser reconhecidas. A principal delas é o risco de divergência entre o código do repositório oficial e o código efetivamente publicado no Render. Caso as alterações não sejam sincronizadas com cuidado, o serviço em produção pode ficar diferente do que está documentado no projeto.

&emsp;Também existe uma dependência operacional da conta pessoal usada para manter o repositório e a configuração do Render. Isso significa que o deploy não está totalmente centralizado na organização do projeto, o que pode dificultar manutenção futura caso outra pessoa precise assumir a operação do backend.

&emsp;Outro ponto importante é a exposição pública do código utilizado no deploy. Mesmo que o backend não contenha dados sensíveis, o fato de o repositório ser público permite que qualquer pessoa visualize a estrutura das rotas, bibliotecas utilizadas e parte da lógica de funcionamento do serviço. Por isso, o repositório externo deve ser tratado como um ambiente de publicação controlada, contendo somente o necessário para executar o servidor.

&emsp;Os principais riscos identificados são:

- divergência entre o repositório oficial e o repositório usado no deploy;
- exposição pública da estrutura do backend e das rotas disponíveis;
- dependência da conta pessoal responsável pelo repositório externo;
- publicação acidental de arquivos sensíveis;
- dificuldade de rastrear mudanças caso não exista um processo claro de sincronização;
- possibilidade de uso indevido das rotas públicas enquanto não houver autenticação.


## O que não pode ser publicado no repositório público

&emsp;Como o repositório externo é público, ele não deve receber nenhum arquivo ou informação que comprometa a segurança do projeto, dos integrantes ou de serviços externos. A regra adotada é manter no repositório apenas código necessário para o funcionamento do backend, dependências, arquivos estáticos sem segredos e dados fictícios usados em testes.

&emsp;Não devem ser enviados para esse repositório:

- arquivos `.env` ou qualquer arquivo de configuração com variáveis sensíveis;
- chaves de API, tokens, senhas, secrets do Render ou credenciais de banco de dados;
- chaves SSH, arquivos de conta de serviço ou certificados privados;
- dados reais de usuários, veículos, placas, sinistros ou qualquer informação pessoal;
- imagens reais capturadas em testes que possam identificar pessoas, locais ou placas;
- logs de execução contendo IPs, payloads, tokens ou dados de requisições;
- documentos internos do projeto que não tenham sido preparados para publicação;
- modelos, pesos ou bases de dados que tenham restrição de licença ou uso;
- configurações locais da máquina do desenvolvedor.

&emsp;Caso alguma configuração sensível seja necessária para o funcionamento do serviço, ela deve ser cadastrada diretamente no painel do Render como variável de ambiente, e não versionada no GitHub. Se algum segredo for publicado por engano, ele deve ser removido do repositório e também revogado no serviço de origem, pois apenas apagar o arquivo em um commit posterior não elimina o risco de exposição pelo histórico do Git.


## Pontos em aberto para segurança

&emsp;Esta documentação registra apenas a base da decisão de deploy. As questões de segurança ainda precisam ser desenvolvidas em uma etapa posterior, principalmente porque as rotas publicadas ficam acessíveis pela internet.

&emsp;Alguns pontos que deverão ser avaliados nas próximas versões são:

- autenticação para envio de frames no WebSocket;
- controle de origem das requisições;
- limitação de taxa para evitar excesso de envio de imagens;
- restrição de acesso às rotas de consulta de imagem;
- validação mais rígida dos metadados recebidos;
- armazenamento seguro de variáveis de ambiente;
- definição de quais rotas devem permanecer públicas e quais devem exigir autorização.

&emsp;No estado atual, a prioridade foi tornar o fluxo acessível remotamente para viabilizar integração e testes. A camada de segurança deve ser tratada antes de considerar o serviço adequado para uso em produção.


## Conclusão

&emsp;A decisão de publicar as rotas no Render representa uma evolução no processo de integração do projeto. O backend deixa de depender da execução local e passa a funcionar como um ponto remoto de comunicação entre o celular gateway, o módulo de visão computacional e demais consumidores das imagens.

&emsp;Como o repositório oficial do projeto é privado e não foi possível anexar diretamente a configuração de deploy nele, a manutenção de um repositório externo autorizado tornou-se a alternativa prática para manter o servidor na nuvem. Essa escolha resolve a necessidade de acesso remoto, mas exige cuidado com sincronização, exposição pública do código e proteção de informações sensíveis.

&emsp;Essa base permite validar o funcionamento das rotas em um ambiente acessível externamente, reduzindo a dependência de configurações locais e preparando o projeto para as próximas discussões sobre segurança, persistência, escalabilidade e operação em produção.
