import React, { useState, useEffect } from 'react';
import { Search, Star, TrendingUp, Users, Cpu, Brain, Eye, Zap, Heart, Plus, ChevronDown, ChevronUp, ExternalLink, Github, Globe, BookOpen, Award, Filter, ArrowUpDown, Info, X, Check, Sparkles } from 'lucide-react';

// Sample data for demonstration
const sampleProjects = [
  {
    id: 1,
    name: 'PostgreSQL',
    type: 'open-source',
    category: 'Database',
    description: 'The world\'s most advanced open source relational database',
    url: 'https://postgresql.org',
    github: 'https://github.com/postgres/postgres',
    logo: '🐘',
    ratings: {
      insightCompression: 9.2,
      substrateEfficiency: 9.5,
      broadUtility: 9.8,
      awareness: 9.7,
      agentFriction: 7.8,
      humanCoefficient: 8.5
    },
    totalVotes: 2847,
    survivalScore: 9.1,
    tags: ['sql', 'acid', 'enterprise', 'battle-tested'],
    yearCreated: 1996
  },
  {
    id: 2,
    name: 'Git',
    type: 'open-source',
    category: 'Version Control',
    description: 'Distributed version control system designed for speed and efficiency',
    url: 'https://git-scm.com',
    github: 'https://github.com/git/git',
    logo: '📦',
    ratings: {
      insightCompression: 10.0,
      substrateEfficiency: 9.8,
      broadUtility: 10.0,
      awareness: 10.0,
      agentFriction: 8.5,
      humanCoefficient: 7.5
    },
    totalVotes: 5621,
    survivalScore: 9.6,
    tags: ['vcs', 'distributed', 'ubiquitous', 'essential'],
    yearCreated: 2005
  },
  {
    id: 3,
    name: 'Redis',
    type: 'open-source',
    category: 'Cache/Database',
    description: 'In-memory data structure store, used as database, cache, and message broker',
    url: 'https://redis.io',
    github: 'https://github.com/redis/redis',
    logo: '⚡',
    ratings: {
      insightCompression: 8.9,
      substrateEfficiency: 9.7,
      broadUtility: 9.2,
      awareness: 9.4,
      agentFriction: 8.8,
      humanCoefficient: 7.8
    },
    totalVotes: 3102,
    survivalScore: 9.0,
    tags: ['cache', 'fast', 'versatile', 'simple'],
    yearCreated: 2009
  },
  {
    id: 4,
    name: 'Stripe',
    type: 'saas',
    category: 'Payments',
    description: 'Payment processing platform for internet businesses',
    url: 'https://stripe.com',
    logo: '💳',
    ratings: {
      insightCompression: 8.5,
      substrateEfficiency: 8.2,
      broadUtility: 8.8,
      awareness: 9.5,
      agentFriction: 9.2,
      humanCoefficient: 8.8
    },
    totalVotes: 4215,
    survivalScore: 8.8,
    tags: ['payments', 'api-first', 'developer-friendly', 'documentation'],
    yearCreated: 2010
  },
  {
    id: 5,
    name: 'Nginx',
    type: 'open-source',
    category: 'Web Server',
    description: 'High-performance HTTP server and reverse proxy',
    url: 'https://nginx.org',
    github: 'https://github.com/nginx/nginx',
    logo: '🌐',
    ratings: {
      insightCompression: 9.0,
      substrateEfficiency: 9.6,
      broadUtility: 9.4,
      awareness: 9.3,
      agentFriction: 7.5,
      humanCoefficient: 7.2
    },
    totalVotes: 2956,
    survivalScore: 8.9,
    tags: ['web-server', 'reverse-proxy', 'performant', 'stable'],
    yearCreated: 2004
  },
  {
    id: 6,
    name: 'SQLite',
    type: 'open-source',
    category: 'Database',
    description: 'Self-contained, serverless SQL database engine',
    url: 'https://sqlite.org',
    logo: '🗄️',
    ratings: {
      insightCompression: 9.5,
      substrateEfficiency: 9.9,
      broadUtility: 9.6,
      awareness: 9.0,
      agentFriction: 9.5,
      humanCoefficient: 8.0
    },
    totalVotes: 3890,
    survivalScore: 9.4,
    tags: ['embedded', 'zero-config', 'reliable', 'everywhere'],
    yearCreated: 2000
  }
];

