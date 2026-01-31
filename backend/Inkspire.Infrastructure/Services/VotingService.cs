using Inkspire.Core.DTOs;
using Inkspire.Core.Entities;
using Inkspire.Core.Enums;
using Inkspire.Core.Interfaces;
using Inkspire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Inkspire.Infrastructure.Services;

public class VotingService : IVotingService
{
    private readonly InkspireDbContext _context;
    private readonly IProposalService _proposalService;

    public VotingService(InkspireDbContext context, IProposalService proposalService)
    {
        _context = context;
        _proposalService = proposalService;
    }

    public async Task<VoteDto> CastVoteAsync(Guid proposalId, Guid userId, CastVoteRequest request)
    {
        var proposal = await _context.Proposals
            .Include(p => p.Document)
                .ThenInclude(d => d.Project)
            .FirstOrDefaultAsync(p => p.Id == proposalId);

        if (proposal == null)
            throw new InvalidOperationException("Proposal not found");

        if (proposal.Status != ProposalStatus.Pending)
            throw new InvalidOperationException("Proposal is not pending");

        // Check if user is a member with voting rights
        var membership = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == proposal.Document.ProjectId && pm.UserId == userId);

        if (membership == null || membership.Role == ProjectRole.Viewer)
            throw new InvalidOperationException("User does not have voting rights");

        // Find existing vote or create new one
        var vote = await _context.Votes
            .Include(v => v.Comments)
            .FirstOrDefaultAsync(v => v.ProposalId == proposalId && v.UserId == userId);

        if (vote == null)
        {
            vote = new Vote
            {
                Id = Guid.NewGuid(),
                ProposalId = proposalId,
                UserId = userId,
                VoteType = request.Vote,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Votes.Add(vote);
        }
        else
        {
            vote.VoteType = request.Vote;
            vote.UpdatedAt = DateTime.UtcNow;
        }

        // Add comment if provided
        if (!string.IsNullOrWhiteSpace(request.Comment))
        {
            var comment = new VoteComment
            {
                Id = Guid.NewGuid(),
                VoteId = vote.Id,
                Content = request.Comment,
                CreatedAt = DateTime.UtcNow
            };
            _context.VoteComments.Add(comment);
        }

        await _context.SaveChangesAsync();

        // Check if majority was reached
        await CheckMajorityReachedAsync(proposalId);

        var user = await _context.Users.FindAsync(userId);
        var comments = await _context.VoteComments
            .Where(vc => vc.VoteId == vote.Id)
            .OrderBy(vc => vc.CreatedAt)
            .ToListAsync();

        return new VoteDto(
            vote.Id,
            vote.ProposalId,
            vote.UserId,
            new UserSummaryDto(user!.Id, user.DisplayName, user.AvatarUrl),
            vote.VoteType,
            comments.Select(c => new VoteCommentDto(c.Id, c.Content, c.CreatedAt)),
            vote.CreatedAt,
            vote.UpdatedAt
        );
    }

    public async Task<IEnumerable<VoteDto>> GetVotesAsync(Guid proposalId)
    {
        var votes = await _context.Votes
            .Include(v => v.User)
            .Include(v => v.Comments)
            .Where(v => v.ProposalId == proposalId)
            .ToListAsync();

        return votes.Select(v => new VoteDto(
            v.Id,
            v.ProposalId,
            v.UserId,
            new UserSummaryDto(v.User.Id, v.User.DisplayName, v.User.AvatarUrl),
            v.VoteType,
            v.Comments.OrderBy(c => c.CreatedAt).Select(c => new VoteCommentDto(c.Id, c.Content, c.CreatedAt)),
            v.CreatedAt,
            v.UpdatedAt
        ));
    }

    public async Task<VotingSummaryDto> GetVotingSummaryAsync(Guid proposalId)
    {
        var proposal = await _context.Proposals
            .Include(p => p.Document)
                .ThenInclude(d => d.Project)
                    .ThenInclude(p => p.Members)
            .Include(p => p.Votes)
            .FirstOrDefaultAsync(p => p.Id == proposalId);

        if (proposal == null)
            throw new InvalidOperationException("Proposal not found");

        // Get eligible voters (non-viewers)
        var eligibleVoters = proposal.Document.Project.Members
            .Where(m => m.Role != ProjectRole.Viewer)
            .ToList();

        var approveCount = proposal.Votes.Count(v => v.VoteType == VoteType.Approve);
        var rejectCount = proposal.Votes.Count(v => v.VoteType == VoteType.Reject);
        var pendingCount = eligibleVoters.Count - approveCount - rejectCount;
        var threshold = (eligibleVoters.Count / 2) + 1;

        var majorityReached = approveCount >= threshold || rejectCount >= threshold;
        VoteType? majorityResult = null;
        if (approveCount >= threshold) majorityResult = VoteType.Approve;
        else if (rejectCount >= threshold) majorityResult = VoteType.Reject;

        return new VotingSummaryDto(
            proposalId,
            eligibleVoters.Count,
            approveCount,
            rejectCount,
            pendingCount,
            threshold,
            majorityReached,
            majorityResult
        );
    }

    public async Task<VoteCommentDto> AddVoteCommentAsync(Guid voteId, AddVoteCommentRequest request)
    {
        var vote = await _context.Votes.FindAsync(voteId);
        if (vote == null)
            throw new InvalidOperationException("Vote not found");

        var comment = new VoteComment
        {
            Id = Guid.NewGuid(),
            VoteId = voteId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.VoteComments.Add(comment);
        await _context.SaveChangesAsync();

        return new VoteCommentDto(comment.Id, comment.Content, comment.CreatedAt);
    }

    public async Task<bool> CheckMajorityReachedAsync(Guid proposalId)
    {
        var summary = await GetVotingSummaryAsync(proposalId);

        if (!summary.MajorityReached)
            return false;

        var proposal = await _context.Proposals.FindAsync(proposalId);
        if (proposal == null || proposal.Status != ProposalStatus.Pending)
            return false;

        if (summary.MajorityResult == VoteType.Approve)
        {
            // Try to merge
            var result = await _proposalService.TryMergeProposalAsync(proposalId);
            return result.Success;
        }
        else if (summary.MajorityResult == VoteType.Reject)
        {
            proposal.Status = ProposalStatus.Rejected;
            proposal.ResolvedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        return false;
    }
}
