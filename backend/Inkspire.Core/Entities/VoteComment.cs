namespace Inkspire.Core.Entities;

/// <summary>
/// Represents a comment attached to a vote, explaining the voter's reasoning.
/// A vote can have multiple comments over time as discussion continues.
/// </summary>
public class VoteComment
{
    public Guid Id { get; set; }

    /// <summary>
    /// The vote this comment belongs to.
    /// </summary>
    public Guid VoteId { get; set; }

    /// <summary>
    /// The content of the comment.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Vote Vote { get; set; } = null!;
}
