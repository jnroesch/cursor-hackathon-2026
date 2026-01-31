using System.Security.Claims;
using Inkspire.Core.DTOs;
using Inkspire.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inkspire.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetDocument(Guid id)
    {
        var document = await _documentService.GetLiveDocumentAsync(id);
        if (document == null)
            return NotFound();

        return Ok(document);
    }

    [HttpGet("{id}/draft")]
    public async Task<ActionResult<UserDraftDto>> GetOrCreateDraft(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var draft = await _documentService.GetOrCreateUserDraftAsync(id, userId);
            return Ok(draft);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPut("{id}/draft")]
    public async Task<ActionResult<UserDraftDto>> SaveDraft(Guid id, [FromBody] SaveDraftRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existingDraft = await _documentService.GetOrCreateUserDraftAsync(id, userId);
            var draft = await _documentService.SaveDraftAsync(existingDraft.Id, request.Content);
            return Ok(draft);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<IEnumerable<DocumentVersionDto>>> GetVersionHistory(Guid id)
    {
        var history = await _documentService.GetVersionHistoryAsync(id);
        return Ok(history);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }
        return userId;
    }
}

// Separate controller for project-scoped document operations
[ApiController]
[Route("api/projects/{projectId}/documents")]
[Authorize]
public class ProjectDocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public ProjectDocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentSummaryDto>>> GetProjectDocuments(Guid projectId)
    {
        var documents = await _documentService.GetProjectDocumentsAsync(projectId);
        return Ok(documents);
    }

    [HttpPost]
    public async Task<ActionResult<DocumentDto>> CreateDocument(Guid projectId, [FromBody] CreateDocumentRequest request)
    {
        var document = await _documentService.CreateDocumentAsync(projectId, request);
        return CreatedAtAction(
            nameof(DocumentsController.GetDocument), 
            "Documents",
            new { id = document.Id }, 
            document);
    }
}
