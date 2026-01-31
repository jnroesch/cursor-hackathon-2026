using Inkspire.Core.DTOs;

namespace Inkspire.Core.Interfaces;

/// <summary>
/// Service for managing projects and their members.
/// </summary>
public interface IProjectService
{
    /// <summary>
    /// Gets all projects the user is a member of.
    /// </summary>
    Task<IEnumerable<ProjectSummaryDto>> GetUserProjectsAsync(Guid userId);

    /// <summary>
    /// Gets a project by ID with full details.
    /// </summary>
    Task<ProjectDto?> GetProjectAsync(Guid projectId);

    /// <summary>
    /// Creates a new project with the user as owner.
    /// </summary>
    Task<ProjectDto> CreateProjectAsync(Guid userId, CreateProjectRequest request);

    /// <summary>
    /// Updates a project's details.
    /// </summary>
    Task<ProjectDto> UpdateProjectAsync(Guid projectId, UpdateProjectRequest request);

    /// <summary>
    /// Deletes a project and all its contents.
    /// </summary>
    Task DeleteProjectAsync(Guid projectId);

    /// <summary>
    /// Gets all members of a project.
    /// </summary>
    Task<IEnumerable<ProjectMemberDto>> GetProjectMembersAsync(Guid projectId);

    /// <summary>
    /// Invites a user to join a project.
    /// </summary>
    Task<ProjectMemberDto> InviteMemberAsync(Guid projectId, InviteMemberRequest request);

    /// <summary>
    /// Updates a member's role and permissions.
    /// </summary>
    Task<ProjectMemberDto> UpdateMemberRoleAsync(Guid projectId, Guid userId, UpdateMemberRoleRequest request);

    /// <summary>
    /// Removes a member from a project.
    /// </summary>
    Task RemoveMemberAsync(Guid projectId, Guid userId);

    /// <summary>
    /// Checks if a user has the specified permission in a project.
    /// </summary>
    Task<bool> HasPermissionAsync(Guid projectId, Guid userId, Inkspire.Core.Enums.MemberPermissions permission);
}
