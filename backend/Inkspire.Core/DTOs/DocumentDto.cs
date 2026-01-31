using System.Text.Json;

namespace Inkspire.Core.DTOs;

public record DocumentDto(
    Guid Id,
    Guid ProjectId,
    string Title,
    JsonDocument? LiveContent,
    int Version,
    int WordCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record DocumentSummaryDto(
    Guid Id,
    string Title,
    int Version,
    int WordCount,
    DateTime UpdatedAt
);

public record CreateDocumentRequest(
    string Title,
    JsonDocument? InitialContent
);

public record UpdateDocumentRequest(
    string Title
);

public record UserDraftDto(
    Guid Id,
    Guid DocumentId,
    Guid UserId,
    int BaseVersion,
    JsonDocument? DraftContent,
    DateTime LastEditedAt
);

public record SaveDraftRequest(
    JsonDocument Content
);
