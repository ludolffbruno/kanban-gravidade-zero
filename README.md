<div align="center">

<h1>🚀 Gravidade Zero</h1>
<p><strong>Gerenciador de tarefas Kanban premium com drag & drop, colunas dinâmicas e design dark mode.</strong></p>

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Bun-1.x-fbf0df?style=flat-square&logo=bun&logoColor=black" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Licença-MIT-green?style=flat-square" />
</p>

<p>
  <a href="#-funcionalidades">✨ Funcionalidades</a> •
  <a href="#-stack-técnica">🛠️ Stack</a> •
  <a href="#-como-rodar">▶️ Como Rodar</a> •
  <a href="#-estrutura-do-projeto">📁 Estrutura</a> •
  <a href="#-endpoints-da-api">📡 API</a> •
  <a href="#-autor">👤 Autor</a>
</p>

</div>

---

## ✨ Funcionalidades

- **📋 Board Kanban** — Organize suas tarefas em colunas de status com contadores em tempo real
- **🖱️ Drag & Drop** — Arraste cards entre colunas com animações fluidas (powered by `@hello-pangea/dnd`)
- **➕ Colunas Dinâmicas** — Crie, renomeie (clique no título) e exclua colunas livremente
- **✏️ CRUD Completo** — Crie, edite e exclua tarefas com título, descrição, prioridade, categoria e data
- **🔴🟡🟢 Prioridades Visuais** — Indicadores coloridos de Alta, Média e Baixa prioridade em cada card
- **🏷️ Categorias com Emoji** — Trabalho 💼, Estudo 📚, Saúde 🍎, Pessoal 🏠, Finanças 💰
- **🌙 Dark Mode** — Interface premium com tema escuro e efeito glassmorphism
- **📱 Responsivo** — Layout adaptável para diferentes tamanhos de tela
- **💾 Persistência Real** — Dados salvos em banco SQLite via Bun nativo

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Vercel Serverless Functions (`/api`) |
| **Banco de Dados** | SQLite (Local via arquivo) / Turso (Produção na Nuvem) |
| **Client SQL** | `@libsql/client` |
| **Drag & Drop** | `@hello-pangea/dnd` |
| **Ícones** | `lucide-react` |
| **Estilo** | CSS puro com variáveis e glassmorphism |

---

## 🚀 Como Rodar e Fazer Deploy

O projeto foi migrado para suportar **Vercel Serverless** e **Turso Database**.

### Pré-requisitos (Desenvolvimento Local)
- [Node.js](https://nodejs.org) `>= 20.x`
- Vercel CLI (opcional, mas recomendado)

### 1. Clone o repositório

```bash
git clone https://github.com/ludolffbruno/kanban-gravidade-zero.git
cd kanban-gravidade-zero
```

### 2. Instalar e rodar localmente (Modo Desenvolvimento)

Em desenvolvimento, o app gera e usa um arquivo `kanban.sqlite` na raiz via LibSQL.

```bash
npm install
```

Para gerar as tabelas de banco locais:
Abra o navegador e acesse a rota (com o backend rodando): `http://localhost:3000/api/seed`

Rodando com Vercel CLI (simula Serverless e Frontend na mesma porta 3000):
```bash
npm run vercel-dev
```
Se não quiser usar a cli da vercel, você precisaria subir a vercel em outra plataforma, mas a recomendada para rodar o fullstack é a vercel cli.

### 3. Deploy para Produção na Vercel & Turso

Como a Vercel tem discos efêmeros (somente leitura real), você **deve** usar um banco remoto em produção, recomendamos o [Turso](https://turso.tech).

1. Crie um banco no Turso e pegue a URL (`libsql://...`) e o Auth Token.
2. Na sua Vercel, crie um novo projeto importando este repositório.
3. Nas variáveis de ambiente da Vercel, adicione:
   - `TURSO_DATABASE_URL`: `sua_url_do_turso`
   - `TURSO_AUTH_TOKEN`: `seu_token_do_turso`
4. Dê Deploy!
5. Importante: no primeiro acesso, abra `/api/seed` na URL de produção gerada pela Vercel para criar as tabelas no Turso.

---

## 📁 Estrutura do Projeto

```
kanban-gravidade-zero/
├── api/                  # Backend Serverless Functions (Vercel)
│   ├── db.ts             # Conexão LibSQL (Local/Turso)
│   ├── seed.ts           # Rota para rodar tabelas
│   ├── tasks.ts
│   ├── tasks/[id].ts
│   ├── columns.ts
│   ├── columns/[id].ts
│   └── categories.ts
├── src/                  # Frontend (React + Vite)
│   ├── api.ts            # Client Axios apontando para /api
│   ├── App.tsx           
│   └── App.css           
├── package.json
└── README.md
```

---

## 📡 Endpoints da API (Serverless Routes)

Base URL: `/api` (Relativo)

### Tarefas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/tasks` | Listar todas as tarefas |
| `POST` | `/api/tasks` | Criar nova tarefa |
| `PUT` | `/api/tasks/:id` | Atualizar tarefa |
| `DELETE`| `/api/tasks/:id` | Excluir tarefa |

### Colunas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/columns` | Listar colunas |
| `POST` | `/api/columns` | Criar nova coluna |
| `PUT` | `/api/columns/:id` | Renomear coluna |
| `DELETE`| `/api/columns/:id` | Excluir coluna e suas tarefas |

### Categorias

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/categories`| Listar categorias disponíveis |

---

## 📸 Preview

> Board com tarefas reais distribuídas nas colunas **A Fazer**, **Em Progresso** e **Concluída**.

O board suporta criação de colunas extras como **Revisão**, **Teste**, **Bloqueado**, conforme a necessidade do fluxo de trabalho.

---

## 🔒 Segurança

- Nenhuma credencial ou informação sensível está presente no repositório
- O banco de dados SQLite é gerado **localmente** via seed — não é versionado no Git
- O arquivo `.gitignore` exclui `*.sqlite`, `*.log` e `node_modules`

---

## 👤 Autor

**Bruno Ludolff**

- GitHub: [@ludolffbruno](https://github.com/ludolffbruno)
- Projeto: [kanban-gravidade-zero](https://github.com/ludolffbruno/kanban-gravidade-zero)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** — sinta-se livre para usar, modificar e distribuir.

---

<div align="center">
  <sub>Feito com ☕ e muito TypeScript por Bruno Ludolff</sub>
</div>
