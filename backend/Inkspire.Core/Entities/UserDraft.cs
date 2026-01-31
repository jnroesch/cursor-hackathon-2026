using System.Text.Json;

namespace Inkspire.Core.Entities;

/// <summary>
/// Represents a user's personal working copy (shadow copy) of a document.
/// Each user has one draft per document where they make their edits.
/// </summary>
public class UserDraft
{
    public Guid Id { get; set; }

    /// <summary>
    /// The document this draft is based on.
    /// </summary>
    public Guid DocumentId { get; set; }

    /// <summary>
    /// The user who owns this draft.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// The version of the live document this draft was branched from.
    /// Used for detecting conflicts when submitting proposals.
    /// </summary>
    public int BaseVersion { get; set; }

    /// <summary>
    /// The draft content stored as TipTap JSON.
    /// </summary>
    public JsonDocument? DraftContent { get; set; }

    /// <summary>
    /// When the draft was last edited.
    /// </summary>
    public DateTime LastEditedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Document Document { get; set; } = null!;
    public User User { get; set; } = null!;
}
