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
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

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
 * Helper to calculate survival score from ratings
 */
export function calculateSurvivalScore(ratings) {
  const weights = {
    insightCompression: 0.20,
    substrateEfficiency: 0.18,
    broadUtility: 0.22,
    awareness: 0.15,
    agentFriction: 0.15,
    humanCoefficient: 0.10,
  };

  return (
    ratings.insightCompression * weights.insightCompression +
    ratings.substrateEfficiency * weights.substrateEfficiency +
    ratings.broadUtility * weights.broadUtility +
    ratings.awareness * weights.awareness +
    ratings.agentFriction * weights.agentFriction +
    ratings.humanCoefficient * weights.humanCoefficient
  );
}

/**
 * Get survival tier from score
 */
export function getSurvivalTier(score) {
  if (score >= 9.0) return 'S';
  if (score >= 8.0) return 'A';
  if (score >= 7.0) return 'B';
  if (score >= 6.0) return 'C';
  if (score >= 5.0) return 'D';
  return 'F';
}

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

export default {
  projects: projectsApi,
  aiJudge: aiJudgeApi,
  ratings: ratingsApi,
  auth: authApi,
  calculateSurvivalScore,
  getSurvivalTier,
};
