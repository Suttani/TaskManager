
import { TaskStatus } from "@/types/task";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  const statusClasses = {
    Pendente: "status-pendente",
    EmProgresso: "status-emProgresso",
    Concluida: "status-concluida",
  };

  const statusLabels = {
    Pendente: "Pendente",
    EmProgresso: "Em Progresso",
    Concluida: "Concluída",
  };

  return (
    <span className={`status-badge ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
};
