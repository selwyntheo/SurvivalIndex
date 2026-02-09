Here's a comprehensive spec for Claude Code to implement the SurvivalIndex.ai enhancements:

---

# SurvivalIndex.ai Enhancement Specification

## Project Overview

Enhance the SurvivalIndex.ai platform - a crowdsourced rating system for software survival based on Steve Yegge's "Software Survival 3.0" framework. The platform helps AI agents discover battle-tested software that won't need to be re-invented.

**Current State:** React single-file component with 12 categories, 33 projects, basic rating system.

**Target State:** Comprehensive platform with 25+ categories, 150+ projects, enhanced metadata, API endpoints, and improved UI/UX.

---

## 1. Data Model Enhancements

### 1.1 Enhanced Project Schema

```javascript
const projectSchema = {
  // Existing fields
  id: number,
  name: string,
  type: 'open-source' | 'saas' | 'open-core',
  category: string,
  description: string,
  url: string,
  github: string | null,
  logo: string, // emoji or URL
  ratings: {
    insightCompression: number,
    substrateEfficiency: number,
    broadUtility: number,
    awareness: number,
    agentFriction: number,
    humanCoefficient: number
  },
  totalVotes: number,
  survivalScore: number,
  tags: string[],
  yearCreated: number,

  // NEW FIELDS
  selfHostable: boolean,                    // Can be self-hosted
  license: string,                          // SPDX identifier: 'MIT', 'AGPL-3.0', 'Apache-2.0', etc.
  licenseType: 'permissive' | 'copyleft' | 'proprietary',
  techStack: string[],                      // ['Go', 'Docker', 'PostgreSQL']
  deployment: string[],                     // ['Docker', 'K8S', 'Binary', 'npm']
  alternativeTo: string[],                  // ['Slack', 'Discord'] - what SaaS it replaces
  
  // GitHub Metrics (fetched/cached)
  githubStats: {
    stars: number,
    forks: number,
    contributors: number,
    lastCommit: string,                     // ISO date
    openIssues: number,
    weeklyCommits: number
  } | null,
  
  // Health indicators
  maintenanceStatus: 'active' | 'maintained' | 'minimal' | 'unmaintained' | 'archived',
  deprecationRisk: 'low' | 'medium' | 'high',
  lastVerified: string,                     // ISO date when data was last verified
  
  // Extended metadata
  documentation: string | null,             // Docs URL
  pricing: 'free' | 'freemium' | 'paid' | 'open-core',
  enterprise: boolean,                      // Has enterprise offering
  foundedBy: string | null,                 // Company/org
  funding: string | null                    // 'bootstrapped', 'VC-backed', 'foundation', etc.
}
```

### 1.2 Enhanced Category Schema

```javascript
const categorySchema = {
  id: string,                               // 'analytics', 'database', etc.
  name: string,                             // 'Analytics'
  icon: string,                             // Emoji
  description: string,
  useCases: string[],
  
  // NEW FIELDS
  parentCategory: string | null,            // For subcategories
  relatedCategories: string[],              // ['monitoring', 'observability']
  commonAlternatives: string[],             // SaaS products this category replaces
  maturityLevel: 'emerging' | 'growing' | 'mature' | 'declining'
}
```

---

## 2. New Categories to Add

Implement these 25 categories (expanding from current 12):

