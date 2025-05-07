# Task Manager

Sistema de Gerenciamento de Tarefas com API REST e Interface Web.

## Estrutura do Projeto

```
TaskManager/
├── TaskManager.API/           # API REST (Backend)
├── TaskManager.Application/   # Camada de Aplicação
├── TaskManager.Domain/        # Camada de Domínio
├── TaskManager.Infrastructure/# Camada de Infraestrutura
└── TaskManager.Web/           # Interface Web (Frontend)
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
- Shadcn/ui

## Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- [SQL Server Express](https://www.microsoft.com/pt-br/sql-server/sql-server-downloads)
- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (versão 18 ou superior)

## Como Executar

### 1. Configuração do SQL Server

1. Após instalar o SQL Server Express, verifique se o serviço está rodando:
   - Abra o Windows Services (services.msc)
   - Procure por "SQL Server (SQLEXPRESS)"
   - O status deve estar como "Running"
   - Se não estiver, inicie o serviço

2. A string de conexão padrão está em `TaskManager.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=TaskManagerDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

### 2. Backend

1. Instale as ferramentas do Entity Framework (caso ainda não tenha):
```bash
dotnet tool install --global dotnet-ef
```

2. Na pasta TaskManager.API, execute:
```bash
dotnet restore
dotnet ef database update
dotnet run
```

A API estará disponível em `http://localhost:5156`

### 3. Frontend

Na pasta TaskManager.Web, execute:
```bash
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:8080` ou `http://localhost:5173`

## Endpoints da API

- GET /api/tarefas - Listar todas as tarefas
- GET /api/tarefas/{id} - Obter tarefa por ID
- POST /api/tarefas - Criar nova tarefa
- PUT /api/tarefas/{id} - Atualizar tarefa
- DELETE /api/tarefas/{id} - Excluir tarefa

## Regras de Negócio

1. Tarefas:
   - Título é obrigatório (máx. 100 caracteres)
   - Descrição é opcional (máx. 500 caracteres)
   - Data de conclusão só pode ser definida para tarefas concluídas
   - Data de conclusão não pode ser anterior à data de criação
   - Data de conclusão não pode ser superior a 10 anos no futuro

2. Status:
   - Pendente (0)
   - Em Progresso (1)
   - Concluída (2)