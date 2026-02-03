# 📅 Sistema de Gestão e Reserva de Laboratórios (LabHub)

Este projeto é uma aplicação web completa para **gerenciamento de laboratórios ou salas e controle de reservas**, desenvolvida com **React no frontend** e **Express.js no backend**, focando em organização, prevenção de conflitos de horários e controle de permissões por tipo de usuário.

## 🌐 Acesso Online (Deploy)

O sistema está disponível para uso diretamente via navegador no link abaixo:

🔗 **Deploy:** https://labhub.netlify.app

Para acessar o sistema no ambiente de produção, utilize o usuário de demonstração:

Email: master@gmail.com  
Senha: 12345678  

⚠️ Credenciais disponibilizadas apenas para fins de demonstração.

## 🚀 Funcionalidades

- ✅ Tratamento de conflitos de horários entre reservas
- 🏫 Cadastro e gerenciamento de laboratórios
- 📆 Suporte a diferentes tipos de reservas:
  - Reserva única
  - Reserva diária
  - Reserva semanal
  - Reserva personalizada (dias quaisquer com diferentes horários e durações)
- 👥 Controle de usuários com diferentes permissões:
  - Administrador
  - Responsável por salas
  - Usuários comuns
- 📄 Documentação completa da API com **Swagger UI** e **OpenAPI**
- 🧪 Testes unitários e de integração com **Vitest** e **Supertest**
- 🔄 Pipeline de CI configurado com **GitHub Actions**

## 🧑‍💻 Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- Zod (validação de dados)
- Swagger UI / OpenAPI
- Vitest
- Supertest

### Frontend
- React.js
- TypeScript
- Figma (prototipação e design)

### DevOps & Ferramentas
- Git / GitHub
- GitHub Actions (CI)

## 🔐 Acesso para Testes

Ao acessar o sistema pela primeira vez um usuário é criado automaticamente com o email e senha informado.

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js
- npm ou yarn
- Banco de dados PostgreSQL ou SQLite para ser utilizado com Prisma

### Clonando o repositório
```bash
git clone https://github.com/ForasteiroSD/Sistema-de-Alocacao-de-Laboratorios.git
cd Sistema-de-Alocacao-de-Laboratorios
```

#### Backend
```bash
cd back
npm install
```

Antes de iniciar o backend é necessário criar um arquivo .env contendo o seguinte conteúdo:
```bash
JWT_SECRET = "seu secret jwt"

PORT = porta em que o backend estará disponível (opcional)
EMAIL_USER = "email utilizado para informar usuários sobre o cancelamento de reservas"
EMAIL_PASS = "senha de aplicativo do email"

DB_PROVIDER = "tipo de banco de dados utilizado. Utilize 'sqlite' ou 'pg'"
DATABASE_URL = "URL do banco de dados (se seu banco for sqlite utilize o seguinte padrão 'file:./nome_do_arquivo.db'"
DIRECT_URL = "Utilizada somente com banco de dados postgres"

PAGE_LINK = "URL do frontend"
ALLOWED_LINKS = "URL das páginas com acesso permitido a API (por padrão insira a URL de seu frontend, é possível adicionar mais uma URL as separando por vírgula)"
HOST = "URL em que a API está disponível"
NODE_ENV = "test ou production (default test)"
```

Após criar o arquivo, aplique as tabelas ao banco e inicie o servidor:
```bash
npx prisma migrate deploy --schema=./prisma/(sqlite ou postgres)/schema.prisma
npm run dev
```

O servidor backend será iniciado e ficará disponível conforme a porta configurada ou por padrão na porta 3000.

#### Frontend
```bash
cd front
npm install
```

Antes de iniciar o frontend também é necessário criar um arquivo .env contendo o seguinte conteúdo:
```bash
VITE_REACT_APP_BACKEND_URL = "URL do backend"
```

## 📚 Documentação da API

Após iniciar o backend, a documentação da API estará disponível em:

http://localhost:PORT/docs

A interface do Swagger permite visualizar, documentar e testar todos os endpoints da API.

## 🧪 Testes

Para executar os testes unitários e de integração acesse o diretório do backend e execute:
```bash
npm run test
```

Os testes são implementados com Vitest e Supertest, garantindo a confiabilidade das rotas e das regras de negócio.

## 🔄 Integração Contínua (CI)

O projeto conta com um pipeline de Integração Contínua (CI) utilizando GitHub Actions, responsável por:
- Instalar dependências
- Executar testes unitários e de integração
- Validar a qualidade do código a cada push ou pull request
