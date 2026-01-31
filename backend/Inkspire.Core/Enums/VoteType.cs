namespace Inkspire.Core.Enums;

/// <summary>
/// Defines the type of vote a user can cast on a proposal.
/// </summary>
public enum VoteType
{
    /// <summary>
    /// User approves the proposal and wants it merged.
    /// </summary>
    Approve = 0,

    /// <summary>
    /// User rejects the proposal and does not want it merged.
    /// </summary>
    Reject = 1
}
