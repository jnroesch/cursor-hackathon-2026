using Inkspire.Core.Enums;

namespace Inkspire.Core.DTOs;

public record ProjectDto(
    Guid Id,
    string Title,
    string? Description,
    string? CoverImageUrl,
    Guid OwnerId,
    UserSummaryDto Owner,
    int MemberCount,
    int DocumentCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ProjectSummaryDto(
    Guid Id,
    string Title,
    string? CoverImageUrl,
    int MemberCount,
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

public record ProjectMemberDto(
    Guid UserId,
    UserSummaryDto User,
    ProjectRole Role,
    MemberPermissions Permissions,
    DateTime JoinedAt,
    int EditCount,
    int SuggestionCount
);

public record InviteMemberRequest(
    string Email,
    ProjectRole Role
);

public record UpdateMemberRoleRequest(
    ProjectRole Role,
    MemberPermissions? Permissions
);
