
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task } from "@/types/task";
import { TaskStatusBadge } from "@/components/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { Trash2, Check, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Task["status"]) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleStatusChange = (status: Task["status"]) => {
    onStatusChange(task.id, status);
  };

  const getNextStatus = () => {
    switch (task.status) {
      case "Pendente":
        return "EmProgresso";
      case "EmProgresso":
        return "Concluida";
      case "Concluida":
        return "Pendente";
      default:
        return "Pendente";
    }
  };

  return (
    <Card className="task-card animate-fade-in">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle 
            className="text-lg font-medium cursor-pointer hover:text-primary transition-colors"
            onClick={() => onEdit(task)}
          >
            {task.titulo}
          </CardTitle>
          <TaskStatusBadge status={task.status} />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        {task.descricao && (
          <div className="mt-2 text-sm text-muted-foreground line-clamp-3">
            {task.descricao}
          </div>
        )}
        
        <div className="flex flex-col gap-1 mt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Criada em: {formatDate(task.dataCriacao)}</span>
          </div>
          
          {task.dataConclusao && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Conclusão: {formatDate(task.dataConclusao)}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(getNextStatus())}
        >
          <Check className="h-4 w-4 mr-1" />
          Atualizar Status
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