```javascript
const categories = {
  // === EXISTING (keep) ===
  'database': { ... },
  'version-control': { ... },
  'cache': { ... },
  'web-server': { ... },
  'payments': { ... },
  'authentication': { ... },
  'search': { ... },
  'message-queue': { ... },
  'container-orchestration': { ... },
  'monitoring': { ... },
  'ci-cd': { ... },
  'email': { ... },

  // === NEW CATEGORIES ===
  'analytics': {
    icon: '📊',
    description: 'Web, product, and business analytics platforms',
    useCases: ['Web analytics', 'Product analytics', 'Session replay', 'A/B testing'],
    commonAlternatives: ['Google Analytics', 'Mixpanel', 'Amplitude', 'Heap']
  },
  
  'backup': {
    icon: '💾',
    description: 'Data backup and disaster recovery solutions',
    useCases: ['File backup', 'Database backup', 'Incremental backup', 'Cloud sync'],
    commonAlternatives: ['Backblaze', 'Carbonite', 'Acronis']
  },
  
  'blogging-cms': {
    icon: '📝',
    description: 'Content management systems and blogging platforms',
    useCases: ['Blogging', 'Website building', 'Headless CMS', 'Documentation'],
    commonAlternatives: ['Medium', 'Substack', 'Contentful', 'Sanity']
  },
  
  'communication': {
    icon: '💬',
    description: 'Team chat and communication platforms',
    useCases: ['Team messaging', 'Channels', 'Direct messages', 'Threads'],
    commonAlternatives: ['Slack', 'Discord', 'Microsoft Teams']
  },
  
  'video-conferencing': {
    icon: '📹',
    description: 'Video calls and conferencing solutions',
    useCases: ['Video calls', 'Webinars', 'Screen sharing', 'Recording'],
    commonAlternatives: ['Zoom', 'Google Meet', 'Microsoft Teams']
  },
  
  'password-management': {
    icon: '🔐',
    description: 'Password and secrets management',
    useCases: ['Password storage', 'Team sharing', 'Secret management', '2FA'],
    commonAlternatives: ['1Password', 'LastPass', 'Dashlane']
  },
  
  'document-management': {
    icon: '📄',
    description: 'Document storage, OCR, and organization',
    useCases: ['Document storage', 'OCR', 'Tagging', 'Search'],
    commonAlternatives: ['Dropbox', 'Google Drive', 'Box']
  },
  
  'identity-management': {
    icon: '🪪',
    description: 'Identity providers and access management',
    useCases: ['SSO', 'OIDC/OAuth', 'User federation', 'MFA'],
    commonAlternatives: ['Okta', 'Auth0', 'Azure AD']
  },
  
  'paas-hosting': {
    icon: '☁️',
    description: 'Platform-as-a-Service and app hosting',
    useCases: ['App deployment', 'Container hosting', 'Serverless', 'Edge functions'],
    commonAlternatives: ['Heroku', 'Vercel', 'Netlify', 'Railway']
  },
  
  'object-storage': {
    icon: '🪣',
    description: 'S3-compatible object storage solutions',
    useCases: ['File storage', 'Blob storage', 'CDN origin', 'Backup target'],
    commonAlternatives: ['AWS S3', 'Google Cloud Storage', 'Azure Blob']
  },
  
  'automation': {
    icon: '🤖',
    description: 'Workflow automation and integration platforms',
    useCases: ['Workflow automation', 'API integration', 'Scheduled tasks', 'Webhooks'],
    commonAlternatives: ['Zapier', 'Make', 'IFTTT', 'Tray.io']
  },
  
  'notifications': {
    icon: '🔔',
    description: 'Push notifications and alerting systems',
    useCases: ['Push notifications', 'SMS alerts', 'Email notifications', 'Webhooks'],
    commonAlternatives: ['Pushover', 'PagerDuty', 'Twilio']
  },
  
  'low-code': {
    icon: '🧩',
    description: 'Low-code and no-code application builders',
    useCases: ['Internal tools', 'Admin panels', 'Forms', 'Dashboards'],
    commonAlternatives: ['Retool', 'Airtable', 'Notion', 'Coda']
  },
  
  'llm-evaluation': {
    icon: '🧠',
    description: 'LLM testing, evaluation, and observability',
    useCases: ['LLM-as-a-Judge', 'Prompt testing', 'Hallucination detection', 'Tracing'],
    commonAlternatives: ['Braintrust', 'LangSmith', 'Patronus AI']
  },
  
  'project-management': {
    icon: '📋',
    description: 'Project and task management tools',
    useCases: ['Task tracking', 'Kanban boards', 'Gantt charts', 'Time tracking'],
    commonAlternatives: ['Jira', 'Asana', 'Monday.com', 'Linear']
  },
  
  'crm': {
    icon: '🤝',
    description: 'Customer relationship management',
    useCases: ['Contact management', 'Sales pipeline', 'Lead tracking', 'Reporting'],
    commonAlternatives: ['Salesforce', 'HubSpot', 'Pipedrive']
  },
  
  'ecommerce': {
    icon: '🛒',
    description: 'E-commerce platforms and shopping carts',
    useCases: ['Online stores', 'Payment processing', 'Inventory', 'Shipping'],
    commonAlternatives: ['Shopify', 'BigCommerce', 'WooCommerce']
  },
  
  'knowledge-base': {
    icon: '📚',
    description: 'Documentation and knowledge management',
    useCases: ['Documentation', 'Wikis', 'FAQs', 'Internal knowledge'],
    commonAlternatives: ['Notion', 'Confluence', 'GitBook', 'Slite']
  },
  
  'scheduling': {
    icon: '📅',
    description: 'Appointment and meeting scheduling',
    useCases: ['Booking', 'Calendar sync', 'Availability', 'Reminders'],
    commonAlternatives: ['Calendly', 'Cal.com', 'Doodle']
  },
  
  'form-builder': {
    icon: '📝',
    description: 'Form and survey creation tools',
    useCases: ['Forms', 'Surveys', 'Quizzes', 'Data collection'],
    commonAlternatives: ['Typeform', 'Google Forms', 'JotForm']
  },
  
  'feature-flags': {
    icon: '🚩',
    description: 'Feature flag and A/B testing platforms',
    useCases: ['Feature toggles', 'Gradual rollouts', 'A/B testing', 'Remote config'],
    commonAlternatives: ['LaunchDarkly', 'Split.io', 'Optimizely']
  },
  
  'api-gateway': {
    icon: '🚪',
    description: 'API management and gateway solutions',
    useCases: ['Rate limiting', 'Authentication', 'Routing', 'Analytics'],
    commonAlternatives: ['Kong', 'AWS API Gateway', 'Apigee']
  },
  
  'log-management': {
    icon: '📜',
    description: 'Log aggregation and analysis',
    useCases: ['Log collection', 'Search', 'Alerting', 'Visualization'],
    commonAlternatives: ['Splunk', 'Datadog Logs', 'Loggly', 'Papertrail']
  }
}
```

