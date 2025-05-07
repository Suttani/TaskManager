using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;

namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TarefasController : ControllerBase
    {
        private readonly ITarefaService _service;

        public TarefasController(ITarefaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.ObterTodasAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var tarefa = await _service.ObterPorIdAsync(id);
            return tarefa == null ? NotFound() : Ok(tarefa);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Tarefa tarefa)
        {
            try
            {
                var nova = await _service.CriarAsync(tarefa);
                return CreatedAtAction(nameof(Get), new { id = nova.Id }, nova);
            }
            catch (ArgumentException e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Tarefa tarefa)
        {
            if (id != tarefa.Id) return BadRequest("ID não confere.");
            var atualizado = await _service.AtualizarAsync(tarefa);
            return atualizado ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletado = await _service.DeletarAsync(id);
            return deletado ? NoContent() : NotFound();
        }
    }
} 