using System.Text.Json;
using Inkspire.Core.DTOs;

namespace Inkspire.Core.Interfaces;

/// <summary>
/// Service for managing documents and user drafts.
/// </summary>
public interface IDocumentService
{
    /// <summary>
    /// Gets all documents in a project.
    /// </summary>
    Task<IEnumerable<DocumentSummaryDto>> GetProjectDocumentsAsync(Guid projectId);

    /// <summary>
    /// Gets the live document with its current content.
    /// </summary>
    Task<DocumentDto?> GetLiveDocumentAsync(Guid documentId);

    /// <summary>
    /// Creates a new document in a project.
    /// </summary>
    Task<DocumentDto> CreateDocumentAsync(Guid projectId, CreateDocumentRequest request);

    /// <summary>
    /// Updates a document's metadata (not content).
    /// </summary>
    Task<DocumentDto> UpdateDocumentAsync(Guid documentId, UpdateDocumentRequest request);

    /// <summary>
    /// Deletes a document and all its drafts/proposals.
    /// </summary>
    Task DeleteDocumentAsync(Guid documentId);

    /// <summary>
    /// Gets or creates the user's draft for a document.
    /// </summary>
    Task<UserDraftDto> GetOrCreateUserDraftAsync(Guid documentId, Guid userId);

    /// <summary>
    /// Saves the user's draft content.
    /// </summary>
    Task<UserDraftDto> SaveDraftAsync(Guid draftId, JsonDocument content);

    /// <summary>
    /// Gets the version history of a document.
    /// </summary>
    Task<IEnumerable<DocumentVersionDto>> GetVersionHistoryAsync(Guid documentId);
}

public record DocumentVersionDto(
    int Version,
    Guid? ProposalId,
    UserSummaryDto? MergedBy,
    DateTime MergedAt,
    string? Description
);
