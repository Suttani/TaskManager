using TaskManager.Domain.Entities;

namespace TaskManager.Application.Interfaces
{
    public interface ITarefaService
    {
        Task<IEnumerable<Tarefa>> ObterTodasAsync();
        Task<Tarefa?> ObterPorIdAsync(int id);
        Task<Tarefa> CriarAsync(Tarefa tarefa);
        Task<bool> AtualizarAsync(Tarefa tarefa);
        Task<bool> DeletarAsync(int id);
    }
} 