---

## 3. New Projects to Add

Add at minimum these high-value projects (150+ total target):

### Analytics
```javascript
{ name: 'Plausible Analytics', type: 'open-source', selfHostable: true, license: 'AGPL-3.0', techStack: ['Elixir', 'PostgreSQL'], alternativeTo: ['Google Analytics'], survivalScore: 8.4 },
{ name: 'Umami', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Nodejs', 'PostgreSQL'], alternativeTo: ['Google Analytics'], survivalScore: 8.2 },
{ name: 'PostHog', type: 'open-core', selfHostable: true, license: 'MIT', techStack: ['Python', 'Django', 'ClickHouse'], alternativeTo: ['Mixpanel', 'Amplitude', 'Heap'], survivalScore: 8.5 },
{ name: 'Matomo', type: 'open-source', selfHostable: true, license: 'GPL-3.0', techStack: ['PHP', 'MySQL'], alternativeTo: ['Google Analytics'], survivalScore: 8.0 },
{ name: 'Countly', type: 'open-core', selfHostable: true, license: 'AGPL-3.0', techStack: ['Nodejs', 'MongoDB'], alternativeTo: ['Amplitude', 'Mixpanel'], survivalScore: 7.8 },
```

### Communication
```javascript
{ name: 'Mattermost', type: 'open-core', selfHostable: true, license: 'AGPL-3.0', techStack: ['Go', 'React', 'PostgreSQL'], alternativeTo: ['Slack'], survivalScore: 8.5 },
{ name: 'Rocket.Chat', type: 'open-core', selfHostable: true, license: 'MIT', techStack: ['Nodejs', 'MongoDB'], alternativeTo: ['Slack', 'Teams'], survivalScore: 8.0 },
{ name: 'Zulip', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Python', 'Django', 'PostgreSQL'], alternativeTo: ['Slack'], survivalScore: 8.2 },
{ name: 'Matrix/Synapse', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Python'], alternativeTo: ['Slack', 'Discord'], survivalScore: 8.3 },
{ name: 'Element', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['TypeScript', 'React'], alternativeTo: ['Slack', 'Discord'], survivalScore: 8.1 },
```

### Video Conferencing
```javascript
{ name: 'Jitsi Meet', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Java', 'JavaScript'], alternativeTo: ['Zoom', 'Google Meet'], survivalScore: 8.4 },
{ name: 'BigBlueButton', type: 'open-source', selfHostable: true, license: 'LGPL-3.0', techStack: ['Java', 'Scala'], alternativeTo: ['Zoom', 'Webex'], survivalScore: 8.0 },
{ name: 'Galène', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Go'], alternativeTo: ['Zoom'], survivalScore: 7.6 },
```

