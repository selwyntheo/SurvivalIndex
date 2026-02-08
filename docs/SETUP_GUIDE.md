# SurvivalIndex Setup Guide - AI Judge Agent

This guide will help you set up and use the **AI Judge agent** to automatically score projects.

## ✅ Quick Setup Checklist

### 1. Install Dependencies
```bash
# From project root
npm install
```

### 2. Configure Backend

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/survivalindex?schema=public"
ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY_HERE"
GITHUB_TOKEN="ghp_YOUR_TOKEN_HERE"  # Optional but recommended
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### 3. Setup Database

```bash
# From apps/backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

You should see:
```
✅ Projects seeded successfully
📊 Seeding Summary:
   Total Projects: 33
   - Open Source: 26
   - SaaS: 7
```

### 4. Start Everything

```bash
# From project root
npm run dev
```

Or separately:
```bash
# Terminal 1
npm run dev:frontend  # → http://localhost:5173

# Terminal 2
npm run dev:backend   # → http://localhost:3001
```

## 🤖 Using the AI Judge

### Test the API

```bash
# Health check
curl http://localhost:3001/api/health

# Get all projects
curl http://localhost:3001/api/projects

# Evaluate PostgreSQL (project ID 1)
curl -X POST http://localhost:3001/api/ai-judge/evaluate/1
```

### Batch Evaluate Projects

```bash
# Evaluate first 5 projects
curl -X POST http://localhost:3001/api/ai-judge/batch-evaluate \
  -H "Content-Type: application/json" \
  -d '{"projectIds": [1, 2, 3, 4, 5]}'
