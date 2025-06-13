// src/services/authService.js - Updated for your backend
const API_BASE_URL = 'http://localhost:4000';

export const authService = {
  // Verify token with your backend
  async verifyToken(token) {
    try {
      // 🎯 FIXED: Use GET method and correct endpoint
      const response = await fetch(`${API_BASE_URL}/auth/github/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.user; // Your backend returns { success: true, user: {...} }
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('Auth service error:', error);
      throw error;
    }
  },

  // Start OAuth flow
  initiateLogin() {
    // 🎯 FIXED: Use correct login endpoint
    window.location.href = `${API_BASE_URL}/auth/github/login`;
  },

  // Extract token from URL callback
  extractTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token'); // Your backend sends raw GitHub token
  },

  // Store token locally
  storeToken(token) {
    localStorage.setItem('github_token', token);
  },

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('github_token');
  },

  // Clear stored token
  clearToken() {
    localStorage.removeItem('github_token');
  }
};

// src/services/githubService.js - Direct GitHub API calls (since your github routes are commented out)
export const githubService = {
  // Get user repositories directly from GitHub API
  async getRepositories(githubToken, page = 1, perPage = 30) {
    try {
      // 🎯 FIXED: Call GitHub API directly since your backend github routes are commented out
      const response = await fetch(`https://api.github.com/user/repos?page=${page}&per_page=${perPage}&sort=updated`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Code-Editor'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub service error (repos):', error);
      throw error;
    }
  },

  // Get repository contents directly from GitHub API
  async getRepositoryContents(githubToken, owner, repo, path = '') {
    try {
      const url = path 
        ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        : `https://api.github.com/repos/${owner}/${repo}/contents`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Code-Editor'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contents: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub service error (contents):', error);
      throw error;
    }
  },

  // Get file content directly from GitHub API
  async getFileContent(githubToken, owner, repo, filePath) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Code-Editor'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub service error (file):', error);
      throw error;
    }
  }
}