### PaaS/Hosting
```javascript
{ name: 'Coolify', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['PHP', 'Laravel', 'Docker'], alternativeTo: ['Heroku', 'Netlify', 'Vercel'], survivalScore: 8.0 },
{ name: 'Dokku', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Shell', 'Docker'], alternativeTo: ['Heroku'], survivalScore: 8.4 },
{ name: 'CapRover', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Nodejs', 'Docker'], alternativeTo: ['Heroku'], survivalScore: 7.8 },
{ name: 'Portainer', type: 'open-core', selfHostable: true, license: 'Zlib', techStack: ['Go', 'Docker'], alternativeTo: ['Docker Desktop'], survivalScore: 8.2 },
```

### Object Storage
```javascript
{ name: 'MinIO', type: 'open-source', selfHostable: true, license: 'AGPL-3.0', techStack: ['Go'], alternativeTo: ['AWS S3'], survivalScore: 9.0 },
{ name: 'SeaweedFS', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Go'], alternativeTo: ['AWS S3', 'HDFS'], survivalScore: 8.2 },
{ name: 'Garage', type: 'open-source', selfHostable: true, license: 'AGPL-3.0', techStack: ['Rust'], alternativeTo: ['AWS S3'], survivalScore: 7.8 },
```

### Automation
```javascript
{ name: 'n8n', type: 'open-core', selfHostable: true, license: 'Sustainable-Use', techStack: ['TypeScript', 'Nodejs'], alternativeTo: ['Zapier', 'Make'], survivalScore: 8.2 },
{ name: 'Activepieces', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['TypeScript', 'Nodejs'], alternativeTo: ['Zapier'], survivalScore: 7.8 },
{ name: 'Huginn', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Ruby'], alternativeTo: ['IFTTT', 'Zapier'], survivalScore: 7.5 },
{ name: 'Automatisch', type: 'open-source', selfHostable: true, license: 'AGPL-3.0', techStack: ['Nodejs'], alternativeTo: ['Zapier'], survivalScore: 7.2 },
```

### Low-Code
```javascript
{ name: 'NocoDB', type: 'open-source', selfHostable: true, license: 'AGPL-3.0', techStack: ['Nodejs', 'Vue'], alternativeTo: ['Airtable'], survivalScore: 8.0 },
{ name: 'Appsmith', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Java', 'React'], alternativeTo: ['Retool'], survivalScore: 7.8 },
{ name: 'Budibase', type: 'open-source', selfHostable: true, license: 'GPL-3.0', techStack: ['Nodejs', 'Svelte'], alternativeTo: ['Retool', 'Airtable'], survivalScore: 7.6 },
{ name: 'Baserow', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Python', 'Django', 'Vue'], alternativeTo: ['Airtable'], survivalScore: 7.8 },
```

### LLM Evaluation
```javascript
{ name: 'DeepEval', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Python'], alternativeTo: ['Braintrust', 'LangSmith'], survivalScore: 8.5 },
{ name: 'Langfuse', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['TypeScript', 'Nodejs'], alternativeTo: ['LangSmith', 'Braintrust'], survivalScore: 8.0 },
{ name: 'Phoenix (Arize)', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Python'], alternativeTo: ['Braintrust', 'LangSmith'], survivalScore: 8.4 },
{ name: 'Atla Selene', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Python'], alternativeTo: ['GPT-4 Judge'], survivalScore: 8.3 },
```

### Password Management
```javascript
{ name: 'Vaultwarden', type: 'open-source', selfHostable: true, license: 'AGPL-3.0', techStack: ['Rust'], alternativeTo: ['Bitwarden', '1Password'], survivalScore: 8.6 },
{ name: 'Bitwarden', type: 'open-core', selfHostable: true, license: 'AGPL-3.0', techStack: ['C#', '.NET'], alternativeTo: ['1Password', 'LastPass'], survivalScore: 8.8 },
{ name: 'Passbolt', type: 'open-source', selfHostable: true, license: 'AGPL-3.0', techStack: ['PHP'], alternativeTo: ['1Password Teams'], survivalScore: 7.8 },
```

### Identity Management
```javascript
{ name: 'Keycloak', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Java'], alternativeTo: ['Okta', 'Auth0'], survivalScore: 8.5 },
{ name: 'Authentik', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Python', 'Django'], alternativeTo: ['Okta', 'Auth0'], survivalScore: 8.0 },
{ name: 'Zitadel', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Go'], alternativeTo: ['Auth0', 'Okta'], survivalScore: 7.8 },
{ name: 'Ory', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Go'], alternativeTo: ['Auth0'], survivalScore: 8.2 },
```

