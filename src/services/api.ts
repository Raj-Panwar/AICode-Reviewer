const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const apiClient = {
  getToken(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY) || '';
    }
    return '';
  },

  setToken(token: string) {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    }
  },

  getUser() {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(USER_KEY);
      if (val) {
        try { return JSON.parse(val); } catch {}
      }
    }
    return null;
  },

  setUser(user: any) {
    if (typeof localStorage !== 'undefined') {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    }
  },

  async get(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null) {
        url.searchParams.append(k, params[k]);
      }
    });

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(url.toString(), { method: 'GET', headers });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data: data.data || data };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async post(endpoint: string, body: any = {}) {
    const url = new URL(endpoint, window.location.origin);
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data: data };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async delete(endpoint: string) {
    const url = new URL(endpoint, window.location.origin);
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(url.toString(), { method: 'DELETE', headers });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }
};
