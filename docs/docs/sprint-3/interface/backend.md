# Backend 

Esta seção documenta como o backend está estruturado: os arquivos que compõem a API, as rotas disponíveis e as tabelas do banco que cada uma delas acessa. É por meio dessas rotas que o dashboard consome os dados de drones, operadores, atribuições e detecções de placas coletadas pela frota da Pier Seguros.

API REST em **Node.js + Express** conectada a um banco **PostgreSQL**. Composta por cinco arquivos:

| Arquivo | Responsabilidade |
|---------|-----------------|
| `server.js` | Entry point — configura o servidor, o pool e as rotas de drones, operadores e atribuições |
| `login.js` | Autenticação de usuários |
| `drones.js` | Listagem paginada de drones |
| `users.js` | Listagem paginada de operadores |
| `detections.js` | Listagem paginada de detecções de placas |

---

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- Banco PostgreSQL acessível (local ou remoto)

### 1. Instalar dependências

```bash
cd src/backend
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `src/backend/` com as seguintes variáveis:

```env
DB_HOST=<host do banco>
DB_PORT=5432
DB_USER=<usuário>
DB_PASSWORD=<senha>
DB_DATABASE=postgres
DB_SSL=true
PORT=3000
```

### 3. Iniciar o servidor

```bash
npm start
```

O servidor sobe na porta definida em `PORT` (padrão: `3000`). Para verificar se está no ar:

```bash
curl http://localhost:3000/health
# { "status": "online", "db": "connected" }
```

---

## Banco de dados

As tabelas consultadas por esses arquivos são:

| Tabela | Usada em |
|--------|----------|
| `drone` | `server.js`, `drones.js` |
| `user` | `server.js`, `users.js`, `login.js` |
| `drone_assignment` | `server.js`, `drones.js` |
| `detection` | `detections.js` |
| `vehicle` | `detections.js` |

---

## server.js

Entry point da aplicação. Inicializa o Express, o pool de conexão com o banco e monta as rotas. As rotas de drones sem paginação, operadores sem paginação e atribuições estão definidas diretamente aqui.

### `GET /health` e `GET /api/health`

Verifica se a API e o banco estão no ar.

```json
{ "status": "online", "db": "connected" }
```

### `GET /api/drones`

Lista todos os drones sem paginação. Usado pela tela de Atribuições.

```json
[
  {
    "id": 1,
    "name": "Drone Alpha",
    "model": "DJI Tello",
    "status": "Disponível",
    "battery": 85,
    "signal": "95"
  }
]
```

### `GET /api/operators`

Lista todos os operadores sem paginação. Usado pela tela de Atribuições.

```json
[
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "Operador",
    "isOnline": true,
    "initial": "J"
  }
]
```

### `GET /api/assignments`

Retorna as 10 atribuições mais recentes, com dados completos do drone e do operador.

```json
[
  {
    "id": 5,
    "droneId": 2,
    "droneName": "Drone Beta",
    "droneModel": "DJI 2",
    "droneStatus": "Em uso",
    "droneBattery": 60,
    "droneSignal": "80",
    "operatorId": 3,
    "operatorName": "Maria",
    "operatorInitial": "M",
    "operatorRole": "Operador",
    "operatorIsOnline": true,
    "assignedAt": "2026-05-29T14:00:00.000Z",
    "unassignedAt": null,
    "isActive": true
  }
]
```

### `POST /api/assignments`

Cria uma nova atribuição drone-operador.

```json
// Body
{ "userId": 3, "droneId": 2 }

// Resposta 201
{ "id": 6, "user_id": 3, "drone_id": 2, "assigned_at": "2026-05-29T14:05:00.000Z", "is_active": true }
```

Retorna `409` se o drone já tiver uma atribuição ativa.

### `PATCH /api/assignments/:id/unassign`

Encerra uma atribuição, marcando `is_active = false` e registrando `unassigned_at`.

```json
{ "id": 6, "user_id": 3, "drone_id": 2, "assigned_at": "...", "unassigned_at": "...", "is_active": false }
```

---

## login.js

Montado em `/auth`. Valida as credenciais de um usuário consultando a tabela `user`.

### `POST /auth/login`

```json
// Body
{ "email": "usuario@example.com", "senha": "senha123" }

// Resposta
{ "authenticated": true }
```

---

## drones.js

### `GET /drones?page=1&limit=15`

Lista drones com paginação. Faz JOIN com `drone_assignment` e `user` para incluir o e-mail do operador atribuído no momento.

| Param | Padrão | Máximo |
|-------|--------|--------|
| `page` | 1 | — |
| `limit` | 15 | 100 |

```json
{
  "drones": [
    {
      "id": 1,
      "name": "Drone Alpha",
      "model": "DJI Tello",
      "status": "Disponível",
      "battery": 85,
      "signal": "95",
      "base": "Base Norte",
      "imageUrl": "https://...",
      "operator": "operador@email.com"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 15
}
```

---

## users.js

### `GET /users?page=1&limit=9`

Lista operadores com paginação.

| Param | Padrão | Máximo |
|-------|--------|--------|
| `page` | 1 | — |
| `limit` | 9 | 100 |

```json
{
  "users": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "Operador",
      "last_login": "29/05/2026, 14:32:00",
      "status": "Online",
      "avatarUrl": null
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 9
}
```

`last_login` vem do campo `ultimo_ping` da tabela `user`, formatado para pt-BR. Quando nulo, exibe `"Nunca"`.

---

## detections.js

### `GET /detections?page=1&limit=14`

Lista detecções de placa paginadas, ordenadas da mais recente para a mais antiga. Faz JOIN com `vehicle` para compor o nome do veículo.

| Param | Padrão | Máximo |
|-------|--------|--------|
| `page` | 1 | — |
| `limit` | 14 | 100 |

```json
{
  "detections": [
    {
      "id": 10,
      "photoUrl": "https://...",
      "carModel": "toyota corolla — ABC-1234",
      "time": "14:32",
      "date": "29/05/2026",
      "location": "-23.5505, -46.6333",
      "status": "ALERTA"
    }
  ],
  "total": 200,
  "page": 1,
  "limit": 14
}
```

`status` é `"ALERTA"` quando `has_match = true` (veículo com ocorrência), ou `"VERIFICADO"` caso contrário.

---

## Conclusão

O backend do projeto tem como objetivo ser simples e direto: cada arquivo tem uma responsabilidade clara, todas as rotas consultam o banco via pool compartilhado e os dados já chegam ao frontend no formato que ele espera consumir.
