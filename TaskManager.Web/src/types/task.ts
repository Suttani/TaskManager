
export type TaskStatus = "Pendente" | "EmProgresso" | "Concluida";

export interface Task {
  id: number;
  titulo: string;
  descricao?: string;
  dataCriacao: string;
  dataConclusao?: string;
  status: TaskStatus;
}

export interface CreateTaskDto {
  titulo: string;
  descricao?: string;
  dataConclusao?: string;
  status: TaskStatus;
}

export interface UpdateTaskDto {
  titulo?: string;
  descricao?: string;
  dataConclusao?: string;
  status?: TaskStatus;
}

export interface TaskFilter {
  status?: TaskStatus;
  search?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}
