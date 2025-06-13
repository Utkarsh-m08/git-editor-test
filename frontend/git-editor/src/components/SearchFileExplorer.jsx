import React, { useState, useEffect } from "react";
import FileTreeItem from "./FileTreeItem";
import { githubService } from "../services/githubService";

const SearchFileExplorer = ({ owner, repo, onFileContentLoad }) => {
  const [rootContents, setRootContents] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [folderContents, setFolderContents] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //   useEffect(() => {
  //     loadRootContents();
  //   }, [owner, repo]);

  //   const loadRootContents = async () => {
  //     if (!owner || !repo) return;

  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const contents = await githubService.getRepositoryContents(
  //         null,
  //         owner,
  //         repo
  //       );
  //       const sortedContents = contents.sort((a, b) => {
  //         if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
  //         return a.name.localeCompare(b.name);
  //       });
  //       setRootContents(sortedContents);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   new
  const handleFetch = async () => {
    const { owner, repo } = parseGitHubRepoUrl(repoUrl);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/`
      );
      const sortedContents = response.sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setRootContents(sortedContents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    const data = await response.json();
    setFiles(data);
    setFolderContents(data);
    setSearched(true);
  };
  //   converr repo to parse
  const parseGitHubRepoUrl = (url) => {
    const parts = url.replace("https://github.com/", "").split("/");
    setRepoOwner(parts[0]);
    setRepository(parts[1]);
    return { owner: parts[0], repo: parts[1] };
  };

  const loadFolderContents = async (folderPath) => {
    try {
      const contents = await githubService.getRepositoryContents(
        null,
        owner,
        repo,
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

  const handleFileClick = async (file) => {
    if (file.type === "file") {
      try {
        const response = await fetch(file.download_url);
        const content = await response.text();
        onFileContentLoad(file.name, content);
      } catch (err) {
        console.error("Error loading file content:", err);
      }
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => (
      <FileTreeItem
        key={item.path}
        item={item}
        level={level}
        isExpanded={expandedFolders.has(item.path)}
        isSelected={false}
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

  if (loading) {
    return <div className="file-explorer">Loading...</div>;
  }

  if (error) {
    return <div className="file-explorer">Error: {error}</div>;
  }

  return (
    <div className="file-explorer">
      <h3>📁 {repo}</h3>
      <div className="file-tree">
        {rootContents.length === 0 ? (
          <p>Empty Repository</p>
        ) : (
          renderFileTree(rootContents)
        )}
      </div>
    </div>
  );
};

export default SearchFileExplorer;
