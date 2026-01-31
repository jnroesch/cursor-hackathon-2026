using Inkspire.Core.DTOs;
using Inkspire.Core.Entities;
using Inkspire.Core.Enums;
using Inkspire.Core.Interfaces;
using Inkspire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Inkspire.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly InkspireDbContext _context;

    public ProjectService(InkspireDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProjectSummaryDto>> GetUserProjectsAsync(Guid userId)
    {
        var projects = await _context.ProjectMembers
            .Where(pm => pm.UserId == userId)
            .Include(pm => pm.Project)
                .ThenInclude(p => p.Documents)
            .Include(pm => pm.Project)
                .ThenInclude(p => p.Members)
            .Select(pm => pm.Project)
            .ToListAsync();

        return projects.Select(p => new ProjectSummaryDto(
            p.Id,
            p.Title,
            p.CoverImageUrl,
            p.Members.Count,
            p.Documents.Sum(d => d.WordCount),
            p.UpdatedAt
        ));
    }

    public async Task<ProjectDto?> GetProjectAsync(Guid projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return null;

        return new ProjectDto(
            project.Id,
            project.Title,
            project.Description,
            project.CoverImageUrl,
            project.OwnerId,
            new UserSummaryDto(project.Owner.Id, project.Owner.DisplayName, project.Owner.AvatarUrl),
            project.Members.Count,
            project.Documents.Count,
            project.CreatedAt,
            project.UpdatedAt
        );
    }

    public async Task<ProjectDto> CreateProjectAsync(Guid userId, CreateProjectRequest request)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            OwnerId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Add owner as a member
        var ownerMember = new ProjectMember
        {
            ProjectId = project.Id,
            UserId = userId,
            Role = ProjectRole.Owner,
            Permissions = MemberPermissions.FullAccess,
            JoinedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        _context.ProjectMembers.Add(ownerMember);
        await _context.SaveChangesAsync();

        var owner = await _context.Users.FindAsync(userId);
        
        return new ProjectDto(
            project.Id,
            project.Title,
            project.Description,
            project.CoverImageUrl,
            project.OwnerId,
            new UserSummaryDto(owner!.Id, owner.DisplayName, owner.AvatarUrl),
            1,
            0,
            project.CreatedAt,
            project.UpdatedAt
        );
    }

    public async Task<ProjectDto> UpdateProjectAsync(Guid projectId, UpdateProjectRequest request)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new InvalidOperationException("Project not found");

        project.Title = request.Title;
        project.Description = request.Description;
        project.CoverImageUrl = request.CoverImageUrl;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProjectDto(
            project.Id,
            project.Title,
            project.Description,
            project.CoverImageUrl,
            project.OwnerId,
            new UserSummaryDto(project.Owner.Id, project.Owner.DisplayName, project.Owner.AvatarUrl),
            project.Members.Count,
            project.Documents.Count,
            project.CreatedAt,
            project.UpdatedAt
        );
    }

    public async Task DeleteProjectAsync(Guid projectId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            throw new InvalidOperationException("Project not found");

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<ProjectAuthorDto>> GetProjectAuthorsAsync(Guid projectId)
    {
        var members = await _context.ProjectMembers
            .Where(pm => pm.ProjectId == projectId)
            .Include(pm => pm.User)
            .ToListAsync();

        // TODO: Calculate actual edit and suggestion counts
        return members.Select(pm => new ProjectAuthorDto(
            pm.UserId,
            new UserSummaryDto(pm.User.Id, pm.User.DisplayName, pm.User.AvatarUrl),
            pm.Role,
            pm.Permissions,
            pm.JoinedAt,
            0, // EditCount - TODO
            0  // SuggestionCount - TODO
        ));
    }

    public async Task<ProjectAuthorDto> InviteAuthorAsync(Guid projectId, InviteAuthorRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
            throw new InvalidOperationException("User not found");

        var existingMember = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == user.Id);
        if (existingMember != null)
            throw new InvalidOperationException("User is already an author");

        var permissions = request.Role switch
        {
            ProjectRole.Owner => MemberPermissions.FullAccess,
            ProjectRole.CoAuthor => MemberPermissions.CoAuthor,
            ProjectRole.Editor => MemberPermissions.Editor,
            ProjectRole.Contributor => MemberPermissions.Contributor,
            ProjectRole.Viewer => MemberPermissions.ViewOnly,
            _ => MemberPermissions.ViewOnly
        };

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = user.Id,
            Role = request.Role,
            Permissions = permissions,
            JoinedAt = DateTime.UtcNow
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        return new ProjectAuthorDto(
            user.Id,
            new UserSummaryDto(user.Id, user.DisplayName, user.AvatarUrl),
            member.Role,
            member.Permissions,
            member.JoinedAt,
            0,
            0
        );
    }

    public async Task<ProjectAuthorDto> UpdateAuthorRoleAsync(Guid projectId, Guid userId, UpdateAuthorRoleRequest request)
    {
        var member = await _context.ProjectMembers
            .Include(pm => pm.User)
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

        if (member == null)
            throw new InvalidOperationException("Author not found");

        member.Role = request.Role;
        if (request.Permissions.HasValue)
        {
            member.Permissions = request.Permissions.Value;
        }

        await _context.SaveChangesAsync();

        return new ProjectAuthorDto(
            member.UserId,
            new UserSummaryDto(member.User.Id, member.User.DisplayName, member.User.AvatarUrl),
            member.Role,
            member.Permissions,
            member.JoinedAt,
            0,
            0
        );
    }

    public async Task RemoveAuthorAsync(Guid projectId, Guid userId)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

        if (member == null)
            throw new InvalidOperationException("Author not found");

        if (member.Role == ProjectRole.Owner)
            throw new InvalidOperationException("Cannot remove the project owner");

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HasPermissionAsync(Guid projectId, Guid userId, MemberPermissions permission)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

        if (member == null) return false;

        return (member.Permissions & permission) == permission;
    }
}
