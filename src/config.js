// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  projects: `${API_URL}/api/projects`,
  categories: `${API_URL}/api/categories`,
  stats: `${API_URL}/api/stats`,
  health: `${API_URL}/health`,
};
