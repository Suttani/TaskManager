import { Task, CreateTaskDto } from "@/types/task";
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
import { useState, useEffect } from 'react';
import { StatusTarefa } from '@/types/StatusTarefa';
import { toast } from 'react-hot-toast';

const statusOptions = [
  { value: StatusTarefa.Pendente, label: "Pendente" },
  { value: StatusTarefa.EmProgresso, label: "Em Progresso" },
  { value: StatusTarefa.Concluida, label: "Concluída" },
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
  status: z.nativeEnum(StatusTarefa),
});

export const TaskFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  isSubmitting: isSubmittingProp,
}: TaskFormDialogProps) => {
  const [titulo, setTitulo] = useState(editingTask?.titulo || '');
  const [descricao, setDescricao] = useState(editingTask?.descricao || '');
  const [status, setStatus] = useState<StatusTarefa>(editingTask?.status ?? StatusTarefa.Pendente);
  const [dataConclusao, setDataConclusao] = useState<string | null>(
    editingTask?.dataConclusao ? format(new Date(editingTask.dataConclusao), 'yyyy-MM-dd') : null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      titulo: editingTask?.titulo || "",
      descricao: editingTask?.descricao || "",
      status: editingTask?.status || StatusTarefa.Pendente,
      dataConclusao: editingTask?.dataConclusao 
        ? new Date(editingTask.dataConclusao)
        : null,
    },
  });

  // Reset form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setTitulo(editingTask.titulo);
      setDescricao(editingTask.descricao || '');
      setStatus(editingTask.status);
      
      // Só define a data de conclusão se o status for Concluída
      if (editingTask.status === StatusTarefa.Concluida && editingTask.dataConclusao) {
        setDataConclusao(format(new Date(editingTask.dataConclusao), 'yyyy-MM-dd'));
        form.setValue('dataConclusao', new Date(editingTask.dataConclusao));
      } else {
        setDataConclusao(null);
        form.setValue('dataConclusao', null);
      }
    } else {
      // Reset do formulário quando não houver tarefa em edição
      setTitulo('');
      setDescricao('');
      setStatus(StatusTarefa.Pendente);
      setDataConclusao(null);
      form.reset({
        titulo: '',
        descricao: '',
        status: StatusTarefa.Pendente,
        dataConclusao: null
      });
    }
  }, [editingTask, form]);

  const handleStatusChange = (newStatus: StatusTarefa) => {
    setStatus(newStatus);
    if (newStatus === StatusTarefa.Concluida && !dataConclusao) {
      const today = new Date();
      setDataConclusao(format(today, 'yyyy-MM-dd'));
      form.setValue('dataConclusao', today);
    } else if (newStatus !== StatusTarefa.Concluida) {
      setDataConclusao(null);
      form.setValue('dataConclusao', null);
    }
  };

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
    if (status === StatusTarefa.Concluida) {
      if (!dataConclusao) {
        // Se não houver data de conclusão, define como a data atual
        const today = new Date();
        setDataConclusao(format(today, 'yyyy-MM-dd'));
      } else {
        const dataConclusaoObj = new Date(dataConclusao);
        dataConclusaoObj.setHours(0, 0, 0, 0);
        
        const dataCriacao = editingTask?.dataCriacao 
          ? new Date(editingTask.dataCriacao) 
          : new Date();
        dataCriacao.setHours(0, 0, 0, 0);

        // Permite que a data de conclusão seja igual à data de criação
        if (dataConclusaoObj.getTime() < dataCriacao.getTime()) {
          newErrors.dataConclusao = 'A data de conclusão não pode ser anterior à data de criação';
        }

        const maxFutureDate = new Date();
        maxFutureDate.setHours(0, 0, 0, 0);
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 10);
        if (dataConclusaoObj > maxFutureDate) {
          newErrors.dataConclusao = 'A data de conclusão não pode ser superior a 10 anos no futuro';
        }
      }
    } else if (dataConclusao) {
      setDataConclusao(null);
      form.setValue('dataConclusao', null);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        id: editingTask?.id,
        titulo,
        descricao,
        status,
        dataConclusao: dataConclusao ? new Date(dataConclusao).toISOString() : null
      };

      await onSubmit(taskData);
      form.reset();
      onClose();
      toast.success(editingTask ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar a tarefa');
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
                      {...field}
                      value={descricao}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setDescricao(e.target.value);
                      }}
                      className={`resize-none h-24 ${errors.descricao ? 'border-red-500' : ''}`}
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
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => handleStatusChange(Number(value) as StatusTarefa)}
                      defaultValue={status.toString()}
                      value={status.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className={`h-9 ${errors.status ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && <FormMessage>{errors.status}</FormMessage>}
                  </FormItem>
                )}
              />

              {status === StatusTarefa.Concluida && (
                <FormField
                  control={form.control}
                  name="dataConclusao"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-2">
                      <FormLabel>Data de Conclusão</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className={`h-9 w-full justify-start text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              } ${errors.dataConclusao ? 'border-red-500' : ''}`}
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
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              if (date) {
                                setDataConclusao(format(date, 'yyyy-MM-dd'));
                              }
                            }}
                            initialFocus
                            disabled={(date) => {
                              if (!date) return false;
                              
                              const selectedDate = new Date(date);
                              selectedDate.setHours(0, 0, 0, 0);
                              
                              const taskCreationDate = editingTask?.dataCriacao 
                                ? new Date(editingTask.dataCriacao) 
                                : new Date();
                              taskCreationDate.setHours(0, 0, 0, 0);
                              
                              const maxDate = new Date();
                              maxDate.setHours(0, 0, 0, 0);
                              maxDate.setFullYear(maxDate.getFullYear() + 10);
                              
                              // Permite que a data de conclusão seja igual à data de criação
                              return selectedDate.getTime() < taskCreationDate.getTime() || selectedDate > maxDate;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.dataConclusao && <FormMessage>{errors.dataConclusao}</FormMessage>}
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmittingProp}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingProp}>
                {isSubmittingProp
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