```

**Expected output:**
```json
{
  "successful": [
    {
      "project": { "id": 1, "name": "PostgreSQL", ... },
      "aiRating": {
        "survivalScore": 9.15,
        "tier": "S",
        "confidence": 0.92,
        "reasoning": { ... }
      }
    },
    ...
  ],
  "failed": [],
  "stats": {
    "total": 5,
    "successful": 5,
    "failed": 0
  }
}
```

### Re-evaluate Stale Projects

```bash
# Re-evaluate projects not analyzed in last 30 days
curl -X POST http://localhost:3001/api/ai-judge/reevaluate-stale?daysOld=30
```

## 📊 Understanding AI Judge Scores

The AI Judge evaluates projects on 6 levers (0-10 scale):

| Lever | Weight | Description |
|-------|--------|-------------|
| Insight Compression | 20% | Crystallized knowledge density |
| Substrate Efficiency | 18% | CPU vs GPU efficiency |
| Broad Utility | 22% | Cross-domain applicability |
| Awareness | 15% | Discoverability & mindshare |
| Agent Friction | 15% | AI agent usability (lower = better score) |
| Human Coefficient | 10% | Human preference factor |

**Survival Score** = Weighted average of the 6 levers

**Tiers:**
- S (9.0+): Immortal
- A (8.0-8.9): Enduring
- B (7.0-7.9): Resilient
- C (6.0-6.9): Vulnerable
- D (5.0-5.9): At Risk
- F (<5.0): Endangered

## 🔗 Frontend Integration

### Option 1: Modify Existing Frontend

The current frontend (`apps/frontend/src/App.jsx`) uses hardcoded data. To integrate with the backend:

**1. Create API client** (`apps/frontend/src/api/client.js`):
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  // Projects
  async getProjects(filters = {}) {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/projects?${params}`);
    return res.json();
  },

  async getProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return res.json();
  },

  async getLeaderboard(limit = 100) {
    const res = await fetch(`${API_BASE}/projects/leaderboard?limit=${limit}`);
    return res.json();
  },

  // AI Judge
  async evaluateProject(projectId) {
    const res = await fetch(`${API_BASE}/ai-judge/evaluate/${projectId}`, {
      method: 'POST'
    });
    return res.json();
  },

  async batchEvaluate(projectIds) {
    const res = await fetch(`${API_BASE}/ai-judge/batch-evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectIds })
    });
    return res.json();
  },

  // User Ratings
  async submitRating(rating) {
    const res = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rating)
    });
    return res.json();
  },

  async getUserRatings(projectId) {
    const res = await fetch(`${API_BASE}/ratings/${projectId}`);
    return res.json();
  },

  async getAverageRating(projectId) {
    const res = await fetch(`${API_BASE}/ratings/${projectId}/average`);
    return res.json();
  }
};
```

**2. Update App.jsx** to fetch from API:
```javascript
import { useEffect, useState } from 'react';
import { api } from './api/client';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await api.getLeaderboard();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  // ... rest of component
}
```

**3. Display AI Scores**:
```javascript
function ProjectCard({ project }) {
  const { aiRating, userRatings } = project;

  return (
    <div className="project-card">
      <h3>{project.name}</h3>

      {/* AI Judge Score */}
      {aiRating && (
        <div className="ai-score">
          <div className="score-badge">
            🤖 AI Score: {aiRating.survivalScore}
            <span className="tier">{aiRating.tier}-Tier</span>
          </div>
          <div className="confidence">
            Confidence: {(aiRating.confidence * 100).toFixed(0)}%
          </div>

          {/* AI Reasoning */}
          <details>
            <summary>View AI Reasoning</summary>
            <div className="reasoning">
              {Object.entries(aiRating.reasoning).map(([lever, reason]) => (
                <div key={lever}>
                  <strong>{lever}:</strong> {reason}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Community Rating Average */}
      {userRatings && userRatings.length > 0 && (
        <div className="community-score">
          👥 Community: {calculateAverage(userRatings).toFixed(1)}
          <span>({userRatings.length} ratings)</span>
        </div>
      )}

      {/* Trigger AI Re-evaluation */}
      <button onClick={() => handleEvaluate(project.id)}>
        ⚡ Re-evaluate with AI
      </button>
    </div>
  );
}

async function handleEvaluate(projectId) {
  try {
    const result = await api.evaluateProject(projectId);
    console.log('AI Evaluation:', result);
    // Refresh project data
    loadProjects();
  } catch (error) {
    console.error('Evaluation failed:', error);
  }
}
```

### Option 2: Use Existing Frontend (Temporary)

The current frontend will work standalone. The backend can be used via API/CLI:

```bash
# Evaluate projects
curl -X POST http://localhost:3001/api/ai-judge/batch-evaluate \
  -H "Content-Type: application/json" \
  -d '{"projectIds": [1,2,3,4,5,6,7,8,9,10]}'

# View results
curl http://localhost:3001/api/projects/leaderboard | jq
```

## 🧪 Testing the AI Judge

### Test Single Project Evaluation

```bash
# PostgreSQL
curl -X POST http://localhost:3001/api/ai-judge/evaluate/1 | jq .aiRating

# Expected output:
{
  "insightCompression": 9.2,
  "substrateEfficiency": 9.5,
  "broadUtility": 9.8,
  "awareness": 9.7,
  "agentFriction": 7.8,
  "humanCoefficient": 8.5,
  "survivalScore": 9.15,
  "tier": "S",
  "confidence": 0.92,
  "reasoning": {
    "insightCompression": "PostgreSQL encodes 30+ years of database research...",
    ...
  },
  "model": "claude-sonnet-4-5-20250929"
}
```

### Test Batch Evaluation

```bash
# Evaluate all 33 projects (will take ~2-3 minutes)
node -e "
const projectIds = Array.from({length: 33}, (_, i) => i + 1);
fetch('http://localhost:3001/api/ai-judge/batch-evaluate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({projectIds})
}).then(r => r.json()).then(console.log);
"
```

## 📈 Monitoring and Debugging

### View Database with Prisma Studio

```bash
cd apps/backend
npm run prisma:studio
```
Opens GUI at http://localhost:5555 to browse:
- Projects
- AIRatings
- UserRatings

### Check Logs

Backend logs show AI evaluations in real-time:
```
🤖 AI Judge: Evaluating project "PostgreSQL"...
✅ AI evaluation complete: PostgreSQL scored 9.15 (Tier S)
```

### Common Issues

**Error: "ANTHROPIC_API_KEY not found"**
- Solution: Add API key to `apps/backend/.env`

**Error: "Database connection failed"**
- Solution: Verify PostgreSQL is running and DATABASE_URL is correct
- Test: `psql "postgresql://user:password@localhost:5432/survivalindex"`

**Error: "GitHub rate limit exceeded"**
- Solution: Add GITHUB_TOKEN to .env for 5000 req/hour instead of 60

## 🎯 Next Steps

1. **Evaluate all projects**: Run batch evaluation on all 33 seeded projects
2. **Integrate frontend**: Connect React app to backend API
3. **Add new projects**: POST to `/api/projects`, then trigger AI evaluation
4. **Compare scores**: Display AI judge vs community ratings side-by-side
5. **Scheduled jobs**: Set up cron to re-evaluate projects weekly

## 📚 Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Anthropic API**: https://docs.anthropic.com/
- **GitHub API**: https://docs.github.com/en/rest

---

**Questions?** Check the main README.md or inspect the code in `apps/backend/src/agents/judge.js`
