// src/pages/EditorPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FileExplorer from "../../components/FileExplorer";
import RichTextEditor from "../../components/RichTextEditor";
import { useNavigate } from "react-router-dom";

const EditorPage = () => {
  const navigate = useNavigate();

  const { owner, repo, "*": filePath } = useParams();
  const { token, user } = useAuth();
  const noFileSelected = !filePath || filePath.trim() === "";

  // Derive whether this is editable or read-only mode
  const isOwnRepo = user?.login?.toLowerCase() === owner?.toLowerCase();
  const editorToken = isOwnRepo ? token : null;

  // Construct file and repo objects expected by RichTextEditor
  const fakeFile = filePath
    ? {
        name: filePath.split("/").pop(),
        path: filePath,
        download_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`,
      }
    : null;

  const fakeRepo = {
    name: repo,
    full_name: `${owner}/${repo}`,
    owner: {
      login: owner,
    },
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg)]">
      <div className="flex flex-row overflow-auto">
        <div className="flex bg-[var(--bg)] text-[var(--text)]">
          <FileExplorer
            repository={fakeRepo}
            token={editorToken}
            onFileSelect={(newFile) => {
              // navigate to new file route
              navigate(`/repos/${owner}/${repo}/file/${newFile.path}`);
            }}
            selectedFile={null}
          />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          {noFileSelected ? (
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
          ) : (
            <RichTextEditor
              file={fakeFile}
              repository={fakeRepo}
              token={editorToken}
            />
          )}
        </div>
        {/* <div className="flex flex-col flex-1 overflow-hidden">
          {" "}
          <RichTextEditor
            file={fakeFile}
            repository={fakeRepo}
            token={editorToken}
          />
        </div> */}
      </div>
    </div>
  );
};

export default EditorPage;
