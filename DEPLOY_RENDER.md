# Deploy do Frontend Vite no Render

Este documento resume os ajustes feitos no projeto e os passos recomendados para publicar o frontend no Render.

## Alteracoes feitas

### 1. API do frontend parametrizada

Arquivo alterado:

```text
src/frontend/services/assignmentApi.js
```

Antes, o arquivo usava uma URL fixa:

```js
http://localhost:3000/api
```

Isso funcionava localmente, mas quebraria no Render, porque o navegador do usuario tentaria acessar `localhost:3000` na propria maquina dele, e nao o backend publicado.

Agora o arquivo usa:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_BASE_PATH = API_BASE_URL + "/api";
```

Com isso, no deploy basta configurar a variavel `VITE_API_BASE_URL` com a URL publica do backend.

Exemplo:

```text
VITE_API_BASE_URL=https://seu-backend.onrender.com
```

Nao coloque `/api` no final da variavel, porque o codigo ja adiciona esse caminho quando necessario.

### 2. Pasta `dist` ignorada no Git

Arquivo alterado:

```text
.gitignore
```

Foi adicionada a linha:

```text
dist/
```

A pasta `dist` e gerada pelo Vite durante o build. No Render, ela deve ser criada automaticamente pelo comando de build, entao nao precisa ser versionada no repositorio.

## Deploy do frontend no Render

O frontend do projeto esta em:

```text
src/frontend
```

Como ele usa Vite, o deploy correto no Render e como **Static Site**.

### Configuracao do Static Site

No Render, crie um novo servico:

```text
New > Static Site
```

Use os seguintes campos:

```text
Root Directory: src/frontend
Build Command: npm ci && npm run build
Publish Directory: dist
```

O Vite gera os arquivos finais dentro da pasta `dist`, e essa e a pasta que o Render deve publicar.

## Variaveis de ambiente do frontend

No Static Site do frontend, adicione:

```text
VITE_API_BASE_URL=https://url-do-seu-backend.onrender.com
```

Importante:

- Variaveis usadas no frontend Vite precisam comecar com `VITE_`.
- Essa variavel fica embutida no build final do site.
- Nao coloque segredos no frontend, como senhas, tokens privados ou credenciais de banco.

## Rewrite para React Router

O projeto usa `react-router-dom` com rotas como:

```text
/login
/drones
/drones-selection
/history
/operators
/assignments
/drone-visu
```

Por isso, no Render, configure uma regra em:

```text
Redirects/Rewrites
```

Com estes valores:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

Sem essa regra, acessar uma rota diretamente ou atualizar a pagina em uma rota interna pode causar erro 404.

## Backend necessario

O frontend depende da API Node localizada em:

```text
src/backend
```

Se o backend ainda nao estiver publicado, crie tambem um **Web Service** no Render.

Configuracao sugerida:

```text
Root Directory: src/backend
Build Command: npm install
Start Command: npm start
```

Variaveis esperadas pelo backend:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_DATABASE
DB_SSL
```

Se estiver usando banco Postgres no Render, normalmente `DB_SSL` deve ser:

```text
true
```

Depois que o backend estiver online, copie a URL publica dele e use no frontend como `VITE_API_BASE_URL`.

## Checklist final

Antes de fazer o deploy, confira:

- O codigo esta enviado para o GitHub/GitLab conectado ao Render.
- O frontend foi criado como **Static Site**.
- O `Root Directory` do frontend esta como `src/frontend`.
- O `Publish Directory` esta como `dist`.
- A variavel `VITE_API_BASE_URL` aponta para o backend publicado.
- A regra `/* -> /index.html` esta configurada como `Rewrite`.
- O backend esta online e responde em `/health` ou `/api/health`.

## Observacao sobre validacao local

Neste ambiente, nao foi possivel executar `npm run build` porque o comando `npm` nao estava instalado. Mesmo assim, os scripts do projeto indicam que o build esperado e:

```text
npm run build
```

E o `package.json` do frontend ja possui:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

