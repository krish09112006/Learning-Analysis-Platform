export const BASE_URL = 'http://localhost/learning-analytics-backend/api/';

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  let authHeaders = {};
  try {
    const storedUser = localStorage.getItem('lap_current_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.token) {
        authHeaders['Authorization'] = `Bearer ${parsed.token}`;
        authHeaders['X-Auth-Token'] = parsed.token;
      }
      if (parsed?.email) {
        authHeaders['X-Session-Email'] = parsed.email;
      }
    }
  } catch (e) {}

  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const timestamp = new Date().toLocaleTimeString();

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const err = new Error(data.error || `HTTP error ${response.status}`);
      err.endpoint = endpoint;
      err.url = url;
      err.status = response.status;
      err.timestamp = timestamp;
      throw err;
    }
    
    return data;
  } catch (error) {
    if (!error.endpoint) {
      error.endpoint = endpoint;
      error.url = url;
      error.timestamp = timestamp;
    }
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

export async function checkBackendHealth() {
  const startTime = Date.now();
  try {
    const res = await fetch(`${BASE_URL}health.php`, { cache: 'no-store' });
    const responseTime = Date.now() - startTime;
    if (!res.ok) {
      return {
        online: false,
        status: 'error',
        url: `${BASE_URL}health.php`,
        message: `HTTP error ${res.status}`,
        responseTime
      };
    }
    const data = await res.json();
    return {
      online: data.status === 'healthy',
      ...data,
      url: `${BASE_URL}health.php`,
      clientResponseTimeMs: responseTime
    };
  } catch (err) {
    return {
      online: false,
      status: 'offline',
      url: `${BASE_URL}health.php`,
      message: err.message || 'Network error: Server unreachable',
      clientResponseTimeMs: Date.now() - startTime
    };
  }
}

export default BASE_URL;
