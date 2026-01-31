using System.Text.Json;
using Inkspire.Core.DTOs;
using Inkspire.Core.Entities;
using Inkspire.Core.Enums;
using Inkspire.Core.Interfaces;
using Inkspire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Inkspire.Infrastructure.Services;

public class ProposalService : IProposalService
{
    private readonly InkspireDbContext _context;
    private readonly IChangeTrackingService _changeTrackingService;

    public ProposalService(InkspireDbContext context, IChangeTrackingService changeTrackingService)
    {
        _context = context;
        _changeTrackingService = changeTrackingService;
    }

    public async Task<ProposalDto> CreateProposalAsync(Guid userId, CreateProposalRequest request)
    {
        var draft = await _context.UserDrafts
            .Include(d => d.Document)
            .FirstOrDefaultAsync(d => d.DocumentId == request.DocumentId && d.UserId == userId);

        if (draft == null)
            throw new InvalidOperationException("Draft not found");

        var document = draft.Document;

        // Compute the diff between base version and draft
        JsonDocument? operations = null;
        if (document.LiveContent != null && draft.DraftContent != null)
        {
            operations = await _changeTrackingService.ComputeDiffAsync(
                document.LiveContent, 
                draft.DraftContent);
        }

        var proposal = new Proposal
        {
            Id = Guid.NewGuid(),
            DocumentId = request.DocumentId,
            AuthorId = userId,
            BaseVersion = draft.BaseVersion,
            Status = ProposalStatus.Pending,
            Operations = operations,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.Proposals.Add(proposal);
        await _context.SaveChangesAsync();

        var author = await _context.Users.FindAsync(userId);

        return new ProposalDto(
            proposal.Id,
            proposal.DocumentId,
            proposal.AuthorId,
            new UserSummaryDto(author!.Id, author.DisplayName, author.AvatarUrl),
            proposal.BaseVersion,
            proposal.Status,
            proposal.Operations,
            proposal.Description,
            0, 0, 0,
            proposal.CreatedAt,
            proposal.ResolvedAt
        );
    }

    public async Task<IEnumerable<ProposalSummaryDto>> GetProposalsAsync(Guid documentId, ProposalStatus? status = null)
    {
        var query = _context.Proposals
            .Include(p => p.Author)
            .Include(p => p.Votes)
            .Where(p => p.DocumentId == documentId);

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var proposals = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

        return proposals.Select(p => new ProposalSummaryDto(
            p.Id,
            new UserSummaryDto(p.Author.Id, p.Author.DisplayName, p.Author.AvatarUrl),
            p.Status,
            p.Description,
            p.Votes.Count(v => v.VoteType == VoteType.Approve),
            p.Votes.Count(v => v.VoteType == VoteType.Reject),
            p.CreatedAt
        ));
    }

    public async Task<ProposalDto?> GetProposalAsync(Guid proposalId)
    {
        var proposal = await _context.Proposals
            .Include(p => p.Author)
            .Include(p => p.Votes)
            .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == proposalId);

        if (proposal == null) return null;

        return new ProposalDto(
            proposal.Id,
            proposal.DocumentId,
            proposal.AuthorId,
            new UserSummaryDto(proposal.Author.Id, proposal.Author.DisplayName, proposal.Author.AvatarUrl),
            proposal.BaseVersion,
            proposal.Status,
            proposal.Operations,
            proposal.Description,
            proposal.Votes.Count(v => v.VoteType == VoteType.Approve),
            proposal.Votes.Count(v => v.VoteType == VoteType.Reject),
            proposal.Comments.Count,
            proposal.CreatedAt,
            proposal.ResolvedAt
        );
    }

