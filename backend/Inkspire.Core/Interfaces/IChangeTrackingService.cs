using System.Text.Json;
using Inkspire.Core.DTOs;

namespace Inkspire.Core.Interfaces;

/// <summary>
/// Service for computing diffs and handling document changes.
/// </summary>
public interface IChangeTrackingService
{
    /// <summary>
    /// Computes the diff (operations) between two document versions.
    /// </summary>
    Task<JsonDocument> ComputeDiffAsync(JsonDocument baseContent, JsonDocument newContent);

    /// <summary>
    /// Applies operations to a base document to produce a new version.
    /// </summary>
    Task<JsonDocument> ApplyOperationsAsync(JsonDocument baseContent, JsonDocument operations);

    /// <summary>
    /// Detects conflicts between two sets of operations.
    /// </summary>
    Task<ConflictAnalysis> DetectConflictsAsync(JsonDocument operations1, JsonDocument operations2);

    /// <summary>
    /// Resolves conflicts using the specified resolution strategy.
    /// </summary>
    Task<JsonDocument> ResolveConflictsAsync(
        JsonDocument baseContent, 
        JsonDocument operations, 
        ConflictResolution resolution);

    /// <summary>
    /// Performs a three-way merge of changes.
    /// </summary>
    Task<ThreeWayMergeResult> ThreeWayMergeAsync(
        JsonDocument baseVersion,
        JsonDocument acceptedVersion,
        JsonDocument pendingOperations);
}

public enum ConflictResolution
{
    /// <summary>
    /// Accept the current (live) version for conflicts.
    /// </summary>
    AcceptCurrent,

    /// <summary>
    /// Accept the proposed changes for conflicts.
    /// </summary>
    AcceptProposed,

    /// <summary>
    /// Merge both when possible, fail on true conflicts.
    /// </summary>
    AutoMerge
}

public record ThreeWayMergeResult(
    bool Success,
    JsonDocument? MergedContent,
    IEnumerable<ConflictDto>? Conflicts
);
