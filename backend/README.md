# SurvivalIndex Backend API

Backend service for the SurvivalIndex.ai platform.

## API Endpoints

### Health Check
- `GET /health` - Check API health status

### Projects
- `GET /api/projects` - Get all projects (supports filtering and sorting)
  - Query params: `type`, `category`, `search`, `sortBy`
- `GET /api/projects/:id` - Get single project by ID
- `POST /api/projects` - Add new project
- `POST /api/projects/:id/rate` - Submit rating for a project

### Categories & Stats
- `GET /api/categories` - Get projects grouped by category
- `GET /api/stats` - Get platform statistics

## Local Development

```bash
cd backend
npm install
npm run dev
```

The API will run on `http://localhost:8080`

## Environment Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (production/development)

## Production Deployment

The backend is configured to run on DigitalOcean App Platform. See `.do/app.yaml` for deployment configuration.
