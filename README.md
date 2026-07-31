# Projeto x Front

Site de convite digital personalizado para o Arraiá Macabro — 2ª edição do PacJunino. Cada convidado acessa com um código único e visualiza um convite com seu nome, informações da festa e confirmação de presença.

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
git clone https://github.com/Sono-backdoend/frontend.git
cd projeto-x-frontend
npm install
```

Configure o `.env` do frontend:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="sua_chave"
```

## Estrutura

Frontend `projeto-x/`:

├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
└── public/
	├── images/
	├── fonts/
	└── animations/
