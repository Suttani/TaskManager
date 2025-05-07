import { format, isValid } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Task } from "@/types/task";
import { TaskStatusBadge } from "@/components/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não definida";
    const date = new Date(dateString);
    if (!isValid(date)) return "Data inválida";
    try {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Data inválida";
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
      
      <CardFooter className="flex justify-end p-4 pt-2">
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
