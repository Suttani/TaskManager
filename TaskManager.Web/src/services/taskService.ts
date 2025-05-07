import axios from "axios";
import { CreateTaskDto, Task, UpdateTaskDto, TaskStatus } from "@/types/task";

const API_URL = "http://localhost:5156/api";

/**
 * Converte o status numérico do backend para o formato do frontend
 */
const convertStatusToFrontendFormat = (status: number): TaskStatus => {
  switch (status) {
    case 0:
      return "Pendente";
    case 1:
      return "EmProgresso";
    case 2:
      return "Concluida";
    default:
      return "Pendente";
  }
};

/**
 * Converte o status do frontend para o formato numérico do backend
 */
const convertStatusToBackendFormat = (status: TaskStatus): number => {
  switch (status) {
    case "Pendente":
      return 0;
    case "EmProgresso":
      return 1;
    case "Concluida":
      return 2;
    default:
      return 0;
  }
};

/**
 * Converte os dados do backend para o formato do frontend
 */
const convertToFrontendFormat = (data: any): Task => ({
  id: data.Id,
  titulo: data.Titulo,
  descricao: data.Descricao,
  dataCriacao: data.DataCriacao,
  dataConclusao: data.DataConclusao,
  status: convertStatusToFrontendFormat(data.Status)
});

/**
 * Converte os dados do frontend para o formato do backend
 */
const convertToBackendFormat = (data: any) => ({
  titulo: data.titulo,
  descricao: data.descricao || null,
  dataConclusao: data.dataConclusao || null,
  status: convertStatusToBackendFormat(data.status)
});

const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await axios.get(`${API_URL}/tarefas`);
      return response.data.map(convertToFrontendFormat);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      throw error;
    }
  },
  
  getTaskById: async (id: number): Promise<Task> => {
    try {
      const response = await axios.get(`${API_URL}/tarefas/${id}`);
      return convertToFrontendFormat(response.data);
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${id}:`, error);
      throw error;
    }
  },
  
  createTask: async (task: CreateTaskDto): Promise<Task> => {
    try {
      const formattedTask = convertToBackendFormat(task);
      const response = await axios.post(`${API_URL}/tarefas`, formattedTask, {
        headers: { 'Content-Type': 'application/json' }
      });
      return convertToFrontendFormat(response.data);
    } catch (error: any) {
      console.error("Erro ao criar tarefa:", error.response?.data || error.message);
      throw error;
    }
  },
  
  updateTask: async (id: number, task: UpdateTaskDto): Promise<Task> => {
    try {
      const formattedTask = convertToBackendFormat({ ...task, id });
      const response = await axios.put(`${API_URL}/tarefas/${id}`, formattedTask, {
        headers: { 'Content-Type': 'application/json' }
      });
      return convertToFrontendFormat(response.data);
    } catch (error: any) {
      console.error(`Erro ao atualizar tarefa ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  deleteTask: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/tarefas/${id}`);
    } catch (error: any) {
      console.error(`Erro ao excluir tarefa ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  updateTaskStatus: async (id: number, status: TaskStatus): Promise<Task> => {
    try {
      const currentTask = await taskService.getTaskById(id);
      const data = {
        id,
        titulo: currentTask.titulo,
        descricao: currentTask.descricao,
        dataConclusao: currentTask.dataConclusao,
        status: convertStatusToBackendFormat(status)
      };

      const response = await axios.put(`${API_URL}/tarefas/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
      });
      return convertToFrontendFormat(response.data);
    } catch (error: any) {
      console.error(`Erro ao atualizar status da tarefa ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default taskService;
