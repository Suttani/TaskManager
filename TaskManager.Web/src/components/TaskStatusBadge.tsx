import { Badge } from "@/components/ui/badge";
import { StatusTarefa } from "@/types/StatusTarefa";

interface TaskStatusBadgeProps {
  status: StatusTarefa;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  const statusConfig = {
    [StatusTarefa.Pendente]: {
      className: "bg-task-pending text-task-pending-text",
      label: "Pendente"
    },
    [StatusTarefa.EmProgresso]: {
      className: "bg-task-in-progress text-task-in-progress-text",
      label: "Em Progresso"
    },
    [StatusTarefa.Concluida]: {
      className: "bg-task-completed text-task-completed-text",
      label: "Concluída"
    }
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
