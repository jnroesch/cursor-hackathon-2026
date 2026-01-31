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

    [HttpGet("{id}/members")]
    public async Task<ActionResult<IEnumerable<ProjectMemberDto>>> GetMembers(Guid id)
    {
        var members = await _projectService.GetProjectMembersAsync(id);
        return Ok(members);
    }

    [HttpPost("{id}/members")]
    public async Task<ActionResult<ProjectMemberDto>> InviteMember(Guid id, [FromBody] InviteMemberRequest request)
    {
        try
        {
            var member = await _projectService.InviteMemberAsync(id, request);
            return Ok(member);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}/members/{userId}")]
    public async Task<ActionResult<ProjectMemberDto>> UpdateMemberRole(
        Guid id, 
        Guid userId, 
        [FromBody] UpdateMemberRoleRequest request)
    {
        try
        {
            var member = await _projectService.UpdateMemberRoleAsync(id, userId, request);
            return Ok(member);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}/members/{userId}")]
    public async Task<ActionResult> RemoveMember(Guid id, Guid userId)
    {
        try
        {
            await _projectService.RemoveMemberAsync(id, userId);
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
