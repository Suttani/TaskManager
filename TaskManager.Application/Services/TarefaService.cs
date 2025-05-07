using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Interfaces;

namespace TaskManager.Application.Services
{
    public class TarefaService : ITarefaService
    {
        private readonly ITarefaRepository _repo;

        public TarefaService(ITarefaRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<Tarefa>> ObterTodasAsync() => _repo.ObterTodasAsync();

        public Task<Tarefa?> ObterPorIdAsync(int id) => _repo.ObterPorIdAsync(id);

        public Task<Tarefa> CriarAsync(Tarefa tarefa)
        {
            if (tarefa.DataConclusao.HasValue && tarefa.DataConclusao < tarefa.DataCriacao)
                throw new ArgumentException("Data de conclusão não pode ser anterior à data de criação.");
            return _repo.CriarAsync(tarefa);
        }

        public Task<bool> AtualizarAsync(Tarefa tarefa) => _repo.AtualizarAsync(tarefa);

        public Task<bool> DeletarAsync(int id) => _repo.DeletarAsync(id);
    }
} 