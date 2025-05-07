import axios from "axios";
import { CreateTaskDto, Task, UpdateTaskDto } from "@/types/task";
import { StatusTarefa } from "@/types/StatusTarefa";

const API_URL = "http://localhost:5156/api";

/**
 * Converte os dados do backend para o formato do frontend
 */
const convertToFrontendFormat = (data: any): Task => ({
  id: data.id,
  titulo: data.titulo,
  descricao: data.descricao,
  dataCriacao: data.dataCriacao,
  dataConclusao: data.dataConclusao,
  status: data.status as StatusTarefa
});

/**
 * Converte os dados do frontend para o formato do backend
 */
const convertToBackendFormat = (data: any) => ({
  id: data.id,
  titulo: data.titulo,
  descricao: data.descricao || null,
  dataConclusao: data.dataConclusao || null,
  status: data.status
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

  updateTaskStatus: async (id: number, status: StatusTarefa): Promise<Task> => {
    try {
      const currentTask = await taskService.getTaskById(id);
      const data = {
        id,
        titulo: currentTask.titulo,
        descricao: currentTask.descricao,
        dataConclusao: currentTask.dataConclusao,
        status
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
