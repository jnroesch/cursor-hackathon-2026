namespace Inkspire.Core.Entities;

/// <summary>
/// Represents a writing project that can contain multiple documents.
/// </summary>
public class Project
{
    public Guid Id { get; set; }

    /// <summary>
    /// The title of the project (e.g., "The Whispering Woods").
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// A brief description of the project.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// URL to the project's cover image.
    /// </summary>
    public string? CoverImageUrl { get; set; }

    /// <summary>
    /// The user who owns this project.
    /// </summary>
    public Guid OwnerId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}
