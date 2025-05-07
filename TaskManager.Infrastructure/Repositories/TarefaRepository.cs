using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Application.Interfaces;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories
{
    public class TarefaRepository : ITarefaRepository
    {
        private readonly ApplicationDbContext _context;

        public TarefaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tarefa>> ObterTodasAsync()
        {
            return await _context.Tarefas.ToListAsync();
        }

        public async Task<Tarefa?> ObterPorIdAsync(int id)
        {
            return await _context.Tarefas.FindAsync(id);
        }

        public async Task<Tarefa> CriarAsync(Tarefa tarefa)
        {
            _context.Tarefas.Add(tarefa);
            await _context.SaveChangesAsync();
            return tarefa;
        }

        public async Task<bool> AtualizarAsync(Tarefa tarefa)
        {
            var tarefaExistente = await _context.Tarefas.FindAsync(tarefa.Id);
            if (tarefaExistente == null)
                return false;

            _context.Entry(tarefaExistente).CurrentValues.SetValues(tarefa);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletarAsync(int id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);
            if (tarefa == null)
                return false;

            _context.Tarefas.Remove(tarefa);
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 