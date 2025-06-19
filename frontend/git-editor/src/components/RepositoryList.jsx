// src/components/RepositoryList.jsx - Updated for direct GitHub API calls
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { githubService } from "../services/githubService";
import { useNavigate } from "react-router-dom";

import SearchRepo from "./SearchRepo";

const RepositoryList = ({ onSelectRepo }) => {
  const navigate = useNavigate();

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

  const getColor = (index) => {
    const num = (index % 4) + 2;
    const className = `bg-sky-${num}00`;
    return className;
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
      <div className="px-4 py-6 max-w-6xl mx-auto text-[var(--text)]">
        {/* for saving variables from deletion in tailwind */}
        <div className="bg-sky-200 bg-sky-300 bg-sky-400 bg-sky-500 bg-sky-600 bg-sky-700 bg-sky-800 bg-sky-900"></div>
        {/* <h2 className="text-xl font-medium mb-4">Your Repositories</h2> */}
        <div className="flex flex-col items-center justify-center h-52 gap-4 text-[var(--text-muted)]">
          <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          {/* <p>Loading your repositories from GitHub...</p> */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 max-w-6xl mx-auto text-[var(--text)]">
        <h2 className="text-xl font-medium mb-4">Your Repositories</h2>
        <div className="flex flex-col items-center justify-center h-52 gap-3 text-[var(--text-muted)]">
          <p>❌ Error loading repositories</p>
          <p>{error}</p>
          <button
            onClick={loadRepositories}
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius)] bg-[var(--hover)] hover:bg-[var(--bg)] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="px-4 py-6 max-w-6xl mx-auto h-full overflow-y-auto text-[var(--text)]">
        {/* <SearchRepo onSelectRepo={onSearchRepo} /> */}

        <h2 className="text-xl font-medium mb-4">
          Your Repositories ({repositories.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {repositories.map((repo, index) => (
            <div
              key={repo.id}
              className={`${getColor(
                index
              )} border border-[var(--border)] rounded-[var(--radius)] p-5 cursor-pointer transition hover:bg-[var(--hover)] hover:border-[var(--accent)] hover:-translate-y-0.5 shadow-sm `}
              onClick={
                // () => onSelectRepo(repo)
                () => navigate(`/repos/${repo.owner.login}/${repo.name}`)
              }
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium text-[var(--text)]">
                  {repo.name}
                </h3>
                {repo.private && (
                  <span className="bg-[var(--accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    🔒 Private
                  </span>
                )}
              </div>

              <p className="text-sm opacity-70 mb-4 min-h-[36px]">
                {repo.description || "No description available"}
              </p>

              <div className="flex gap-4 text-xs text-[var(--text-muted)] mb-3">
                <span className="flex items-center gap-1">
                  <span className="text-[10px]">⭐</span>
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[10px]">🍴</span>
                  {repo.forks_count}
                </span>
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: getLanguageColor(repo.language),
                      }}
                    />
                    {repo.language}
                  </span>
                )}
              </div>

              <div className="text-[11px] italic text-[var(--text-muted)]">
                Updated {new Date(repo.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default RepositoryList;
