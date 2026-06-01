---
title: Watcher — Monitoramento Contínuo de Frames
sidebar_position: 2
---

&emsp; Durante a Sprint 3, foi desenvolvido um script de monitoramento contínuo (*watcher*) responsável por integrar o servidor de recebimento de frames com o modelo YOLO de detecção de placas. O script fica rodando indefinidamente, verificando se chegou uma imagem nova do drone e, quando detecta, processa e salva o recorte da placa automaticamente.

## Motivação

&emsp; O servidor de frames[¹](#ref-1) recebe imagens enviadas pelo drone via WebSocket e as armazena em um buffer. Para que o modelo de visão computacional processe essas imagens de forma automática e contínua, sem intervenção humana, foi necessário criar um processo que monitore o servidor e reaja a cada novo frame recebido.

&emsp; O watcher resolve esse problema: ele consulta periodicamente o servidor, compara o identificador do frame atual com o último que já processou, e só age quando há uma atualização real. Isso evita processar a mesma imagem duas vezes e garante que nenhum frame novo seja ignorado.

## Fluxo de Funcionamento

```
Servidor recebe frame do drone
        ↓
Watcher detecta frame_id novo
        ↓
Baixa imagem via /vision/latest-frame
        ↓
Roda YOLO → recorta a placa
        ↓
Salva recorte em output/plates/
        ↓
(futuro) Envia para OCR
```

## Estrutura de Arquivos

&emsp; O script está localizado em `src/license-plate-detection/plate-cutter/`:

- **`watcher.py`**: script principal de monitoramento contínuo;
- **`output/plates/`**: pasta gerada automaticamente onde os recortes das placas detectadas são salvos.

&emsp; O modelo YOLO utilizado (`best.pt`) não é versionado no repositório. Ele deve ser colocado no caminho configurado pela variável `MODEL_PATH` antes de executar o script.

## Configurações

&emsp; As configurações do script estão no topo do arquivo `watcher.py` e podem ser ajustadas conforme o ambiente:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `SERVER_URL` | Endereço do servidor de frames | `http://localhost:8000` |
| `INTERVALO` | Segundos entre cada verificação | `2` |
| `MODEL_PATH` | Caminho para o arquivo `best.pt` | `../model-plate/best.pt` |
| `OUTPUT_DIR` | Pasta onde os recortes são salvos | `output/plates` |

## Como Utilizar

&emsp; Crie um ambiente virtual e instale as dependências necessárias:

```bash
pip install ultralytics opencv-python numpy requests
```

&emsp; Certifique-se de que o servidor de frames está rodando e que o arquivo `best.pt` está no caminho configurado. Em seguida, execute o script:

```bash
cd src/license-plate-detection/plate-cutter
python watcher.py
```

&emsp; O script ficará rodando indefinidamente, imprimindo no terminal o status de cada verificação. Os recortes das placas detectadas são salvos em `output/plates/` com o nome `placa_{frame_id}.jpg`. Para interromper o script, use `Ctrl+C`.

## Próximos Passos

&emsp; Os pontos abaixo foram identificados como evoluções futuras para o watcher:

- **Integração com OCR**: conectar a saída do watcher com o módulo de leitura de texto da placa (FastPlate), substituindo o salvamento em pasta pelo envio direto ao OCR;
- **Integração com a API da Pier**: após o OCR retornar o texto da placa, consultar a API para verificar se o veículo consta em registros de sinistros.

## Referências

<span id="ref-1">1.</span> Servidor de frames desenvolvido pelo grupo — `src/web-socket-test/main.py`. Branch: `websocket-yolo`.

<span id="ref-2">2.</span> JOCHER, G.; CHAURASIA, A.; QIU, J. Ultralytics YOLOv8. Disponível em: https://docs.ultralytics.com/. Acesso em: 28 maio 2026.
