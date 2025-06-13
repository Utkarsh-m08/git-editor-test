// components/CodeEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

const CodeEditor = ({ file, repo, token, apiBase }) => {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileSha, setFileSha] = useState("");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    if (file) {
      loadFileContent();
    }
  }, [file]);

  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      initializeEditor();
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && content !== undefined) {
      const currentValue = monacoRef.current.getValue();
      if (currentValue !== content) {
        monacoRef.current.setValue(content);
        setIsModified(false);
      }
    }
  }, [content]);

  const loadFileContent = async () => {
    try {
      const response = await fetch(
        `${apiBase}/api/github/repos/${repo.owner.login}/${repo.name}/file/${file.fullPath}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setOriginalContent(data.content);
        setFileSha(data.sha);
        setIsModified(false);
      } else {
        console.error("Failed to load file content");
      }
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  const initializeEditor = () => {
    if (!editorRef.current) return;

    const editor = monaco.editor.create(editorRef.current, {
      value: content,
      language: getLanguageFromFileName(file?.name || ""),
      theme: "vs-dark",
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: "on",
      renderWhitespace: "selection",
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: "on",
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "blink",
      cursorSmoothCaretAnimation: true,
    });

    editor.onDidChangeModelContent(() => {
      const currentContent = editor.getValue();
      setIsModified(currentContent !== originalContent);
    });

    // Auto-save on Ctrl+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile();
    });

    monacoRef.current = editor;
  };

  const getLanguageFromFileName = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      html: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      md: "markdown",
      sql: "sql",
      sh: "shell",
      bash: "shell",
      dockerfile: "dockerfile",
    };
    return languageMap[extension] || "plaintext";
  };

  const saveFile = async () => {
    if (!monacoRef.current || !isModified || saving) return;

    setSaving(true);
    const currentContent = monacoRef.current.getValue();

    try {
      const response = await fetch(
        `${apiBase}/api/github/repos/${repo.owner.login}/${repo.name}/file/${file.fullPath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: currentContent,
            sha: fileSha,
            message: `Update ${file.name} via web editor`,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOriginalContent(currentContent);
        setFileSha(data.content.sha);
        setIsModified(false);
        console.log("File saved successfully");
      } else {
        console.error("Failed to save file");
      }
    } catch (error) {
      console.error("Error saving file:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!file) {
    return (
      <div className="no-file-selected">
        <h3>Welcome to GitHub Code Editor</h3>
        <p>Select a file from the explorer to start editing</p>
      </div>
    );
  }

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="file-info">
          <span className="file-name">
            {file.name}
            {isModified && <span className="modified-indicator">●</span>}
          </span>
          <span className="file-path">{file.fullPath}</span>
        </div>
        <div className="editor-actions">
          {isModified && (
            <button
              onClick={saveFile}
              disabled={saving}
              className="save-button"
            >
              {saving ? "Saving..." : "Save (Ctrl+S)"}
            </button>
          )}
        </div>
      </div>
      <div className="editor-container" ref={editorRef} />
    </div>
  );
};

export default CodeEditor;
