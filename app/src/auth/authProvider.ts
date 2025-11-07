import { AuthProvider } from 'react-admin';

const BASE = '/api';
const TOKEN_KEY = 'sameday_token';
const EXP_KEY = 'sameday_token_exp';

function setToken(token: string, expireAtUtc: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXP_KEY, expireAtUtc);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getExp(): number | null {
  const v = localStorage.getItem(EXP_KEY);
  return v ? Date.parse(v) : null;
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXP_KEY);
}

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const res = await fetch(`${BASE}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Username': username,
        'X-Auth-Password': password
      }
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.token) {
      throw new Error(json?.error?.message || json?.message || 'Invalid credentials');
    }
    setToken(json.token, json.expire_at_utc || json.expire_at);
    return '/';
  },
  logout: async () => {
    clearToken();
  },
  checkError: async (error) => {
    if (error?.status === 401) {
      clearToken();
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: async () => {
    const token = getToken();
    const exp = getExp();
    if (!token || (exp && Date.now() >= exp)) {
      clearToken();
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getPermissions: async () => Promise.resolve('user'),
  getIdentity: async () => Promise.resolve({ id: 'me', fullName: 'User' })
};

export default authProvider;


