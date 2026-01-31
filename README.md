# cursor-hackathon-2026

This will be awesome ... whatever it will be

# Cursor 2-Day AI Hackathon — Repo Template

![Cursor 2-Day AI Hackathon](https://ai-beavers.com/_next/image?url=%2Fimages%2Fhackathon-hero-20012026.png&w=1920&q=75)

---

# Project Name

> One-line description of your project

## Tech Stack

What technologies power your project?

<!-- List your main technologies, frameworks, and services -->

- **Frontend**: e.g., Next.js, React, Tailwind
- **Backend**: e.g., Node.js, Python, FastAPI
- **Database**: e.g., Supabase, Firebase, PostgreSQL
- **AI/ML**: e.g., OpenAI GPT-4, Gemini Pro
- **Hosting**: e.g., Vercel, Railway

## How to Run

Step-by-step instructions to run the project locally, including everything that needs to be set up.

TODO

## Details

Add anything else you want to share: architecture diagrams, screenshots, challenges faced, future plans, etc.

## MCP Server Configuration

This repository includes pre-configured MCP (Model Context Protocol) servers for GitHub and Figma integration in Cursor. The configuration is stored in `.cursor/mcp.json` and will be automatically available to all users who clone this repository.

### Included MCP Servers

1. **GitHub MCP Server** - Enables AI-assisted interactions with GitHub repositories, issues, pull requests, and more.
2. **Figma MCP Server** - Provides design context from Figma files directly in your development workflow.
3. **Miro MCP Server** - Generate diagrams on Miro boards and generate code from board content.

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

#### Miro MCP Server

1. Open Cursor with this repository
2. Go to **Settings** → **MCP** tab
3. Click **Connect** next to Miro
4. Authorize via OAuth and select the Miro team containing your boards

> **Note:** Enterprise Plan users must have Miro's MCP Server enabled by their admin first.
