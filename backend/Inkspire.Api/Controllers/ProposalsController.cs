using System.Security.Claims;
using Inkspire.Core.DTOs;
using Inkspire.Core.Enums;
using Inkspire.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inkspire.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProposalsController : ControllerBase
{
    private readonly IProposalService _proposalService;
    private readonly IVotingService _votingService;
    private readonly ICommentService _commentService;

    public ProposalsController(
        IProposalService proposalService,
        IVotingService votingService,
        ICommentService commentService)
    {
        _proposalService = proposalService;
        _votingService = votingService;
        _commentService = commentService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProposalDto>> GetProposal(Guid id)
    {
        var proposal = await _proposalService.GetProposalAsync(id);
        if (proposal == null)
            return NotFound();

        return Ok(proposal);
    }

    [HttpGet("{id}/diff")]
    public async Task<ActionResult<ProposalDiffDto>> GetProposalDiff(Guid id)
    {
        try
        {
            var diff = await _proposalService.GetProposalDiffAsync(id);
            return Ok(diff);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/rebase")]
    public async Task<ActionResult<ProposalDto>> RebaseProposal(Guid id)
    {
        try
        {
            var proposal = await _proposalService.RebaseProposalAsync(id);
            return Ok(proposal);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // Voting endpoints
    [HttpGet("{id}/votes")]
    public async Task<ActionResult<IEnumerable<VoteDto>>> GetVotes(Guid id)
    {
        var votes = await _votingService.GetVotesAsync(id);
        return Ok(votes);
    }

    [HttpPost("{id}/votes")]
    public async Task<ActionResult<VoteDto>> CastVote(Guid id, [FromBody] CastVoteRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var vote = await _votingService.CastVoteAsync(id, userId, request);
            return Ok(vote);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/votes/summary")]
    public async Task<ActionResult<VotingSummaryDto>> GetVotingSummary(Guid id)
    {
        try
        {
            var summary = await _votingService.GetVotingSummaryAsync(id);
            return Ok(summary);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // Comment endpoints
    [HttpGet("{id}/comments")]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetComments(Guid id)
    {
        var comments = await _commentService.GetCommentsAsync(id);
        return Ok(comments);
    }

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<CommentDto>> AddComment(Guid id, [FromBody] CreateCommentRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var comment = await _commentService.AddCommentAsync(id, userId, request);
            return Ok(comment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("comments/{commentId}")]
    public async Task<ActionResult> DeleteComment(Guid commentId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _commentService.DeleteCommentAsync(commentId, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
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

// Document-scoped proposals
[ApiController]
[Route("api/documents/{documentId}/proposals")]
[Authorize]
public class DocumentProposalsController : ControllerBase
{
    private readonly IProposalService _proposalService;

    public DocumentProposalsController(IProposalService proposalService)
    {
        _proposalService = proposalService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProposalSummaryDto>>> GetProposals(
        Guid documentId, 
        [FromQuery] ProposalStatus? status = null)
    {
        var proposals = await _proposalService.GetProposalsAsync(documentId, status);
        return Ok(proposals);
    }

    [HttpPost]
    public async Task<ActionResult<ProposalDto>> CreateProposal(
        Guid documentId, 
        [FromBody] CreateProposalBodyRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var createRequest = new CreateProposalRequest(documentId, request.Description);
            var proposal = await _proposalService.CreateProposalAsync(userId, createRequest);
            return CreatedAtAction(
                nameof(ProposalsController.GetProposal),
                "Proposals",
                new { id = proposal.Id },
                proposal);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
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

public record CreateProposalBodyRequest(string? Description);
