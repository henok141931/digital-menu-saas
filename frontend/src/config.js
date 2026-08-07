// config.js
// This ensures that the frontend communicates with the local backend during development,
// and points to your live Render backend when deployed to Vercel/Netlify.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
