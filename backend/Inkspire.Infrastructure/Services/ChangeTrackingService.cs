using System.Text.Json;
using Inkspire.Core.DTOs;
using Inkspire.Core.Interfaces;

namespace Inkspire.Infrastructure.Services;

/// <summary>
/// Service for computing diffs and handling document changes.
/// Uses a simplified operation-based approach for TipTap JSON documents.
/// </summary>
public class ChangeTrackingService : IChangeTrackingService
{
    /// <summary>
    /// Computes the diff (operations) between two document versions.
    /// Returns a JSON document containing an array of operations.
    /// </summary>
    public Task<JsonDocument> ComputeDiffAsync(JsonDocument baseContent, JsonDocument newContent)
    {
        var operations = new List<object>();
        
        // Compute diff recursively
        ComputeDiffRecursive(
            baseContent.RootElement,
            newContent.RootElement,
            new List<int>(),
            operations
        );

        var json = JsonSerializer.Serialize(new { operations });
        return Task.FromResult(JsonDocument.Parse(json));
    }

    /// <summary>
    /// Applies operations to a base document to produce a new version.
    /// </summary>
    public Task<JsonDocument> ApplyOperationsAsync(JsonDocument baseContent, JsonDocument operations)
    {
        // For the MVP, we'll use a simple approach:
        // The operations document contains the "target" state we want to achieve.
        // In a full implementation, we would apply individual operations.
        
        // For now, if operations contain a "content" field, use that as the new content
        if (operations.RootElement.TryGetProperty("content", out var content))
        {
            return Task.FromResult(JsonDocument.Parse(content.GetRawText()));
        }

        // Otherwise, return the base content unchanged
        return Task.FromResult(JsonDocument.Parse(baseContent.RootElement.GetRawText()));
    }

    /// <summary>
    /// Detects conflicts between two sets of operations.
    /// </summary>
    public Task<ConflictAnalysis> DetectConflictsAsync(JsonDocument operations1, JsonDocument operations2)
    {
        // Simple conflict detection: check if both operations modify the same paths
        var paths1 = ExtractModifiedPaths(operations1);
        var paths2 = ExtractModifiedPaths(operations2);

        var conflictingPaths = paths1.Intersect(paths2).ToList();

        if (conflictingPaths.Count == 0)
        {
            return Task.FromResult(new ConflictAnalysis(false, Enumerable.Empty<ConflictDto>()));
        }

        var conflicts = conflictingPaths.Select(path => new ConflictDto(
            path,
            $"Both changes modify the same path: {path}",
            null, null, null
        ));

        return Task.FromResult(new ConflictAnalysis(true, conflicts));
    }

    /// <summary>
    /// Resolves conflicts using the specified resolution strategy.
    /// </summary>
    public Task<JsonDocument> ResolveConflictsAsync(
        JsonDocument baseContent,
        JsonDocument operations,
        ConflictResolution resolution)
    {
        return resolution switch
        {
            ConflictResolution.AcceptCurrent => Task.FromResult(
                JsonDocument.Parse(baseContent.RootElement.GetRawText())),
            ConflictResolution.AcceptProposed => ApplyOperationsAsync(baseContent, operations),
            ConflictResolution.AutoMerge => AutoMergeAsync(baseContent, operations),
            _ => throw new ArgumentOutOfRangeException(nameof(resolution))
        };
    }

    /// <summary>
    /// Performs a three-way merge of changes.
    /// </summary>
    public async Task<ThreeWayMergeResult> ThreeWayMergeAsync(
        JsonDocument baseVersion,
        JsonDocument acceptedVersion,
        JsonDocument pendingOperations)
    {
        // Compute what changed between base and accepted
        var acceptedOps = await ComputeDiffAsync(baseVersion, acceptedVersion);

        // Check for conflicts
        var conflicts = await DetectConflictsAsync(acceptedOps, pendingOperations);

        if (conflicts.HasConflicts)
        {
            return new ThreeWayMergeResult(false, null, conflicts.Conflicts);
        }

        // Apply pending operations to accepted version
        var mergedContent = await ApplyOperationsAsync(acceptedVersion, pendingOperations);

        return new ThreeWayMergeResult(true, mergedContent, null);
    }

