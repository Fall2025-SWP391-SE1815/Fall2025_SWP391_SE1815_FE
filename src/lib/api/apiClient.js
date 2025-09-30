// Fetch-based API client utilities
import { getApiUrl, API_ENDPOINTS } from './apiConfig.js';

// Helper to read token from localStorage - default key 'token'
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
};

export const getAuthHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
};

const readText = async (res) => {
  try {
    return await res.text();
  } catch {
    return null;
  }
};

export const handleApiResponse = async (response, defaultMessage = 'API request failed') => {
  const text = await readText(response);
  if (!response.ok) {
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
    }
    const message = data?.error || data?.message || data?.raw || defaultMessage;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  if (text && text.trim().startsWith('https://')) {
    return text.trim();
  }
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
};

// Simple GET cache + in-flight dedupe
const GET_CACHE = new Map();
const INFLIGHT = new Map();
const DEFAULT_TTL = Number(import.meta.env.VITE_API_GET_CACHE_TTL_MS || 60000);

const isFresh = (entry, ttl) => entry && (Date.now() - entry.at) < ttl;

export const invalidateAllGetCache = () => {
  GET_CACHE.clear();
};

export const apiGet = async (endpoint, errorMessage = 'Không thể lấy dữ liệu', options = {}) => {
  const url = getApiUrl(endpoint);
  const { cache = true, ttl = DEFAULT_TTL } = options;

  if (cache) {
    const cached = GET_CACHE.get(url);
    if (isFresh(cached, ttl)) return cached.data;
    const inflight = INFLIGHT.get(url);
    if (inflight) return inflight;
  }

  const promise = (async () => {
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await handleApiResponse(res, errorMessage);
    if (cache) GET_CACHE.set(url, { at: Date.now(), data });
    INFLIGHT.delete(url);
    return data;
  })();

  if (cache) INFLIGHT.set(url, promise);
  return promise;
};

export const apiPost = async (endpoint, body, errorMessage = 'Không thể tạo dữ liệu', options = {}) => {
  const url = getApiUrl(endpoint);
  const isForm = body instanceof FormData;
  const headers = getAuthHeaders(isForm ? {} : { 'Content-Type': 'application/json' });

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: isForm ? body : JSON.stringify(body),
    credentials: 'include'
  });
  const data = await handleApiResponse(res, errorMessage);
  invalidateAllGetCache();
  return data;
};

export const apiPut = async (endpoint, body, errorMessage = 'Không thể cập nhật dữ liệu') => {
  const url = getApiUrl(endpoint);
  const isForm = body instanceof FormData;
  const headers = getAuthHeaders(isForm ? {} : { 'Content-Type': 'application/json' });
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: isForm ? body : JSON.stringify(body),
    credentials: 'include'
  });
  const data = await handleApiResponse(res, errorMessage);
  invalidateAllGetCache();
  return data;
};

export const apiDelete = async (endpoint, errorMessage = 'Không thể xóa dữ liệu') => {
  const url = getApiUrl(endpoint);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await handleApiResponse(res, errorMessage);
  invalidateAllGetCache();
  return data;
};

// Convenience default export mimicking previous apiClient shape for minimal changes
export const apiClient = {
  get: (endpoint, params, options) => {
    const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
    return apiGet(`${endpoint}${query}`, undefined, options);
  },
  post: (endpoint, data, options) => apiPost(endpoint, data, undefined, options),
  put: (endpoint, data, options) => apiPut(endpoint, data, undefined, options),
  delete: (endpoint, options) => apiDelete(endpoint)
};

export default apiClient;