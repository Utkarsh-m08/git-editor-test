import { useState, useEffect } from "react";
import FileExplorer from "./FileExplorer";
import RichTextEditor from "./RichTextEditor";
import { Carrot, CircleAlert, Folder, Home } from "lucide-react";

function SearchRepo({ onRepoFound, onSelectRepo }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoOwner, setRepoOwner] = useState("");
  const [repository, setRepository] = useState("");
  const [searched, setSearched] = useState(false);
  const [repoFound, setRepoFound] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const parseGitHubRepoUrl = (url) => {
    const parts = url.replace("https://github.com/", "").split("/");
    const owner = parts[0];
    const repo = parts[1];
    setRepoOwner(owner);
    setRepository(repo);
    return { owner, repo };
  };

  const handleFetch = async () => {
    const { owner, repo } = parseGitHubRepoUrl(repoUrl);
    setError(null);

    try {
      // First get repository metadata
      const repoResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`
      );
      if (!repoResponse.ok) throw new Error("Repository not found or private");

      const repoData = await repoResponse.json();

      // Then get contents to verify it's accessible
      const contentsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/`
      );
      if (!contentsResponse.ok)
        throw new Error("Repository contents not accessible");

      // Create repository object that matches the format expected by FileExplorer and RichTextEditor
      const repositoryObject = {
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        private: repoData.private,
        owner: {
          login: repoData.owner.login,
          avatar_url: repoData.owner.avatar_url,
        },
        html_url: repoData.html_url,
        clone_url: repoData.clone_url,
        ssh_url: repoData.ssh_url,
        language: repoData.language,
        stargazers_count: repoData.stargazers_count,
        forks_count: repoData.forks_count,
        updated_at: repoData.updated_at,
        created_at: repoData.created_at,
        default_branch: repoData.default_branch,
        isPublicRepo: true, // Flag to indicate this is a searched public repo
      };

      setSelectedRepo(repositoryObject);
      setSearched(true);
      setRepoFound(true);
      onRepoFound?.(true);
      onSelectRepo?.(repositoryObject); // Notify parent component
    } catch (err) {
      console.error("Failed to fetch repository:", err);
      setError(`Failed to fetch repository: ${err.message}`);
      setRepoFound(false);
      onRepoFound?.(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    console.log("📄 File selected:", file.name);
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setSelectedFile(null);
    setRepoFound(false);
    setSearched(false);
    setRepoUrl("");
    setRepoOwner("");
    setRepository("");
    setError(null);
    onRepoFound?.(false);
  };

  const handleHomeClick = () => {
    handleBackToRepos();
  };

  return (
    <div className="flex bg-[var(--bg)] text-[var(--text)] bg-padel-white ">
      {/* File Explorer Sidebar - only show if a repo is selected */}
      {selectedRepo && (
        <div className=" bg-[var(--accent)] border-r border-[var(--border)] flex flex-col overflow-hidden max-w-7xl">
          <FileExplorer
            repository={selectedRepo}
            token={null} // No token for public repos (read-only mode)
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onBack={handleBackToRepos}
          />
        </div>
      )}

      {/* Main Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 bg-[var(--bg)] pb-1">
          {!repoFound ? (
            // Show search interface when no repo is found
            <div className="flex flex-col items-center justify-center">
              {/* logo-Header-text */}
              <div className="flex flex-row gap-4">
                <div>
                  <Carrot />
                </div>
                <div className="text-xl font-semibold">
                  Search Repositories from web
                </div>
              </div>

              <div className="flex flex-col gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-3 w-full max-w-xl shadow-md">
                <input
                  type="text"
                  placeholder="Enter GitHub repo URL (e.g., https://github.com/owner/repo)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleFetch()}
                  className="w-full bg-[var(--bg)] p-2 rounded-[var(--radius)] text-sm outline-none focus:border-[var(--border)]"
                />
                <button
                  onClick={handleFetch}
                  disabled={!repoUrl.trim()}
                  className="self-start text-sm font-medium px-4 py-1 rounded-[var(--radius)] bg-[var(--bg)] hover:bg-[var(--hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Find Repository
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center max-w-xl">
                  <CircleAlert size={16} className="inline mr-2" />
                  {error}
                </div>
              )}

              <div className="text-sm text-[var(--text-muted)] text-center max-w-xl">
                <p className="mb-2">
                  Enter a public GitHub repository URL to browse and view files
                  in read-only mode.
                </p>
                <p className="text-xs">
                  Example: https://github.com/facebook/react
                </p>
              </div>
            </div>
          ) : selectedFile ? (
            // Show RichTextEditor when a file is selected
            <RichTextEditor
              file={selectedFile}
              repository={selectedRepo}
              token={null} // No token for read-only mode
            />
          ) : (
            // Show repository selection message
            <div className="text-center text-[var(--text-muted)] mt-20">
              <h3 className="text-[var(--text)] mb-4 text-lg font-normal">
                Select a file to view
              </h3>
              <p className="mb-2 text-sm">
                Choose a file from the explorer to view its contents
              </p>
              <div className="mt-4 text-left inline-block">
                <h4 className="text-sm font-medium mb-2">
                  Viewable file types:
                </h4>
                <ul className="text-sm text-[var(--text-muted)] list-disc list-inside">
                  <li>Markdown (.md, .markdown)</li>
                  <li>Text files (.txt)</li>
                  <li>Configuration (.json, .yml, .yaml, .xml)</li>
                </ul>
                <p className="text-xs text-[var(--text-muted)] mt-3">
                  ℹ️ Repository is in read-only mode - editing not available
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SearchRepo;
