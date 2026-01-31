using Inkspire.Core.Enums;

namespace Inkspire.Core.Entities;

/// <summary>
/// Represents a user's membership in a project with their role and permissions.
/// </summary>
public class ProjectMember
{
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }

    /// <summary>
    /// The role of the user in this project.
    /// </summary>
    public ProjectRole Role { get; set; }

    /// <summary>
    /// Granular permissions for this member (can override role defaults).
    /// </summary>
    public MemberPermissions Permissions { get; set; }

    /// <summary>
    /// When the user joined this project.
    /// </summary>
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Project Project { get; set; } = null!;
    public User User { get; set; } = null!;
}
