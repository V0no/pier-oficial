# Frontend 

Interface web do projeto Pier Surveillance, construída com **React 18 + Vite**. Permite que administradores e operadores monitorem drones, gerenciem atribuições e consultem o histórico de detecções de placas.

---

## Estrutura de arquivos

```
frontend/
├── index.html
├── main.jsx              
├── App.jsx                # Roteador principal 
├── vite.config.js
├── .env                  
│
├── pages/                 
│   ├── login.jsx          # Autenticação
│   ├── DroneSelection.jsx # Grade de cards para escolha do drone
│   ├── DroneVisu.jsx      # Visualização em tempo real do drone ativo
│   ├── DroneList.jsx      # Tabela paginada de todos os drones
│   ├── OperatorList.jsx   # Tabela paginada de operadores
│   ├── Assignments.jsx    # Criação e gestão de atribuições drone-operador
│   └── HistoryPage.jsx    # Histórico paginado de detecções de placas
│
├── components/          
│   ├── Sidebar.jsx        # Navegação lateral (variantes admin / drone)
│   ├── DroneCard.jsx      # Card individual de drone na grade de seleção
│   ├── TableDrone.jsx     # Tabela de drones com paginação embutida
│   ├── TableOperator.jsx  # Tabela de operadores com paginação embutida
│   ├── HistoryTablePlates.jsx # Tabela de histórico de detecções
│   └── Pagination.jsx     # Controle de paginação genérico
│
├── services/              # Camada de acesso à API
│   ├── api.js             # Exporta API_BASE_URL 
│   ├── authService.js     # authenticateUser(email, senha)
│   └── assignmentApi.js   # CRUD de drones, operadores e atribuições
│
├── styles/                # CSS 
├── static/                
└── public/                
```

---

## Como executar

```bash
cd src/frontend
npm install
npm run dev      http://localhost:8000/

```

---

## Roteamento

Definido em `App.jsx`. A rota `/` redireciona automaticamente para `/login`.

| Rota | Componente | Perfil de acesso |
|------|-----------|-----------------|
| `/login` | `Login` | Público |
| `/drones-selection` | `DroneSelection` | Operador |
| `/drone-visu` | `DroneVisu` | Operador |
| `/drones` | `DroneList` | Admin |
| `/operators` | `OperatorList` | Admin |
| `/assignments` | `Assignments` | Admin |
| `/history` | `HistoryPage` | Operador / Admin |


---

## Páginas

### `login.jsx`

Formulário de autenticação com email e senha. Chama `authenticateUser` do `authService` e redireciona para `/drones-selection` em caso de sucesso. Exibe mensagens de erro inline para credenciais inválidas ou falha de rede.

---

### `DroneSelection.jsx`

Grade de cards com todos os drones cadastrados (até 100 por requisição). Exibe contadores de drones disponíveis e ativos no topo. Cada card é renderizado por `components/DroneCard.jsx`.

**Endpoint:** `GET /drones?limit=100`

---

### `DroneVisu.jsx`

Tela de operação do drone ativo. Exibe:
- Cronômetro de tempo de operação (incrementa a cada segundo)
- Métricas: placas lidas, alertas, status do sinal
- Lista animada de placas detectadas (simulada com dados mock — intervalo de 1,8 s por placa)
- Destaque visual para veículos com status `"Roubado"`
- Botão "Acionar equipe" visível quando há alertas
- Botão para navegar ao histórico completo

---

### `DroneList.jsx`

Tabela paginada de drones. Busca `recordsPerPage = 9` drones por página via `components/TableDrone.jsx`.

**Endpoint:** `GET /drones?page={n}&limit=9`

---

### `OperatorList.jsx`

Tabela paginada de operadores com status online/offline. Busca `recordsPerPage = 9` por página.

**Endpoint:** `GET /users?page={n}&limit=9`

---

### `Assignments.jsx`

Permite criar e encerrar atribuições drone-operador.

**Funcionalidades:**
- Seletor carrossel de drones (← →) com nome, modelo, bateria e sinal
- Seletor carrossel de operadores com nome, função e status online
- Botão "+ Atribuir" — chama `POST /api/assignments`
- Grade com as 4 últimas atribuições, cada uma com botão "Desatribuir" quando ativa

**Endpoints consumidos:**
- `GET /api/drones` — lista todos os drones
- `GET /api/operators` — lista todos os operadores
- `GET /api/assignments` — lista as 10 últimas atribuições
- `POST /api/assignments` — cria atribuição
- `PATCH /api/assignments/:id/unassign` — encerra atribuição

---

### `HistoryPage.jsx`

Histórico paginado de detecções de placas. Exibe `recordsPerPage = 14` itens por página via `HistoryTablePlates.jsx`.

**Endpoint:** `GET /detections?page={n}&limit=14`

---

## Componentes

### `Sidebar.jsx`

Navegação lateral com duas variantes configuráveis via prop `variant`:

| Variante | Links |
|----------|-------|
| `admin` (padrão) | Atribuições · Drones · Operadores |
| `drone` | Seleção de drone · Mapa de calor · Histórico |

O item ativo é detectado automaticamente via `useLocation`. Exibe nome, papel e inicial do usuário no rodapé (dados estáticos por enquanto — sem contexto de autenticação global).

---

### `DroneCard.jsx`

Card individual para a grade de seleção. Recebe o objeto `drone` e exibe nome, modelo, status, bateria, sinal e base. Diferencia visualmente drones disponíveis dos em uso ou manutenção.

---

### `TableDrone.jsx`

Tabela de drones com colunas: nome, modelo, status, bateria, sinal, base e operador. Inclui o componente `Pagination` no rodapé.

---

### `TableOperator.jsx`

Tabela de operadores com colunas: nome, email, função, último login e status. Inclui `Pagination` no rodapé.

---

### `HistoryTablePlates.jsx`

Tabela de detecções com colunas: foto, modelo do carro, horário, data, localização e status (`ALERTA` / `VERIFICADO`). Inclui `Pagination` no rodapé.

---

### `Pagination.jsx`

Controle genérico de paginação. Recebe `totalRecords`, `recordsPerPage`, `currentPage` e `onPageChange`. Calcula `totalPages` internamente e emite o número da nova página via callback.

---

## Camada de serviços

### `services/api.js`

Exporta `API_BASE_URL` lida de `VITE_API_BASE_URL`. Usado como base para chamadas fetch nas páginas.

### `services/authService.js`

```js
authenticateUser(email, senha) → Promise<boolean>
```

Faz `POST /auth/login` e retorna `true` se `authenticated === true`.

### `services/assignmentApi.js`

| Função | Método | Endpoint |
|--------|--------|----------|
| `getDrones()` | GET | `/api/drones` |
| `getOperators()` | GET | `/api/operators` |
| `getAssignments()` | GET | `/api/assignments` |
| `createAssignment(userId, droneId)` | POST | `/api/assignments` |
| `unassignDrone(assignmentId)` | PATCH | `/api/assignments/:id/unassign` |

Todas as funções lançam `Error` em caso de resposta não-OK, usando a mensagem de erro retornada pela API quando disponível.
