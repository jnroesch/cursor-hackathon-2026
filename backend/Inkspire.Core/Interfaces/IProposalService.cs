using Inkspire.Core.DTOs;
using Inkspire.Core.Enums;

namespace Inkspire.Core.Interfaces;

/// <summary>
/// Service for managing change proposals.
/// </summary>
public interface IProposalService
{
    /// <summary>
    /// Creates a new proposal from a user's draft.
    /// </summary>
    Task<ProposalDto> CreateProposalAsync(Guid userId, CreateProposalRequest request);

    /// <summary>
    /// Gets proposals for a document, optionally filtered by status.
    /// </summary>
    Task<IEnumerable<ProposalSummaryDto>> GetProposalsAsync(Guid documentId, ProposalStatus? status = null);

    /// <summary>
    /// Gets a proposal by ID with full details.
    /// </summary>
    Task<ProposalDto?> GetProposalAsync(Guid proposalId);

    /// <summary>
    /// Gets the visual diff for a proposal.
    /// </summary>
    Task<ProposalDiffDto> GetProposalDiffAsync(Guid proposalId);

    /// <summary>
    /// Analyzes a proposal for conflicts with the current document version.
    /// </summary>
    Task<ConflictAnalysis> AnalyzeConflictsAsync(Guid proposalId);

    /// <summary>
    /// Attempts to merge an approved proposal into the live document.
    /// </summary>
    Task<MergeResult> TryMergeProposalAsync(Guid proposalId);

    /// <summary>
    /// Rebases a proposal onto the latest document version.
    /// </summary>
    Task<ProposalDto> RebaseProposalAsync(Guid proposalId);

    /// <summary>
    /// Gets pending proposals for a document.
    /// </summary>
    Task<IEnumerable<ProposalSummaryDto>> GetPendingProposalsAsync(Guid documentId);
}
