import { useState } from "react";
import { Task, TaskFilter } from "@/types/task";
import { StatusTarefa } from "@/types/StatusTarefa";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { DeleteTaskDialog } from "@/components/DeleteTaskDialog";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "lucide-react";

// Expandir o tipo para incluir "Todas" como opção válida para o filtro de UI
type StatusFilterOption = StatusTarefa | "Todas";

export const TaskList = () => {
  const [filter, setFilter] = useState<TaskFilter>({});
  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    tasks,
    isLoading,
    isError,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTasks(filter);

  const handleFilterChange = (status?: StatusFilterOption) => {
    setFilter((prev) => ({
      ...prev,
      status: status === "Todas" ? undefined : status as StatusTarefa | undefined,
    }));
  };

  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      search: searchInput || undefined,
    }));
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setFilter({});
    setSearchInput("");
  };

  const handleDeleteTask = (id: number) => {
    setTaskToDelete(id);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
  };

  const handleCreateTask = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSubmitTask = async (taskData: any) => {
    if (taskToEdit) {
      const { id, ...updateData } = taskData;
      await updateTask({ id: taskToEdit.id, task: updateData });
      setTaskToEdit(null);
    } else {
      await createTask(taskData);
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Input
              placeholder="Pesquisar tarefas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchInputKeyDown}
              className="pr-16"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={handleSearch}
            >
              Buscar
            </Button>
          </div>
          
          <Select
            value={filter.status !== undefined ? filter.status.toString() : "Todas"}
            onValueChange={(value) => handleFilterChange(value === "Todas" ? "Todas" : Number(value) as StatusTarefa)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value={StatusTarefa.Pendente.toString()}>Pendente</SelectItem>
              <SelectItem value={StatusTarefa.EmProgresso.toString()}>Em Progresso</SelectItem>
              <SelectItem value={StatusTarefa.Concluida.toString()}>Concluída</SelectItem>
            </SelectContent>
          </Select>
          
          {(filter.status || filter.search) && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Tabs
            defaultValue="grid"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "list" | "grid")}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger key="list-view" value="list">Lista</TabsTrigger>
              <TabsTrigger key="grid-view" value="grid">Grid</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={handleCreateTask}>Nova Tarefa</Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center p-8 bg-destructive/10 rounded-md">
          <p className="text-destructive">Erro ao carregar tarefas. Por favor, tente novamente.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-md">
          <p className="text-muted-foreground">
            {filter.status !== undefined || filter.search
              ? "Nenhuma tarefa encontrada com os filtros aplicados."
              : "Não há tarefas cadastradas. Crie sua primeira tarefa!"}
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid-view grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "list-view space-y-4"}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
      
      <TaskFormDialog
        key="edit-dialog"
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        onSubmit={handleSubmitTask}
        editingTask={taskToEdit || undefined}
        isSubmitting={isUpdating}
      />
      
      <TaskFormDialog
        key="create-dialog"
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleSubmitTask}
        isSubmitting={isCreating}
      />
      
      <DeleteTaskDialog
        isOpen={!!taskToDelete}
        isDeleting={isDeleting}
        onConfirm={confirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
