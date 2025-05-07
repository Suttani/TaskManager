import { StatusTarefa } from './StatusTarefa';

export interface Task {
  id: number;
  titulo: string;
  descricao?: string;
  dataCriacao: string;
  dataConclusao?: string;
  status: StatusTarefa;
}

export interface CreateTaskDto {
  titulo: string;
  descricao?: string;
  dataConclusao?: string | null;
  status: StatusTarefa;
}

export interface UpdateTaskDto extends CreateTaskDto {}

export interface TaskFilter {
  status?: StatusTarefa;
  search?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}