const leverInfo = {
  insightCompression: {
    name: 'Insight Compression',
    icon: Brain,
    color: '#8B5CF6',
    description: 'How much crystallized knowledge and hard-won insights does this software encode? Git represents decades of version control wisdom compressed into elegant commands.',
    question: 'Would recreating this from scratch require rediscovering significant insights?'
  },
  substrateEfficiency: {
    name: 'Substrate Efficiency',
    icon: Cpu,
    color: '#10B981',
    description: 'Does this run efficiently on CPU/traditional compute rather than requiring expensive GPU/inference cycles? grep on CPU beats LLM pattern matching.',
    question: 'Does this save compute resources vs. AI re-synthesis at runtime?'
  },
  broadUtility: {
    name: 'Broad Utility',
    icon: Globe,
    color: '#3B82F6',
    description: 'How widely applicable is this across different use cases and domains? More usage = more survival pressure to stay relevant.',
    question: 'How many different problems and contexts does this solve?'
  },
  awareness: {
    name: 'Awareness/Publicity',
    icon: Eye,
    color: '#F59E0B',
    description: 'Is this software well-known and discoverable? Agents need to find it to use it. Being good isn\'t enough - you must be known.',
    question: 'How likely are AI agents and developers to discover this?'
  },
  agentFriction: {
    name: 'Agent Friendliness',
    icon: Zap,
    color: '#EF4444',
    description: 'How easy is it for AI agents to use this tool? Good docs, simple APIs, predictable behavior, and clear error messages reduce friction.',
    question: 'Can an AI agent easily learn and use this without human intervention?'
  },
  humanCoefficient: {
    name: 'Human Coefficient',
    icon: Heart,
    color: '#EC4899',
    description: 'For domains where humans prefer human work, this matters. Some software will survive because people WANT it, not just because it\'s efficient.',
    question: 'Do humans specifically prefer this over AI-generated alternatives?'
  }
};

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

