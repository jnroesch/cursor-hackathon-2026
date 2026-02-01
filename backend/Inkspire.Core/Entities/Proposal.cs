using System.Text.Json;
using Inkspire.Core.Enums;

namespace Inkspire.Core.Entities;

/// <summary>
/// Represents a submitted change proposal from a user's draft.
/// Contains the operations (diff) that describe what changed.
/// </summary>
public class Proposal
{
    public Guid Id { get; set; }

    /// <summary>
    /// The document this proposal is for.
    /// </summary>
    public Guid DocumentId { get; set; }

    /// <summary>
    /// The user who authored this proposal.
    /// </summary>
    public Guid AuthorId { get; set; }

    /// <summary>
    /// The version of the live document this proposal was based on.
    /// Used for conflict detection.
    /// </summary>
    public int BaseVersion { get; set; }

    /// <summary>
    /// The current status of the proposal in the review workflow.
    /// </summary>
    public ProposalStatus Status { get; set; } = ProposalStatus.Pending;

    /// <summary>
    /// The operations (diff) describing the changes, stored as JSONB.
    /// This is an array of operation objects.
    /// </summary>
    public JsonDocument? Operations { get; set; }

    /// <summary>
    /// The full proposed content (TipTap JSON) at the time of submission.
    /// This allows reviewers to see the complete proposed version.
    /// </summary>
    public JsonDocument? ProposedContent { get; set; }

    /// <summary>
    /// A description of what this proposal changes.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// AI-generated feedback about consistency issues, stored as JSONB.
    /// Contains issues found, summary, and timestamp of the check.
    /// </summary>
    public JsonDocument? AIFeedback { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the proposal was resolved (accepted, rejected, or marked conflicted).
    /// </summary>
    public DateTime? ResolvedAt { get; set; }

    // Navigation properties
    public Document Document { get; set; } = null!;
    public User Author { get; set; } = null!;
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
