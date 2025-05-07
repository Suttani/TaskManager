using System.ComponentModel.DataAnnotations;
using TaskManager.Domain.Entities;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Enums;

namespace TaskManager.Application.Services
{
    public class TarefaService : ITarefaService
    {
        private readonly ITarefaRepository _repository;

        public TarefaService(ITarefaRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Tarefa>> ObterTodasAsync()
        {
            return await _repository.ObterTodasAsync();
        }

        public async Task<Tarefa?> ObterPorIdAsync(int id)
        {
            return await _repository.ObterPorIdAsync(id);
        }

        public async Task<Tarefa> CriarAsync(Tarefa tarefa)
        {
            ValidarTarefa(tarefa);
            
            // Garantir que o status está definido
            if (!Enum.IsDefined(typeof(StatusTarefa), tarefa.Status))
            {
                tarefa.Status = StatusTarefa.Pendente;
            }

            return await _repository.CriarAsync(tarefa);
        }

        public async Task<bool> AtualizarAsync(Tarefa tarefa)
        {
            ValidarTarefa(tarefa);
            
            var tarefaExistente = await _repository.ObterPorIdAsync(tarefa.Id);
            if (tarefaExistente == null)
                throw new KeyNotFoundException($"Tarefa com ID {tarefa.Id} não encontrada.");

            return await _repository.AtualizarAsync(tarefa);
        }

        public async Task<bool> DeletarAsync(int id)
        {
            var tarefa = await _repository.ObterPorIdAsync(id);
            if (tarefa == null)
                throw new KeyNotFoundException($"Tarefa com ID {id} não encontrada.");

            return await _repository.DeletarAsync(id);
        }

        private void ValidarTarefa(Tarefa tarefa)
        {
            if (string.IsNullOrWhiteSpace(tarefa.Titulo))
                throw new ValidationException("O título da tarefa é obrigatório.");

            if (tarefa.Titulo.Length > 100)
                throw new ValidationException("O título deve ter no máximo 100 caracteres.");

            if (tarefa.Descricao?.Length > 500)
                throw new ValidationException("A descrição deve ter no máximo 500 caracteres.");

            // Validação da data de conclusão
            if (tarefa.DataConclusao.HasValue)
            {
                if (tarefa.DataConclusao.Value < tarefa.DataCriacao)
                    throw new ValidationException("A data de conclusão não pode ser anterior à data de criação.");

                if (tarefa.DataConclusao.Value > DateTime.Now.AddYears(10))
                    throw new ValidationException("A data de conclusão não pode ser superior a 10 anos no futuro.");
            }

            // Validação do status em relação à data de conclusão
            if (tarefa.Status == StatusTarefa.Concluida && !tarefa.DataConclusao.HasValue)
            {
                tarefa.DataConclusao = DateTime.Now;
            }
            else if (tarefa.Status != StatusTarefa.Concluida && tarefa.DataConclusao.HasValue)
            {
                throw new ValidationException("Uma tarefa não concluída não pode ter data de conclusão.");
            }
        }
    }
} 