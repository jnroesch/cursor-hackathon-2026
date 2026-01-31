namespace Inkspire.Core.Enums;

/// <summary>
/// Defines the roles a user can have within a project.
/// </summary>
public enum ProjectRole
{
    /// <summary>
    /// Full control over the project, can delete it and manage all members.
    /// </summary>
    Owner = 0,

    /// <summary>
    /// Can edit content, create proposals, vote, and invite contributors.
    /// </summary>
    CoAuthor = 1,

    /// <summary>
    /// Can edit content, create proposals, vote, and suggest changes.
    /// </summary>
    Editor = 2,

    /// <summary>
    /// Can view content, comment, and suggest changes but cannot edit directly.
    /// </summary>
    Contributor = 3,

    /// <summary>
    /// Read-only access to the project. Cannot vote or suggest.
    /// </summary>
    Viewer = 4
}
