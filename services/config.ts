// API URL Configuration
// This file is only used in the frontend (browser)
// @ts-ignore - import.meta.env is available in Vite
const isProd = import.meta.env?.PROD || false;
// @ts-ignore
const apiUrl = import.meta.env?.VITE_API_URL || '';

export const API_URL = isProd && apiUrl
  ? apiUrl
  : 'http://localhost:3001';

// For API endpoints, append /api
export const API_BASE = `${API_URL}/api`;
