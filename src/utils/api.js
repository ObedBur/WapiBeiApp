import authService from '../services/auth.service';
import { fetchJson } from './fetcher';

export async function fetchWithAuth(url, options = {}) {
  const user = authService.getCurrentUser && authService.getCurrentUser();
  const token = user?.token;
  const headers = Object.assign({}, options.headers || {});
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = Object.assign({}, options, { headers });
  return fetchJson(url, opts);
}

export async function postJson(url, body, opts = {}) {
  return fetchWithAuth(url, Object.assign({}, opts, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}), body: JSON.stringify(body) }));
}

// re-export fetchJson for convenience
export { fetchJson }; 