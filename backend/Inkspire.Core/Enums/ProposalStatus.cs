namespace Inkspire.Core.Enums;

/// <summary>
/// Defines the possible states of a proposal in the review workflow.
/// </summary>
public enum ProposalStatus
{
    /// <summary>
    /// Proposal has been submitted and is awaiting votes.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Proposal received majority approval and was merged into the live document.
    /// </summary>
    Accepted = 1,

    /// <summary>
    /// Proposal received majority rejection and was archived.
    /// </summary>
    Rejected = 2,

    /// <summary>
    /// The live document has changed since this proposal was created,
    /// causing potential conflicts that need to be resolved via rebase.
    /// </summary>
    Conflicted = 3
}
