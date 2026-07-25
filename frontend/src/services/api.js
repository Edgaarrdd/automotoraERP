const API_BASE_URL = 'http://127.0.0.1:8000/api';

export function getAuthToken() {
  return localStorage.getItem('automotora_token') || '';
}

export function setAuthToken(token) {
  localStorage.setItem('automotora_token', token);
}

export function getCurrentUserData() {
  const userJson = localStorage.getItem('automotora_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

export function setCurrentUserData(user) {
  localStorage.setItem('automotora_user', JSON.stringify(user));
}

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Error en la petición' }));
      throw new Error(errData.detail || `Error HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API Fetch fallback active for ${endpoint}]:`, err.message);
    throw err;
  }
}
