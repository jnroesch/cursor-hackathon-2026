namespace Inkspire.Core.Entities;

/// <summary>
/// Represents a general discussion comment on a proposal.
/// Separate from VoteComment which is attached to a specific vote.
/// </summary>
public class Comment
{
    public Guid Id { get; set; }

    /// <summary>
    /// The proposal this comment is on.
    /// </summary>
    public Guid ProposalId { get; set; }

    /// <summary>
    /// The user who wrote this comment.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// The content of the comment.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Proposal Proposal { get; set; } = null!;
    public User User { get; set; } = null!;
}
