// src/components/Dashboard.jsx
import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import RepositoryList from "./RepositoryList";
import FileExplorer from "./FileExplorer";
import RichTextEditor from "./RichTextEditor";
import SearchRepo from "./SearchRepo";
import {
  CircleUser,
  Folder,
  HelpCircle,
  Home,
  LogOut,
  Settings,
} from "lucide-react";

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [repoFound, setRepoFound] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="flex bg-[var(--bg)] text-[var(--text)] ">
      {/* File Explorer Sidebar - only show if a repo is selected */}
      {selectedRepo && (
        <div className="w-sidebar  bg-[var(--accent)] border-r border-[var(--border)] flex flex-col overflow-hidden max-w-7xl">
          <FileExplorer
            repository={selectedRepo}
            token={token}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onBack={handleBackToRepos}
          />
        </div>
      )}

      {/* Main Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top-right Header */}
        <div className="h-10 flex justify-end items-center px-4  bg-[var(--bg)] relative">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-2 text-xs focus:outline-none"
            >
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-[var(--text)]">{user.login}</span>
            </button>

            {showDropdown && (
              <div className="bg-[var(--bg)] p-1 absolute right-0 mt-2 w-48  border border-[var(--border)] rounded-[var(--radius)] shadow-lg z-50 text-xs">
                <ul className="flex flex-col text-xs bg-[var(--bg)]">
                  <li className="flex flex-row gap-2 px-4 py-2 hover:bg-[var(--hover)] cursor-pointer">
                    <CircleUser size={15} />
                    Profile
                  </li>
                  <li className="flex flex-row gap-2 px-4 py-2 hover:bg-[var(--hover)] cursor-pointer">
                    <Settings size={15} />
                    Settings
                  </li>
                  <li className="flex flex-row gap-2 px-4 py-2 hover:bg-[var(--hover)] cursor-pointer">
                    <HelpCircle size={15} />
                    Help
                  </li>
                  <li className="flex flex-row gap-2 px-4 py-2 hover:bg-[var(--hover)] cursor-pointer">
                    <LogOut size={15} />
                    <button onClick={logout} className="">
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 mx-0 bg-[var(--bg)] pb-1 px-20">
          {!selectedRepo ? (
            <div className="">
              <div className="">
                <SearchRepo onSelectRepo={handleRepoSelect} />
              </div>
              <RepositoryList onSelectRepo={handleRepoSelect} />
            </div>
          ) : selectedFile ? (
            <RichTextEditor
              file={selectedFile}
              repository={selectedRepo}
              token={token}
            />
          ) : (
            <div className="text-center text-[var(--text-muted)] mt-20">
              <h3 className="text-[var(--text)] mb-4 text-lg font-normal">
                Select a file to edit
              </h3>
              <p className="mb-2 text-sm">
                Choose a file from the explorer to start editing
              </p>
              <div className="mt-4 text-left inline-block">
                <h4 className="text-sm font-medium mb-2">
                  Supported file types:
                </h4>
                <ul className="text-sm text-[var(--text-muted)] list-disc list-inside">
                  <li>Markdown (.md, .markdown)</li>
                  <li>Text files (.txt)</li>
                  <li>Configuration (.json, .yml, .yaml, .xml)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
