# Dashboard Empresarial Inteligente — Nexus Insight

## Visão Geral

Plataforma de dashboard empresarial construída com **TanStack Start + Supabase**, centralizando KPIs, projetos, tarefas, equipes e lembretes em uma interface moderna e responsiva.

## Stack Implementada (MVP)

| Camada       | Tecnologia                             | Função                 |
| ------------ | -------------------------------------- | ---------------------- |
| Frontend     | TanStack Start + React 19 + TypeScript | Aplicação full-stack   |
| UI           | Tailwind CSS 4 + shadcn/ui             | Design system          |
| Gráficos     | Recharts                               | Visualização de dados  |
| Formulários  | React Hook Form + Zod                  | Validação              |
| Estado async | TanStack React Query                   | Cache e mutations      |
| Backend      | TanStack Start Server Functions        | API server-side        |
| Banco        | Supabase PostgreSQL                    | Persistência           |
| Auth         | Supabase Auth                          | Login e registro       |
| Segurança    | Row Level Security (RLS)               | Isolamento por usuário |

## Arquitetura

```
Usuário
   │
   ▼
Frontend (TanStack Start)
   │
   ├── React Query hooks
   ├── AuthProvider (Supabase Auth)
   │
   ▼
Server Functions (createServerFn)
   │
   ▼
Supabase PostgreSQL + RLS
```

## Estrutura de Pastas

```
Nexus Insight/
├── src/
│   ├── routes/              # Rotas file-based
│   │   ├── _authenticated/  # Rotas protegidas
│   │   └── login.tsx
│   ├── components/
│   │   ├── layout/          # Shell, sidebar, header
│   │   ├── dashboard/       # KPI cards
│   │   ├── forms/           # Dialogs CRUD
│   │   ├── command-menu/    # Ctrl+K
│   │   └── skeletons/       # Loading states
│   ├── hooks/               # React Query hooks
│   ├── lib/
│   │   ├── api/             # Server functions
│   │   ├── supabase/        # Clients Supabase
│   │   └── types/           # Tipos de domínio
│   └── providers/           # Auth, Theme
├── supabase/
│   └── migrations/          # Schema versionado
├── .env.example
└── readme.md
```

## Variáveis de Ambiente

Copie `.env.example` para `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # server-only, opcional
```

## Como Executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:8080`, crie uma conta em `/login` e os dados demo serão inicializados automaticamente.

### Desenvolvimento — evitar erro 429 no signup

O plano gratuito do Supabase limita o envio de e-mails de confirmação (~2/hora). Se aparecer **429** no signup:

1. No [painel Supabase](https://supabase.com/dashboard/project/yldqdnykxwbtogvhtebx/auth/providers) → **Authentication** → **Providers** → **Email**
2. Desative **Confirm email** (recomendado em dev)
3. Aguarde ~1 hora se o limite já foi atingido
4. Use **Entrar** se a conta já foi criada em tentativas anteriores

### Credenciais (projeto `yldqdnykxwbtogvhtebx`)

| Variável                        | Valor                                                            |
| ------------------------------- | ---------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | `https://yldqdnykxwbtogvhtebx.supabase.co`                       |
| `VITE_SUPABASE_ANON_KEY`        | Chave anon (JWT) — ver `.env.example` ou painel → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave `sb_publishable_...` — alternativa moderna                 |

## Funcionalidades MVP

- Autenticação email/senha + Google OAuth
- Dashboard com KPIs, gráficos e feed de atividades (dados reais)
- CRUD de projetos, tarefas, equipes e lembretes
- Relatórios básicos com gráficos
- Configurações de perfil
- Busca global (Ctrl+K)
- Modo escuro
- Layout premium (Inter, sidebar 260px, grid 12 colunas)

## Roadmap Futuro

| Fase | Entregável                                           | Status    |
| ---- | ---------------------------------------------------- | --------- |
| 7    | Docker Compose                                       | Planejado |
| 8    | CI/CD + Deploy                                       | Planejado |
| —    | python-service (FastAPI) — PDF, relatórios avançados | Planejado |
| —    | Redis cache / pub-sub                                | Planejado |
| —    | WebSocket / notificações realtime                    | Planejado |
| —    | backend/ Express separado (se necessário escalar)    | Planejado |

## Segurança

- **JWT (Supabase Auth):** todo `createServerFn` valida o token via `requireAuth()` → `auth.getUser()` (verificação de assinatura, não apenas decode)
- **Validação Zod** em todas as entradas (UUID, enums, tamanho de strings)
- **SQL Injection:** queries exclusivamente via Supabase client (parâmetros bindados) + RPC `SECURITY DEFINER`; nunca SQL concatenado
- **Sanitização** de textos com `sanitizeText()` antes de persistir
- **RLS** habilitado em todas as tabelas
- Tokens nunca logados; `.env` no `.gitignore`
- Autorização via `auth.uid()`, não `user_metadata`

### Estrutura de segurança

```
src/lib/security/
├── jwt.server.ts      # Validação JWT centralizada
├── validation.ts      # Schemas Zod + sanitizeText
└── index.ts
```

## Boas Práticas

- React Query para cache e invalidação
- Skeleton loading em vez de spinners
- Feedback via Sonner toasts
- Microanimações 200ms nos cards
