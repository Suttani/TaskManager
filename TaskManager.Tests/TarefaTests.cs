using System.ComponentModel.DataAnnotations;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using Xunit;

namespace TaskManager.Tests
{
    public class TarefaTests
    {
        [Fact]
        public void CriarTarefa_DeveTerDataCriacaoPreenchida()
        {
            // Arrange & Act
            var tarefa = new Tarefa();

            // Assert
            Assert.NotEqual(default(DateTime), tarefa.DataCriacao);
        }

        [Fact]
        public void CriarTarefa_DeveIniciarComStatusPendente()
        {
            // Arrange & Act
            var tarefa = new Tarefa();

            // Assert
            Assert.Equal(StatusTarefa.Pendente, tarefa.Status);
        }

        [Fact]
        public void Validate_DataConclusaoAnteriorDataCriacao_DeveLancarException()
        {
            // Arrange
            var tarefa = new Tarefa
            {
                Titulo = "Teste",
                DataConclusao = DateTime.Now.AddDays(-1)
            };

            // Act & Assert
            Assert.Throws<ValidationException>(() => tarefa.Validate());
        }

        [Fact]
        public void AtualizarStatus_ParaConcluida_DevePreencherDataConclusao()
        {
            // Arrange
            var tarefa = new Tarefa
            {
                Titulo = "Teste"
            };

            // Act
            tarefa.AtualizarStatus(StatusTarefa.Concluida);

            // Assert
            Assert.NotNull(tarefa.DataConclusao);
            Assert.Equal(StatusTarefa.Concluida, tarefa.Status);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void Tarefa_TituloVazio_DeveSerInvalido(string titulo)
        {
            // Arrange
            var tarefa = new Tarefa { Titulo = titulo };
            var context = new ValidationContext(tarefa);
            var results = new List<ValidationResult>();

            // Act
            var isValid = Validator.TryValidateObject(tarefa, context, results, true);

            // Assert
            Assert.False(isValid);
            Assert.Contains(results, r => r.MemberNames.Contains("Titulo"));
        }

        [Fact]
        public void Tarefa_TituloMaiorQue100Caracteres_DeveSerInvalido()
        {
            // Arrange
            var titulo = new string('a', 101); // String com 101 caracteres
            var tarefa = new Tarefa { Titulo = titulo };
            var context = new ValidationContext(tarefa);
            var results = new List<ValidationResult>();

            // Act
            var isValid = Validator.TryValidateObject(tarefa, context, results, true);

            // Assert
            Assert.False(isValid);
            Assert.Contains(results, r => r.MemberNames.Contains("Titulo"));
        }
    }
} 