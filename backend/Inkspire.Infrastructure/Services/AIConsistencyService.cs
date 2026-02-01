using System.ClientModel;
using System.Text.Json;
using Inkspire.Core.DTOs;
using Inkspire.Core.Enums;
using Inkspire.Core.Interfaces;
using Inkspire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Chat;

namespace Inkspire.Infrastructure.Services;

public class AIConsistencyService : IAIConsistencyService
{
    private readonly InkspireDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AIConsistencyService> _logger;
    private readonly ChatClient? _chatClient;

    public AIConsistencyService(
        InkspireDbContext context,
        IConfiguration configuration,
        ILogger<AIConsistencyService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;

        var apiKey = _configuration["OpenAI:ApiKey"];
        var model = _configuration["OpenAI:Model"] ?? "gpt-4o";

        if (!string.IsNullOrEmpty(apiKey))
        {
            var client = new OpenAIClient(apiKey);
            _chatClient = client.GetChatClient(model);
        }
    }

    public async Task<ConsistencyCheckResult> CheckConsistencyAsync(
        Guid projectId,
        Guid documentId,
        JsonDocument? draftContent)
    {
        // If no OpenAI client configured, return empty result
        if (_chatClient == null)
        {
            _logger.LogWarning("OpenAI API key not configured. Skipping consistency check.");
            return new ConsistencyCheckResult(
                Enumerable.Empty<ConsistencyIssue>(),
                "AI consistency check is not configured.",
                DateTime.UtcNow);
        }

        try
        {
            // Fetch all project documents
            var documents = await _context.Documents
                .Where(d => d.ProjectId == projectId)
                .ToListAsync();

            // Separate notes and manuscripts
            var notes = documents.Where(d => d.DocumentType == DocumentType.Notes).ToList();
            var manuscripts = documents.Where(d => d.DocumentType == DocumentType.Manuscript && d.Id != documentId).ToList();
            var currentDocument = documents.FirstOrDefault(d => d.Id == documentId);

            // Extract text content from TipTap JSON
            var notesText = string.Join("\n\n---\n\n", notes.Select(n => 
                $"[{n.Title}]\n{ExtractTextFromTipTap(n.LiveContent)}"));
            
            var manuscriptsText = string.Join("\n\n---\n\n", manuscripts.Select(m => 
                $"[{m.Title}]\n{ExtractTextFromTipTap(m.LiveContent)}"));

            var currentLiveText = currentDocument != null 
                ? ExtractTextFromTipTap(currentDocument.LiveContent) 
                : "";

            var draftText = ExtractTextFromTipTap(draftContent);

            // Build the prompt
            var prompt = BuildConsistencyCheckPrompt(notesText, manuscriptsText, currentLiveText, draftText);

            // Call OpenAI API
            var maxTokens = int.Parse(_configuration["OpenAI:MaxTokens"] ?? "4096");
            
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(GetSystemPrompt()),
                new UserChatMessage(prompt)
            };

            var options = new ChatCompletionOptions
            {
                MaxOutputTokenCount = maxTokens,
                Temperature = 0.3f // Lower temperature for more consistent analysis
            };

            var response = await _chatClient.CompleteChatAsync(messages, options);
            var responseText = response.Value.Content[0].Text;

            // Parse the response
            return ParseAIResponse(responseText);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during AI consistency check");
            return new ConsistencyCheckResult(
                Enumerable.Empty<ConsistencyIssue>(),
                $"Error during consistency check: {ex.Message}",
                DateTime.UtcNow);
        }
    }

    private string GetSystemPrompt()
    {
        return @"You are an expert fiction editor specializing in maintaining consistency across collaborative storytelling projects. Your task is to analyze draft changes against existing content and notes to identify any inconsistencies.

You should check for:
1. **Character Consistency**: Names, physical descriptions, personality traits, abilities, relationships, and character arcs
2. **World Consistency**: Geography, rules of the world (magic systems, technology, etc.), organizations, cultures, and historical events
3. **Plot Consistency**: Story events, cause and effect, character motivations, and narrative logic
4. **Timeline Consistency**: Chronological order of events, character ages, time passed between events
5. **Style Consistency**: Tone, voice, and writing style that matches the existing content

For each issue found, provide:
- A severity level (Warning for minor issues, Error for significant contradictions)
- A category (Character, World, Plot, Timeline, Style, or Other)
- A clear description of the inconsistency
- A suggestion for how to resolve it
- The approximate location in the draft where the issue occurs (if applicable)

Respond in JSON format with the following structure:
{
  ""issues"": [
    {
      ""severity"": ""Warning"" or ""Error"",
      ""category"": ""Character"" | ""World"" | ""Plot"" | ""Timeline"" | ""Style"" | ""Other"",
      ""description"": ""Description of the issue"",
      ""suggestion"": ""How to fix it"",
      ""location"": ""Quote or description of where in the draft""
    }
  ],
  ""summary"": ""A brief overall summary of the consistency check results""
}

If no issues are found, return an empty issues array with a positive summary.";
    }

    private string BuildConsistencyCheckPrompt(string notesText, string manuscriptsText, string currentLiveText, string draftText)
    {
        var prompt = new System.Text.StringBuilder();

        prompt.AppendLine("# BACKGROUND NOTES (World-building, Characters, etc.)");
        prompt.AppendLine();
        if (string.IsNullOrWhiteSpace(notesText))
        {
            prompt.AppendLine("(No notes available)");
        }
        else
        {
            prompt.AppendLine(notesText);
        }
        prompt.AppendLine();

        prompt.AppendLine("# EXISTING MANUSCRIPT CONTENT (Other chapters/sections)");
        prompt.AppendLine();
        if (string.IsNullOrWhiteSpace(manuscriptsText))
        {
            prompt.AppendLine("(No other manuscript sections available)");
        }
        else
        {
            prompt.AppendLine(manuscriptsText);
        }
        prompt.AppendLine();

        prompt.AppendLine("# CURRENT PUBLISHED VERSION OF THIS SECTION");
        prompt.AppendLine();
        if (string.IsNullOrWhiteSpace(currentLiveText))
        {
            prompt.AppendLine("(This is a new section with no published content yet)");
        }
        else
        {
            prompt.AppendLine(currentLiveText);
        }
        prompt.AppendLine();

        prompt.AppendLine("# PROPOSED DRAFT CHANGES");
        prompt.AppendLine();
        if (string.IsNullOrWhiteSpace(draftText))
        {
            prompt.AppendLine("(Empty draft)");
        }
        else
        {
            prompt.AppendLine(draftText);
        }
        prompt.AppendLine();

        prompt.AppendLine("Please analyze the proposed draft changes for consistency issues compared to the background notes, existing manuscript content, and the current published version. Focus on identifying contradictions, inconsistencies, or potential plot holes.");

        return prompt.ToString();
    }

    private ConsistencyCheckResult ParseAIResponse(string responseText)
    {
        try
        {
            // Try to extract JSON from the response (in case there's extra text)
            var jsonStart = responseText.IndexOf('{');
            var jsonEnd = responseText.LastIndexOf('}');
            
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonText = responseText.Substring(jsonStart, jsonEnd - jsonStart + 1);
                var parsed = JsonSerializer.Deserialize<AIResponseJson>(jsonText, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (parsed != null)
                {
                    var issues = parsed.Issues?.Select(i => new ConsistencyIssue(
                        ParseSeverity(i.Severity),
                        ParseCategory(i.Category),
                        i.Description ?? "No description provided",
                        i.Suggestion,
                        i.Location
                    )) ?? Enumerable.Empty<ConsistencyIssue>();

                    return new ConsistencyCheckResult(
                        issues,
                        parsed.Summary ?? "Consistency check completed.",
                        DateTime.UtcNow);
                }
            }

            // If parsing fails, return the raw response as summary
            return new ConsistencyCheckResult(
                Enumerable.Empty<ConsistencyIssue>(),
                responseText,
                DateTime.UtcNow);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse AI response as JSON");
            return new ConsistencyCheckResult(
                Enumerable.Empty<ConsistencyIssue>(),
                $"Could not parse AI response: {responseText}",
                DateTime.UtcNow);
        }
    }

    private static IssueSeverity ParseSeverity(string? severity)
    {
        return severity?.ToLowerInvariant() switch
        {
            "error" => IssueSeverity.Error,
            _ => IssueSeverity.Warning
        };
    }

    private static IssueCategory ParseCategory(string? category)
    {
        return category?.ToLowerInvariant() switch
        {
            "character" => IssueCategory.Character,
            "world" => IssueCategory.World,
            "plot" => IssueCategory.Plot,
            "timeline" => IssueCategory.Timeline,
            "style" => IssueCategory.Style,
            _ => IssueCategory.Other
        };
    }

    private static string ExtractTextFromTipTap(JsonDocument? content)
    {
        if (content == null)
            return string.Empty;

        try
        {
            var text = new System.Text.StringBuilder();
            ExtractTextRecursive(content.RootElement, text);
            return text.ToString().Trim();
        }
        catch
        {
            return string.Empty;
        }
    }

    private static void ExtractTextRecursive(JsonElement element, System.Text.StringBuilder text)
    {
        if (element.ValueKind == JsonValueKind.Object)
        {
            // Check for text content
            if (element.TryGetProperty("text", out var textProp) && textProp.ValueKind == JsonValueKind.String)
            {
                text.Append(textProp.GetString());
            }

            // Check for type to add appropriate spacing
            if (element.TryGetProperty("type", out var typeProp) && typeProp.ValueKind == JsonValueKind.String)
            {
                var nodeType = typeProp.GetString();
                if (nodeType == "paragraph" || nodeType == "heading" || nodeType == "bulletList" || nodeType == "orderedList")
                {
                    if (text.Length > 0 && !text.ToString().EndsWith("\n"))
                    {
                        text.AppendLine();
                    }
                }
            }

            // Recurse into content array
            if (element.TryGetProperty("content", out var contentProp) && contentProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var child in contentProp.EnumerateArray())
                {
                    ExtractTextRecursive(child, text);
                }
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            foreach (var child in element.EnumerateArray())
            {
                ExtractTextRecursive(child, text);
            }
        }
    }

    // Helper class for JSON deserialization
    private class AIResponseJson
    {
        public List<AIIssueJson>? Issues { get; set; }
        public string? Summary { get; set; }
    }

    private class AIIssueJson
    {
        public string? Severity { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? Suggestion { get; set; }
        public string? Location { get; set; }
    }
}
