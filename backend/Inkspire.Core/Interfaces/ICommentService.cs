using Inkspire.Core.DTOs;

namespace Inkspire.Core.Interfaces;

/// <summary>
/// Service for managing comments on proposals.
/// </summary>
public interface ICommentService
{
    /// <summary>
    /// Gets all comments for a proposal.
    /// </summary>
    Task<IEnumerable<CommentDto>> GetCommentsAsync(Guid proposalId);

    /// <summary>
    /// Adds a comment to a proposal.
    /// </summary>
    Task<CommentDto> AddCommentAsync(Guid proposalId, Guid userId, CreateCommentRequest request);

    /// <summary>
    /// Deletes a comment (only by the author).
    /// </summary>
    Task DeleteCommentAsync(Guid commentId, Guid userId);
}
