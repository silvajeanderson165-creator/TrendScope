# 🌐 TrendScope

| Um **Pipeline Autônomo de Curadoria** e **Motor de Busca de Tendências**, construído com React, TypeScript, Hono e Python.

![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

---

## 🚀 Sobre o Projeto

O **TrendScope** é um portal completo para descoberta de conteúdos virais e em alta. Ele atua pesquisando as últimas tendências na internet e curando os links, títulos e descrições dos artigos mais relevantes. Tudo isso processado de forma assíncrona por um motor em Python, salvo num banco MySQL e servido em tempo real para o usuário final através de uma interface React lindamente fluida.

### ✨ Features

- 🕵️‍♂️ **Curadoria Autônoma** — Scripts em Python (`tools/`) buscam tendências da web automaticamente sem afetar o frontend.
- ⚡ **Performance e Cache** — O backend em **Hono + tRPC** garante respostas rápidas com suporte a cache inteligente.
- 🎨 **Interface Premium** — Animações fluidas (`framer-motion`), Glassmorphism, feedback tátil e Design System moderno.
- 🛡️ **Rate Limiting** — Proteção nativa contra abusos para manter a estabilidade do sistema.
- 🧩 **Arquitetura Desacoplada** — Back-office em Python (coleta) e API Edge-ready em TypeScript (entrega).
- 📱 **Responsividade Total** — Adapta-se perfeitamente para visualização no celular ou desktop.
- 🌐 **Deploy na Vercel** — Integração CI/CD contínua para o frontend e serverless API.

---

## 🛠 Tecnologias Utilizadas

| Componente | Tecnologia | Uso no Projeto |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Renderização da interface, gestão de estado e animações (Framer Motion). |
| **Estilização**| TailwindCSS | Design System, classes utilitárias e criação da estética Glassmorphism. |
| **API** | Hono + tRPC | Roteamento Serverless rápido, Typesafe API e comunicação com o banco. |
| **Banco** | MySQL (TiDB) | Armazenamento primário dos resultados de busca (Schema desenhado via Drizzle). |
| **Back-Office**| Python | Pipeline de Ingestão (`daemon_worker.py`), requisições autônomas ao SearXNG. |

---

> Desenvolvido com muita paixão e código limpo por **Jeanderson Silva 😎🤌**
