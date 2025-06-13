const API_BASE_URL = "http://localhost:4000";

export const githubService = {
  // Get user repositories
  async getRepositories(token, page = 1, perPage = 30) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/repos?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GitHub service error (repos):", error);
      throw error;
    }
  },

  // epository content
  async getRepositoryContents(token, owner, repo, path = "") {
    try {
      const url = path
        ? `${API_BASE_URL}/api/repos/${owner}/${repo}/contents/${path}`
        : `${API_BASE_URL}/api/repos/${owner}/${repo}/contents`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contents: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GitHub service error (contents):", error);
      throw error;
    }
  },

  // Get file content
  async getFileContent(token, owner, repo, filePath) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/repos/${owner}/${repo}/file/${filePath}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GitHub service error (file):", error);
      throw error;
    }
  },

  // Update file content
  async updateFile(token, owner, repo, filePath, content, sha, message) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/repos/${owner}/${repo}/file/${filePath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            sha,
            message: message || `Update ${filePath}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update file: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GitHub service error (update):", error);
      throw error;
    }
  },

  // Create new file
  async createFile(token, owner, repo, filePath, content, message) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/repos/${owner}/${repo}/file/${filePath}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            message: message || `Create ${filePath}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create file: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GitHub service error (create):", error);
      throw error;
    }
  },

  // Delete file
  async deleteFile(token, owner, repo, filePath, sha, message) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/repos/${owner}/${repo}/file/${filePath}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sha,
            message: message || `Delete ${filePath}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GitHub service error (delete):", error);
      throw error;
    }
  },
};
