using System.Text.Json;
using Inkspire.Core.Enums;

namespace Inkspire.Core.DTOs;

public record ProposalDto(
    Guid Id,
    Guid DocumentId,
    Guid AuthorId,
    UserSummaryDto Author,
    int BaseVersion,
    ProposalStatus Status,
    JsonDocument? Operations,
    string? Description,
    int ApproveCount,
    int RejectCount,
    int CommentCount,
    DateTime CreatedAt,
    DateTime? ResolvedAt
);

public record ProposalSummaryDto(
    Guid Id,
    UserSummaryDto Author,
    ProposalStatus Status,
    string? Description,
    int ApproveCount,
    int RejectCount,
    DateTime CreatedAt
);

public record CreateProposalRequest(
    Guid DocumentId,
    string? Description
);

public record ProposalDiffDto(
    Guid ProposalId,
    int BaseVersion,
    int CurrentVersion,
    JsonDocument? Operations,
    bool HasConflicts,
    IEnumerable<ConflictDto>? Conflicts
);

public record ConflictDto(
    string Path,
    string Description,
    JsonDocument? BaseContent,
    JsonDocument? ProposedContent,
    JsonDocument? CurrentContent
);

public record MergeResult(
    bool Success,
    int NewVersion,
    string? ErrorMessage
);

public record ConflictAnalysis(
    bool HasConflicts,
    IEnumerable<ConflictDto> Conflicts
);
