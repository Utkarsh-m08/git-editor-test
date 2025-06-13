// src/components/Dashboard.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import RepositoryList from "./RepositoryList";
import FileExplorer from "./FileExplorer";
import RichTextEditor from "./RichTextEditor";
import SearchRepo from "./SearchRepo";

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    setSelectedFile(null);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    console.log("Selected file:", file);
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setSelectedFile(null);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          {selectedRepo && (
            <button onClick={handleBackToRepos} className="back-button">
              ← Back to Repositories
            </button>
          )}
          <h1>{selectedRepo ? selectedRepo.name : "GitHub Code Editor"}</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="avatar-small"
            />
            <span>{user.login}</span>
          </div>
          <button onClick={logout} className="button secondary small">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {!selectedRepo ? (
          <RepositoryList onSelectRepo={handleRepoSelect} />
        ) : (
          <div className="editor-layout">
            {/* Sidebar - File Explorer */}
            <div className="sidebar">
              <FileExplorer
                repository={selectedRepo}
                token={token}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
            </div>

            {/* Main Editor Area */}
            <div className="editor-area">
              {selectedFile ? (
                <RichTextEditor
                  file={selectedFile}
                  repository={selectedRepo}
                  token={token}
                />
              ) : (
                <div className="no-file-selected">
                  <h3>Select a file to edit</h3>
                  <p>Choose a file from the explorer to start editing</p>
                  <div className="supported-files">
                    <h4>Supported file types:</h4>
                    <ul>
                      <li>📝 Markdown (.md, .markdown)</li>
                      <li>📄 Text files (.txt)</li>
                      <li>⚙️ Configuration (.json, .yml, .yaml, .xml)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
