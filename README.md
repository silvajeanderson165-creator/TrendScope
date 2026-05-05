# 🔍 TrendScope — Motor de Curadoria de Tendências

> Plataforma **Full Stack** de curadoria inteligente que pesquisa e entrega as **Top 5 tendências** sobre qualquer tema em tempo real — com backend tRPC, banco TiDB e API Serper.dev.

[![Acessar App](https://img.shields.io/badge/🌐_ACESSAR_APP-trend--scope.vercel.app-06B6D4?style=for-the-badge)](https://trend-scope.vercel.app)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=for-the-badge&logo=trpc&logoColor=white)
![TiDB](https://img.shields.io/badge/TiDB-Serverless-FF4500?style=for-the-badge)

🟢 **LIVE DEMO:** [Acesse o TrendScope Ao Vivo Aqui](https://trend-scope.vercel.app)

---

## 🧠 Sobre

Motor de busca especializado em curadoria. O usuário pesquisa qualquer tema e recebe os **5 resultados mais relevantes** com título, descrição, imagem OG e link direto.

### ✨ Features

- 🔎 **Busca em Tempo Real** — API Google via Serper.dev
- 🖼️ **OG Image Extraction** — Thumbnails automáticas dos sites
- 📊 **Histórico Inteligente** — Persistência com ranking de popularidade
- ⚡ **Cache + Rate Limit** — Respostas rápidas e proteção contra abuso
- 🌐 **Serverless-Ready** — Vercel Serverless Functions
- 🎨 **UI Premium** — Glassmorphism, skeleton loading e animações

---

## 🛠️ Stack

| Camada | Tech |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, tRPC Client |
| **Backend** | tRPC v11, Drizzle ORM, Serper.dev API |
| **Database** | TiDB Serverless (MySQL distribuído) |
| **Infra** | Vercel Serverless, Catch-all Routes |

---

## 🚀 Como Rodar

```bash
git clone https://github.com/jeanderson-silva8/TrendScope.git
cd TrendScope && npm install
# Configurar .env com DATABASE_URL e SERPER_API_KEY
npm run dev
```

---

Desenvolvido por **Jeanderson Silva**
