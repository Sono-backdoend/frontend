# Projeto x Front

Site de convite digital personalizado para o Arraiá Macabro — 2ª edição do PacJunino. Cada convidado acessa com um código único e visualiza um convite com seu nome, informações da festa e confirmação de presença.

O backend foi separado para o diretório irmão `../arraia-macabro-backend` e agora roda como um projeto independente.

## Funcionalidades

- Acesso por código único por convidado
- Boas-vindas personalizadas com nome do convidado
- Confirmação de presença via WhatsApp
- Opção de indicar um acompanhante
- Localização da festa via Google Maps
- Tela de loading animada com efeito de cortina
- Partículas animadas no fundo
- Layout responsivo para mobile e desktop

## Stack

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 16 + React 19 |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS 4 |
| Banco de dados | PostgreSQL + Prisma ORM |
| Autenticação | NextAuth v5 + bcryptjs |
| Animações | Lottie, tsParticles, Swiper.js |
| Deploy | Vercel + Neon |
| Maps | Google Maps Embed API |

## Instalação

Frontend:

```bash
git clone https://github.com/wtfpac/arraia-macabro.git
cd arraia-macabro
npm install
```

Backend:

```bash
cd ../arraia-macabro-backend
npm install
```

Configure o `.env` do frontend:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="sua_chave"
```

Configure o `.env` do backend:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/arraia_macabro"
DATABASE_URL_UNPOOLED="postgresql://usuario:senha@localhost:5432/arraia_macabro"
AUTH_SECRET="seu_secret"
NEXTAUTH_URL="http://localhost:3001"
ADMIN_EMAIL="admin@arraia.com"
ADMIN_PASSWORD="sua_senha_aqui"
ADMIN_NAME="Admin"
```

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Estrutura

Frontend `arraia-macabro/`:

├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
└── public/
	├── images/
	├── fonts/
	└── animations/

Backend `arraia-macabro-backend/`:

├── app/
│   ├── api/
│   │   ├── admin/
│   │   ├── auth/
│   │   └── invite/
│   └── generated/
├── lib/
├── prisma/
└── auth.ts

## Equipe

| Dev | Responsabilidade |
|---|---|
| @wtfpac | Frontend, UI/UX, Deploy |
| @kauawerle | Backend, API, Banco de dados |