function getSurvivalTier(score) {
  if (score >= 9.0) return { tier: 'S', label: 'Immortal', color: '#FFD700', bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' };
  if (score >= 8.0) return { tier: 'A', label: 'Enduring', color: '#10B981', bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' };
  if (score >= 7.0) return { tier: 'B', label: 'Resilient', color: '#3B82F6', bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' };
  if (score >= 6.0) return { tier: 'C', label: 'Vulnerable', color: '#F59E0B', bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' };
  if (score >= 5.0) return { tier: 'D', label: 'At Risk', color: '#EF4444', bg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' };
  return { tier: 'F', label: 'Endangered', color: '#6B7280', bg: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' };
}

function LeverSlider({ leverKey, value, onChange, disabled }) {
  const lever = leverInfo[leverKey];
  const Icon = lever.icon;
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="lever-slider">
      <div className="lever-header">
        <div className="lever-title">
          <Icon size={18} style={{ color: lever.color }} />
          <span>{lever.name}</span>
          <button 
            className="info-btn"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info size={14} />
            {showTooltip && (
              <div className="lever-tooltip">
                <p>{lever.description}</p>
                <p className="tooltip-question">{lever.question}</p>
              </div>
            )}
          </button>
        </div>
        <span className="lever-value" style={{ color: lever.color }}>{value.toFixed(1)}</span>
      </div>
      <div className="slider-container">
        <input
          type="range"
          min="1"
          max="10"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="lever-range"
          style={{ '--lever-color': lever.color, '--value-percent': `${(value - 1) / 9 * 100}%` }}
        />
        <div className="slider-labels">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onRate, expanded, onToggle }) {
  const tier = getSurvivalTier(project.survivalScore);
  
  return (
    <div className={`project-card ${expanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={onToggle}>
        <div className="card-left">
          <div className="project-logo">{project.logo}</div>
          <div className="project-info">
            <div className="project-name-row">
              <h3>{project.name}</h3>
              <span className={`project-type ${project.type}`}>{project.type}</span>
            </div>
            <p className="project-desc">{project.description}</p>
            <div className="project-tags">
              {project.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="card-right">
          <div className="survival-badge" style={{ background: tier.bg }}>
            <span className="tier-letter">{tier.tier}</span>
            <span className="tier-label">{tier.label}</span>
          </div>
          <div className="survival-score">
            <span className="score-value">{project.survivalScore}</span>
            <span className="score-label">Survival Score</span>
          </div>
          <div className="vote-count">
            <Users size={14} />
            <span>{project.totalVotes.toLocaleString()} ratings</span>
          </div>
          <button className="expand-btn">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="card-expanded">
          <div className="ratings-breakdown">
            <h4>Survival Breakdown</h4>
            <div className="lever-bars">
              {Object.keys(leverInfo).map(key => {
                const lever = leverInfo[key];
                const Icon = lever.icon;
                const value = project.ratings[key];
                return (
                  <div key={key} className="lever-bar-row">
                    <div className="lever-bar-label">
                      <Icon size={16} style={{ color: lever.color }} />
                      <span>{lever.name}</span>
                    </div>
                    <div className="lever-bar-container">
                      <div 
                        className="lever-bar-fill" 
                        style={{ 
                          width: `${value * 10}%`, 
                          backgroundColor: lever.color 
                        }}
                      />
                    </div>
                    <span className="lever-bar-value">{value.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="card-actions">
            <div className="card-links">
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="card-link">
                  <Globe size={16} />
                  Website
                </a>
              )}
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="card-link">
                  <Github size={16} />
                  GitHub
                </a>
              )}
            </div>
            <button className="rate-btn" onClick={() => onRate(project)}>
              <Star size={16} />
              Rate This Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingModal({ project, onClose, onSubmit }) {
  const [ratings, setRatings] = useState({
    insightCompression: 5,
    substrateEfficiency: 5,
    broadUtility: 5,
    awareness: 5,
    agentFriction: 5,
    humanCoefficient: 5
  });
  const [submitted, setSubmitted] = useState(false);
  
  const previewScore = calculateSurvivalScore(ratings);
  const previewTier = getSurvivalTier(previewScore);
  
  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(ratings);
    }, 1500);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        {submitted ? (
          <div className="submit-success">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h2>Rating Submitted!</h2>
            <p>Thank you for contributing to the survival index.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-project">
                <span className="modal-logo">{project.logo}</span>
                <div>
                  <h2>Rate {project.name}</h2>
                  <p className="modal-subtitle">Your rating helps AI agents discover battle-tested software</p>
                </div>
              </div>
              <div className="preview-score" style={{ background: previewTier.bg }}>
                <span className="preview-tier">{previewTier.tier}</span>
                <span className="preview-value">{previewScore}</span>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="levers-grid">
                {Object.keys(leverInfo).map(key => (
                  <LeverSlider
                    key={key}
                    leverKey={key}
                    value={ratings[key]}
                    onChange={(val) => setRatings(prev => ({ ...prev, [key]: val }))}
                  />
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="submit-btn" onClick={handleSubmit}>
                <Sparkles size={18} />
                Submit Rating
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AddProjectModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'open-source',
    category: '',
    description: '',
    url: '',
    github: '',
    tags: ''
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = () => {
    if (!formData.name || !formData.description) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(formData);
    }, 1500);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        {submitted ? (
          <div className="submit-success">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h2>Project Submitted!</h2>
            <p>Your submission will be reviewed and added to the index.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <h2>Add New Project</h2>
                <p className="modal-subtitle">Nominate software that deserves to survive the AI era</p>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., PostgreSQL"
                  />
                </div>
                
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="open-source">Open Source</option>
                    <option value="saas">SaaS</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Database, Web Server"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what this software does"
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label>Website URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                    placeholder="https://github.com/org/repo"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., database, reliable, fast"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button 
                className="submit-btn" 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.description}
              >
                <Plus size={18} />
                Submit Project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SurvivalRatingPlatform() {
  const [projects, setProjects] = useState(sampleProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [expandedCard, setExpandedCard] = useState(null);
  const [ratingProject, setRatingProject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || p.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.survivalScore - a.survivalScore;
      if (sortBy === 'votes') return b.totalVotes - a.totalVotes;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  
  return (
    <div className="survival-platform">
      <header className="platform-header">
        <div className="logo-section">
          <div className="logo">S</div>
          <div className="logo-text">
            <h1>SurvivalIndex.ai</h1>
            <p>RATE • DISCOVER • SURVIVE</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="header-btn secondary" onClick={() => setShowAbout(true)}>
            <BookOpen size={18} />
            About
          </button>
          <button className="header-btn primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Add Project
          </button>
        </div>
      </header>
      
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          Based on Steve Yegge's Software Survival 3.0
        </div>
        <h1 className="hero-title">
          Software That Will <span>Survive</span> the AI Era
        </h1>
        <p className="hero-subtitle">
          Crowdsourced ratings for open source and SaaS projects. Help AI agents discover 
          battle-tested software that won't be re-invented. Rate projects across six survival levers.
        </p>
      </section>
      
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Projects Indexed</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{projects.reduce((acc, p) => acc + p.totalVotes, 0).toLocaleString()}</div>
          <div className="stat-label">Community Ratings</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">6</div>
          <div className="stat-label">Survival Levers</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{projects.filter(p => p.survivalScore >= 9).length}</div>
          <div className="stat-label">S-Tier Projects</div>
        </div>
      </div>
      
      <section className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search projects by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Types
            </button>
            <button
              className={`filter-btn ${filterType === 'open-source' ? 'active' : ''}`}
              onClick={() => setFilterType('open-source')}
            >
              Open Source
            </button>
            <button
              className={`filter-btn ${filterType === 'saas' ? 'active' : ''}`}
              onClick={() => setFilterType('saas')}
            >
              SaaS
            </button>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="score">Sort by Score</option>
              <option value="votes">Sort by Votes</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </section>
      
      <section className="projects-section">
        <div className="section-header">
          <span className="section-title">Survival Index</span>
          <span className="result-count">{filteredProjects.length} projects found</span>
        </div>
        <div className="projects-list">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              expanded={expandedCard === project.id}
              onToggle={() => setExpandedCard(expandedCard === project.id ? null : project.id)}
              onRate={setRatingProject}
            />
          ))}
        </div>
      </section>
      
      {ratingProject && (
        <RatingModal
          project={ratingProject}
          onClose={() => setRatingProject(null)}
          onSubmit={(ratings) => {
            setProjects(prev => prev.map(p => {
              if (p.id === ratingProject.id) {
                return {
                  ...p,
                  totalVotes: p.totalVotes + 1,
                  survivalScore: calculateSurvivalScore(ratings)
                };
              }
              return p;
            }));
            setRatingProject(null);
          }}
        />
      )}
      
      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(formData) => {
            const newProject = {
              id: projects.length + 1,
              name: formData.name,
              type: formData.type,
              category: formData.category || 'Uncategorized',
              description: formData.description,
              url: formData.url,
              github: formData.github,
              logo: '📦',
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
              tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
              yearCreated: new Date().getFullYear()
            };
            setProjects(prev => [...prev, newProject]);
            setShowAddModal(false);
          }}
        />
      )}
      
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAbout(false)}>
              <X size={24} />
            </button>
            <div className="about-content">
              <h3>What is SurvivalIndex.ai?</h3>
              <p>
                Based on <a href="https://steve-yegge.medium.com/software-survival-3-0-97a2a6255f7b" target="_blank" rel="noopener noreferrer">Steve Yegge's "Software Survival 3.0"</a> framework, 
                this platform helps identify which software will survive in an era where AI can generate code.
              </p>
              <p>
                The core insight: Not all software will be re-synthesized by AI. Software with high "Survival Ratios" 
                represents crystallized knowledge that would be crazy to recreate from scratch.
              </p>
              
              <h3>The Six Survival Levers</h3>
              <div className="lever-explainer">
                {Object.entries(leverInfo).map(([key, lever]) => {
                  const Icon = lever.icon;
                  return (
                    <div key={key} className="lever-explain-item">
                      <div className="lever-explain-icon" style={{ background: `${lever.color}20` }}>
                        <Icon size={18} style={{ color: lever.color }} />
                      </div>
                      <div className="lever-explain-text">
                        <h4>{lever.name}</h4>
                        <p>{lever.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <h3>For AI Agents</h3>
              <p>
                This index is designed to be machine-readable. AI coding agents can query this database to discover 
                battle-tested software rather than re-implementing solutions from scratch. High-scoring projects 
                represent accumulated wisdom that saves compute, tokens, and energy.
              </p>
              
              <h3>Survival Tiers</h3>
              <p>
                <strong>S-Tier (9.0+):</strong> Immortal — Would be insane to re-synthesize<br />
                <strong>A-Tier (8.0-8.9):</strong> Enduring — Extremely high survival probability<br />
                <strong>B-Tier (7.0-7.9):</strong> Resilient — Strong survival characteristics<br />
                <strong>C-Tier (6.0-6.9):</strong> Vulnerable — May need to adapt<br />
                <strong>D-Tier (5.0-5.9):</strong> At Risk — Could be replaced by AI<br />
                <strong>F-Tier (&lt;5.0):</strong> Endangered — Likely to be re-synthesized
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
