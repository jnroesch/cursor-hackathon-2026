using Inkspire.Core.DTOs;
using Inkspire.Core.Enums;

namespace Inkspire.Core.Interfaces;

/// <summary>
/// Service for managing votes on proposals.
/// </summary>
public interface IVotingService
{
    /// <summary>
    /// Casts or updates a vote on a proposal.
    /// </summary>
    Task<VoteDto> CastVoteAsync(Guid proposalId, Guid userId, CastVoteRequest request);

    /// <summary>
    /// Gets all votes for a proposal.
    /// </summary>
    Task<IEnumerable<VoteDto>> GetVotesAsync(Guid proposalId);

    /// <summary>
    /// Gets the voting summary for a proposal.
    /// </summary>
    Task<VotingSummaryDto> GetVotingSummaryAsync(Guid proposalId);

    /// <summary>
    /// Adds a comment to an existing vote.
    /// </summary>
    Task<VoteCommentDto> AddVoteCommentAsync(Guid voteId, AddVoteCommentRequest request);

    /// <summary>
    /// Checks if majority has been reached and triggers merge/reject if so.
    /// </summary>
    Task<bool> CheckMajorityReachedAsync(Guid proposalId);
}
