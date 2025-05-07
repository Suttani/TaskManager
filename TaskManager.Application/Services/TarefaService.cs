using TaskManager.Domain.Entities;
using TaskManager.Application.Interfaces;

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
            if (string.IsNullOrWhiteSpace(tarefa.Titulo))
                throw new ArgumentException("O título da tarefa é obrigatório.");

            return await _repository.CriarAsync(tarefa);
        }

        public async Task<bool> AtualizarAsync(Tarefa tarefa)
        {
            if (string.IsNullOrWhiteSpace(tarefa.Titulo))
                throw new ArgumentException("O título da tarefa é obrigatório.");

            return await _repository.AtualizarAsync(tarefa);
        }

        public async Task<bool> DeletarAsync(int id)
        {
            return await _repository.DeletarAsync(id);
        }
    }
} 