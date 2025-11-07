import { DataProvider } from 'react-admin';
import { getToken } from './auth/authProvider';

const API = '/api';

interface AWB {
  awbNumber: string;
  [key: string]: any;
}

function buildQuery(params: Record<string, any>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.set(k, String(v));
  });
  return usp.toString();
}

async function http(method: string, url: string, body?: any, withAuth = false) {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (withAuth) {
    const token = getToken();
    if (token) headers['X-Auth-Token'] = token;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const err: any = new Error(json?.message || 'Request failed');
    (err.status = res.status), (err.body = json);
    throw err;
  }
  return { json, headers: res.headers } as { json: any; headers: Headers };
}

function toUnixForBucharest(dateStr: string): { startTimestamp: number; endTimestamp: number } {
  // Compute UNIX timestamps for 00:00:00 and 23:59:59 in Europe/Bucharest
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const tz = 'Europe/Bucharest';
  const toUtc = (hh: number, mm: number, ss: number) => {
    // Invert time zone using one-iteration trick via formatToParts
    const guess = Date.UTC(y, (m || 1) - 1, d || 1, hh, mm, ss);
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const parts = Object.fromEntries(fmt.formatToParts(new Date(guess)).map((p) => [p.type, p.value]));
    const asUTC = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    // t such that tz(t) = (y,m,d,hh,mm,ss)
    return Math.floor((guess - (asUTC - guess)) / 1000);
  };
  return { startTimestamp: toUtc(0, 0, 0), endTimestamp: toUtc(23, 59, 59) };
}

const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
    const filter = params.filter || {};
    if (resource === 'products' || resource === 'clients') {
      const key = resource === 'products' ? 'ra-products' : 'ra-clients';
      let all: any[] | null = null;
      try {
        const raw = localStorage.getItem(key);
        if (raw) all = JSON.parse(raw);
      } catch {}
      if (!Array.isArray(all) || all.length === 0) {
        const url = resource === 'products' ? '/resources/products.json' : '/resources/clients.json';
        const resp = await fetch(url);
        all = await resp.json();
      }
      if (!Array.isArray(all)) {
        throw new Error(`Failed to load local data for ${resource}`);
      }
      const start = (page - 1) * perPage;
      const items = all.slice(start, start + perPage);
      return { data: items, total: all.length };
    }
    if (resource === 'awbs') {
      const query: any = { page, countPerPage: perPage };
      const dateStr: string | undefined = filter.date;
      if (dateStr) {
        const { startTimestamp, endTimestamp } = toUnixForBucharest(dateStr);
        query.startTimestamp = startTimestamp;
        query.endTimestamp = endTimestamp;
      }
      const url = `${API}/client-awb-list?${buildQuery(query)}`;
      const { json } = await http('GET', url, undefined, true);
      return {
        data: json.data.map((awb: AWB) => ({
          ...awb,
          id: awb.awbNumber
        })),
        total: json.total
      }
    }
    if (resource === 'pickup-points') {
      const query: any = { page, countPerPage: perPage };
      const url = `${API}/client/pickup-points?${buildQuery(query)}`;
      const { json } = await http('GET', url, undefined, true);
      return {
        data: json.data,
        total: json.total
      };
    }
    throw new Error(`Unsupported resource ${resource}`);
  },
  getOne: async (resource, params) => {
    if (resource === 'products' || resource === 'clients') {
      const key = resource === 'products' ? 'ra-products' : 'ra-clients';
      const all: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      const found = all.find((e) => e.id === params.id);
      if (!found) throw Object.assign(new Error('Not found'), { status: 404 });
      return { data: found };
    }
    throw new Error(`Unsupported getOne for ${resource}`);
  },
  getMany: async (resource, params) => {
    if (resource === 'products' || resource === 'clients') {
      const key = resource === 'products' ? 'ra-products' : 'ra-clients';
      const all: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      return { data: all.filter((e) => params.ids.includes(e.id)) };
    }
    return { data: [] };
  },
  getManyReference: async (resource, params) => {
    // Not used
    return { data: [], total: 0 };
  },
  create: async (resource, params) => {
    if (resource === 'awbs') {
      const { json } = await http('POST', `${API}/awb`, params.data, true);
      return {
        data: {
          id: json.awbNumber,
          ...json
        }
      }
    }
    if (resource === 'pickup-points') {
      const { json } = await http('POST', `${API}/client/pickup-points`, params.data, true);
      return { data: json };
    }
    if (resource === 'products' || resource === 'clients') {
      const key = resource === 'products' ? 'ra-products' : 'ra-clients';
      const all: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      const created = { id: crypto.randomUUID?.() || String(Date.now()), ...params.data };
      all.push(created);
      localStorage.setItem(key, JSON.stringify(all));
      return { data: created };
    }
    throw new Error(`Unsupported create for ${resource}`);
  },
  update: async (resource, params) => {
    if (resource === 'products' || resource === 'clients') {
      const key = resource === 'products' ? 'ra-products' : 'ra-clients';
      const all: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = all.findIndex((e) => e.id === params.id);
      if (idx === -1) throw Object.assign(new Error('Not found'), { status: 404 });
      all[idx] = { ...all[idx], ...params.data, id: params.id };
      localStorage.setItem(key, JSON.stringify(all));
      return { data: all[idx] };
    }
    throw new Error(`Unsupported update for ${resource}`);
  },
  updateMany: async () => ({ data: [] }),
  delete: async (resource, params) => {
    throw new Error(`Unsupported delete for ${resource}`);
  },
  deleteMany: async () => ({ data: [] })
};

export default dataProvider;


