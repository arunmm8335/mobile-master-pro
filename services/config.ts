// API URL Configuration
// In production, use the environment variable VITE_API_URL
// In development, use local server
export const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com'
  : 'http://localhost:3001';

// For API endpoints, append /api
export const API_BASE = `${API_URL}/api`;