### Notifications
```javascript
{ name: 'ntfy', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Go'], alternativeTo: ['Pushover', 'PushBullet'], survivalScore: 8.2 },
{ name: 'Gotify', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Go'], alternativeTo: ['Pushover'], survivalScore: 7.8 },
{ name: 'Apprise', type: 'open-source', selfHostable: true, license: 'BSD-2-Clause', techStack: ['Python'], alternativeTo: ['Pushover'], survivalScore: 7.6 },
{ name: 'Novu', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['TypeScript', 'Nodejs'], alternativeTo: ['Customer.io', 'OneSignal'], survivalScore: 7.8 },
```

### Backup
```javascript
{ name: 'Restic', type: 'open-source', selfHostable: true, license: 'BSD-2-Clause', techStack: ['Go'], alternativeTo: ['Backblaze', 'Acronis'], survivalScore: 8.6 },
{ name: 'BorgBackup', type: 'open-source', selfHostable: true, license: 'BSD-3-Clause', techStack: ['Python', 'C'], alternativeTo: ['Backblaze'], survivalScore: 8.4 },
{ name: 'Duplicati', type: 'open-source', selfHostable: true, license: 'LGPL-2.1', techStack: ['C#'], alternativeTo: ['Backblaze', 'Carbonite'], survivalScore: 7.8 },
{ name: 'Kopia', type: 'open-source', selfHostable: true, license: 'Apache-2.0', techStack: ['Go'], alternativeTo: ['Backblaze'], survivalScore: 8.0 },
```

### CMS/Blogging
```javascript
{ name: 'Ghost', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Nodejs'], alternativeTo: ['Medium', 'Substack'], survivalScore: 8.4 },
{ name: 'WordPress', type: 'open-source', selfHostable: true, license: 'GPL-2.0', techStack: ['PHP', 'MySQL'], alternativeTo: ['Squarespace', 'Wix'], survivalScore: 9.2 },
{ name: 'Strapi', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['Nodejs'], alternativeTo: ['Contentful', 'Sanity'], survivalScore: 8.2 },
{ name: 'Directus', type: 'open-source', selfHostable: true, license: 'GPL-3.0', techStack: ['Nodejs', 'Vue'], alternativeTo: ['Contentful'], survivalScore: 8.0 },
{ name: 'Payload CMS', type: 'open-source', selfHostable: true, license: 'MIT', techStack: ['TypeScript', 'Nodejs'], alternativeTo: ['Contentful', 'Strapi'], survivalScore: 8.0 },
```

---

## 4. UI/UX Enhancements

### 4.1 New Filter Options

Add filters to the header/toolbar:

```jsx
// Filter state
const [filters, setFilters] = useState({
  type: 'all',                    // 'all' | 'open-source' | 'saas' | 'open-core'
  selfHostable: null,             // null | true | false
  license: 'all',                 // 'all' | 'permissive' | 'copyleft'
  maintenanceStatus: 'all',       // 'all' | 'active' | 'maintained' | 'unmaintained'
  minScore: 0,                    // 0-10
  techStack: [],                  // ['Go', 'Python', 'Rust']
  deployment: []                  // ['Docker', 'K8S']
});
```

### 4.2 Enhanced Project Card

Update `ProjectCard` component to show new metadata:

