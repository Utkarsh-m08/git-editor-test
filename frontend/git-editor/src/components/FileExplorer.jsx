// src/components/FileExplorer.jsx - Updated for both authenticated and public repositories
import React, { useState, useEffect } from "react";
import FileTreeItem from "./FileTreeItem";
import { useNavigate } from "react-router-dom";

import { githubService } from "../services/githubService";
import {
  Folder,
  Home,
  HomeIcon,
  LucideHome,
  Search,
  Lock,
  Globe,
} from "lucide-react";

const FileExplorer = ({
  repository,
  token = null,
  onFileSelect,
  selectedFile,
  onBack,
}) => {
  const [rootContents, setRootContents] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [folderContents, setFolderContents] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Check if this is a public repository (no token)
  const isPublicRepo = !token;

  useEffect(() => {
    loadRootContents();
  }, [repository]);

  const loadRootContents = async () => {
    if (!repository) return;

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Loading root contents from GitHub API...");

      let contents;

      if (isPublicRepo) {
        // For public repositories, use direct GitHub API without authentication
        const response = await fetch(
          `https://api.github.com/repos/${repository.owner.login}/${repository.name}/contents/`
        );
        if (!response.ok) throw new Error("Repository not found or private");
        contents = await response.json();
      } else {
        // For authenticated repositories, use githubService
        contents = await githubService.getRepositoryContents(
          token,
          repository.owner.login,
          repository.name
        );
      }

      // Sortin dirctories first, then files, both alphabetically
      const sortedContents = contents.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "dir" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      console.log("✅ Root contents loaded:", sortedContents.length, "items");
      setRootContents(sortedContents);
    } catch (err) {
      console.error("Error loading root contents:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFolderContents = async (folderPath) => {
    if (!repository) return;

    try {
      console.log("🔄 Loading folder contents:", folderPath);

      let contents;

      if (isPublicRepo) {
        // For public repositories, use direct GitHub API without authentication
        const response = await fetch(
          `https://api.github.com/repos/${repository.owner.login}/${repository.name}/contents/${folderPath}`
        );
        if (!response.ok) throw new Error("Folder not found");
        contents = await response.json();
      } else {
        // For authenticated repositories, use githubService
        contents = await githubService.getRepositoryContents(
          token,
          repository.owner.login,
          repository.name,
          folderPath
        );
      }

      // Sort: directories first, then files, both alphabetically
      const sortedContents = contents.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "dir" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      console.log(
        "✅ Folder contents loaded:",
        folderPath,
        "-",
        sortedContents.length,
        "items"
      );
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
      // Load folder contents if not already loaded
      if (!folderContents.has(folder.path)) {
        await loadFolderContents(folder.path);
      }
    }

    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file) => {
    if (file.type === "file") {
      console.log("📄 File selected:", file.name);
      onFileSelect(file);
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => (
      <FileTreeItem
        key={item.path}
        item={item}
        level={level}
        isExpanded={expandedFolders.has(item.path)}
        isSelected={selectedFile && selectedFile.path === item.path}
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
    return (
      // <></>
      <div className="p-2 h-screen w-60 flex flex-col bg-[var(--accent)] text-[var(--text-muted)] overflow-hidden text-sm">
        <div className="px-2 pb-3 pt-1 border-b border-[var(--border)] flex items-center gap-2">
          <Folder size={16} />
          <h3 className="uppercase text-[10px] font-bold text-[var(--text-muted)]">
            Files
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] text-sm gap-2 px-4 py-8">
          <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          <span>Loading repository from GitHub...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <div className="px-2 pb-3 pt-1 border-b border-[var(--border)] flex items-center gap-2">
          <Folder size={16} />
          <h3 className="uppercase text-[10px] font-bold text-[var(--text-muted)]">
            Files
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] text-sm gap-2 px-4 py-8">
          <p>❌ Error loading files</p>
          <p className="text-center">{error}</p>
          <button
            // onClick={loadRootContents}
            onCLick={() => navigate("/repos")}
            className="text-sm font-medium rounded bg-[var(--hover)] px-3 py-1 transition hover:bg-[var(--bg)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 h-screen w-60 flex flex-col bg-[var(--accent)] text-[var(--text-muted)] overflow-hidden text-sm">
      <div className="flex flex-col buttons-file-explorer border-b border-[var(--border)] pb-5 pt-2 gap-1">
        <div className="home flex flex-row gap-3 pl-2">
          {isPublicRepo ? <Globe size={16} /> : <Search size={16} />}
          {isPublicRepo ? "Public Repo" : "Search"}
        </div>
        <div className="home flex flex-row gap-3">
          {onBack && (
            <button
              // onClick={onBack}
              onClick={() => navigate("/repos")}
              className="home flex flex-row gap-3 pl-2"
            >
              <LucideHome size={16} />
              Home
            </button>
          )}
        </div>
        <div className="">
          <button
            className="home flex flex-row gap-3 pl-2"
            onClick={() => navigate("/repos")}
          >
            <LucideHome size={16} />
            Button
          </button>
        </div>
      </div>
      <div className="">
        <span className="flex flex-row gap-2 pl-2 pb-2 items-center">
          ○ {repository.name}
          {isPublicRepo && (
            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded flex items-center gap-1">
              <Lock size={10} />
              Read-only
            </span>
          )}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1.5">
        {rootContents.length === 0 ? (
          <div className="flex items-center justify-center text-[var(--text-muted)] text-sm h-full">
            <Folder size={12} className="mr-1" /> Empty repository
          </div>
        ) : (
          renderFileTree(rootContents)
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
