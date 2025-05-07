import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";
import { StatusTarefa } from "@/types/StatusTarefa";

export const TaskStats = () => {
  const { tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === StatusTarefa.Pendente).length;
  const inProgressTasks = tasks.filter((task) => task.status === StatusTarefa.EmProgresso).length;
  const completedTasks = tasks.filter((task) => task.status === StatusTarefa.Concluida).length;

  const completionPercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-task-pending-text">{pendingTasks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-task-in-progress-text">{inProgressTasks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-task-completed-text">{completedTasks}</div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progresso Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={completionPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completionPercentage}% concluído</span>
              <span>{completedTasks} de {totalTasks} tarefas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
