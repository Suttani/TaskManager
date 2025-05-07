import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Task, TaskFilter, CreateTaskDto, UpdateTaskDto } from "@/types/task";
import { StatusTarefa } from "@/types/StatusTarefa";
import taskService from "@/services/taskService";
import { useMemo } from "react";

export const useTasks = (filter?: TaskFilter) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: allTasks = [], error, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskService.getAllTasks,
  });

  // Filtragem e ordenação das tarefas
  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];
  
    if (filter?.status !== undefined) {
      tasks = tasks.filter(task => task.status === filter.status);
    }
  
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      tasks = tasks.filter(task =>
        task.titulo.toLowerCase().includes(searchLower) ||
        (task.descricao && task.descricao.toLowerCase().includes(searchLower))
      );
    }
  
    return tasks.sort((a, b) => {
      if (a.status === StatusTarefa.Concluida && b.status !== StatusTarefa.Concluida) return 1;
      if (a.status !== StatusTarefa.Concluida && b.status === StatusTarefa.Concluida) return -1;
      return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
    });
  }, [allTasks, filter?.status, filter?.search]);
  
  const createTaskMutation = useMutation({
    mutationFn: (newTask: CreateTaskDto) => taskService.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar tarefa",
        description: error.message || "Ocorreu um erro ao criar a tarefa",
        variant: "destructive",
      });
    },
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }: { id: number; task: UpdateTaskDto }) => 
      taskService.updateTask(id, task),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message || "Ocorreu um erro ao atualizar a tarefa",
        variant: "destructive",
      });
    },
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message || "Ocorreu um erro ao excluir a tarefa",
        variant: "destructive",
      });
    },
  });
  
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusTarefa }) => 
      taskService.updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      
      // Snapshot the current value
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
      
      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(["tasks"], 
          previousTasks.map((task) => 
            task.id === id ? { ...task, status } : task
          )
        );
      }
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context to rollback
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status da tarefa",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  
  return {
    tasks: filteredTasks,
    isLoading,
    error,
    isError: !!error,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    updateTaskStatus: updateTaskStatusMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isStatusUpdating: updateTaskStatusMutation.isPending,
  };
};

export const useTask = (id: number) => {
  const {
    data: task,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id, // Only run if id is provided
  });
  
  return {
    task,
    isLoading,
    isError,
    error,
  };
};
