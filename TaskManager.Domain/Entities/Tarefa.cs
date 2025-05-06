using System.ComponentModel.DataAnnotations;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities
{
    public class Tarefa
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Titulo { get; set; } = string.Empty;

        public string? Descricao { get; set; }

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        public DateTime? DataConclusao { get; set; }

        public StatusTarefa Status { get; set; } = StatusTarefa.Pendente;
    }
} 