```jsx
function ProjectCard({ project, expanded, onToggle, onRate }) {
  return (
    <div className="project-card">
      {/* Header Row */}
      <div className="card-header">
        <div className="project-logo">{project.logo}</div>
        <div className="project-info">
          <div className="project-name-row">
            <h3>{project.name}</h3>
            
            {/* Badges */}
            <div className="badges">
              <span className={`type-badge ${project.type}`}>{project.type}</span>
              {project.selfHostable && <span className="badge self-host">🏠 Self-Hostable</span>}
              {project.deprecationRisk === 'high' && <span className="badge warning">⚠️ At Risk</span>}
            </div>
          </div>
          
          <p className="description">{project.description}</p>
          
          {/* Tech Stack Pills */}
          <div className="tech-stack">
            {project.techStack.map(tech => (
              <span key={tech} className="tech-pill">{tech}</span>
            ))}
          </div>
          
          {/* Alternative To */}
          {project.alternativeTo?.length > 0 && (
            <div className="alternatives">
              Replaces: {project.alternativeTo.join(', ')}
            </div>
          )}
        </div>
        
        {/* Score & Stats */}
        <div className="card-stats">
          <SurvivalBadge score={project.survivalScore} />
          
          {/* GitHub Stats */}
          {project.githubStats && (
            <div className="github-stats">
              <span>⭐ {formatNumber(project.githubStats.stars)}</span>
              <span>👥 {project.githubStats.contributors}</span>
            </div>
          )}
          
          <span className="license">{project.license}</span>
        </div>
      </div>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="card-expanded">
          {/* Survival Breakdown (existing) */}
          {/* Links (existing) */}
          
          {/* NEW: Maintenance Status */}
          <div className="maintenance-status">
            <MaintenanceIndicator status={project.maintenanceStatus} />
            <span>Last commit: {formatDate(project.githubStats?.lastCommit)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4.3 New Views

Add additional view modes beyond "Survival Index" and "By Use Case":

```jsx
const views = ['index', 'category', 'alternatives', 'techStack'];

// "Alternatives" View - Group by what SaaS they replace
// "Tech Stack" View - Group by implementation language
```

#### Alternatives View

```jsx
function AlternativesView({ projects }) {
  // Group projects by what they replace
  const byAlternative = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      (p.alternativeTo || []).forEach(alt => {
        if (!map[alt]) map[alt] = [];
        map[alt].push(p);
      });
    });
    return map;
  }, [projects]);
  
  return (
    <div className="alternatives-view">
      <h2>Find Alternatives To...</h2>
      <div className="alternatives-grid">
        {Object.entries(byAlternative)
          .sort((a, b) => b[1].length - a[1].length)
          .map(([saas, alts]) => (
            <AlternativeCard key={saas} saasName={saas} alternatives={alts} />
          ))}
      </div>
    </div>
  );
}
```

### 4.4 Search Enhancements

Improve search to include new fields:

```javascript
const searchProjects = (projects, query) => {
  const q = query.toLowerCase();
  return projects.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q)) ||
    p.techStack?.some(t => t.toLowerCase().includes(q)) ||
    p.alternativeTo?.some(a => a.toLowerCase().includes(q)) ||
    p.category.toLowerCase().includes(q)
  );
};
```

---

## 5. API Endpoints

Create a simple API layer for machine consumption:

### 5.1 Data Export Functions

```javascript
// api.js - Export functions for API-like access

export function getAllProjects() {
  return {
    version: '1.0',
    updated: new Date().toISOString(),
    count: projects.length,
    projects: projects.map(formatProjectForAPI)
  };
}

export function getProjectsByCategory(categoryId) {
  return {
    category: categories[categoryId],
    projects: projects.filter(p => p.category === categoryId)
  };
}

export function searchProjects(query, filters = {}) {
  let results = projects;
  
  if (query) {
    results = searchProjects(results, query);
  }
  
  if (filters.type && filters.type !== 'all') {
    results = results.filter(p => p.type === filters.type);
  }
  
  if (filters.selfHostable !== null) {
    results = results.filter(p => p.selfHostable === filters.selfHostable);
  }
  
  if (filters.minScore) {
    results = results.filter(p => p.survivalScore >= filters.minScore);
  }
  
  return results;
}

export function getCategories() {
  return Object.entries(categories).map(([id, cat]) => ({
    id,
    ...cat,
    projectCount: projects.filter(p => p.category === id).length
  }));
}

