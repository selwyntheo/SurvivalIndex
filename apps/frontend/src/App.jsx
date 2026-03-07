import React, { useState, useEffect } from 'react';
import { Search, Star, TrendingUp, Users, Cpu, Brain, Eye, Zap, Heart, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ExternalLink, Github, Globe, BookOpen, Award, Filter, ArrowUpDown, Info, X, Check, Sparkles, Loader2, Bot, Target, BarChart3, DollarSign, Activity, Layers } from 'lucide-react';
import api from './api/client';
import { calculateSurvivalScore, getSurvivalTier, mapOldRatingsToSfi, getAASColor } from './api/client';
import Leaderboard from './components/Leaderboard';

// AAS sample data for demonstration (fallback when backend unavailable)
const sampleProjects = [
  {
    id: 1, name: 'PostgreSQL', type: 'open-source', category: 'Database',
    description: 'The world\'s most advanced open source relational database',
    url: 'https://postgresql.org', github: 'https://github.com/postgres/postgres',
    logo: '🐘',
    aas: 85, aasData: { unpromptedPickRate: 0.82, contextBreadth: 4, crossModelConsistency: 0.95, expertPreference: 88, hiddenGemGap: 3, hiddenGemClass: 'aligned' },
    totalVotes: 2847, survivalScore: 85,
    tags: ['sql', 'acid', 'enterprise', 'battle-tested'], yearCreated: 1996
  },
  {
    id: 2, name: 'Git', type: 'open-source', category: 'Version Control',
    description: 'Distributed version control system designed for speed and efficiency',
    url: 'https://git-scm.com', github: 'https://github.com/git/git',
    logo: '📦',
    aas: 92, aasData: { unpromptedPickRate: 0.95, contextBreadth: 4, crossModelConsistency: 1.0, expertPreference: 95, hiddenGemGap: 3, hiddenGemClass: 'aligned' },
    totalVotes: 5621, survivalScore: 92,
    tags: ['vcs', 'distributed', 'ubiquitous', 'essential'], yearCreated: 2005
  },
  {
    id: 3, name: 'Redis', type: 'open-source', category: 'Cache/Database',
    description: 'In-memory data structure store, used as database, cache, and message broker',
    url: 'https://redis.io', github: 'https://github.com/redis/redis',
    logo: '⚡',
    aas: 72, aasData: { unpromptedPickRate: 0.68, contextBreadth: 3, crossModelConsistency: 0.75, expertPreference: 78, hiddenGemGap: 6, hiddenGemClass: 'aligned' },
    totalVotes: 3102, survivalScore: 72,
    tags: ['cache', 'fast', 'versatile', 'simple'], yearCreated: 2009
  },
  {
    id: 4, name: 'Stripe', type: 'saas', category: 'Payments',
    description: 'Payment processing platform for internet businesses',
    url: 'https://stripe.com',
    logo: '💳',
    aas: 78, aasData: { unpromptedPickRate: 0.75, contextBreadth: 3, crossModelConsistency: 0.88, expertPreference: 82, hiddenGemGap: 4, hiddenGemClass: 'aligned' },
    totalVotes: 4215, survivalScore: 78,
    tags: ['payments', 'api-first', 'developer-friendly', 'documentation'], yearCreated: 2010
  },
  {
    id: 5, name: 'Nginx', type: 'open-source', category: 'Web Server',
    description: 'High-performance HTTP server and reverse proxy',
    url: 'https://nginx.org', github: 'https://github.com/nginx/nginx',
    logo: '🌐',
    aas: 68, aasData: { unpromptedPickRate: 0.62, contextBreadth: 3, crossModelConsistency: 0.75, expertPreference: 70, hiddenGemGap: 2, hiddenGemClass: 'aligned' },
    totalVotes: 2956, survivalScore: 68,
    tags: ['web-server', 'reverse-proxy', 'performant', 'stable'], yearCreated: 2004
  },
  {
    id: 6, name: 'SQLite', type: 'open-source', category: 'Database',
    description: 'Self-contained, serverless SQL database engine',
    url: 'https://sqlite.org',
    logo: '🗄️',
    aas: 74, aasData: { unpromptedPickRate: 0.70, contextBreadth: 4, crossModelConsistency: 0.80, expertPreference: 85, hiddenGemGap: 11, hiddenGemClass: 'aligned' },
    totalVotes: 3890, survivalScore: 74,
    tags: ['embedded', 'zero-config', 'reliable', 'everywhere'], yearCreated: 2000
  }
];

