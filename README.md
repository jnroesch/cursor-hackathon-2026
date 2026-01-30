# cursor-hackathon-2026

This will be awesome ... whatever it will be

## MCP Server Configuration

This repository includes pre-configured MCP (Model Context Protocol) servers for GitHub and Figma integration in Cursor. The configuration is stored in `.cursor/mcp.json` and will be automatically available to all users who clone this repository.

### Included MCP Servers

1. **GitHub MCP Server** - Enables AI-assisted interactions with GitHub repositories, issues, pull requests, and more.
2. **Figma MCP Server** - Provides design context from Figma files directly in your development workflow.

### Setup Instructions

Copy mcp.json.sample to mcp.json

```pwsh
cp mcp.json.sample mcp.json
```

#### GitHub MCP Server

1. Replace the github personal access token in mcp.json
2. Open Cursor with this repository
3. Go to **Settings** → **MCP** tab
4. Click **Connect** next to Github

#### Figma MCP Server

1. Open Cursor with this repository
2. Go to **Settings** → **MCP** tab
3. Click **Connect** next to Figma
4. Authorize via OAuth when prompted with your Figma account
