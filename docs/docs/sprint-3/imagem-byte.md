---
title: Envio de Imagem em Bytes
sidebar_position: 4
id: base64-para-byte
sidebar_label: De Base64 para Bytes
---


# Modificação do Envio de Imagens de Base64 para Bytes

&emsp;Esta seção documenta a modificação realizada no fluxo de transmissão de imagens entre o cliente mobile e o backend do projeto. A implementação anterior previa o envio da imagem codificada em `base64`, junto aos metadados do frame. Na nova versão, os metadados continuam sendo enviados em formato JSON, mas a imagem passa a ser transmitida pelo WebSocket como dados binários, ou seja, em bytes.

&emsp;Essa alteração foi feita para tornar a transmissão de frames mais eficiente e mais adequada ao processamento posterior por modelos de visão computacional. Como o sistema precisa receber imagens de forma contínua, qualquer aumento desnecessário no tamanho do payload impacta diretamente a latência, o consumo de banda e a capacidade do backend de manter um fluxo estável.


## Contexto da alteração

&emsp;Durante a Sprint 2, a transmissão de imagem foi estruturada com WebSocket como canal principal de comunicação entre o celular gateway e o backend remoto. A proposta inicial considerava o envio da imagem em `base64`, pois esse formato facilita a inclusão da imagem dentro de um objeto JSON e simplifica os primeiros testes de integração.

&emsp;Apesar de útil para prototipação, o `base64` não é o formato mais eficiente para envio contínuo de imagens. Ao converter uma imagem JPEG para texto, o tamanho final do conteúdo aumenta, pois os bytes originais são representados por caracteres ASCII. Além disso, o backend precisa decodificar esse texto antes de conseguir utilizar a imagem como arquivo ou como entrada para modelos de visão computacional.

&emsp;Com a evolução do protótipo, foi necessário aproximar o fluxo de transmissão de um cenário mais realista. Por isso, o envio passou a separar os dados em duas mensagens:

1. uma mensagem de texto com os metadados do frame;
2. uma mensagem binária com a imagem em bytes.


## Fluxo anterior com base64

&emsp;No fluxo anterior, a imagem era transformada em uma string `base64` e enviada como parte de um JSON. A estrutura esperada era semelhante ao exemplo abaixo:

```json
{
  "frame_id": 1,
  "timestamp": "2026-05-28T12:00:00.000Z",
  "latitude": -23.55052,
  "longitude": -46.633308,
  "content_type": "image/jpeg",
  "image_base64": "/9j/4AAQSkZJRgABAQ..."
}
```

&emsp;Esse formato possui algumas vantagens para testes iniciais, como a facilidade de visualizar o payload completo e a compatibilidade direta com JSON. Porém, para um fluxo contínuo de frames, ele apresenta limitações importantes:

- aumenta o tamanho da mensagem enviada;
- exige conversão da imagem para texto no cliente;
- exige decodificação do `base64` no backend;
- mistura metadados e imagem em um único payload pesado;
- dificulta a entrega direta da imagem por rotas HTTP como `image/jpeg`.

&emsp;Essas limitações se tornam mais relevantes quando o celular envia vários frames por segundo, como no caso do cliente mobile, que opera com uma frequência inicial de 5 FPS.


## Novo fluxo com envio em bytes

&emsp;Na nova implementação, o cliente mobile captura o frame da câmera, desenha a imagem em um `canvas`, converte esse conteúdo para um `Blob` JPEG e, em seguida, transforma o `Blob` em um `ArrayBuffer`. Esse `ArrayBuffer` é enviado pelo WebSocket como mensagem binária.

&emsp;Antes da imagem, o cliente envia uma mensagem JSON contendo apenas os metadados do frame. Dessa forma, o backend consegue associar os metadados recebidos à próxima mensagem binária enviada pela mesma conexão.

&emsp;Com isso, o WebSocket passa a utilizar dois tipos de mensagem:

| Tipo de mensagem | Conteúdo | Finalidade |
|---|---|---|
| Texto | JSON com `frame_id`, `timestamp`, localização e tipo do arquivo | Registrar os metadados do frame |
| Binária | Bytes da imagem JPEG | Transmitir a imagem sem conversão para texto |

## Implementação no cliente mobile

&emsp;No arquivo `src/web-socket-test/static/mobile-client.html`, a imagem é capturada a partir da câmera do celular e convertida para JPEG com qualidade configurada em `0.75`. A geração do arquivo é feita com `canvas.toBlob`, e o envio binário ocorre após a conversão do `Blob` para `ArrayBuffer`.

&emsp;O trecho principal do fluxo é:

```javascript
const blob = await canvasToBlob(canvas);
const imageBytes = await blob.arrayBuffer();

const metadata = {
  frame_id: frameId,
  timestamp: new Date().toISOString(),
  latitude: currentPosition.latitude,
  longitude: currentPosition.longitude,
  content_type: "image/jpeg",
  width: canvas.width,
  height: canvas.height
};

websocket.send(JSON.stringify(metadata));
websocket.send(imageBytes);
```

&emsp;Essa estrutura garante que os metadados continuem legíveis e organizados, enquanto a imagem é enviada no formato mais próximo do arquivo original gerado pelo navegador.

&emsp;Também foi definido o uso de:

