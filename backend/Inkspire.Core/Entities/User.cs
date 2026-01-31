using Microsoft.AspNetCore.Identity;

namespace Inkspire.Core.Entities;

/// <summary>
/// Represents an application user, extending ASP.NET Core Identity.
/// </summary>
public class User : IdentityUser<Guid>
{
    /// <summary>
    /// The display name shown in the UI (e.g., "Margaret Johnson").
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// URL to the user's avatar image.
    /// </summary>
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// When the user account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the user account was last updated.
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// User's selected roles (stored as JSON array).
    /// </summary>
    public string? Roles { get; set; }

    /// <summary>
    /// User's favorite books, movies, etc.
    /// </summary>
    public string? FavoriteMedia { get; set; }

    /// <summary>
    /// About myself, writing philosophy, fun fact, or alike.
    /// </summary>
    public string? AboutMe { get; set; }

    // Navigation properties
    public ICollection<ProjectMember> ProjectMemberships { get; set; } = new List<ProjectMember>();
    public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();
    public ICollection<UserDraft> Drafts { get; set; } = new List<UserDraft>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
