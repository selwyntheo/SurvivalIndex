# SurvivalIndex.org

**Software That Will Survive the AI Era**

An AI-powered rating platform for open source and SaaS projects that evaluates software survival likelihood in the age of AI code generation. Help AI agents discover battle-tested software that won't be re-invented.

![SurvivalIndex.org](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## 🎯 Overview

In an era where AI can generate code, which software will survive? Not all software will be re-synthesized by AI. Software with high "Survival Ratios" represents crystallized knowledge that would be crazy to recreate from scratch.

SurvivalIndex.org provides a platform to rate and discover software across six critical survival levers, helping both humans and AI agents identify truly valuable, battle-tested tools.

## 🔑 The Six Survival Levers

### 1. **Insight Compression** 🧠
How much crystallized knowledge and hard-won insights does this software encode? Git represents decades of version control wisdom compressed into elegant commands.

### 2. **Substrate Efficiency** ⚡
Does this run efficiently on CPU/traditional compute rather than requiring expensive GPU/inference cycles? grep on CPU beats LLM pattern matching.

### 3. **Broad Utility** 🌐
How widely applicable is this across different use cases and domains? More usage = more survival pressure to stay relevant.

### 4. **Awareness/Publicity** 👁️
Is this software well-known and discoverable? Agents need to find it to use it. Being good isn't enough - you must be known.

### 5. **Agent Friendliness** ⚡
How easy is it for AI agents to use this tool? Good docs, simple APIs, predictable behavior, and clear error messages reduce friction.

### 6. **Human Coefficient** ❤️
For domains where humans prefer human work, this matters. Some software will survive because people WANT it, not just because it's efficient.

## 🏆 Survival Tiers

- **S-Tier (9.0+):** Immortal — Would be insane to re-synthesize
- **A-Tier (8.0-8.9):** Enduring — Extremely high survival probability
- **B-Tier (7.0-7.9):** Resilient — Strong survival characteristics
- **C-Tier (6.0-6.9):** Vulnerable — May need to adapt
- **D-Tier (5.0-5.9):** At Risk — Could be replaced by AI
- **F-Tier (<5.0):** Endangered — Likely to be re-synthesized

## ✨ Features

- **Interactive Rating System**: Rate projects across all six survival levers with intuitive sliders
- **Real-time Survival Score**: See calculated survival scores update as you adjust ratings
- **Project Discovery**: Search and filter projects by type, name, tags, and more
- **Expandable Cards**: Detailed breakdown of each project's survival metrics
- **Add New Projects**: Nominate software that deserves to survive the AI era
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Dark Theme**: Easy on the eyes with a sleek dark interface

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL** database (local or hosted like Supabase/Neon)
- **Anthropic API Key** - Get from [Anthropic Console](https://console.anthropic.com/)
- **GitHub Token** (optional) - For enhanced project analysis

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd SurvivalIndex

# Install all workspace dependencies
npm install
```

### Backend Setup

```bash
cd apps/backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Example `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/survivalindex?schema=public"
ANTHROPIC_API_KEY="sk-ant-api03-..."
GITHUB_TOKEN="ghp_..." # Optional but recommended
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### Database Setup

```bash
# From apps/backend directory
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Create database tables
npm run seed               # Seed with 33 sample projects
```

### Run the Application

**Option A: Run both frontend and backend**
```bash
# From project root
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

**Option B: Run separately**
```bash
# Terminal 1
npm run dev:frontend

# Terminal 2
npm run dev:backend
```

### Trigger AI Evaluations

```bash
# Evaluate a single project
curl -X POST http://localhost:3001/api/ai-judge/evaluate/1

# Batch evaluate all projects
curl -X POST http://localhost:3001/api/ai-judge/batch-evaluate \
  -H "Content-Type: application/json" \
  -d '{"projectIds": [1,2,3,4,5]}'
```

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **Vite 5.4** - Build tool and dev server
- **Lucide React** - Beautiful icon library
- **CSS3** - Custom styling with modern features
- **Google Fonts** - Outfit & JetBrains Mono

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
SurvivalIndex/
├── src/                    # Frontend source
│   ├── App.jsx            # Main React component
│   ├── main.jsx           # React entry point
│   ├── index.css          # Global styles
│   └── config.js          # API configuration
├── backend/               # Backend API service
│   ├── server.js          # Express API server
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── .do/                   # DigitalOcean deployment
│   ├── app.yaml           # App Platform config
│   └── deploy.md          # Deployment guide
├── index.html             # HTML template
├── package.json           # Frontend dependencies
├── vite.config.js         # Vite configuration
└── README.md              # This file
│   │   └── package.json
│   └── backend/             # Express API
│       ├── src/
│       │   ├── agents/
│       │   │   └── judge.js     # AI Judge agent
│       │   ├── routes/
│       │   │   ├── projects.js
│       │   │   ├── ratings.js
│       │   │   └── ai-judge.js
│       │   ├── services/
│       │   │   ├── projectService.js
│       │   │   └── aiJudgeService.js
│       │   ├── config/
│       │   │   └── database.js
│       │   ├── scripts/
│       │   │   └── seed.js
│       │   └── server.js
│       ├── prisma/
│       │   └── schema.prisma
│       ├── .env.example
│       └── package.json
└── package.json             # Workspace config
```

## 🤖 AI Judge Agent

The **AI Judge** is the core innovation - an LLM-powered agent that autonomously evaluates projects:

### How it works:

1. **Data Gathering**
   - Fetches GitHub metrics (stars, forks, commits, activity)
   - Analyzes repository health and maintenance status

2. **LLM Evaluation**
   - Uses Anthropic Claude Sonnet 4.5 to score each of the 6 survival levers
   - Provides detailed reasoning for each score
   - Returns confidence level (0-1)

3. **Scoring Algorithm**
   - Calculates weighted survival score from the 6 levers
   - Assigns tier (S/A/B/C/D/F) based on score
   - Stores results in PostgreSQL database

4. **API Access**
   - On-demand evaluation via REST API
   - Batch processing for multiple projects
   - Automatic re-evaluation of stale ratings

### Example AI Judge Response:

```json
{
  "scores": {
    "insightCompression": 9.2,
    "substrateEfficiency": 9.5,
    "broadUtility": 9.8,
    "awareness": 9.7,
    "agentFriction": 7.8,
    "humanCoefficient": 8.5
  },
  "survivalScore": 9.1,
  "tier": "S",
  "confidence": 0.92,
  "reasoning": {
    "insightCompression": "PostgreSQL encodes 30+ years of database research...",
    "substrateEfficiency": "Extremely efficient on commodity CPUs...",
    "overall": "PostgreSQL is immortal - would be insane to re-synthesize..."
  }
}
```

## 📡 API Endpoints

### Projects
- `GET /api/projects` - List all projects (with filters)
- `GET /api/projects/:id` - Get single project
- `GET /api/projects/leaderboard` - Get ranked projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### AI Judge
- `POST /api/ai-judge/evaluate/:projectId` - Evaluate single project
- `POST /api/ai-judge/batch-evaluate` - Evaluate multiple projects
- `POST /api/ai-judge/reevaluate-stale?daysOld=30` - Re-evaluate old ratings

### User Ratings
- `POST /api/ratings` - Submit community rating
- `GET /api/ratings/:projectId` - Get all ratings for project
- `GET /api/ratings/:projectId/average` - Get average community rating

## 🎨 Design Philosophy

- **Modern & Minimal**: Clean interface with focus on content
- **Gradient Accents**: Purple-blue-green gradients for visual hierarchy
- **Typography**: Outfit for UI, JetBrains Mono for data/code
- **Glassmorphism**: Subtle backdrop blur effects
- **Smooth Animations**: Polished transitions and interactions

## 🤖 For AI Agents

This index is designed to be machine-readable. AI coding agents can query this database to discover battle-tested software rather than re-implementing solutions from scratch. High-scoring projects represent accumulated wisdom that saves compute, tokens, and energy.

## 📊 Sample Projects Included

The platform comes pre-loaded with sample projects including:

- **PostgreSQL** - Advanced open source relational database
- **Git** - Distributed version control system
- **Redis** - In-memory data structure store
- **Stripe** - Payment processing platform
- **Nginx** - High-performance HTTP server
- **SQLite** - Self-contained SQL database engine

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

- Add more projects to the index
- Improve the rating algorithm
- Enhance the UI/UX
- Add new features (export data, API, etc.)
- Fix bugs and improve performance

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🙏 Credits

### Framework & Methodology

This platform is based on **Steve Yegge's "Software Survival 3.0"** framework, which provides a systematic approach to evaluating which software will survive in the AI era.

**Original Article**: [Software Survival 3.0](https://steve-yegge.medium.com/software-survival-3-0-97a2a6255f7b) by Steve Yegge

### Survival Score Formula

The survival score is calculated using a weighted formula across six key levers:

```
Survival Score = (
  Insight Compression    × 0.20 +
  Substrate Efficiency   × 0.18 +
  Broad Utility          × 0.22 +
  Awareness/Publicity    × 0.15 +
  Agent Friendliness     × 0.15 +
  Human Coefficient      × 0.10
)
```

**Weight Rationale:**
- **Broad Utility (22%)**: Most critical - software must solve real problems
- **Insight Compression (20%)**: Crystallized knowledge is hard to recreate
- **Substrate Efficiency (18%)**: CPU efficiency matters in AI era
- **Awareness (15%)**: Discoverability is key for adoption
- **Agent Friendliness (15%)**: AI agents need easy-to-use tools
- **Human Coefficient (10%)**: Human preference still matters in some domains

### Technology

Built with modern web technologies and powered by Claude AI for intelligent software evaluation.

## 🔗 Links

- [Steve Yegge's Software Survival 3.0](https://steve-yegge.medium.com/software-survival-3-0-97a2a6255f7b)
- [Anthropic Claude](https://www.anthropic.com/claude)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Lucide Icons](https://lucide.dev)

---

**Built with ❤️ for the AI era**
