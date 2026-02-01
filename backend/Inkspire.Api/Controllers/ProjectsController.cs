using System.Security.Claims;
using Inkspire.Core.DTOs;
using Inkspire.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inkspire.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectSummaryDto>>> GetProjects()
    {
        var userId = GetCurrentUserId();
        var projects = await _projectService.GetUserProjectsAsync(userId);
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetProject(Guid id)
    {
        var project = await _projectService.GetProjectAsync(id);
        if (project == null)
            return NotFound();

        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectRequest request)
    {
        var userId = GetCurrentUserId();
        var project = await _projectService.CreateProjectAsync(userId, request);
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectDto>> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
    {
        try
        {
            var project = await _projectService.UpdateProjectAsync(id, request);
            return Ok(project);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProject(Guid id)
    {
        try
        {
            await _projectService.DeleteProjectAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/authors")]
    public async Task<ActionResult<IEnumerable<ProjectAuthorDto>>> GetAuthors(Guid id)
    {
        var authors = await _projectService.GetProjectAuthorsAsync(id);
        return Ok(authors);
    }

    [HttpPost("{id}/authors")]
    public async Task<ActionResult<ProjectAuthorDto>> InviteAuthor(Guid id, [FromBody] InviteAuthorRequest request)
    {
        try
        {
            var author = await _projectService.InviteAuthorAsync(id, request);
            return Ok(author);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}/authors/{userId}")]
    public async Task<ActionResult<ProjectAuthorDto>> UpdateAuthorRole(
        Guid id, 
        Guid userId, 
        [FromBody] UpdateAuthorRoleRequest request)
    {
        try
        {
            var author = await _projectService.UpdateAuthorRoleAsync(id, userId, request);
            return Ok(author);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}/authors/{userId}")]
    public async Task<ActionResult> RemoveAuthor(Guid id, Guid userId)
    {
        try
        {
            await _projectService.RemoveAuthorAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/leave")]
    public async Task<ActionResult> LeaveProject(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _projectService.LeaveProjectAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/delete-vote")]
    public async Task<ActionResult> VoteToDeleteProject(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _projectService.VoteToDeleteProjectAsync(id, userId);
            return Ok(new { message = result });
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
