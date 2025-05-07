using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using System.Text.Json;

namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TarefasController : ControllerBase
    {
        private readonly ITarefaService _service;
        private readonly ILogger<TarefasController> _logger;

        public TarefasController(ITarefaService service, ILogger<TarefasController> logger)
        {
            _service = service;
            _logger = logger;
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
            _logger.LogInformation("Recebendo requisição POST para criar tarefa");
            _logger.LogInformation("Dados recebidos: {@Tarefa}", JsonSerializer.Serialize(tarefa));
            _logger.LogInformation("Status recebido: {Status}", tarefa.Status);
            _logger.LogInformation("Tipo do Status: {StatusType}", tarefa.Status.GetType().Name);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState inválido: {@ModelState}", JsonSerializer.Serialize(ModelState));
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    _logger.LogWarning("Erro de validação: {ErrorMessage}", error.ErrorMessage);
                }
                return BadRequest(ModelState);
            }

            try
            {
                // Validar título
                if (string.IsNullOrWhiteSpace(tarefa.Titulo))
                {
                    _logger.LogWarning("Título da tarefa está vazio");
                    return BadRequest("O título da tarefa é obrigatório");
                }

                if (tarefa.Titulo.Length > 100)
                {
                    _logger.LogWarning("Título da tarefa excede o limite de 100 caracteres");
                    return BadRequest("O título da tarefa deve ter no máximo 100 caracteres");
                }

                // Garantir que o status está definido
                if (!Enum.IsDefined(typeof(StatusTarefa), tarefa.Status))
                {
                    _logger.LogWarning("Status inválido recebido: {Status}, definindo como Pendente", tarefa.Status);
                    tarefa.Status = StatusTarefa.Pendente;
                }

                _logger.LogInformation("Status da tarefa antes de salvar: {Status}", tarefa.Status);

                var novaTarefa = await _service.CriarAsync(tarefa);
                _logger.LogInformation("Tarefa criada com sucesso. ID: {Id}", novaTarefa.Id);
                return CreatedAtAction(nameof(Get), new { id = novaTarefa.Id }, novaTarefa);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar tarefa");
                return StatusCode(500, "Erro interno ao criar tarefa");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Tarefa tarefa)
        {
            try
            {
                _logger.LogInformation("Recebendo requisição PUT para atualizar tarefa {Id}", id);
                _logger.LogInformation("Dados recebidos: {Tarefa}", JsonSerializer.Serialize(tarefa));

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("ModelState inválido: {@ModelState}", JsonSerializer.Serialize(ModelState));
                    foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                    {
                        _logger.LogWarning("Erro de validação: {ErrorMessage}", error.ErrorMessage);
                    }
                    return BadRequest(ModelState);
                }

                if (tarefa == null)
                {
                    _logger.LogWarning("Dados da tarefa são nulos");
                    return BadRequest("Dados da tarefa inválidos");
                }

                if (id != tarefa.Id)
                {
                    _logger.LogWarning("ID não confere. ID da URL: {UrlId}, ID do corpo: {BodyId}", id, tarefa.Id);
                    return BadRequest("ID não confere");
                }

                if (string.IsNullOrWhiteSpace(tarefa.Titulo))
                {
                    _logger.LogWarning("Título da tarefa está vazio");
                    return BadRequest("O título da tarefa é obrigatório");
                }

                // Validar o Status
                if (string.IsNullOrWhiteSpace(tarefa.Status.ToString()))
                {
                    _logger.LogWarning("Status da tarefa está vazio");
                    return BadRequest("O status da tarefa é obrigatório");
                }

                // Tentar converter o status para o enum
                if (!Enum.TryParse<StatusTarefa>(tarefa.Status.ToString(), true, out var statusTarefa))
                {
                    _logger.LogWarning("Status inválido: {Status}", tarefa.Status);
                    return BadRequest($"Status inválido: {tarefa.Status}");
                }

                // Atribuir o status convertido
                tarefa.Status = statusTarefa;

                var atualizado = await _service.AtualizarAsync(tarefa);
                if (atualizado)
                {
                    _logger.LogInformation("Tarefa {Id} atualizada com sucesso", id);
                    return NoContent();
                }
                else
                {
                    _logger.LogWarning("Tarefa {Id} não encontrada para atualização", id);
                    return NotFound();
                }
            }
            catch (ArgumentException e)
            {
                _logger.LogError(e, "Erro ao atualizar tarefa");
                return BadRequest(e.Message);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro inesperado ao atualizar tarefa");
                return StatusCode(500, "Ocorreu um erro inesperado ao atualizar a tarefa");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Recebendo requisição DELETE para tarefa {Id}", id);
                var deletado = await _service.DeletarAsync(id);
                if (deletado)
                {
                    _logger.LogInformation("Tarefa {Id} deletada com sucesso", id);
                    return NoContent();
                }
                else
                {
                    _logger.LogWarning("Tarefa {Id} não encontrada para deleção", id);
                    return NotFound();
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro ao deletar tarefa");
                return StatusCode(500, "Ocorreu um erro inesperado ao deletar a tarefa");
            }
        }
    }
} 