namespace Inkspire.Core.Enums;

/// <summary>
/// Flags defining specific permissions a project member can have.
/// </summary>
[Flags]
public enum MemberPermissions
{
    None = 0,
    
    /// <summary>
    /// Can view the document content.
    /// </summary>
    View = 1 << 0,

    /// <summary>
    /// Can add comments to proposals.
    /// </summary>
    Comment = 1 << 1,

    /// <summary>
    /// Can create and submit proposals.
    /// </summary>
    Suggest = 1 << 2,

    /// <summary>
    /// Can vote on proposals.
    /// </summary>
    Vote = 1 << 3,

    /// <summary>
    /// Can directly edit the draft.
    /// </summary>
    Edit = 1 << 4,

    /// <summary>
    /// Can delete content.
    /// </summary>
    Delete = 1 << 5,

    /// <summary>
    /// Can manage team members (invite, remove, change roles).
    /// </summary>
    ManageTeam = 1 << 6,

    /// <summary>
    /// Can manage project settings.
    /// </summary>
    ManageProject = 1 << 7,

    // Common permission sets
    ViewOnly = View,
    ViewAndComment = View | Comment,
    Contributor = View | Comment | Suggest,
    Editor = View | Comment | Suggest | Vote | Edit,
    CoAuthor = View | Comment | Suggest | Vote | Edit | Delete,
    FullAccess = View | Comment | Suggest | Vote | Edit | Delete | ManageTeam | ManageProject
}
