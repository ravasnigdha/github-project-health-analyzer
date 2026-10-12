const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const msg = typeof data === 'object' && data?.detail?.message
        ? data.detail.message
        : (typeof data === 'object' && data?.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : response.statusText);
      throw new ApiError(msg || `Request failed with status ${response.status}`, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network or server unreachable
    throw new ApiError(
      'Unable to connect to the backend server. Please verify the Python backend is running on port 8000.',
      0,
      err
    );
  }
}

export const api = {
  analyzeRepository: (repositoryUrl) => {
    return request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ repository_url: repositoryUrl }),
    });
  },

  compareRepositories: (repoUrl1, repoUrl2) => {
    return request('/compare', {
      method: 'POST',
      body: JSON.stringify({
        repository_url_1: repoUrl1,
        repository_url_2: repoUrl2,
      }),
    });
  },

  getRateLimit: () => {
    return request('/rate-limit', { method: 'GET' });
  },

  getHealth: () => {
    return request('/health', { method: 'GET' });
  },

  clearCache: () => {
    return request('/cache/clear', { method: 'POST' });
  },
};