export function getAlternativesTo(saasName) {
  return projects.filter(p => 
    p.alternativeTo?.some(a => 
      a.toLowerCase() === saasName.toLowerCase()
    )
  );
}
```

### 5.2 JSON Export Button

Add a button to export data as JSON:

```jsx
function ExportButton() {
  const handleExport = () => {
    const data = getAllProjects();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survivalindex-data.json';
    a.click();
  };
  
  return (
    <button onClick={handleExport} className="export-btn">
      📥 Export JSON
    </button>
  );
}
```

---

## 6. GitHub Stats Integration (Optional Enhancement)

If implementing live GitHub stats fetching:

```javascript
// Mock function - in production would call GitHub API
async function fetchGitHubStats(repoUrl) {
  // Extract owner/repo from URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  
  const [, owner, repo] = match;
  
  // In production: fetch from GitHub API
  // For now: return cached/static data
  return {
    stars: 0,
    forks: 0,
    contributors: 0,
    lastCommit: new Date().toISOString(),
    openIssues: 0
  };
}
```

---

## 7. Styling Updates

### 7.1 New Badge Styles

```css
/* Self-hostable badge */
.badge.self-host {
  background: rgba(16, 185, 129, 0.15);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* Warning badge for deprecation risk */
.badge.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #FBBF24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* Tech stack pills */
.tech-pill {
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #60A5FA;
}

/* License badge */
.license {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #71717a;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

/* GitHub stats */
.github-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #a1a1aa;
}

/* Maintenance indicator */
.maintenance-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.maintenance-indicator.active { color: #34D399; }
.maintenance-indicator.maintained { color: #60A5FA; }
.maintenance-indicator.minimal { color: #FBBF24; }
.maintenance-indicator.unmaintained { color: #EF4444; }
```

### 7.2 Filter Bar Styles

```css
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 12px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #e4e4e7;
  font-size: 13px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #a1a1aa;
}

.filter-checkbox.active {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
  color: #A78BFA;
}
```

---

## 8. File Structure

Recommended file organization for the enhanced platform:

```
/survival-platform/
├── index.html
├── src/
│   ├── App.jsx                 # Main component
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── RatingModal.jsx
│   │   ├── FilterBar.jsx
│   │   ├── SurvivalBadge.jsx
│   │   ├── LeverSlider.jsx
│   │   └── ExportButton.jsx
│   ├── views/
│   │   ├── IndexView.jsx
│   │   ├── CategoryView.jsx
│   │   ├── AlternativesView.jsx
│   │   └── TechStackView.jsx
│   ├── data/
│   │   ├── projects.js         # All project data
│   │   ├── categories.js       # Category definitions
│   │   └── levers.js           # Survival lever definitions
│   ├── utils/
│   │   ├── scoring.js          # Score calculation
│   │   ├── search.js           # Search logic
│   │   ├── api.js              # API export functions
│   │   └── formatters.js       # Number/date formatting
│   └── styles/
│       └── index.css           # All styles
└── package.json
```

**Note:** For the current single-file React artifact approach, keep everything in one file but organize with clear section comments.

---

## 9. Implementation Order

### Phase 1: Data Enhancement (Priority: High)
1. Add new project schema fields
2. Expand categories to 25+
3. Add 100+ new projects with full metadata
4. Update existing projects with new fields

### Phase 2: UI Updates (Priority: High)
1. Add self-hostable badge to cards
2. Add license display
3. Add tech stack pills
4. Add "Replaces" display
5. Add enhanced filter bar

### Phase 3: New Views (Priority: Medium)
1. Implement "Alternatives View"
2. Implement "Tech Stack View"
3. Add view switcher to header

### Phase 4: API & Export (Priority: Medium)
1. Implement JSON export
2. Add API-like data functions
3. Add copy-to-clipboard for JSON

### Phase 5: Polish (Priority: Low)
1. GitHub stats display (static/cached initially)
2. Maintenance status indicators
3. Deprecation risk warnings
4. Responsive design improvements

---

## 10. Success Criteria

- [ ] 25+ categories defined
- [ ] 150+ projects with full metadata
- [ ] All projects have `selfHostable`, `license`, `techStack`, `alternativeTo` fields
- [ ] Filter by self-hostable, license type, tech stack
- [ ] "Alternatives To" view showing "Find alternatives to Slack/Heroku/etc."
- [ ] JSON export functionality
- [ ] Mobile-responsive design maintained
- [ ] Rating modal works with all projects
- [ ] Search covers all new fields

---

## Notes for Claude Code

1. **Single File Approach:** Keep as single `.jsx` file for artifact rendering, but organize with clear section comments.

2. **No External API Calls:** GitHub stats should be static/pre-populated data, not live API calls.

3. **Preserve Existing Functionality:** Don't break existing rating system, search, or views.

4. **Performance:** With 150+ projects, ensure filtering/sorting remains fast. Use `useMemo` for computed values.

5. **Data Accuracy:** Use realistic survival scores based on the Yegge framework. Battle-tested projects (PostgreSQL, Git, Nginx) should score higher than newer alternatives.