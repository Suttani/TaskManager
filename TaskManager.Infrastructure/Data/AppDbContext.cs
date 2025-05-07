using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using System;

namespace TaskManager.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Tarefa> Tarefas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tarefa>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Titulo).IsRequired();
                entity.Property(e => e.Descricao);
                entity.Property(e => e.DataCriacao).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.DataConclusao);
                entity.Property(e => e.Status)
                    .HasColumnType("int")
                    .HasConversion<int>()
                    .HasDefaultValue(StatusTarefa.Pendente);
            });
        }
    }
} 