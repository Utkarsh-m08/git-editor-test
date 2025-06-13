import { useState, useEffect } from "react";
import FileExplorer from "./FileExplorer";
import SearchFileExplorer from "./SearchFileExplorer";
import FileTreeItem from "./FileTreeItem";
import { githubService } from "../services/githubService";

function SearchRepo() {
  const [rootContents, setRootContents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [folderContents, setFolderContents] = useState(new Map());
  const [repoUrl, setRepoUrl] = useState("");
  const [repoOwner, setRepoOwner] = useState("");
  const [repository, setRepository] = useState("");
  const [searched, setSearched] = useState(false);

  const handleToggleFolder = async (folder) => {
    const isExpanded = expandedFolders.has(folder.path);
    const newExpanded = new Set(expandedFolders);

    if (isExpanded) {
      newExpanded.delete(folder.path);
    } else {
      newExpanded.add(folder.path);
      if (!folderContents.has(folder.path)) {
        await loadFolderContents(folder.path);
      }
    }

    setExpandedFolders(newExpanded);
  };

  const loadFolderContents = async (folderPath) => {
    try {
      const contents = await githubService.getRepositoryContents(
        null,
        repoOwner,
        repository,
        folderPath
      );
      const sortedContents = contents.sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setFolderContents(
        (prev) => new Map(prev.set(folderPath, sortedContents))
      );
    } catch (err) {
      console.error("Error loading folder contents:", err);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    try {
      const response = await fetch(file.download_url);
      const text = await response.text();
      setFileContent(text);
    } catch (err) {
      console.error("Failed to load file content:", err);
      setFileContent("Failed to load file content.");
    }
  };

  const handleFileClick = (file) => {
    if (file.type === "file") {
      console.log("📄 File selected:", file.name);
      handleFileSelect(file);
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => (
      <FileTreeItem
        key={item.path}
        item={item}
        level={level}
        isExpanded={expandedFolders.has(item.path)}
        isSelected={selectedFile?.path === item.path}
        onToggle={() => handleToggleFolder(item)}
        onClick={() => handleFileClick(item)}
        children={
          item.type === "dir" &&
          expandedFolders.has(item.path) &&
          folderContents.has(item.path)
            ? renderFileTree(folderContents.get(item.path), level + 1)
            : null
        }
      />
    ));
  };

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

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/`
      );
      if (!response.ok) throw new Error("Repository not found");

      const data = await response.json();
      setRootContents(data);
      setSearched(true);
    } catch (err) {
      console.error("Failed to fetch repository contents:", err);
      setRootContents([]);
      setSearched(false);
    }
  };

  return (
    <div className="search-repo">
      <div className="text-search-web">Search Repositories from web</div>
      <div className="search-container">
        <input
          className="search-form"
          type="text"
          placeholder="Enter GitHub repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <button onClick={handleFetch} className="button-search-repo">
          Find
        </button>
      </div>
      <div className="search-file-and-display">
        <div className="search-file-explorer">
          <h3>{repository}</h3>
          <div className="file-tree">
            {rootContents.length === 0 ? <p></p> : renderFileTree(rootContents)}
          </div>
        </div>

        {selectedFile && fileContent && (
          <div className="search-file-preview">
            <h4>📄 {selectedFile.name}</h4>
            <pre>
              <code>{fileContent}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchRepo;
