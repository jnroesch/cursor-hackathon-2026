# Inkspire

A collaborative writing platform where authors work together on books, articles, and other written content. Each author works on their own local "shadow copy" and submits changes for majority-vote approval.

## Live Demo

**Production URL:** [https://inkspire-production-frontend.azurewebsites.net/](https://inkspire-production-frontend.azurewebsites.net/)

### Demo Credentials

You can register a new account or use this seeded demo account:

| Email                 | Password | Description                   |
| --------------------- | -------- | ----------------------------- |
| eleanor@inkspire.demo | Test123! | Author with multiple projects |

---

## Tech Stack

### Backend

| Technology            | Version | Purpose                               |
| --------------------- | ------- | ------------------------------------- |
| .NET                  | 9.0     | Runtime & SDK                         |
| ASP.NET Core          | 9.0     | Web API framework                     |
| Entity Framework Core | 9.0     | ORM & database migrations             |
| ASP.NET Core Identity | 9.0     | User authentication & authorization   |
| PostgreSQL            | 16      | Primary database                      |
| OpenAI API            | GPT-4o  | AI consistency checking for proposals |

### Frontend

| Technology   | Version | Purpose                              |
| ------------ | ------- | ------------------------------------ |
| Angular      | 21.1    | Frontend framework                   |
| Nx           | 22.4    | Monorepo workspace management        |
| TypeScript   | 5.9     | Type-safe JavaScript                 |
| Tailwind CSS | 3.4     | Utility-first CSS framework          |
| TipTap       | 3.18    | Rich text editor (ProseMirror-based) |
| RxJS         | 7.8     | Reactive programming                 |

### Infrastructure & DevOps

| Technology        | Version         | Purpose                       |
| ----------------- | --------------- | ----------------------------- |
| Docker            | Latest          | Containerization              |
| Docker Compose    | Latest          | Multi-container orchestration |
| GitHub Actions    | -               | CI/CD pipelines               |
| Terraform         | >= 1.6          | Infrastructure as Code        |
| Azure App Service | -               | Production hosting            |
| Azure PostgreSQL  | Flexible Server | Managed database              |
| GHCR              | -               | Container registry            |

### Design System

Inkspire uses the **Scharf Design System** - a high-contrast, minimalist design with:

- Editorial serif typography (Playfair Display)
- Clean sans-serif body text (Inter)
- Monochromatic palette (#F4F4F4 canvas, #0D0D0D panels)
- Hairline borders instead of shadows
- Sharp corners (0px border-radius)

---

## Pages & Features Status

### Fully Functional Pages

| Page                   | Route                                      | Description                                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| **Login**              | `/auth/login`                              | User authentication with JWT tokens                                 |
| **Register**           | `/auth/register`                           | New user registration                                               |
| **Forgot Password**    | `/auth/forgot-password`                    | Password reset request (UI only)                                    |
| **Dashboard**          | `/dashboard`                               | View all projects, create new projects                              |
| **Project View**       | `/project/:id`                             | Project management with tabs (Manuscript, Notes, Review, Configure) |
| **Editor**             | `/editor/:documentId`                      | Full-featured TipTap rich text editor with formatting toolbar       |
| **Proposal Diff View** | `/editor/:documentId/proposal/:proposalId` | View proposed changes with inline diff highlighting                 |

### Key Functional Features

- **Shadow Copy System**: Each user maintains their own draft of documents
- **Proposal Workflow**: Submit changes with optional description
- **AI Consistency Checking**: GPT-4o analyzes proposals for character, plot, timeline, and style consistency
- **Majority Voting**: Team members vote to approve/reject proposals
- **Real-time Diff**: Visual comparison of proposed vs. live content
- **Team Management**: Invite members, manage roles, leave projects
- **Document Management**: Create chapters and notes within projects
- **Auto-save**: Drafts automatically save every 30 seconds

### Decorative/Placeholder Pages

| Page            | Route          | Description                                                    |
| --------------- | -------------- | -------------------------------------------------------------- |
| **Marketplace** | `/marketplace` | Book marketplace UI with mock data - no backend integration    |
| **Pitches**     | `/pitches`     | Project pitch board UI with mock data - no backend integration |
| **Profile**     | `/profile`     | User profile management (display name, roles, bio)             |

These pages showcase the design system and planned future features but do not connect to any backend APIs. All data displayed is hardcoded mock data.

---

## Local Development Setup

### Prerequisites

- .NET 9 SDK
- Node.js 22+ and npm
- Docker & Docker Compose
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/cursor-hackathon-2026.git
cd cursor-hackathon-2026
```

### Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` to configure:

```env
# OpenAI API Key (optional - for AI consistency checking)
# Get yours from: https://platform.openai.com/api-keys
# Leave empty to disable AI features (app will still work)
OpenAI__ApiKey=sk-your-api-key-here
```

### Step 3: Start the Database

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

The backend API will be available at `https://localhost:5000`

The frontend will be available at `http://localhost:4200`

### Step 6: Seed Demo Data (Optional)

To populate the database with sample users and projects:

```powershell
# PowerShell (Windows)
.\scripts\seed-demo-data.ps1
```

### Full Docker Setup (Alternative)

Run the entire stack with Docker:

```bash
docker-compose up --build
```

Access the application at `http://localhost`

---

## Project Structure

```
├── backend/
│   ├── Inkspire.Api/              # ASP.NET Core Web API
│   │   ├── Controllers/           # API endpoints
│   │   └── Program.cs             # App configuration
│   ├── Inkspire.Core/             # Domain layer
│   │   ├── Entities/              # Database entities
│   │   ├── DTOs/                  # Data transfer objects
│   │   ├── Enums/                 # Enumerations
│   │   └── Interfaces/            # Service interfaces
│   └── Inkspire.Infrastructure/   # Data access layer
│       ├── Data/                  # DbContext & migrations
│       └── Services/              # Business logic
├── frontend/
│   ├── src/app/
│   │   ├── core/                  # Services, guards, interceptors, models
│   │   ├── features/              # Feature modules
│   │   │   ├── auth/              # Login, register, password reset
│   │   │   ├── dashboard/         # Project list
│   │   │   ├── editor/            # Document editor
│   │   │   ├── marketplace/       # Book marketplace (decorative)
│   │   │   ├── pitches/           # Pitch board (decorative)
│   │   │   ├── profile/           # User profile
│   │   │   └── project/           # Project management
│   │   └── shared/                # Shared components
│   └── tailwind.config.js         # Tailwind with Scharf tokens
├── infrastructure/                # Terraform IaC for Azure
├── scripts/                       # Utility scripts
├── docker-compose.yml             # Production Docker setup
└── docker-compose.dev.yml         # Development Docker overrides
```

---

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Projects

- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `GET /api/projects/{id}/members` - List project members
- `POST /api/projects/{id}/members` - Invite member
- `DELETE /api/projects/{id}/members/{userId}` - Remove member
- `POST /api/projects/{id}/leave` - Leave project
- `POST /api/projects/{id}/vote-delete` - Vote to delete project

### Documents

- `GET /api/projects/{id}/documents` - List documents
- `POST /api/projects/{id}/documents` - Create document
- `GET /api/documents/{id}` - Get document
- `GET /api/documents/{id}/draft` - Get user's draft
- `PUT /api/documents/{id}/draft` - Save draft
- `POST /api/documents/{id}/consistency-check` - Run AI consistency check

### Proposals

- `GET /api/documents/{id}/proposals` - List proposals
- `POST /api/documents/{id}/proposals` - Submit proposal
- `GET /api/proposals/{id}` - Get proposal details
- `POST /api/proposals/{id}/votes` - Cast vote
- `GET /api/proposals/{id}/votes/summary` - Get voting summary

---
