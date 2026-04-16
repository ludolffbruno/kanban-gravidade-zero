<div align="center">

<img src="./docs/assets/banner.png" alt="Gravidade Zero — Kanban Board" width="100%" />

<br/><br/>

# 🚀 Gravidade Zero

**Gerenciador de tarefas Kanban premium com drag & drop, multi-temas, autenticação Google e dados na nuvem.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Turso](https://img.shields.io/badge/Turso-SQLite-4FF8D2?style=flat-square&logo=sqlite&logoColor=black)](https://turso.tech)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![MIT License](https://img.shields.io/badge/Licença-MIT-22c55e?style=flat-square)](./LICENSE)

[✨ Demo ao vivo](https://kanban-gravidade-zero.vercel.app) · [📋 Funcionalidades](#-funcionalidades) · [🛠️ Stack](#-stack-técnica) · [▶️ Como Rodar](#-como-rodar) · [📡 API](#-endpoints-da-api)

</div>

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🔐 **Login com Google** | Autenticação segura via Firebase — cada usuário vê apenas seus próprios dados |
| 📋 **Board Kanban Completo** | Colunas dinâmicas com contadores em tempo real |
| 🖱️ **Drag & Drop** | Arraste cards entre colunas e reordene as próprias colunas com animações fluidas |
| ➕ **Colunas Dinâmicas** | Crie, renomeie clicando no título (`Enter` ✓, `Esc` cancela) e exclua colunas |
| ✏️ **CRUD de Tarefas** | Título, descrição, prioridade, categoria e data de entrega |
| 🎨 **8 Temas Espaciais** | Nebulosa, Void, Aurora Boreal, Erupção Solar, Cosmos, Lua (claro!), Marte, Buraco Negro |
| 🔴🟡🟢 **Prioridades Visuais** | Indicadores coloridos de Alta, Média e Baixa prioridade |
| 🏷️ **Categorias com Emoji** | Trabalho 💼, Estudo 📚, Saúde 🍎, Pessoal 🏠, Finanças 💰 |
| 📱 **Mobile First** | Swipe horizontal entre colunas com scroll-snap nativo — funciona perfeitamente no celular |
| 💾 **Persistência Real** | Banco SQLite na nuvem via Turso, isolado por usuário |
| 🌐 **PWA-Ready** | Funciona como app instalável no celular |

---

## 📸 Preview

<img src="./docs/assets/banner.png" alt="Desktop Preview" width="100%" />

<br/>

<div align="center">
  <img src="./docs/assets/mobile-preview.png" alt="Mobile Preview — tema Nebulosa e Cosmos" width="60%" />
  <br/>
  <sub>Mobile: tema Nebulosa (esquerda) · tema Cosmos (direita)</sub>
</div>

---

## 🎨 Sistema de Temas

Clique na sua foto de perfil para acessar o painel de aparência com **8 temas espaciais**:

| Tema | Esquema de Cor |
|------|---------------|
| 🪐 **Nebulosa** *(padrão)* | Azul profundo + Índigo |
| 🟢 **Void** | Preto absoluto + Verde Cyber |
| 🌌 **Aurora Boreal** | Verde escuro + Teal |
| ☀️ **Erupção Solar** | Marrom + Laranja |
| 🔮 **Cosmos** | Roxo profundo + Magenta |
| 🌕 **Lua** | Cinza claro + Índigo *(único tema claro!)* |
| 🔴 **Marte** | Vermelho escuro + Laranja |
| ⚫ **Buraco Negro** | Preto puro + Violeta |

> O tema escolhido é salvo automaticamente no `localStorage` e restaurado a cada visita.

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + TypeScript 5 + Vite 5 |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Banco de Dados** | Turso (SQLite na nuvem via `@libsql/client`) |
| **Autenticação** | Firebase Auth (Google Sign-In) + Firebase Admin SDK |
| **Drag & Drop** | `@hello-pangea/dnd` |
| **Ícones** | `lucide-react` |
| **Estilo** | CSS puro · Glassmorphism · CSS Custom Properties |
| **Deploy** | Vercel (CI/CD automático via GitHub push) |

---

## 🔒 Segurança

O sistema usa **isolamento completo em duas camadas**:

1. **Firebase Admin SDK** — verifica o token JWT em cada requisição. Sem token válido → `401 Unauthorized`.
2. **Filtro por `user_id` no banco** — todas as queries SQL usam `WHERE user_id = ?` com o UID do token, garantindo que um usuário nunca acesse dados de outro.

```
Requisição → Bearer Token → verifyIdToken() → uid → WHERE user_id = uid
```

Nenhum dado sensível está no repositório. As credenciais vivem em variáveis de ambiente na Vercel.

---

## ▶️ Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org) `>= 20.x`
- Conta no [Firebase](https://firebase.google.com) (Auth com Google Sign-In habilitado)
- Conta no [Turso](https://turso.tech) (banco SQLite na nuvem)
- [Vercel CLI](https://vercel.com/docs/cli) (recomendado para dev local)

### 1. Clone o repositório

```bash
git clone https://github.com/ludolffbruno/kanban-gravidade-zero.git
cd kanban-gravidade-zero
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz (ou use `npx vercel env pull .env.local` se já tiver o projeto na Vercel):

```env
# Turso
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu_token_turso

# Firebase Client (frontend)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...

# Firebase Admin (backend serverless)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Rode localmente

```bash
# Com Vercel CLI (recomendado — simula serverless + frontend na mesma porta)
npx vercel dev

# Ou com o dev server do Vite apenas (sem backend)
npm run dev
```

### 4. Inicialize o banco

No primeiro acesso, abra no navegador:

```
http://localhost:3000/api/seed
```

Isso cria as tabelas `tasks`, `columns`, `categories` e `users` no Turso.

### 5. Deploy para produção

```bash
git push origin main
# → Vercel detecta o push e faz deploy automático ✅
```

> **Importante:** adicione as mesmas variáveis de ambiente no painel da Vercel em **Settings → Environment Variables**.

---

## 📁 Estrutura do Projeto

```
kanban-gravidade-zero/
├── api/                      # Backend Serverless (Vercel Functions)
│   ├── db.ts                 # Conexão LibSQL → Turso
│   ├── seed.ts               # Cria as tabelas no banco
│   ├── init-user.ts          # Inicializa dados padrão do usuário
│   ├── tasks.ts              # CRUD de tarefas (GET, POST)
│   ├── tasks/[id].ts         # CRUD por ID (PUT, DELETE)
│   ├── columns.ts            # CRUD de colunas
│   ├── columns/[id].ts       # Editar/excluir coluna por ID
│   ├── columns/reorder.ts    # Reordenar colunas via drag & drop
│   ├── categories.ts         # Listar categorias
│   └── utils/
│       └── auth.ts           # Middleware: verifyToken via Firebase Admin
├── src/                      # Frontend (React + Vite)
│   ├── api.ts                # Client Axios com interceptor de token
│   ├── lib/firebase.ts       # Inicialização do Firebase
│   ├── App.tsx               # Componente principal + lógica
│   └── App.css               # Estilos globais + 8 temas espaciais
├── docs/
│   └── assets/               # Imagens do README
├── vercel.json               # Configuração de rotas Vercel
└── README.md
```

---

## 📡 Endpoints da API

> Todos os endpoints requerem o header `Authorization: Bearer <firebase_token>`.

### Tarefas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/tasks` | Listar tarefas do usuário autenticado |
| `POST` | `/api/tasks` | Criar nova tarefa |
| `PUT` | `/api/tasks/:id` | Atualizar tarefa |
| `DELETE` | `/api/tasks/:id` | Excluir tarefa |

### Colunas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/columns` | Listar colunas do usuário |
| `POST` | `/api/columns` | Criar nova coluna |
| `PUT` | `/api/columns/:id` | Renomear coluna |
| `DELETE` | `/api/columns/:id` | Excluir coluna e suas tarefas |
| `POST` | `/api/columns/reorder` | Reordenar colunas após drag & drop |

### Outros

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/categories` | Listar categorias disponíveis |
| `POST` | `/api/init-user` | Inicializar colunas padrão para novo usuário |
| `GET` | `/api/seed` | Criar tabelas no banco (usar apenas uma vez) |

---

## 👤 Autor

<div align="center">

**Bruno Ludolff** · MrLudolff

[![GitHub](https://img.shields.io/badge/GitHub-ludolffbruno-181717?style=flat-square&logo=github)](https://github.com/ludolffbruno)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/ludolffbruno)

</div>

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** — sinta-se livre para usar, modificar e distribuir.

---

<div align="center">
  <sub>Desenvolvido com ☕ e muito TypeScript · <strong>MrLudolff</strong> · 2025</sub>
</div>
