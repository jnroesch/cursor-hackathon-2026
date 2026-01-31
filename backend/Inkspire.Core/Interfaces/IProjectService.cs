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
    /// Gets all authors of a project.
    /// </summary>
    Task<IEnumerable<ProjectAuthorDto>> GetProjectAuthorsAsync(Guid projectId);

    /// <summary>
    /// Invites a user to join a project as an author.
    /// </summary>
    Task<ProjectAuthorDto> InviteAuthorAsync(Guid projectId, InviteAuthorRequest request);

    /// <summary>
    /// Updates an author's role and permissions.
    /// </summary>
    Task<ProjectAuthorDto> UpdateAuthorRoleAsync(Guid projectId, Guid userId, UpdateAuthorRoleRequest request);

    /// <summary>
    /// Removes an author from a project.
    /// </summary>
    Task RemoveAuthorAsync(Guid projectId, Guid userId);

    /// <summary>
    /// Checks if a user has the specified permission in a project.
    /// </summary>
    Task<bool> HasPermissionAsync(Guid projectId, Guid userId, Inkspire.Core.Enums.MemberPermissions permission);
}
