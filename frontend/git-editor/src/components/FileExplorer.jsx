// src/components/FileExplorer.jsx - Updated for direct GitHub API calls
import React, { useState, useEffect } from 'react';
import FileTreeItem from './FileTreeItem';
import { githubService } from '../services/githubService';

const FileExplorer = ({ repository, token = null, onFileSelect, selectedFile }) => {
  const [rootContents, setRootContents] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [folderContents, setFolderContents] = useState(new Map());
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRootContents();
  }, [repository]);

  const loadRootContents = async () => {
    if (!repository || !token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading root contents from GitHub API...');
      
      //  Use direct GitHub API call
      const contents = await githubService.getRepositoryContents(
        token, 
        repository.owner.login, 
        repository.name
      );
      
      // Sort: directories first, then files, both alphabetically
      const sortedContents = contents.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'dir' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      console.log('✅ Root contents loaded:', sortedContents.length, 'items');
      setRootContents(sortedContents);
    } catch (err) {
      console.error('Error loading root contents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFolderContents = async (folderPath) => {
    if (!repository || !token) return;
    
    try {
      console.log('🔄 Loading folder contents:', folderPath);
      
      // 🎯 FIXED: Use direct GitHub API call
      const contents = await githubService.getRepositoryContents(
        token,
        repository.owner.login,
        repository.name,
        folderPath
      );
      
      // Sort: directories first, then files, both alphabetically
      const sortedContents = contents.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'dir' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      console.log('✅ Folder contents loaded:', folderPath, '-', sortedContents.length, 'items');
      setFolderContents(prev => new Map(prev.set(folderPath, sortedContents)));
    } catch (err) {
      console.error('Error loading folder contents:', err);
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
    if (file.type === 'file') {
      console.log('📄 File selected:', file.name);
      onFileSelect(file);
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map(item => (
      <FileTreeItem
        key={item.path}
        item={item}
        level={level}
        isExpanded={expandedFolders.has(item.path)}
        isSelected={selectedFile && selectedFile.path === item.path}
        onToggle={() => handleToggleFolder(item)}
        onClick={() => handleFileClick(item)}
        children={
          item.type === 'dir' && 
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
      <div className="file-explorer">
        <div className="explorer-header">
          <h3>📁 Files</h3>
        </div>
        <div className="explorer-loading">
          <div className="spinner-small"></div>
          <span>Loading repository from GitHub...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-explorer">
        <div className="explorer-header">
          <h3>📁 Files</h3>
        </div>
        <div className="explorer-error">
          <p>❌ Error loading files</p>
          <p>{error}</p>
          <button onClick={loadRootContents} className="button primary small">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3>📁 Files</h3>
        <span className="repo-name">{repository.name}</span>
      </div>
      <div className="file-tree">
        {rootContents.length === 0 ? (
          <div className="empty-repo">
            <p>📂 Empty repository</p>
          </div>
        ) : (
          renderFileTree(rootContents)
        )}
      </div>
    </div>
  );
};

export default FileExplorer;