# 📦 Backend Lumi

Backend do desafio técnico da Lumi desenvolvido com Node.js, TypeScript, NestJS e Prisma. O banco de dados utilizado é o PostgreSQL, executado em container via Docker.

---

## ⚙️ Pré-requisitos

Antes de rodar o projeto, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (versão recomendada: 18+)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Yarn](https://classic.yarnpkg.com/lang/en/) ou `npm`

---

## 🚀 Rodando o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/lucasmoraessouza/lumi-backend.git
cd lumi-backend
```

### 2. Suba o banco de dados com Docker

```bash
docker-compose up -d
```

### 3. Instale as dependências

Com npm:
```bash
npm install
```
ou com yarn:
```bash
npm install
```

### 4. Configure o ambiente
Crie um arquivo .env na raiz do projeto e adicione as variáveis necessárias, como:
```bash
DATABASE_URL=postgresql://postgres:root@localhost:5439/lumi-backend
PORT=3333
```

### 5. Execute as migrations do Prisma

Crie um arquivo .env na raiz do projeto e adicione as variáveis necessárias, como:
```bash
npx prisma migrate dev
```

### 6. Rode o projeto em modo desenvolvimento

Crie um arquivo .env na raiz do projeto e adicione as variáveis necessárias, como:
```bash
npm run start:dev
```

### 7. ✅ Pronto!
A API estará rodando em http://localhost:3333

