using Inkspire.Core.Enums;

namespace Inkspire.Core.DTOs;

public record ProjectDto(
    Guid Id,
    string Title,
    string? Description,
    string? CoverImageUrl,
    Guid OwnerId,
    UserSummaryDto Owner,
    int AuthorCount,
    int DocumentCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ProjectSummaryDto(
    Guid Id,
    string Title,
    string? CoverImageUrl,
    int AuthorCount,
    int WordCount,
    DateTime UpdatedAt
);

public record CreateProjectRequest(
    string Title,
    string? Description
);

public record UpdateProjectRequest(
    string Title,
    string? Description,
    string? CoverImageUrl
);

public record ProjectAuthorDto(
    Guid UserId,
    UserSummaryDto User,
    ProjectRole Role,
    MemberPermissions Permissions,
    DateTime JoinedAt,
    int EditCount,
    int SuggestionCount
);

public record InviteAuthorRequest(
    string Email,
    ProjectRole Role
);

public record UpdateAuthorRoleRequest(
    ProjectRole Role,
    MemberPermissions? Permissions
);
