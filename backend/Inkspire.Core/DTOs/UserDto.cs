namespace Inkspire.Core.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string UserName,
    string DisplayName,
    string? AvatarUrl,
    DateTime CreatedAt
);

public record UserSummaryDto(
    Guid Id,
    string DisplayName,
    string? AvatarUrl
);
