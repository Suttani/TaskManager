import axios from "axios";
import { CreateTaskDto, Task, UpdateTaskDto, TaskStatus } from "@/types/task";

const API_URL = "http://localhost:5156/api";

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

const convertToFrontendFormat = (data: any): Task => {
  return {
    id: data.Id,
    titulo: data.Titulo,
    descricao: data.Descricao,
    dataCriacao: data.DataCriacao,
    dataConclusao: data.DataConclusao,
    status: convertStatusToFrontendFormat(data.Status)
  };
};

const convertToBackendFormat = (data: any) => {
  console.log("Original data:", data);
  const converted = {
    titulo: data.titulo,
    descricao: data.descricao || null,
    dataConclusao: data.dataConclusao || null,
    status: convertStatusToBackendFormat(data.status)
  };
  console.log("Converted data:", converted);
  return converted;
};

const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await axios.get(`${API_URL}/tarefas`);
      console.log("getAllTasks response:", response.data);
      return response.data.map(convertToFrontendFormat);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },
  
  getTaskById: async (id: number): Promise<Task> => {
    const response = await axios.get(`${API_URL}/tarefas/${id}`);
    return convertToFrontendFormat(response.data);
  },
  
  createTask: async (task: CreateTaskDto): Promise<Task> => {
    console.log("Creating task with data:", task);
    const formattedTask = convertToBackendFormat(task);
    console.log("Sending to backend:", formattedTask);

    try {
      const response = await axios.post(`${API_URL}/tarefas`, formattedTask, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Response from backend:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating task:", error.response?.data || error.message);
      throw error;
    }
  },
  
  updateTask: async (id: number, task: UpdateTaskDto): Promise<Task> => {
    console.log("Updating task with data:", { id, task });
    const formattedTask = convertToBackendFormat({
      ...task,
      id
    });
    console.log("Sending to backend:", formattedTask);

    try {
      const response = await axios.put(`${API_URL}/tarefas/${id}`, formattedTask, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Response from backend:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error updating task:", error.response?.data || error.message);
      throw error;
    }
  },
  
  deleteTask: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/tarefas/${id}`);
    } catch (error: any) {
      console.error("Error deleting task:", error.response?.data || error.message);
      throw error;
    }
  },

  updateTaskStatus: async (id: number, status: TaskStatus): Promise<Task> => {
    console.log("Updating task status:", { id, status });
    
    try {
      // First, get the current task
      const currentTask = await taskService.getTaskById(id);
      
      // Prepare the update data with all required fields, including ID
      const data = {
        id: id,
        titulo: currentTask.titulo,
        descricao: currentTask.descricao,
        dataConclusao: currentTask.dataConclusao,
        status: convertStatusToBackendFormat(status)
      };
      
      console.log("Sending to backend:", data);

      const response = await axios.put(`${API_URL}/tarefas/${id}`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Response from backend:", response.data);
      return convertToFrontendFormat(response.data);
    } catch (error: any) {
      console.error("Error updating task status:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default taskService;
