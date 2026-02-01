using System.Text.Json;
using Inkspire.Core.DTOs;

namespace Inkspire.Core.Interfaces;

/// <summary>
/// Service for AI-powered consistency checking of book content
/// </summary>
public interface IAIConsistencyService
{
    /// <summary>
    /// Checks the consistency of draft content against existing project content and notes
    /// </summary>
    /// <param name="projectId">The project ID</param>
    /// <param name="documentId">The document being edited</param>
    /// <param name="draftContent">The draft content to check (TipTap JSON)</param>
    /// <returns>A consistency check result with any issues found</returns>
    Task<ConsistencyCheckResult> CheckConsistencyAsync(
        Guid projectId,
        Guid documentId,
        JsonDocument? draftContent);
}