    private void ComputeDiffRecursive(
        JsonElement baseNode,
        JsonElement newNode,
        List<int> path,
        List<object> operations)
    {
        // If nodes are equal, no operations needed
        if (JsonElementsEqual(baseNode, newNode))
            return;

        var pathString = "/" + string.Join("/", path);

        // If types are different, it's a replace operation
        if (baseNode.ValueKind != newNode.ValueKind)
        {
            operations.Add(new
            {
                type = "replace",
                path = pathString,
                oldValue = JsonSerializer.Deserialize<object>(baseNode.GetRawText()),
                newValue = JsonSerializer.Deserialize<object>(newNode.GetRawText())
            });
            return;
        }

        switch (baseNode.ValueKind)
        {
            case JsonValueKind.Object:
                CompareObjects(baseNode, newNode, path, operations);
                break;
            
            case JsonValueKind.Array:
                CompareArrays(baseNode, newNode, path, operations);
                break;
            
            default:
                // Primitive value changed
                operations.Add(new
                {
                    type = "update",
                    path = pathString,
                    oldValue = JsonSerializer.Deserialize<object>(baseNode.GetRawText()),
                    newValue = JsonSerializer.Deserialize<object>(newNode.GetRawText())
                });
                break;
        }
    }

    private void CompareObjects(
        JsonElement baseObj,
        JsonElement newObj,
        List<int> path,
        List<object> operations)
    {
        var baseProps = baseObj.EnumerateObject().ToDictionary(p => p.Name, p => p.Value);
        var newProps = newObj.EnumerateObject().ToDictionary(p => p.Name, p => p.Value);

        // Check for deleted properties
        foreach (var (name, value) in baseProps)
        {
            if (!newProps.ContainsKey(name))
            {
                operations.Add(new
                {
                    type = "delete",
                    path = "/" + string.Join("/", path) + "/" + name
                });
            }
        }

        // Check for added or modified properties
        foreach (var (name, value) in newProps)
        {
            if (!baseProps.ContainsKey(name))
            {
                operations.Add(new
                {
                    type = "insert",
                    path = "/" + string.Join("/", path) + "/" + name,
                    value = JsonSerializer.Deserialize<object>(value.GetRawText())
                });
            }
            else
            {
                // Recursively compare
                var childPath = new List<int>(path);
                ComputeDiffRecursive(baseProps[name], value, childPath, operations);
            }
        }
    }

    private void CompareArrays(
        JsonElement baseArr,
        JsonElement newArr,
        List<int> path,
        List<object> operations)
    {
        var baseItems = baseArr.EnumerateArray().ToList();
        var newItems = newArr.EnumerateArray().ToList();

        // Simple array comparison using LCS-like approach
        // For MVP, just note if the array changed
        if (baseItems.Count != newItems.Count)
        {
            operations.Add(new
            {
                type = "replaceArray",
                path = "/" + string.Join("/", path),
                oldLength = baseItems.Count,
                newLength = newItems.Count
            });
            return;
        }

        // Compare element by element
        for (int i = 0; i < baseItems.Count; i++)
        {
            var childPath = new List<int>(path) { i };
            ComputeDiffRecursive(baseItems[i], newItems[i], childPath, operations);
        }
    }

    private bool JsonElementsEqual(JsonElement a, JsonElement b)
    {
        return a.GetRawText() == b.GetRawText();
    }

    private HashSet<string> ExtractModifiedPaths(JsonDocument operations)
    {
        var paths = new HashSet<string>();

        if (operations.RootElement.TryGetProperty("operations", out var ops) &&
            ops.ValueKind == JsonValueKind.Array)
        {
            foreach (var op in ops.EnumerateArray())
            {
                if (op.TryGetProperty("path", out var pathElement))
                {
                    paths.Add(pathElement.GetString() ?? "/");
                }
            }
        }

        return paths;
    }

    private Task<JsonDocument> AutoMergeAsync(JsonDocument baseContent, JsonDocument operations)
    {
        // For MVP, just apply the operations
        return ApplyOperationsAsync(baseContent, operations);
    }
}
