using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Interfaces;

namespace TaskManager.Infrastructure.Repositories
{
    public class TarefaRepository : ITarefaRepository
    {
        private readonly AppDbContext _context;

        public TarefaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tarefa>> ObterTodasAsync() => await _context.Tarefas.ToListAsync();

        public async Task<Tarefa?> ObterPorIdAsync(int id) => await _context.Tarefas.FindAsync(id);

        public async Task<Tarefa> CriarAsync(Tarefa tarefa)
        {
            _context.Tarefas.Add(tarefa);
            await _context.SaveChangesAsync();
            return tarefa;
        }

        public async Task<bool> AtualizarAsync(Tarefa tarefa)
        {
            _context.Tarefas.Update(tarefa);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeletarAsync(int id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);
            if (tarefa == null) return false;
            _context.Tarefas.Remove(tarefa);
            return await _context.SaveChangesAsync() > 0;
        }
    }
} 