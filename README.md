# Inkspire

A collaborative writing platform where authors work together on books, articles, and other written content. Each author works on their own local "shadow copy" and submits changes for majority-vote approval.

## Tech Stack

### Backend
- **.NET 9** with ASP.NET Core Web API
- **Entity Framework Core** with PostgreSQL
- **ASP.NET Core Identity** for authentication

### Frontend
- **Angular 21** with standalone components
- **Nx** for workspace management
- **Tailwind CSS** with Scharf Design System

### Infrastructure
- **Docker** & **Docker Compose** for containerization
- **GitHub Actions** for CI/CD
- **Terraform** for infrastructure as code

## Design System

Inkspire uses the **Scharf Design System** - a high-contrast, minimalist design with:
- Editorial serif typography (Playfair Display)
- Clean sans-serif body text (Inter)
- Monochromatic palette (#F4F4F4 canvas, #0D0D0D panels)
- Hairline borders instead of shadows
- Sharp corners (0px border-radius)

## Quick Start

### Prerequisites
- .NET 9 SDK
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Local Development

1. **Start the database:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
   ```

2. **Run the backend:**
   ```bash
   cd backend
   dotnet run --project Inkspire.Api
   ```
   Backend runs at `https://localhost:7001`

3. **Run the frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend runs at `http://localhost:4200`

### Full Docker Setup

Run the entire stack:
```bash
docker-compose up --build
```

Access the application at `http://localhost`

## Project Structure

```
├── backend/
│   ├── Inkspire.Api/          # ASP.NET Core Web API
│   ├── Inkspire.Core/         # Domain entities, DTOs, interfaces
│   └── Inkspire.Infrastructure/ # EF Core, services, data access
├── frontend/
│   ├── src/app/
│   │   ├── core/              # Services, guards, interceptors
│   │   ├── features/          # Feature modules (auth, dashboard, etc.)
│   │   └── shared/            # Shared components
│   └── tailwind.config.js     # Tailwind with Scharf tokens
├── infrastructure/            # Terraform IaC
├── docker-compose.yml         # Full stack
└── docker-compose.dev.yml     # Development override
```

## Key Features

- **Shadow Copy System**: Each user has their own working copy of documents
- **Proposal Workflow**: Submit changes for community review
- **Majority Voting**: Changes accepted when majority approves
- **Conflict Detection**: Automatic detection and resolution of merge conflicts
- **Operation-Based Tracking**: Granular change tracking using JSON diff

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `GET /api/projects/{id}/members` - List project members

### Documents
- `GET /api/projects/{id}/documents` - List documents
- `POST /api/projects/{id}/documents` - Create document
- `GET /api/documents/{id}` - Get document
- `GET /api/documents/{id}/draft` - Get user's draft
- `PUT /api/documents/{id}/draft` - Save draft

### Proposals
- `GET /api/documents/{id}/proposals` - List proposals
- `POST /api/documents/{id}/proposals` - Submit proposal
- `POST /api/proposals/{id}/votes` - Cast vote
- `GET /api/proposals/{id}/votes/summary` - Get voting summary

## Environment Variables

### Backend
```env
ConnectionStrings__DefaultConnection=Host=localhost;Database=inkspire;Username=inkspire;Password=inkspire_dev
Jwt__Secret=your-256-bit-secret-key
Jwt__Issuer=Inkspire
Jwt__Audience=Inkspire
Jwt__ExpirationInDays=7
```

### Frontend
```env
API_URL=https://localhost:7001
```

## License

MIT License - See LICENSE file for details.
