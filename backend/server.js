import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// In-memory data store (replace with database in production)
let projects = [
  { id: 1, name: 'PostgreSQL', type: 'open-source', category: 'Database', description: 'Advanced open source relational database', url: 'https://postgresql.org', github: 'https://github.com/postgres/postgres', logo: '🐘', ratings: { insightCompression: 9.2, substrateEfficiency: 9.5, broadUtility: 9.8, awareness: 9.7, agentFriction: 7.8, humanCoefficient: 8.5 }, totalVotes: 2847, survivalScore: 9.1, tags: ['sql', 'acid', 'enterprise'], yearCreated: 1996 },
  { id: 2, name: 'Git', type: 'open-source', category: 'Version Control', description: 'Distributed version control system', url: 'https://git-scm.com', github: 'https://github.com/git/git', logo: '📦', ratings: { insightCompression: 10.0, substrateEfficiency: 9.8, broadUtility: 10.0, awareness: 10.0, agentFriction: 8.5, humanCoefficient: 7.5 }, totalVotes: 5621, survivalScore: 9.6, tags: ['vcs', 'distributed', 'essential'], yearCreated: 2005 },
  { id: 3, name: 'Redis', type: 'open-source', category: 'Cache/Database', description: 'In-memory data structure store', url: 'https://redis.io', github: 'https://github.com/redis/redis', logo: '⚡', ratings: { insightCompression: 8.9, substrateEfficiency: 9.7, broadUtility: 9.2, awareness: 9.4, agentFriction: 8.8, humanCoefficient: 7.8 }, totalVotes: 3102, survivalScore: 9.0, tags: ['cache', 'fast', 'versatile'], yearCreated: 2009 },
  { id: 4, name: 'Stripe', type: 'saas', category: 'Payments', description: 'Payment processing platform', url: 'https://stripe.com', logo: '💳', ratings: { insightCompression: 8.5, substrateEfficiency: 8.2, broadUtility: 8.8, awareness: 9.5, agentFriction: 9.2, humanCoefficient: 8.8 }, totalVotes: 4215, survivalScore: 8.8, tags: ['payments', 'api-first', 'documentation'], yearCreated: 2010 },
  { id: 5, name: 'Nginx', type: 'open-source', category: 'Web Server', description: 'High-performance HTTP server and reverse proxy', url: 'https://nginx.org', github: 'https://github.com/nginx/nginx', logo: '🌐', ratings: { insightCompression: 9.0, substrateEfficiency: 9.6, broadUtility: 9.4, awareness: 9.3, agentFriction: 7.5, humanCoefficient: 7.2 }, totalVotes: 2956, survivalScore: 8.9, tags: ['web-server', 'reverse-proxy', 'stable'], yearCreated: 2004 },
  { id: 6, name: 'SQLite', type: 'open-source', category: 'Database', description: 'Self-contained serverless SQL database', url: 'https://sqlite.org', logo: '🗄️', ratings: { insightCompression: 9.5, substrateEfficiency: 9.9, broadUtility: 9.6, awareness: 9.0, agentFriction: 9.5, humanCoefficient: 8.0 }, totalVotes: 3890, survivalScore: 9.4, tags: ['embedded', 'zero-config', 'reliable'], yearCreated: 2000 }
];

let nextId = 7;

// Calculate survival score
function calculateSurvivalScore(ratings) {
  const weights = { 
    insightCompression: 0.20, 
    substrateEfficiency: 0.18, 
    broadUtility: 0.22, 
    awareness: 0.15, 
    agentFriction: 0.15, 
    humanCoefficient: 0.10 
  };
  let score = 0;
  Object.keys(weights).forEach(key => { 
    score += (ratings[key] || 0) * weights[key]; 
  });
  return Math.round(score * 10) / 10;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get all projects
app.get('/api/projects', (req, res) => {
  const { type, category, search, sortBy } = req.query;
  
  let filtered = [...projects];
  
  // Filter by type
  if (type && type !== 'all') {
    filtered = filtered.filter(p => p.type === type);
  }
  
  // Filter by category
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  // Search
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(t => t.toLowerCase().includes(searchLower))
    );
  }
  
  // Sort
  if (sortBy === 'votes') {
    filtered.sort((a, b) => b.totalVotes - a.totalVotes);
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default: sort by score
    filtered.sort((a, b) => b.survivalScore - a.survivalScore);
  }
  
  res.json(filtered);
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Submit rating for a project
app.post('/api/projects/:id/rate', (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const { ratings } = req.body;
  
  if (!ratings || typeof ratings !== 'object') {
    return res.status(400).json({ error: 'Invalid ratings data' });
  }
  
  // Update project ratings (simple average for demo)
  const newScore = calculateSurvivalScore(ratings);
  project.survivalScore = newScore;
  project.totalVotes += 1;
  
  // In production, you'd want to store individual ratings and calculate averages
  Object.keys(ratings).forEach(key => {
    if (project.ratings[key] !== undefined) {
      project.ratings[key] = ratings[key];
    }
  });
  
  res.json({ 
    success: true, 
    project,
    message: 'Rating submitted successfully' 
  });
});

// Add new project
app.post('/api/projects', (req, res) => {
  const { name, type, category, description, url, github, logo, tags, yearCreated } = req.body;
  
  if (!name || !type || !category || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newProject = {
    id: nextId++,
    name,
    type,
    category,
    description,
    url: url || '',
    github: github || '',
    logo: logo || '📦',
    ratings: {
      insightCompression: 5,
      substrateEfficiency: 5,
      broadUtility: 5,
      awareness: 5,
      agentFriction: 5,
      humanCoefficient: 5
    },
    totalVotes: 0,
    survivalScore: 5.0,
    tags: tags || [],
    yearCreated: yearCreated || new Date().getFullYear()
  };
  
  projects.push(newProject);
  res.status(201).json(newProject);
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = {};
  projects.forEach(project => {
    if (!categories[project.category]) {
      categories[project.category] = [];
    }
    categories[project.category].push(project);
  });
  res.json(categories);
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    totalProjects: projects.length,
    totalVotes: projects.reduce((sum, p) => sum + p.totalVotes, 0),
    sTierProjects: projects.filter(p => p.survivalScore >= 9.0).length,
    openSourceCount: projects.filter(p => p.type === 'open-source').length,
    saasCount: projects.filter(p => p.type === 'saas').length,
    averageScore: (projects.reduce((sum, p) => sum + p.survivalScore, 0) / projects.length).toFixed(1)
  };
  res.json(stats);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 SurvivalIndex API running on port ${PORT}`);
  console.log(`📊 Loaded ${projects.length} projects`);
});
