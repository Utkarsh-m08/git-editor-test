// src/components/RichTextEditor.jsx - FIXED VERSION
import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { githubService } from "../services/githubService";

const RichTextEditor = ({ file, repository, token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [fileSha, setFileSha] = useState(null);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalContentRef = useRef("");
  const autoSaveTimeoutRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        //  space bar handlwe
        hardBreak: {
          keepMarks: false,
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const currentContent = editor.getHTML();
      const hasChanges = currentContent !== originalContentRef.current;
      setHasUnsavedChanges(hasChanges);

      // Auto-save after 2 seconds of no typing
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      if (hasChanges) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          handleAutoSave();
        }, 2000);
      }
    },
    editorProps: {
      attributes: {
        class: "rich-text-content",
        spellcheck: "false", // Disable spellcheck to prevent cursor issues
      },
      // space and typing handling
      handleKeyDown: (view, event) => {
        // Handle multiple spaces properly
        if (event.key === " " && event.ctrlKey) {
          // Ctrl+Space for non-breaking space
          event.preventDefault();
          view.dispatch(view.state.tr.insertText("\u00A0"));
          return true;
        }
        return false;
      },
    },
  });

  // Load file content when file changes
  useEffect(() => {
    if (file && repository && token && editor) {
      loadFileContent();
    }
  }, [file, repository, token, editor]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const loadFileContent = async () => {
    if (!editor) return;

    setLoading(true);
    setError(null);
    setHasUnsavedChanges(false);

    try {
      console.log("📄 Loading file content:", file.path);

      const fileData = await githubService.getFileContent(
        token,
        repository.owner.login,
        repository.name,
        file.path
      );

      console.log("✅ File content loaded");

      // Convert content based on file type
      let editorContent = "";
      if (isMarkdownFile(file.name)) {
        // For markdown files, keep as plain text initially
        editorContent = `<p>${fileData.content.replace(/\n/g, "</p><p>")}</p>`;
      } else {
        // For text files, preserve formatting better
        editorContent = `<pre>${fileData.content}</pre>`;
      }

      // FIXED: Set content only once, no sync loop
      editor.commands.setContent(editorContent);
      originalContentRef.current = editor.getHTML();
      setFileSha(fileData.sha);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Error loading file:", err);
      setError(`Failed to load file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || saving) return;
    await saveFile(true);
  };

  const saveFile = async (isAutoSave = false) => {
    if (!editor || saving) return;

    setSaving(true);
    setError(null);

    try {
      console.log(
        isAutoSave ? "💾 Auto-saving file:" : "💾 Saving file:",
        file.path
      );

      // Get current content from editor
      const currentHTML = editor.getHTML();

      // Convert editor content back to appropriate format
      let saveContent = "";
      if (isMarkdownFile(file.name)) {
        saveContent = convertHTMLToMarkdown(currentHTML);
      } else {
        saveContent = convertHTMLToText(currentHTML);
      }

      const result = await githubService.updateFile(
        token,
        repository.owner.login,
        repository.name,
        file.path,
        saveContent,
        fileSha,
        isAutoSave ? `Auto-save ${file.name}` : `Update ${file.name}`
      );

      console.log("✅ File saved successfully");
      setFileSha(result.sha);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      originalContentRef.current = currentHTML;

      // Clear auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    } catch (err) {
      console.error("Error saving file:", err);
      setError(`Failed to save file: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper functions
  const isMarkdownFile = (filename) => {
    return (
      filename.toLowerCase().endsWith(".md") ||
      filename.toLowerCase().endsWith(".markdown")
    );
  };

  const isEditableFile = (filename) => {
    const editableExtensions = [
      ".md",
      ".markdown",
      ".txt",
      ".json",
      ".yml",
      ".yaml",
      ".xml",
    ];
    return editableExtensions.some((ext) =>
      filename.toLowerCase().endsWith(ext)
    );
  };

  const convertHTMLToMarkdown = (html) => {
    // Enhanced HTML to markdown conversion
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, "# $1")
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, "## $1")
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, "### $1")
      .replace(/<h4[^>]*>(.*?)<\/h4>/g, "#### $1")
      .replace(/<h5[^>]*>(.*?)<\/h5>/g, "##### $1")
      .replace(/<h6[^>]*>(.*?)<\/h6>/g, "###### $1")
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/g, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/g, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/g, "*$1*")
      .replace(/<code[^>]*>(.*?)<\/code>/g, "`$1`")
      .replace(/<pre[^>]*>(.*?)<\/pre>/gs, "```\n$1\n```")
      .replace(/<p[^>]*>(.*?)<\/p>/g, "$1\n")
      .replace(/<br[^>]*\/?>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  };

  const convertHTMLToText = (html) => {
    // Enhanced HTML to text conversion
    return html
      .replace(/<pre[^>]*>(.*?)<\/pre>/gs, "$1")
      .replace(/<p[^>]*>(.*?)<\/p>/g, "$1\n")
      .replace(/<br[^>]*\/?>/g, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  };

  if (!isEditableFile(file.name)) {
    return (
      <div className="rich-text-editor">
        <div className="editor-header">
          <h3>📄 {file.name}</h3>
          <div className="file-info">
            <span>Not editable</span>
          </div>
        </div>
        <div className="non-editable-file">
          <p>This file type cannot be edited with the rich text editor.</p>
          <p>
            Supported formats: .md, .markdown, .txt, .json, .yml, .yaml, .xml
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rich-text-editor">
        <div className="editor-header">
          <h3>📄 {file.name}</h3>
        </div>
        <div className="editor-loading">
          <div className="spinner"></div>
          <p>Loading file content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rich-text-editor">
        <div className="editor-header">
          <h3>📄 {file.name}</h3>
        </div>
        <div className="editor-error">
          <p>❌ {error}</p>
          <button onClick={loadFileContent} className="button primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      {/* Editor Header */}
      <div className="editor-header">
        <div className="editor-title">
          <h3>📄 {file.name}</h3>
          {hasUnsavedChanges && <span className="unsaved-indicator">●</span>}
        </div>
        <div className="editor-actions">
          {lastSaved && (
            <span className="last-saved">
              {hasUnsavedChanges
                ? "Unsaved changes"
                : `Saved ${lastSaved.toLocaleTimeString()}`}
            </span>
          )}
          <button
            onClick={() => saveFile(false)}
            disabled={saving || !hasUnsavedChanges}
            className="button primary small"
          >
            {saving ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="editor-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? "active" : ""}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? "active" : ""}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor?.isActive("strike") ? "active" : ""}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <div className="toolbar-separator"></div>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={editor?.isActive("heading", { level: 1 }) ? "active" : ""}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor?.isActive("heading", { level: 2 }) ? "active" : ""}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={editor?.isActive("heading", { level: 3 }) ? "active" : ""}
          title="Heading 3"
        >
          H3
        </button>
        <div className="toolbar-separator"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor?.isActive("bulletList") ? "active" : ""}
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive("orderedList") ? "active" : ""}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={editor?.isActive("taskList") ? "active" : ""}
          title="Task List"
        >
          ✓ Tasks
        </button>
        <div className="toolbar-separator"></div>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor?.isActive("code") ? "active" : ""}
          title="Inline Code"
        >
          &lt;/&gt;
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor?.isActive("codeBlock") ? "active" : ""}
          title="Code Block"
        >
          {}
        </button>
      </div>

      {/* Editor Content */}
      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