// AAS: 4 signal indicators
const aasSignalInfo = {
  pickRate: {
    name: 'Pick Rate',
    icon: Target,
    color: '#10B981',
    description: 'How often AI agents select this tool unprompted when given a need-based problem to solve.',
  },
  breadth: {
    name: 'Breadth',
    icon: Layers,
    color: '#3B82F6',
    description: 'How many repository types (NextJS, FastAPI, React SPA, CLI) the tool is picked across. 0-4 scale.',
  },
  models: {
    name: 'Models',
    icon: Bot,
    color: '#8B5CF6',
    description: 'Cross-model consistency: fraction of AI models that "know" and select this tool.',
  },
  expertGap: {
    name: 'Expert Gap',
    icon: Sparkles,
    color: '#F59E0B',
    description: 'Difference between expert preference and agent awareness. Positive = hidden gem, negative = overhyped.',
  },
};

// AAS score color helper
function getAASBg(score) {
  const color = getAASColor(score);
  if (score >= 80) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
  if (score >= 60) return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
  if (score >= 40) return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
  if (score >= 20) return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
  return 'linear-gradient(135deg, #71717a 0%, #52525b 100%)';
}

function getAASLabel(score) {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Low';
  return 'Minimal';
}

function ProjectCard({ project, onRate, expanded, onToggle, onEvaluate, isEvaluating }) {
  const aasScore = project.aas || 0;
  const aasColor = getAASColor(aasScore);
  const aasData = project.aasData || {};
  const isGem = aasData.hiddenGemClass === 'strong_hidden_gem' || aasData.hiddenGemClass === 'mild_hidden_gem';
  const isOverhyped = aasData.hiddenGemClass === 'overhyped' || aasData.hiddenGemClass === 'mildly_overhyped';

  // Build signal bars for expanded view
  const signals = [
    { key: 'pickRate', value: (aasData.unpromptedPickRate || 0) * 100, max: 100, label: '%' },
    { key: 'breadth', value: aasData.contextBreadth || 0, max: 4, label: '/4' },
    { key: 'models', value: (aasData.crossModelConsistency || 0) * 100, max: 100, label: '%' },
    { key: 'expertGap', value: aasData.hiddenGemGap || 0, max: 100, label: '' },
  ];

  return (
    <div className={`project-card ${expanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={onToggle}>
        <div className="card-left">
          <div className="project-logo">{project.logo}</div>
          <div className="project-info">
            <div className="project-name-row">
              <h3>{project.name}</h3>
              <span className={`project-type ${project.type}`}>{project.type}</span>
              {isGem && (
                <span className="gem-badge" title="Hidden Gem: Expert preference exceeds agent awareness">
                  <Sparkles size={14} />
                  Hidden Gem
                </span>
              )}
              {isOverhyped && (
                <span className="overhyped-badge-inline" title="Overhyped: Agent awareness exceeds expert preference">
                  Overhyped
                </span>
              )}
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
          <div className="aas-score-badge" style={{ background: getAASBg(aasScore) }}>
            <span className="aas-score-number">{aasScore}</span>
            <span className="aas-score-label">AAS</span>
          </div>
          <div className="survival-score">
            <span className="score-value" style={{ color: aasColor }}>{aasScore}</span>
            <span className="score-label">/ 100</span>
          </div>
          <button className="expand-btn">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="card-expanded">
          <div className="ratings-breakdown">
            <h4>AAS Awareness Breakdown</h4>
            <div className="lever-bars">
              {signals.map(({ key, value, max, label }) => {
                const signal = aasSignalInfo[key];
                const Icon = signal.icon;
                const fillPercent = key === 'expertGap'
                  ? Math.min(Math.abs(value), 100)
                  : key === 'breadth'
                    ? (value / max) * 100
                    : value;
                return (
                  <div key={key} className="lever-bar-row">
                    <div className="lever-bar-label">
                      <Icon size={16} style={{ color: signal.color }} />
                      <span>{signal.name}</span>
                    </div>
                    <div className="lever-bar-container">
                      <div
                        className="lever-bar-fill"
                        style={{
                          width: `${Math.min(fillPercent, 100)}%`,
                          backgroundColor: signal.color
                        }}
                      />
                    </div>
                    <span className="lever-bar-value">
                      {key === 'breadth' ? `${value}${label}` :
                       key === 'expertGap' ? `${value > 0 ? '+' : ''}${Math.round(value)}` :
                       `${Math.round(value)}${label}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {project.aiRating?.reasoning && (
              <div className="ai-reasoning">
                <h5>
                  <Bot size={16} />
                  AI Analysis
                </h5>
                {project.aiRating.reasoning.overall && (
                  <div className="reasoning-overall">
                    <p>{project.aiRating.reasoning.overall}</p>
                  </div>
                )}
              </div>
            )}
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
            <div className="card-actions-right">
              <button className="rate-btn" onClick={(e) => {
                e.stopPropagation();
                onRate(project);
              }}>
                <Star size={16} />
                Expert Eval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingModal({ project, onClose, onSubmit }) {
  const [wouldYouUse, setWouldYouUse] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [appropriateness, setAppropriateness] = useState(3);
  const [productionReadiness, setProductionReadiness] = useState(3);
  const [longTermViability, setLongTermViability] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!wouldYouUse) return;
    setSubmitted(true);
    try {
      await api.aas.submitExpertEvaluation({
        toolId: project.id,
        categoryId: project.category?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        evaluatorId: 'anonymous',
        wouldYouUse,
        contextNotes,
        appropriateness,
        productionReadiness,
        longTermViability,
      });
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
    }
    setTimeout(() => onClose(), 1500);
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
            <h2>Evaluation Submitted!</h2>
            <p>Thank you for helping calibrate the Agent Awareness Score.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-project">
                <span className="modal-logo">{project.logo}</span>
                <div>
                  <h2>Expert Eval: {project.name}</h2>
                  <p className="modal-subtitle">Your input helps identify hidden gems vs overhyped tools</p>
                </div>
              </div>
              <div className="preview-score" style={{ background: getAASBg(project.aas || 0) }}>
                <span className="preview-tier">{project.aas || 0}</span>
                <span className="preview-value">AAS</span>
              </div>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e4e4e7' }}>
                  Would you use this tool in production?
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['yes', 'no', 'depends'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setWouldYouUse(opt)}
                      style={{
                        padding: '10px 24px', borderRadius: '8px', border: '1px solid',
                        borderColor: wouldYouUse === opt ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                        background: wouldYouUse === opt ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        color: wouldYouUse === opt ? '#c4b5fd' : '#a1a1aa',
                        cursor: 'pointer', fontSize: '14px', fontWeight: '500', textTransform: 'capitalize',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e4e4e7' }}>
                  Context notes (optional)
                </label>
                <textarea
                  value={contextNotes}
                  onChange={e => setContextNotes(e.target.value)}
                  placeholder="When would/wouldn't you use this tool?"
                  style={{
                    width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
                    color: '#e4e4e7', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical',
                  }}
                />
              </div>

              {[
                { label: 'Appropriateness (1-5)', value: appropriateness, setter: setAppropriateness },
                { label: 'Production Readiness (1-5)', value: productionReadiness, setter: setProductionReadiness },
                { label: 'Long-term Viability (1-5)', value: longTermViability, setter: setLongTermViability },
              ].map(({ label, value, setter }) => (
                <div key={label} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '13px', color: '#a1a1aa' }}>{label}</label>
                    <span style={{ fontSize: '13px', color: '#e4e4e7', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
                  </div>
                  <input
                    type="range" min="1" max="5" step="1" value={value}
                    onChange={e => setter(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="submit-btn" onClick={handleSubmit} disabled={!wouldYouUse}>
                <Sparkles size={18} />
                Submit Evaluation
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
    githubUrl: '',
    tags: '',
    license: '',
    techStack: '',
    selfHostable: false,
    alternativeTo: '',
    submittedBy: '',
    submitterEmail: ''
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.category) return;
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
            <h2>Submission Received!</h2>
            <p>Thank you! Your project submission will be reviewed by an admin.</p>
            <p className="submit-note">You'll be notified once it's approved and added to the index.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <h2>Submit New Project</h2>
                <p className="modal-subtitle">Nominate software that deserves to survive the AI era. All submissions are reviewed by admins.</p>
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
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="https://github.com/org/repo"
                  />
                </div>
                
                <div className="form-group">
                  <label>License</label>
                  <input
                    type="text"
                    value={formData.license}
                    onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                    placeholder="e.g., MIT, Apache-2.0, GPL-3.0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tech Stack</label>
                  <input
                    type="text"
                    value={formData.techStack}
                    onChange={(e) => setFormData(prev => ({ ...prev, techStack: e.target.value }))}
                    placeholder="e.g., Rust, PostgreSQL, React"
                  />
                </div>
                
                <div className="form-group">
                  <label>Alternative To</label>
                  <input
                    type="text"
                    value={formData.alternativeTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, alternativeTo: e.target.value }))}
                    placeholder="e.g., Redis, Memcached"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.selfHostable}
                      onChange={(e) => setFormData(prev => ({ ...prev, selfHostable: e.target.checked }))}
                    />
                    {' '}Self-Hostable
                  </label>
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
                
                <div className="form-group">
                  <label>Your Name (optional)</label>
                  <input
                    type="text"
                    value={formData.submittedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, submittedBy: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Your Email (optional)</label>
                  <input
                    type="email"
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, submitterEmail: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button 
                className="submit-btn" 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.description || !formData.category}
              >
                <Plus size={18} />
                Submit for Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SurvivalRatingPlatform() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [expandedCard, setExpandedCard] = useState(null);
  const [ratingProject, setRatingProject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [itemsPerPage] = useState(100);

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Check current user on mount
  useEffect(() => {
    async function checkAuth() {
      if (api.auth.isAuthenticated()) {
        const user = await api.auth.getCurrentUser();
        setCurrentUser(user);
      }
    }
    checkAuth();
  }, []);

  // Fetch projects from backend on mount or page change
  useEffect(() => {
    loadProjects();
  }, [currentPage]);

  async function loadProjects() {
    try {
      setLoading(true);
      const response = await api.projects.getAll({
        page: currentPage,
        limit: itemsPerPage
      });

      // Handle paginated response
      const data = response.data || response;
      const paginationInfo = response.pagination;

      // Transform backend data to match frontend format
      const transformedProjects = data.map(project => {
        // AAS score from backend (latest score)
        const aasRecord = project.aasScores?.[0];

        // Fallback: bootstrap AAS from aiRating.awareness if no AAS record
        const aas = aasRecord
          ? aasRecord.aas
          : project.aiRating
            ? Math.round(Math.min((project.aiRating.awareness || 5) * 10, 100))
            : 0;

        const aasData = aasRecord ? {
          unpromptedPickRate: aasRecord.unpromptedPickRate,
          ecosystemPickRate: aasRecord.ecosystemPickRate,
          considerationRate: aasRecord.considerationRate,
          contextBreadth: aasRecord.contextBreadth,
          crossModelConsistency: aasRecord.crossModelConsistency,
          expertPreference: aasRecord.expertPreference,
          hiddenGemGap: aasRecord.hiddenGemGap,
          hiddenGemClass: aasRecord.hiddenGemClass,
          modelScores: aasRecord.modelScores,
          confidence: aasRecord.confidence,
        } : project.aiRating ? {
          unpromptedPickRate: (project.aiRating.agentFriction || 5) / 10,
          contextBreadth: Math.round(Math.min((project.aiRating.broadUtility || 5) / 2.5, 4)),
          crossModelConsistency: 0.5,
          expertPreference: null,
          hiddenGemGap: null,
          hiddenGemClass: null,
          confidence: 0.2,
        } : {};

        return {
          id: project.id,
          name: project.name,
          type: project.type,
          category: project.category,
          description: project.description,
          url: project.url,
          github: project.githubUrl,
          logo: project.logo || '📦',
          tags: project.tags ? project.tags.split(',') : [],
          yearCreated: project.yearCreated,
          aas,
          aasData,
          survivalScore: aas,
          aiRating: project.aiRating,
          totalVotes: 0,
        };
      });

      setProjects(transformedProjects);
      setPagination(paginationInfo);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Fall back to sample data if backend fails
      setProjects(sampleProjects);
    } finally {
      setLoading(false);
    }
  }

  // Trigger AI evaluation for a project
  async function evaluateWithAI(projectId) {
    // Check if user is admin
    if (!isAdmin) {
      setShowLoginModal(true);
      return;
    }

    try {
      setEvaluating(prev => ({ ...prev, [projectId]: true }));
      const result = await api.aiJudge.evaluate(projectId);

      // Update project with AI rating, bootstrap AAS from awareness lever
      const aas = Math.round(Math.min((result.aiRating.awareness || 5) * 10, 100));

      setProjects(prev => prev.map(p =>
        p.id === projectId ? {
          ...p,
          aiRating: result.aiRating,
          aas,
          aasData: {
            unpromptedPickRate: (result.aiRating.agentFriction || 5) / 10,
            contextBreadth: Math.round(Math.min((result.aiRating.broadUtility || 5) / 2.5, 4)),
            crossModelConsistency: 0.5,
            expertPreference: null,
            hiddenGemGap: null,
            hiddenGemClass: null,
            confidence: 0.2,
          },
          survivalScore: aas,
        } : p
      ));

      alert(`AI evaluation complete! ${result.project.name} — AAS: ${aas}/100`);
    } catch (error) {
      console.error('AI evaluation failed:', error);
      alert(`❌ AI evaluation failed: ${error.message}`);
    } finally {
      setEvaluating(prev => ({ ...prev, [projectId]: false }));
    }
  }

  // Handle login
  async function handleLogin(e) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const result = await api.auth.login(loginEmail, loginPassword);
      setCurrentUser(result.user);
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      await api.auth.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  
  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || p.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.aas || 0) - (a.aas || 0);
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
            <h1>SurvivalIndex.org</h1>
            <p>RATE • DISCOVER • SURVIVE</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="header-btn secondary" onClick={() => setShowLeaderboard(true)}>
            <BarChart3 size={18} />
            Leaderboard
          </button>
          <a href="/methodology" className="header-btn secondary" style={{ textDecoration: 'none' }}>
            <BookOpen size={18} />
            Methodology
          </a>
          <button className="header-btn secondary" onClick={() => setShowAbout(true)}>
            <Info size={18} />
            About
          </button>
          <button className="header-btn primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Submit Project
          </button>
        </div>
      </header>
      
      <main>
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          AI-Powered Software Survival Analysis
        </div>
        <h1 className="hero-title">
          Software That Will <span>Survive</span> the AI Era
        </h1>
        <p className="hero-subtitle">
          Measuring which tools AI agents actually know and recommend.
          Discover hidden gems that experts love but agents overlook. Scored using AAS 0-100.
        </p>
      </section>
      
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{pagination?.total || projects.length}</div>
          <div className="stat-label">Tools Tracked</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">AAS</div>
          <div className="stat-label">0-100 Scale</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{projects.filter(p => p.aasData?.hiddenGemClass === 'strong_hidden_gem' || p.aasData?.hiddenGemClass === 'mild_hidden_gem').length}</div>
          <div className="stat-label">Hidden Gems</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{projects.filter(p => p.aas >= 80).length}</div>
          <div className="stat-label">High Awareness</div>
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
              <option value="score">Sort by AAS</option>
              <option value="votes">Sort by Votes</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </section>
      
      <section className="projects-section">
        <div className="section-header">
          <span className="section-title">Survival Index</span>
          <span className="result-count">
            {pagination ? `${pagination.total} total projects` : `${filteredProjects.length} projects found`}
          </span>
        </div>
        <div className="projects-list">
          {loading ? (
            <div className="loading-state">
              <Loader2 size={48} className="spinning" />
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <p>No projects found</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                expanded={expandedCard === project.id}
                onToggle={() => setExpandedCard(expandedCard === project.id ? null : project.id)}
                onRate={setRatingProject}
                onEvaluate={evaluateWithAI}
                isEvaluating={evaluating[project.id] || false}
              />
            ))
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="pagination-info">
              <span className="page-numbers">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="page-items">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight size={18} />
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={currentPage === pagination.totalPages}
            >
              Last
            </button>
          </div>
        )}
      </section>
      
      </main>

      {ratingProject && (
        <RatingModal
          project={ratingProject}
          onClose={() => setRatingProject(null)}
          onSubmit={(ratings) => {
            const newScore = calculateSurvivalScore(ratings);
            setProjects(prev => prev.map(p => {
              if (p.id === ratingProject.id) {
                return {
                  ...p,
                  totalVotes: (p.totalVotes || 0) + 1,
                  sfiComponents: ratings,
                  survivalScore: newScore,
                  survivalTier: getSurvivalTier(newScore),
                };
              }
              return p;
            }));
            setRatingProject(null);
          }}
        />
      )}

      {showLeaderboard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a0f', zIndex: 999, overflowY: 'auto' }}>
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        </div>
      )}
      
      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (formData) => {
            try {
              // Submit to approval queue
              await api.submissions.submit({
                name: formData.name,
                type: formData.type,
                category: formData.category,
                description: formData.description,
                url: formData.url,
                githubUrl: formData.githubUrl,
                logo: formData.logo || '📦',
                tags: formData.tags,
                license: formData.license,
                techStack: formData.techStack,
                selfHostable: formData.selfHostable,
                alternativeTo: formData.alternativeTo,
                submittedBy: formData.submittedBy,
                submitterEmail: formData.submitterEmail
              });

              // Modal will show success message automatically
              setShowAddModal(false);
            } catch (error) {
              console.error('Failed to submit project:', error);
              alert(`❌ Failed to submit project: ${error.message}`);
            }
          }}
        />
      )}

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content login-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <X size={24} />
            </button>
            <div className="login-content">
              <h3>Admin Login</h3>
              <p>Only administrators can trigger AI evaluations for projects.</p>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@survivalindex.ai"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
                {loginError && (
                  <div className="login-error">
                    {loginError}
                  </div>
                )}
                <div className="login-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowLoginModal(false)}
                    disabled={loggingIn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loggingIn}
                  >
                    {loggingIn ? (
                      <>
                        <Loader2 size={18} className="spinning" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAbout(false)}>
              <X size={24} />
            </button>
            <div className="about-content">
              <h3>What is SurvivalIndex.org?</h3>
              <p>
                This platform measures which tools AI agents actually know about and recommend.
                Using the Agent Awareness Score (AAS), we evaluate whether AI coding agents will
                pick your tool unprompted when solving real problems.
              </p>
              <p>
                The core insight: A tool with great features but zero agent visibility is effectively dead
                in the AI era. Awareness is the foundation — everything else builds on top.
              </p>

              <h3>AAS Methodology</h3>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                AAS = geometric_mean(per_model_pick_rates) * 100
              </p>
              <p>
                Three prompt types per tool (none naming the tool directly): need-based (50% weight),
                ecosystem-adjacent (30%), and consideration-inviting (20%). The geometric mean ensures
                tools must be known across models, not just one.
              </p>

              <h3>AAS Signals</h3>
              <div className="lever-explainer">
                {Object.entries(aasSignalInfo).map(([key, signal]) => {
                  const Icon = signal.icon;
                  return (
                    <div key={key} className="lever-explain-item">
                      <div className="lever-explain-icon" style={{ background: `${signal.color}20` }}>
                        <Icon size={18} style={{ color: signal.color }} />
                      </div>
                      <div className="lever-explain-text">
                        <h4>{signal.name}</h4>
                        <p>{signal.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3>Hidden Gems</h3>
              <p>
                The editorial insight: tools where expert preference far exceeds agent awareness.
                A tool with 89% expert approval but only 34 AAS is a hidden gem — agents should know about it.
                Conversely, tools agents love but experts wouldn't choose are "overhyped."
              </p>

              <h3>AAS Scale (0-100)</h3>
              <p>
                <strong style={{ color: '#10B981' }}>High (80+):</strong> Agents know and pick this tool consistently<br />
                <strong style={{ color: '#3B82F6' }}>Good (60-79):</strong> Well-known across most models<br />
                <strong style={{ color: '#F59E0B' }}>Moderate (40-59):</strong> Known by some models, invisible to others<br />
                <strong style={{ color: '#EF4444' }}>Low (20-39):</strong> Rarely picked by agents<br />
                <strong style={{ color: '#71717a' }}>Minimal (&lt;20):</strong> Effectively invisible to AI agents
              </p>
              <p style={{ marginTop: '16px' }}>
                <a href="/methodology" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>
                  Read the full methodology &rarr;
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="platform-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">S</div>
            <div>
              <strong>SurvivalIndex.org</strong>
              <p>Rate &amp; discover software that will survive the AI era.</p>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="/" aria-label="Browse the Survival Index">Browse Index</a>
              <a href="/methodology" aria-label="How AAS scores are computed">Methodology</a>
              <a href="https://github.com/selwyntheo/survivalindex" target="_blank" rel="noopener noreferrer" aria-label="View source code on GitHub">GitHub</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="/llms.txt" aria-label="Machine-readable site description for AI agents">llms.txt</a>
              <a href="/sitemap.xml" aria-label="XML Sitemap for search engines">Sitemap</a>
              <a href="/humans.txt" aria-label="Credits and technology information">humans.txt</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SurvivalIndex.org — Helping AI agents and developers discover battle-tested software.</p>
        </div>
      </footer>
    </div>
  );
}