    public async Task<ProposalDiffDto> GetProposalDiffAsync(Guid proposalId)
    {
        var proposal = await _context.Proposals
            .Include(p => p.Document)
            .FirstOrDefaultAsync(p => p.Id == proposalId);

        if (proposal == null)
            throw new InvalidOperationException("Proposal not found");

        var hasConflicts = proposal.BaseVersion < proposal.Document.Version;
        IEnumerable<ConflictDto>? conflicts = null;

        if (hasConflicts)
        {
            var analysis = await AnalyzeConflictsAsync(proposalId);
            conflicts = analysis.Conflicts;
        }

        return new ProposalDiffDto(
            proposal.Id,
            proposal.BaseVersion,
            proposal.Document.Version,
            proposal.Operations,
            hasConflicts,
            conflicts
        );
    }

    public async Task<ConflictAnalysis> AnalyzeConflictsAsync(Guid proposalId)
    {
        var proposal = await _context.Proposals
            .Include(p => p.Document)
            .FirstOrDefaultAsync(p => p.Id == proposalId);

        if (proposal == null)
            throw new InvalidOperationException("Proposal not found");

        // If base version matches current, no conflicts
        if (proposal.BaseVersion == proposal.Document.Version)
        {
            return new ConflictAnalysis(false, Enumerable.Empty<ConflictDto>());
        }

        // TODO: Implement proper conflict detection
        // For now, return a simple conflict indication
        return new ConflictAnalysis(
            true,
            new List<ConflictDto>
            {
                new ConflictDto(
                    "/",
                    "Document has been updated since this proposal was created",
                    null, null, null
                )
            }
        );
    }

    public async Task<MergeResult> TryMergeProposalAsync(Guid proposalId)
    {
        var proposal = await _context.Proposals
            .Include(p => p.Document)
            .FirstOrDefaultAsync(p => p.Id == proposalId);

        if (proposal == null)
            return new MergeResult(false, 0, "Proposal not found");

        if (proposal.Status != ProposalStatus.Pending)
            return new MergeResult(false, 0, "Proposal is not pending");

        // Check for conflicts
        if (proposal.BaseVersion < proposal.Document.Version)
        {
            proposal.Status = ProposalStatus.Conflicted;
            await _context.SaveChangesAsync();
            return new MergeResult(false, 0, "Proposal has conflicts and needs to be rebased");
        }

        // Apply the changes
        if (proposal.Operations != null && proposal.Document.LiveContent != null)
        {
            var newContent = await _changeTrackingService.ApplyOperationsAsync(
                proposal.Document.LiveContent,
                proposal.Operations
            );
            proposal.Document.LiveContent = newContent;
        }

        proposal.Document.Version++;
        proposal.Document.UpdatedAt = DateTime.UtcNow;
        proposal.Status = ProposalStatus.Accepted;
        proposal.ResolvedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new MergeResult(true, proposal.Document.Version, null);
    }

    public async Task<ProposalDto> RebaseProposalAsync(Guid proposalId)
    {
        var proposal = await _context.Proposals
            .Include(p => p.Author)
            .Include(p => p.Document)
            .FirstOrDefaultAsync(p => p.Id == proposalId);

        if (proposal == null)
            throw new InvalidOperationException("Proposal not found");

        // Update base version to current
        proposal.BaseVersion = proposal.Document.Version;
        proposal.Status = ProposalStatus.Pending;

        // TODO: Transform operations to work with new base version
        // For now, we'll just update the base version

        await _context.SaveChangesAsync();

        return new ProposalDto(
            proposal.Id,
            proposal.DocumentId,
            proposal.AuthorId,
            new UserSummaryDto(proposal.Author.Id, proposal.Author.DisplayName, proposal.Author.AvatarUrl),
            proposal.BaseVersion,
            proposal.Status,
            proposal.Operations,
            proposal.Description,
            0, 0, 0,
            proposal.CreatedAt,
            proposal.ResolvedAt
        );
    }

    public async Task<IEnumerable<ProposalSummaryDto>> GetPendingProposalsAsync(Guid documentId)
    {
        return await GetProposalsAsync(documentId, ProposalStatus.Pending);
    }
}