- `FPS_ENVIO = 5`, indicando o envio de até cinco frames por segundo;
- `JPEG_QUALITY = 0.75`, equilibrando qualidade visual e tamanho do arquivo;
- `websocket.binaryType = "arraybuffer"`, indicando que mensagens binárias devem ser tratadas como `ArrayBuffer`.



## Implementação no backend

&emsp;No backend, implementado em `src/web-socket-test/main.py`, o endpoint WebSocket `/ws/frames` foi ajustado para diferenciar mensagens de texto e mensagens binárias.

&emsp;Quando o backend recebe uma mensagem de texto, ele tenta interpretar o conteúdo como JSON e armazena esses dados temporariamente como os metadados mais recentes. Quando recebe uma mensagem binária, ele interpreta o conteúdo como a imagem do frame, calcula seu tamanho em bytes e cria o registro completo no buffer.

O fluxo do backend pode ser resumido da seguinte forma:

```text
Mensagem de texto recebida
   └── json.loads(message["text"])
       └── latest_metadata = metadados do frame

Mensagem binária recebida
   └── image_bytes = message["bytes"]
       ├── calcula size_bytes
       ├── associa com latest_metadata
       ├── salva no frames_buffer
       └── responde confirmação ao cliente
```

&emsp;A estrutura armazenada no buffer passou a conter a imagem diretamente em bytes:

```python
frame_data = {
    "frame_id": frame_id,
    "timestamp": timestamp,
    "latitude": latest_metadata.get("latitude"),
    "longitude": latest_metadata.get("longitude"),
    "content_type": latest_metadata.get("content_type", "image/jpeg"),
    "size_bytes": len(image_bytes),
    "image_bytes": image_bytes,
    "received_at": utc_now_iso(),
}
```

&emsp;Ao final do recebimento, o backend envia uma confirmação para o cliente informando que o frame foi recebido em bytes:

```json
{
  "status": "ok",
  "message": "frame recebido em bytes",
  "frame_id": 1,
  "size_bytes": 24576,
  "buffer_size": 1
}
```


## Rotas de consulta da imagem

&emsp;Como a imagem agora é armazenada em bytes, o backend consegue retorná-la diretamente como resposta HTTP com o tipo de mídia correto. Isso facilita a integração com outras partes do sistema, principalmente com o módulo de visão computacional.

As principais rotas relacionadas ao consumo dos frames são:

| Rota | Função |
|---|---|
| `/frames/latest` | Retorna os metadados dos últimos frames recebidos, sem incluir a imagem |
| `/frames/latest/image` | Retorna a imagem mais recente em bytes, mantendo compatibilidade com testes anteriores |
| `/vision/latest-frame` | Rota principal para o modelo de visão computacional consultar a imagem mais recente |
| `/vision/latest-frame/meta` | Retorna apenas os metadados do último frame |
| `/vision/frames/count` | Informa quantos frames estão no buffer |
| `/vision/frames/{frame_id}` | Retorna a imagem de um frame específico pelo identificador |

&emsp;Ao retornar a imagem, o backend utiliza `Response` do FastAPI com `media_type` definido como `image/jpeg`. Também são enviados cabeçalhos auxiliares com informações do frame:

```text
X-Frame-Id
X-Timestamp
X-Size-Bytes
```

&emsp;Esse formato permite que o modelo de visão computacional consuma a imagem diretamente pela rota `/vision/latest-frame`, sem precisar decodificar uma string `base64`.

&emsp;Como próximo passo dessa evolução, essas rotas deixam de ser apenas recursos locais de teste e passam a precisar de um ambiente remoto acessível por outros dispositivos e módulos do sistema. Essa decisão é detalhada na documentação de [publicação das rotas no Render](./deploy-render.md), que complementa este fluxo explicando por que o backend foi disponibilizado fora do ambiente local.


## Benefícios da modificação

&emsp;A mudança de `base64` para bytes trouxe melhorias importantes para o fluxo de transmissão de imagens:

- **Menor tamanho de payload:** a imagem deixa de ser convertida para texto, evitando o aumento de tamanho causado pelo `base64`;
- **Menos processamento no backend:** o servidor não precisa decodificar a imagem antes de armazená-la ou retorná-la;
- **Separação mais clara de responsabilidades:** os metadados ficam no JSON e a imagem fica na mensagem binária;
- **Melhor compatibilidade com visão computacional:** a imagem já fica disponível como bytes JPEG, formato esperado por bibliotecas de processamento;
- **Resposta HTTP mais natural:** as rotas podem retornar `image/jpeg` diretamente;
- **Fluxo mais próximo de produção:** o envio binário é mais adequado para transmissão contínua de frames.

&emsp;Essa alteração também facilita futuras otimizações, como ajuste dinâmico de qualidade JPEG, controle de FPS, compressão, descarte de frames antigos e processamento assíncrono em fila.


## Conclusão

&emsp;A modificação do envio de imagens de `base64` para bytes representa uma evolução importante na arquitetura de transmissão do projeto. A solução mantém a simplicidade do WebSocket, mas reduz a sobrecarga de comunicação e prepara o backend para consumir frames de forma mais eficiente.

&emsp;A separação entre metadados em JSON e imagem em bytes torna o fluxo mais organizado, melhora a compatibilidade com os módulos de visão computacional e aproxima o MVP de uma operação real, na qual o celular atua como gateway entre a câmera e o servidor remoto.
