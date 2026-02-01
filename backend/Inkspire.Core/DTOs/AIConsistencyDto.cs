namespace Inkspire.Core.DTOs;

/// <summary>
/// Severity level for consistency issues
/// </summary>
public enum IssueSeverity
{
    Warning,
    Error
}

/// <summary>
/// Category of consistency issue
/// </summary>
public enum IssueCategory
{
    Character,
    World,
    Plot,
    Timeline,
    Style,
    Other
}

/// <summary>
/// Represents a single consistency issue found by the AI
/// </summary>
public record ConsistencyIssue(
    IssueSeverity Severity,
    IssueCategory Category,
    string Description,
    string? Suggestion,
    string? Location
);

/// <summary>
/// Result of an AI consistency check
/// </summary>
public record ConsistencyCheckResult(
    IEnumerable<ConsistencyIssue> Issues,
    string Summary,
    DateTime CheckedAt
);

/// <summary>
/// AI feedback stored with a proposal
/// </summary>
public record AIFeedbackDto(
    IEnumerable<ConsistencyIssue> Issues,
    string Summary,
    DateTime CheckedAt
);

/// <summary>
/// Request to check consistency of a draft
/// </summary>
public record ConsistencyCheckRequest(
    Guid DocumentId
);
