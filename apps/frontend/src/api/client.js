// API client for SurvivalIndex backend

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Set auth token in localStorage
 */
function setAuthToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Projects API
 */
export const projectsApi = {
  /**
   * Get all projects with pagination
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params}` : '';
    return await apiFetch(`/projects${query}`);
  },

  /**
   * Get single project by ID
   */
  async getById(id) {
    return await apiFetch(`/projects/${id}`);
  },

  /**
   * Get leaderboard (projects sorted by survival score)
   */
  async getLeaderboard(limit = 100) {
    return await apiFetch(`/projects/leaderboard?limit=${limit}`);
  },

  /**
   * Create new project
   */
  async create(projectData) {
    return await apiFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Update project
   */
  async update(id, projectData) {
    return await apiFetch(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Delete project
   */
  async delete(id) {
    return await apiFetch(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * AI Judge API
 */
export const aiJudgeApi = {
  /**
   * Evaluate a project with AI
   */
  async evaluate(projectId) {
    return await apiFetch(`/ai-judge/evaluate/${projectId}`, {
      method: 'POST',
    });
  },

  /**
   * Batch evaluate multiple projects
   */
  async batchEvaluate(projectIds) {
    return await apiFetch('/ai-judge/batch-evaluate', {
      method: 'POST',
      body: JSON.stringify({ projectIds }),
    });
  },

  /**
   * Re-evaluate stale projects
   */
  async reevaluateStale(daysOld = 30) {
    return await apiFetch(`/ai-judge/reevaluate-stale?daysOld=${daysOld}`, {
      method: 'POST',
    });
  },
};

/**
 * Ratings API
 */
export const ratingsApi = {
  /**
   * Submit a user rating
   */
  async submit(ratingData) {
    return await apiFetch('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },

  /**
   * Get ratings for a project
   */
  async getByProject(projectId) {
    return await apiFetch(`/ratings/${projectId}`);
  },

  /**
   * Get average rating for a project
   */
  async getAverage(projectId) {
    return await apiFetch(`/ratings/${projectId}/average`);
  },
};

/**
 * SFI-v3 default weights
 */
const SFI_WEIGHTS = { w_s: 1.0, w_u: 0.8, w_h: 0.6, w_a: 1.0, w_f: 1.0 };

/**
 * Clamp value between min and max
 */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * SFI-v3: Calculate survival score (0-100) from 5 variables.
 * Input: { savings, usage, human, awarenessCost, frictionCost } each 1-10
 */
export function calculateSurvivalScore(components) {
  const s = clamp(components.savings || 5, 1, 10);
  const u = clamp(components.usage || 5, 1, 10);
  const h = clamp(components.human || 5, 1, 10);
  const a = clamp(components.awarenessCost || 5, 1, 10);
  const f = clamp(components.frictionCost || 5, 1, 10);

  const logRatio =
    SFI_WEIGHTS.w_s * Math.log(s) +
    SFI_WEIGHTS.w_u * Math.log(u) +
    SFI_WEIGHTS.w_h * Math.log(h) -
    SFI_WEIGHTS.w_a * Math.log(a) -
    SFI_WEIGHTS.w_f * Math.log(f);

  return Math.round(clamp(50 + 15 * logRatio, 0, 100) * 10) / 10;
}

/**
 * SFI-v3: Map old 7-lever ratings to 5 SFI variables.
 * Used for bootstrap/fallback when only old-style ratings are available.
 */
export function mapOldRatingsToSfi(ratings) {
  return {
    savings: clamp(((ratings.insightCompression || 5) + (ratings.broadUtility || 5)) / 2, 1, 10),
    usage: clamp(ratings.broadUtility || 5, 1, 10),
    human: clamp(ratings.humanCoefficient || 5, 1, 10),
    awarenessCost: clamp(11 - (ratings.awareness || 5), 1, 10),
    frictionCost: clamp(11 - (ratings.agentFriction || 5), 1, 10),
  };
}

/**
 * SFI-v3: Get survival tier from score (0-100)
 */
export function getSurvivalTier(score) {
  if (score >= 82) return 'legendary';
  if (score >= 65) return 'strong';
  if (score >= 45) return 'competitive';
  if (score >= 25) return 'pressured';
  return 'endangered';
}

/**
 * SFI API
 */
export const sfiApi = {
  async getToolLeaderboard(category) {
    return await apiFetch(`/sfi/leaderboard/tools?category=${encodeURIComponent(category)}`);
  },
  async getCategoryLeaderboard() {
    return await apiFetch('/sfi/leaderboard/categories');
  },
  async getAgentLeaderboard() {
    return await apiFetch('/sfi/leaderboard/agents');
  },
  async getToolDetail(toolName, category) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return await apiFetch(`/sfi/tool/${encodeURIComponent(toolName)}${params}`);
  },
  async getTiers() {
    return await apiFetch('/sfi/tiers');
  },
  async getCategories() {
    return await apiFetch('/sfi/categories');
  },
  async getVersion() {
    return await apiFetch('/sfi/version');
  },
  async triggerComputation() {
    return await apiFetch('/sfi/compute', { method: 'POST' });
  },
};

/**
 * Auth API
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Save token to localStorage
    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  /**
   * Logout (clear session)
   */
  async logout() {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear token, even if request fails
      setAuthToken(null);
    }
  },

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      const response = await apiFetch('/auth/me');
      return response.user;
    } catch (error) {
      // If token is invalid, clear it
      setAuthToken(null);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!getAuthToken();
  },

  /**
   * Get auth token
   */
  getToken() {
    return getAuthToken();
  }
};

/**
 * Submissions API
 */
export const submissionsApi = {
  /**
   * Submit a new project for review
   */
  async submit(submissionData) {
    return await apiFetch('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  /**
   * Get all submissions (admin only)
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params}` : '';
    return await apiFetch(`/submissions${query}`);
  },

  /**
   * Get single submission by ID (admin only)
   */
  async getById(id) {
    return await apiFetch(`/submissions/${id}`);
  },

  /**
   * Get pending submissions count (admin only)
   */
  async getPendingCount() {
    return await apiFetch('/submissions/pending/count');
  },

  /**
   * Approve a submission (admin only)
   */
  async approve(id, data = {}) {
    return await apiFetch(`/submissions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reject a submission (admin only)
   */
  async reject(id, data) {
    return await apiFetch(`/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a submission (admin only)
   */
  async delete(id) {
    return await apiFetch(`/submissions/${id}`, {
      method: 'DELETE',
    });
  }
};

/**
 * ACES API
 */
export const acesApi = {
  /**
   * Submit an agent choice observation
   */
  async submitObservation(data) {
    return await apiFetch('/aces/observations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get ACES metrics for a project
   */
  async getMetrics(projectId) {
    return await apiFetch(`/aces/metrics/${projectId}`);
  },

  /**
   * Get all project ACES metrics
   */
  async getAllMetrics() {
    return await apiFetch('/aces/metrics');
  },

  /**
   * Trigger aggregation for a project (admin)
   */
  async aggregate(projectId) {
    return await apiFetch(`/aces/aggregate/${projectId}`, {
      method: 'POST',
    });
  },

  /**
   * Trigger aggregation for all projects (admin)
   */
  async aggregateAll() {
    return await apiFetch('/aces/aggregate', {
      method: 'POST',
    });
  },
};

/**
 * AAS (Agent Awareness Score) API
 */
export const aasApi = {
  async getLeaderboard() {
    return await apiFetch('/aas/leaderboard');
  },
  async getCategoryLeaderboard(category) {
    return await apiFetch(`/aas/leaderboard/${encodeURIComponent(category)}`);
  },
  async getToolDetail(toolName, category) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return await apiFetch(`/aas/tool/${encodeURIComponent(toolName)}${params}`);
  },
  async getToolModels(toolName, category) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return await apiFetch(`/aas/tool/${encodeURIComponent(toolName)}/models${params}`);
  },
  async getHiddenGems(category) {
    if (category) return await apiFetch(`/aas/hidden-gems/${encodeURIComponent(category)}`);
    return await apiFetch('/aas/hidden-gems');
  },
  async getCategories() {
    return await apiFetch('/aas/categories');
  },
  async getVersion() {
    return await apiFetch('/aas/version');
  },
  async triggerComputation() {
    return await apiFetch('/aas/compute', { method: 'POST' });
  },
  async submitExecution(data) {
    return await apiFetch('/aas/executions', { method: 'POST', body: JSON.stringify(data) });
  },
  async submitExpertEvaluation(data) {
    return await apiFetch('/aas/expert-evaluations', { method: 'POST', body: JSON.stringify(data) });
  },
};

/**
 * AAS: Classify hidden gem from gap
 */
export function classifyHiddenGem(aas, expertPref) {
  if (expertPref === null || expertPref === undefined) return null;
  const gap = expertPref - aas;
  if (gap > 30) return 'strong_hidden_gem';
  if (gap > 15) return 'mild_hidden_gem';
  if (gap > -15) return 'aligned';
  if (gap > -30) return 'mildly_overhyped';
  return 'overhyped';
}

/**
 * AAS: Get color for score
 */
export function getAASColor(score) {
  if (score >= 80) return '#10B981'; // green
  if (score >= 60) return '#3B82F6'; // blue
  if (score >= 40) return '#F59E0B'; // amber
  if (score >= 20) return '#EF4444'; // red
  return '#71717a'; // gray
}

export default {
  projects: projectsApi,
  aiJudge: aiJudgeApi,
  ratings: ratingsApi,
  auth: authApi,
  submissions: submissionsApi,
  aces: acesApi,
  sfi: sfiApi,
  aas: aasApi,
  calculateSurvivalScore,
  getSurvivalTier,
  mapOldRatingsToSfi,
  classifyHiddenGem,
  getAASColor,
};
