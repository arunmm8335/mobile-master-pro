export const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'http://localhost:5000'
  : 'http://localhost:5000';
