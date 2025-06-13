// src/components/RepositoryList.jsx - Updated for direct GitHub API calls
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { githubService } from "../services/githubService";
import SearchRepo from "./SearchRepo";

const RepositoryList = ({ onSelectRepo }) => {
  const { token } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRepositories();
  }, [token]);

  const loadRepositories = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Loading repositories from GitHub API...");

      // 🎯 FIXED: Use direct GitHub API call since your backend github routes are commented out
      const repos = await githubService.getRepositories(token);
      console.log("✅ Repositories loaded:", repos.length);

      setRepositories(repos);
    } catch (err) {
      console.error("Error loading repositories:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      Python: "#3572A5",
      Java: "#b07219",
      HTML: "#e34c26",
      CSS: "#1572B6",
      PHP: "#777bb4",
      Ruby: "#701516",
      Go: "#00add8",
      Rust: "#dea584",
      "C++": "#f34b7d",
      C: "#555555",
      Vue: "#4FC08D",
      React: "#61DAFB",
      Swift: "#FA7343",
      Kotlin: "#7F52FF",
      Dart: "#00B4AB",
      Shell: "#89e051",
    };
    return colors[language] || "#586069";
  };

  if (loading) {
    return (
      <div className="repository-list">
        <h2>Your Repositories</h2>
        <div className="loading-repos">
          <div className="spinner"></div>
          <p>Loading your repositories from GitHub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repository-list">
        <h2>Your Repositories</h2>
        <div className="error-repos">
          <p>❌ Error loading repositories</p>
          <p>{error}</p>
          <button onClick={loadRepositories} className="button primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="repository-list">
      {/* search repo container */}
      <SearchRepo />
      <h2>Your Repositories ({repositories.length})</h2>

      <div className="repo-grid">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className="repo-card"
            onClick={() => onSelectRepo(repo)}
          >
            <div className="repo-header">
              <h3>{repo.name}</h3>
              {repo.private && (
                <span className="private-badge">🔒 Private</span>
              )}
            </div>
            <p className="repo-description">
              {repo.description || "No description available"}
            </p>
            <div className="repo-stats">
              <span className="stat">
                <span className="stat-icon">⭐</span>
                {repo.stargazers_count}
              </span>
              <span className="stat">
                <span className="stat-icon">🍴</span>
                {repo.forks_count}
              </span>
              {repo.language && (
                <span className="stat">
                  <span
                    className="language-dot"
                    style={{ backgroundColor: getLanguageColor(repo.language) }}
                  ></span>
                  {repo.language}
                </span>
              )}
            </div>
            <div className="repo-updated">
              Updated {new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositoryList;
