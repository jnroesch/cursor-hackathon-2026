using Inkspire.Core.Enums;

namespace Inkspire.Core.Entities;

/// <summary>
/// Represents a user's vote on a proposal.
/// Each user can only have one vote per proposal (can be changed until resolved).
/// </summary>
public class Vote
{
    public Guid Id { get; set; }

    /// <summary>
    /// The proposal being voted on.
    /// </summary>
    public Guid ProposalId { get; set; }

    /// <summary>
    /// The user who cast this vote.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Whether the user approves or rejects the proposal.
    /// </summary>
    public VoteType VoteType { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the vote was last updated (if the user changed their vote).
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Proposal Proposal { get; set; } = null!;
    public User User { get; set; } = null!;
    
    /// <summary>
    /// Comments attached to this vote explaining the voter's reasoning.
    /// </summary>
    public ICollection<VoteComment> Comments { get; set; } = new List<VoteComment>();
}
