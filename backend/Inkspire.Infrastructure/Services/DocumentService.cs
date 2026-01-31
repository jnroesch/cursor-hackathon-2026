using System.Text.Json;
using Inkspire.Core.DTOs;
using Inkspire.Core.Entities;
using Inkspire.Core.Interfaces;
using Inkspire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Inkspire.Infrastructure.Services;

public class DocumentService : IDocumentService
{
    private readonly InkspireDbContext _context;

    public DocumentService(InkspireDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DocumentSummaryDto>> GetProjectDocumentsAsync(Guid projectId)
    {
        var documents = await _context.Documents
            .Where(d => d.ProjectId == projectId)
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync();

        return documents.Select(d => new DocumentSummaryDto(
            d.Id,
            d.DocumentType,
            d.Title,
            d.Version,
            d.WordCount,
            d.UpdatedAt
        ));
    }

    public async Task<DocumentDto?> GetLiveDocumentAsync(Guid documentId)
    {
        var document = await _context.Documents.FindAsync(documentId);
        if (document == null) return null;

        return new DocumentDto(
            document.Id,
            document.ProjectId,
            document.DocumentType,
            document.Title,
            document.LiveContent,
            document.Version,
            document.WordCount,
            document.CreatedAt,
            document.UpdatedAt
        );
    }

    public async Task<DocumentDto> CreateDocumentAsync(Guid projectId, CreateDocumentRequest request)
    {
        var document = new Document
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Title = request.Title,
            LiveContent = request.InitialContent,
            Version = 1,
            WordCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();

        return new DocumentDto(
            document.Id,
            document.ProjectId,
            document.DocumentType,
            document.Title,
            document.LiveContent,
            document.Version,
            document.WordCount,
            document.CreatedAt,
            document.UpdatedAt
        );
    }

    public async Task<DocumentDto> UpdateDocumentAsync(Guid documentId, UpdateDocumentRequest request)
    {
        var document = await _context.Documents.FindAsync(documentId);
        if (document == null)
            throw new InvalidOperationException("Document not found");

        document.Title = request.Title;
        document.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new DocumentDto(
            document.Id,
            document.ProjectId,
            document.DocumentType,
            document.Title,
            document.LiveContent,
            document.Version,
            document.WordCount,
            document.CreatedAt,
            document.UpdatedAt
        );
    }

    public async Task DeleteDocumentAsync(Guid documentId)
    {
        var document = await _context.Documents.FindAsync(documentId);
        if (document == null)
            throw new InvalidOperationException("Document not found");

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync();
    }

    public async Task<UserDraftDto> GetOrCreateUserDraftAsync(Guid documentId, Guid userId)
    {
        var draft = await _context.UserDrafts
            .FirstOrDefaultAsync(d => d.DocumentId == documentId && d.UserId == userId);

        if (draft == null)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null)
                throw new InvalidOperationException("Document not found");

            draft = new UserDraft
            {
                Id = Guid.NewGuid(),
                DocumentId = documentId,
                UserId = userId,
                BaseVersion = document.Version,
                DraftContent = document.LiveContent,
                LastEditedAt = DateTime.UtcNow
            };

            _context.UserDrafts.Add(draft);
            await _context.SaveChangesAsync();
        }

        return new UserDraftDto(
            draft.Id,
            draft.DocumentId,
            draft.UserId,
            draft.BaseVersion,
            draft.DraftContent,
            draft.LastEditedAt
        );
    }

    public async Task<UserDraftDto> SaveDraftAsync(Guid draftId, JsonDocument content)
    {
        var draft = await _context.UserDrafts.FindAsync(draftId);
        if (draft == null)
            throw new InvalidOperationException("Draft not found");

        draft.DraftContent = content;
        draft.LastEditedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new UserDraftDto(
            draft.Id,
            draft.DocumentId,
            draft.UserId,
            draft.BaseVersion,
            draft.DraftContent,
            draft.LastEditedAt
        );
    }

    public async Task<IEnumerable<DocumentVersionDto>> GetVersionHistoryAsync(Guid documentId)
    {
        // TODO: Implement proper version history tracking
        // For now, return the current version
        var document = await _context.Documents.FindAsync(documentId);
        if (document == null)
            return Enumerable.Empty<DocumentVersionDto>();

        return new List<DocumentVersionDto>
        {
            new DocumentVersionDto(
                document.Version,
                null,
                null,
                document.UpdatedAt,
                "Current version"
            )
        };
    }
}
