# Task Manager

Sistema de Gerenciamento de Tarefas com API REST e Interface Web.

## Estrutura do Projeto

```
TaskManager/
├── TaskManager.API/           # API REST (Backend)
├── TaskManager.Application/   # Camada de Aplicação
├── TaskManager.Domain/        # Camada de Domínio
├── TaskManager.Infrastructure/# Camada de Infraestrutura
└── TaskManager.Web/          # Interface Web (Frontend)
```

## Tecnologias Utilizadas

### Backend
- .NET 8.0
- Entity Framework Core
- SQL Server
- Clean Architecture

### Frontend
- Vite + React
- TypeScript
- Tailwind CSS
- ESLint
- Shadcn/ui (baseado no package.json)

## Como Executar

### Backend
1. Certifique-se de ter o .NET 8.0 SDK instalado
2. Configure a string de conexão no arquivo `appsettings.json`
3. Execute os seguintes comandos:
```bash
cd TaskManager.API
dotnet restore
dotnet run
```

### Frontend
1. Certifique-se de ter o Node.js instalado
2. Execute os seguintes comandos:
```bash
cd TaskManager.Web
npm install
npm run dev
```

## Endpoints da API

- GET /api/tarefas - Listar todas as tarefas
- GET /api/tarefas/{id} - Obter tarefa por ID
- POST /api/tarefas - Criar nova tarefa
- PUT /api/tarefas/{id} - Atualizar tarefa
- DELETE /api/tarefas/{id} - Excluir tarefa