import { Task, CreateTaskDto, TaskStatus } from "@/types/task";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import taskService from "@/services/taskService";
import { useState } from 'react';
import { StatusTarefa } from '../types/StatusTarefa';
import { toast } from 'react-hot-toast';

const statusOptions = [
  { value: "Pendente", label: "Pendente" },
  { value: "EmProgresso", label: "Em Progresso" },
  { value: "Concluida", label: "Concluída" },
];

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskDto) => Promise<void>;
  editingTask?: Task;
  isSubmitting: boolean;
}

const taskFormSchema = z.object({
  titulo: z.string().min(1, "O título é obrigatório").max(100, "O título deve ter no máximo 100 caracteres"),
  descricao: z.string().optional(),
  dataConclusao: z.date().optional().nullable(),
  status: z.enum(["Pendente", "EmProgresso", "Concluida"]),
});

export const TaskFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  isSubmitting,
}: TaskFormDialogProps) => {
  const [titulo, setTitulo] = useState(editingTask?.titulo || '');
  const [descricao, setDescricao] = useState(editingTask?.descricao || '');
  const [status, setStatus] = useState<StatusTarefa>(editingTask?.status || StatusTarefa.Pendente);
  const [dataConclusao, setDataConclusao] = useState(
    editingTask?.dataConclusao ? format(new Date(editingTask.dataConclusao), 'yyyy-MM-dd') : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      titulo: editingTask?.titulo || "",
      descricao: editingTask?.descricao || "",
      status: editingTask?.status || "Pendente",
      dataConclusao: editingTask?.dataConclusao 
        ? new Date(editingTask.dataConclusao)
        : null,
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!titulo.trim()) {
      newErrors.titulo = 'O título é obrigatório';
    }
    if (titulo.length > 100) {
      newErrors.titulo = 'O título deve ter no máximo 100 caracteres';
    }
    if (descricao && descricao.length > 500) {
      newErrors.descricao = 'A descrição deve ter no máximo 500 caracteres';
    }

    // Validações da data de conclusão
    if (dataConclusao) {
      const dataConclusaoObj = new Date(dataConclusao);
      const dataCriacao = editingTask?.dataCriacao 
        ? new Date(editingTask.dataCriacao) 
        : new Date();

      if (dataConclusaoObj < dataCriacao) {
        newErrors.dataConclusao = 'A data de conclusão não pode ser anterior à data de criação';
      }

      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 10);
      if (dataConclusaoObj > maxFutureDate) {
        newErrors.dataConclusao = 'A data de conclusão não pode ser superior a 10 anos no futuro';
      }
    }

    // Validação do status em relação à data de conclusão
    if (status === StatusTarefa.Concluida && !dataConclusao) {
      setDataConclusao(format(new Date(), 'yyyy-MM-dd'));
    } else if (status !== StatusTarefa.Concluida && dataConclusao) {
      newErrors.status = 'Uma tarefa não concluída não pode ter data de conclusão';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        titulo,
        descricao,
        status: status as TaskStatus,
        dataConclusao: dataConclusao ? new Date(dataConclusao).toISOString() : null
      };
      console.log("Task data to be sent:", taskData);

      await onSubmit(taskData);
      form.reset();
      onClose();
      toast.success(editingTask ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar a tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus: StatusTarefa) => {
    setStatus(newStatus);
    if (newStatus === StatusTarefa.Concluida && !dataConclusao) {
      setDataConclusao(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="task-form-description">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o título da tarefa"
                      {...field}
                      value={titulo}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setTitulo(e.target.value);
                      }}
                      className={errors.titulo ? 'border-red-500' : ''}
                    />
                  </FormControl>
                  {errors.titulo && <FormMessage>{errors.titulo}</FormMessage>}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a descrição da tarefa"
                      className="resize-none h-24"
                      {...field}
                      value={descricao}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setDescricao(e.target.value);
                      }}
                      className={errors.descricao ? 'border-red-500' : ''}
                    />
                  </FormControl>
                  {errors.descricao && <FormMessage>{errors.descricao}</FormMessage>}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={handleStatusChange}
                      defaultValue={status}
                    >
                      <FormControl>
                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && <FormMessage>{errors.status}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataConclusao"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Conclusão</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "dd 'de' MMMM 'de' yyyy", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dataConclusao && <FormMessage>{errors.dataConclusao}</FormMessage>}
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : editingTask
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
