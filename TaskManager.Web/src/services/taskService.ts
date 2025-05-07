
import axios from "axios";
import { CreateTaskDto, Task, UpdateTaskDto } from "@/types/task";

const API_URL = "/api";

const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    const response = await axios.get(`${API_URL}/tarefas`);
    return response.data;
  },
  
  getTaskById: async (id: number): Promise<Task> => {
    const response = await axios.get(`${API_URL}/tarefas/${id}`);
    return response.data;
  },
  
  createTask: async (task: CreateTaskDto): Promise<Task> => {
    const response = await axios.post(`${API_URL}/tarefas`, task);
    return response.data;
  },
  
  updateTask: async (id: number, task: UpdateTaskDto): Promise<Task> => {
    const response = await axios.put(`${API_URL}/tarefas/${id}`, task);
    return response.data;
  },
  
  deleteTask: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/tarefas/${id}`);
  },

  updateTaskStatus: async (id: number, status: Task["status"]): Promise<Task> => {
    return taskService.updateTask(id, { status });
  },
};

export default taskService;
