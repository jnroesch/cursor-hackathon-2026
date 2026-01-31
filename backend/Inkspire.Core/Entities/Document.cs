using System.Text.Json;
using Inkspire.Core.Enums;

namespace Inkspire.Core.Entities;

/// <summary>
/// Represents a document within a project. Contains the live (approved) content.
/// </summary>
public class Document
{
    public Guid Id { get; set; }

    /// <summary>
    /// The project this document belongs to.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// The type of document (Manuscript or Notes).
    /// </summary>
    public DocumentType DocumentType { get; set; } = DocumentType.Manuscript;

    /// <summary>
    /// The title of the document (e.g., "Chapter 7: The Lost Kingdom").
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// The live (approved) content stored as TipTap JSON.
    /// </summary>
    public JsonDocument? LiveContent { get; set; }

    /// <summary>
    /// The current version number. Increments each time a proposal is merged.
    /// </summary>
    public int Version { get; set; } = 1;

    /// <summary>
    /// The current word count of the document.
    /// </summary>
    public int WordCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Project Project { get; set; } = null!;
    public ICollection<UserDraft> Drafts { get; set; } = new List<UserDraft>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
}
