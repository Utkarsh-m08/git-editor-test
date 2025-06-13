const express = require("express");
const axios = require("axios");
const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    req.user = response.data;
    req.token = token;
    next();
  } catch (error) {
    console.log("❌ Authentication failed:", error.response?.status);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// All routes require authentication
router.use(authenticateToken);

// public reps dont require token

// Get user repositories
router.get("/repos", async (req, res) => {
  try {
    const { page = 1, per_page = 30, sort = "updated" } = req.query;

    console.log(`📚 Fetching repositories for user: ${req.user.login}`);

    const response = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${req.token}` },
      params: { page, per_page, sort, affiliation: "owner,collaborator" },
    });

    const repositories = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      default_branch: repo.default_branch,
    }));

    console.log(`✅ Found ${repositories.length} repositories`);
    res.json(repositories);
  } catch (error) {
    console.error(
      "❌ Error fetching repositories:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// Get repository contents - ROOT DIRECTORY
router.get("/repos/:owner/:repo/contents", async (req, res) => {
  try {
    const { owner, repo } = req.params;

    console.log(`📁 Fetching root contents: ${owner}/${repo}`);

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/`,
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );

    const contents = Array.isArray(response.data)
      ? response.data
      : [response.data];

    const processedContents = contents.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: item.sha,
      download_url: item.download_url,
    }));

    console.log(`✅ Found ${processedContents.length} items in root`);
    res.json(processedContents);
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: "Repository not found" });
    } else {
      console.error(
        "❌ Error fetching root contents:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to fetch repository contents" });
    }
  }
});

// Get repository contents - SPECIFIC PATH (FIXED PATTERN)
router.get("/repos/:owner/:repo/contents/:path", async (req, res) => {
  try {
    const { owner, repo, path } = req.params;

    // Handle nested paths by reconstructing from the full URL path
    const fullPath = req.path;
    const pathMatch = fullPath.match(/\/repos\/[^/]+\/[^/]+\/contents\/(.+)/);
    const actualPath = pathMatch ? pathMatch[1] : path;

    console.log(`📁 Fetching contents: ${owner}/${repo}/${actualPath}`);

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${actualPath}`,
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );

    const contents = Array.isArray(response.data)
      ? response.data
      : [response.data];

    const processedContents = contents.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: item.sha,
      download_url: item.download_url,
    }));

    console.log(`✅ Found ${processedContents.length} items in ${actualPath}`);
    res.json(processedContents);
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: "Directory not found" });
    } else {
      console.error(
        "❌ Error fetching directory contents:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to fetch directory contents" });
    }
  }
});

// Get file content (FIXED PATTERN)
router.get("/repos/:owner/:repo/file/:filename", async (req, res) => {
  try {
    const { owner, repo, filename } = req.params;

    // Handle nested file paths by reconstructing from the full URL path
    const fullPath = req.path;
    const pathMatch = fullPath.match(/\/repos\/[^/]+\/[^/]+\/file\/(.+)/);
    const actualPath = pathMatch ? pathMatch[1] : filename;

    console.log(`📄 Fetching file: ${owner}/${repo}/${actualPath}`);

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${actualPath}`,
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );

    if (response.data.type !== "file") {
      return res.status(400).json({ error: "Path is not a file" });
    }

    const content = Buffer.from(response.data.content, "base64").toString(
      "utf-8"
    );

    console.log(`✅ File loaded: ${actualPath} (${content.length} characters)`);

    res.json({
      content,
      sha: response.data.sha,
      path: response.data.path,
      name: response.data.name,
      size: response.data.size,
    });
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: "File not found" });
    } else {
      console.error(
        "❌ Error fetching file:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  }
});

// Update file content (FIXED PATTERN)
router.put("/repos/:owner/:repo/file/:filename", async (req, res) => {
  try {
    const { owner, repo, filename } = req.params;
    const { content, sha, message } = req.body;

    // Handle nested file paths by reconstructing from the full URL path
    const fullPath = req.path;
    const pathMatch = fullPath.match(/\/repos\/[^/]+\/[^/]+\/file\/(.+)/);
    const actualPath = pathMatch ? pathMatch[1] : filename;

    if (!content || !sha) {
      return res.status(400).json({ error: "Content and SHA are required" });
    }

    console.log(`💾 Updating file: ${owner}/${repo}/${actualPath}`);

    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${actualPath}`,
      {
        message: message || `Update ${actualPath}`,
        content: Buffer.from(content).toString("base64"),
        sha: sha,
      },
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );

    console.log(`✅ File updated: ${actualPath}`);

    res.json({
      success: true,
      sha: response.data.content.sha,
      commit: {
        sha: response.data.commit.sha,
        message: response.data.commit.message,
      },
    });
  } catch (error) {
    console.error(
      "❌ Error updating file:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to update file" });
  }
});

// Create new file (FIXED PATTERN)
router.post("/repos/:owner/:repo/file/:filename", async (req, res) => {
  try {
    const { owner, repo, filename } = req.params;
    const { content, message } = req.body;

    // Handle nested file paths by reconstructing from the full URL path
    const fullPath = req.path;
    const pathMatch = fullPath.match(/\/repos\/[^/]+\/[^/]+\/file\/(.+)/);
    const actualPath = pathMatch ? pathMatch[1] : filename;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    console.log(`📝 Creating file: ${owner}/${repo}/${actualPath}`);

    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${actualPath}`,
      {
        message: message || `Create ${actualPath}`,
        content: Buffer.from(content).toString("base64"),
      },
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );

    console.log(`✅ File created: ${actualPath}`);

    res.status(201).json({
      success: true,
      sha: response.data.content.sha,
      commit: {
        sha: response.data.commit.sha,
        message: response.data.commit.message,
      },
    });
  } catch (error) {
    if (error.response?.status === 422) {
      res.status(409).json({ error: "File already exists" });
    } else {
      console.error(
        "❌ Error creating file:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to create file" });
    }
  }
});

// Delete file (FIXED PATTERN)
router.delete("/repos/:owner/:repo/file/:filename", async (req, res) => {
  try {
    const { owner, repo, filename } = req.params;
    const { sha, message } = req.body;

    // Handle nested file paths by reconstructing from the full URL path
    const fullPath = req.path;
    const pathMatch = fullPath.match(/\/repos\/[^/]+\/[^/]+\/file\/(.+)/);
    const actualPath = pathMatch ? pathMatch[1] : filename;

    if (!sha) {
      return res.status(400).json({ error: "SHA is required to delete file" });
    }

    console.log(`🗑️ Deleting file: ${owner}/${repo}/${actualPath}`);

    const response = await axios.delete(
      `https://api.github.com/repos/${owner}/${repo}/contents/${actualPath}`,
      {
        data: {
          message: message || `Delete ${actualPath}`,
          sha: sha,
        },
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );

    console.log(`✅ File deleted: ${actualPath}`);

    res.json({
      success: true,
      commit: {
        sha: response.data.commit.sha,
        message: response.data.commit.message,
      },
    });
  } catch (error) {
    console.error(
      "❌ Error deleting file:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to delete file" });
  }
});

module.exports = router;
