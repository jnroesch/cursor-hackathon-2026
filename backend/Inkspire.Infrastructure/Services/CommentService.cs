using Inkspire.Core.DTOs;
using Inkspire.Core.Entities;
using Inkspire.Core.Interfaces;
using Inkspire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Inkspire.Infrastructure.Services;

public class CommentService : ICommentService
{
    private readonly InkspireDbContext _context;

    public CommentService(InkspireDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CommentDto>> GetCommentsAsync(Guid proposalId)
    {
        var comments = await _context.Comments
            .Include(c => c.User)
            .Where(c => c.ProposalId == proposalId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        return comments.Select(c => new CommentDto(
            c.Id,
            c.ProposalId,
            c.UserId,
            new UserSummaryDto(c.User.Id, c.User.DisplayName, c.User.AvatarUrl),
            c.Content,
            c.CreatedAt
        ));
    }

    public async Task<CommentDto> AddCommentAsync(Guid proposalId, Guid userId, CreateCommentRequest request)
    {
        var proposal = await _context.Proposals.FindAsync(proposalId);
        if (proposal == null)
            throw new InvalidOperationException("Proposal not found");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new InvalidOperationException("User not found");

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            ProposalId = proposalId,
            UserId = userId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return new CommentDto(
            comment.Id,
            comment.ProposalId,
            comment.UserId,
            new UserSummaryDto(user.Id, user.DisplayName, user.AvatarUrl),
            comment.Content,
            comment.CreatedAt
        );
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _context.Comments.FindAsync(commentId);
        if (comment == null)
            throw new InvalidOperationException("Comment not found");

        if (comment.UserId != userId)
            throw new InvalidOperationException("Only the author can delete this comment");

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
    }
}
