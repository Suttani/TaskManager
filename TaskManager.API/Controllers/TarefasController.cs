using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;

namespace TaskManager.API.Controllers
{
    /// <summary>
    /// Controller responsável pelo gerenciamento de tarefas
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TarefasController : ControllerBase
    {
        private readonly ITarefaService _service;
        private readonly ILogger<TarefasController> _logger;

        public TarefasController(ITarefaService service, ILogger<TarefasController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Obtém todas as tarefas
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetAll()
        {
            var tarefas = await _service.ObterTodasAsync();
            return Ok(tarefas);
        }

        /// <summary>
        /// Obtém uma tarefa específica pelo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Tarefa>> Get(int id)
        {
            var tarefa = await _service.ObterPorIdAsync(id);
            return tarefa == null ? NotFound() : Ok(tarefa);
        }

        /// <summary>
        /// Cria uma nova tarefa
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Tarefa>> Post([FromBody] Tarefa tarefa)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                ValidarTarefa(tarefa);
                
                if (!Enum.IsDefined(typeof(StatusTarefa), tarefa.Status))
                    tarefa.Status = StatusTarefa.Pendente;

                var novaTarefa = await _service.CriarAsync(tarefa);
                return CreatedAtAction(nameof(Get), new { id = novaTarefa.Id }, novaTarefa);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Erro de validação ao criar tarefa");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar tarefa");
                return StatusCode(500, "Erro interno ao processar a solicitação");
            }
        }

        /// <summary>
        /// Atualiza uma tarefa existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Put(int id, [FromBody] Tarefa tarefa)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                if (id != tarefa.Id)
                    return BadRequest("O ID da tarefa não corresponde ao ID da URL");

                ValidarTarefa(tarefa);

                var atualizado = await _service.AtualizarAsync(tarefa);
                return atualizado ? NoContent() : NotFound();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Erro de validação ao atualizar tarefa {Id}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar tarefa {Id}", id);
                return StatusCode(500, "Erro interno ao processar a solicitação");
            }
        }

        /// <summary>
        /// Remove uma tarefa
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deletado = await _service.DeletarAsync(id);
                return deletado ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao deletar tarefa {Id}", id);
                return StatusCode(500, "Erro interno ao processar a solicitação");
            }
        }

        private static void ValidarTarefa(Tarefa tarefa)
        {
            if (tarefa == null)
                throw new ArgumentException("Dados da tarefa são inválidos");

            if (string.IsNullOrWhiteSpace(tarefa.Titulo))
                throw new ArgumentException("O título da tarefa é obrigatório");

            if (tarefa.Titulo.Length > 100)
                throw new ArgumentException("O título da tarefa deve ter no máximo 100 caracteres");
        }
    }
} 