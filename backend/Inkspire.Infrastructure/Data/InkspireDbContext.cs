using Inkspire.Core.Entities;
using Inkspire.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Inkspire.Infrastructure.Data;

/// <summary>
/// The main database context for the Inkspire application.
/// Extends IdentityDbContext for user authentication support.
/// </summary>
public class InkspireDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public InkspireDbContext(DbContextOptions<InkspireDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<UserDraft> UserDrafts => Set<UserDraft>();
    public DbSet<Proposal> Proposals => Set<Proposal>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<VoteComment> VoteComments => Set<VoteComment>();
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.DisplayName).HasMaxLength(200);
            entity.Property(e => e.AvatarUrl).HasMaxLength(500);
        });

        // Project configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);

            entity.HasOne(e => e.Owner)
                .WithMany(u => u.OwnedProjects)
                .HasForeignKey(e => e.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.OwnerId);
        });

        // ProjectMember configuration (composite primary key)
        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.HasKey(e => new { e.ProjectId, e.UserId });

            entity.Property(e => e.Role)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.Property(e => e.Permissions)
                .HasConversion<int>();

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Members)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.ProjectMemberships)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Document configuration
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();

            // Store TipTap JSON as JSONB in PostgreSQL
            entity.Property(e => e.LiveContent)
                .HasColumnType("jsonb");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Documents)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ProjectId);
        });

        // UserDraft configuration
        modelBuilder.Entity<UserDraft>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Store draft content as JSONB
            entity.Property(e => e.DraftContent)
                .HasColumnType("jsonb");

            entity.HasOne(e => e.Document)
                .WithMany(d => d.Drafts)
                .HasForeignKey(e => e.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Drafts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ensure one draft per user per document
            entity.HasIndex(e => new { e.UserId, e.DocumentId }).IsUnique();
        });

        // Proposal configuration
        modelBuilder.Entity<Proposal>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            // Store operations as JSONB
            entity.Property(e => e.Operations)
                .HasColumnType("jsonb");

            entity.Property(e => e.Description).HasMaxLength(2000);

            entity.HasOne(e => e.Document)
                .WithMany(d => d.Proposals)
                .HasForeignKey(e => e.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Author)
                .WithMany(u => u.Proposals)
                .HasForeignKey(e => e.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Index for efficient queries
            entity.HasIndex(e => new { e.DocumentId, e.Status });
        });

        // Vote configuration
        modelBuilder.Entity<Vote>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.VoteType)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.HasOne(e => e.Proposal)
                .WithMany(p => p.Votes)
                .HasForeignKey(e => e.ProposalId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Votes)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ensure one vote per user per proposal
            entity.HasIndex(e => new { e.ProposalId, e.UserId }).IsUnique();
            entity.HasIndex(e => e.ProposalId);
        });

        // VoteComment configuration
        modelBuilder.Entity<VoteComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).HasMaxLength(2000).IsRequired();

            entity.HasOne(e => e.Vote)
                .WithMany(v => v.Comments)
                .HasForeignKey(e => e.VoteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.VoteId);
        });

        // Comment configuration
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).HasMaxLength(2000).IsRequired();

            entity.HasOne(e => e.Proposal)
                .WithMany(p => p.Comments)
                .HasForeignKey(e => e.ProposalId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.ProposalId);
        });
    }
}
