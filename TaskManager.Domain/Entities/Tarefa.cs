using System.ComponentModel.DataAnnotations;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities
{
    public class Tarefa
    {
        public Tarefa()
        {
            DataCriacao = DateTime.Now;
            Status = StatusTarefa.Pendente;
        }

        public int Id { get; set; }

        [Required(ErrorMessage = "O título é obrigatório")]
        [MaxLength(100, ErrorMessage = "O título deve ter no máximo 100 caracteres")]
        public string Titulo { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string? Descricao { get; set; }

        public DateTime DataCriacao { get; private set; }

        public DateTime? DataConclusao { get; set; }

        public StatusTarefa Status { get; set; }

        public void Validate()
        {
            if (DataConclusao.HasValue && DataConclusao.Value < DataCriacao)
            {
                throw new ValidationException("A data de conclusão não pode ser anterior à data de criação");
            }
        }

        public void AtualizarStatus(StatusTarefa novoStatus)
        {
            Status = novoStatus;
            if (novoStatus == StatusTarefa.Concluida && !DataConclusao.HasValue)
            {
                DataConclusao = DateTime.Now;
            }
        }
    }
} 