namespace Inkspire.Core.DTOs;

public record CommentDto(
    Guid Id,
    Guid ProposalId,
    Guid UserId,
    UserSummaryDto User,
    string Content,
    DateTime CreatedAt
);

public record CreateCommentRequest(
    string Content
);
