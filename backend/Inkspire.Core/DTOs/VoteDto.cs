using Inkspire.Core.Enums;

namespace Inkspire.Core.DTOs;

public record VoteDto(
    Guid Id,
    Guid ProposalId,
    Guid UserId,
    UserSummaryDto User,
    VoteType VoteType,
    IEnumerable<VoteCommentDto> Comments,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record VoteCommentDto(
    Guid Id,
    string Content,
    DateTime CreatedAt
);

public record CastVoteRequest(
    VoteType Vote,
    string? Comment
);

public record AddVoteCommentRequest(
    string Content
);

public record VotingSummaryDto(
    Guid ProposalId,
    int TotalEligibleVoters,
    int ApproveCount,
    int RejectCount,
    int PendingCount,
    int ThresholdRequired,
    bool MajorityReached,
    VoteType? MajorityResult
);
