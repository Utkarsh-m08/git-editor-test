// src/components/RichTextEditor.jsx - SLASH COMMAND VERSION WITH READ-ONLY MODE
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
import { Save, Eye, Lock } from "lucide-react";

const RichTextEditor = ({ file, repository, token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [fileSha, setFileSha] = useState(null);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if this is read-only mode (no token)
  const isReadOnly = !token;

  // for slash commands
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [slashStartPos, setSlashStartPos] = useState(null);

  const originalContentRef = useRef("");
  const autoSaveTimeoutRef = useRef(null);
  const slashMenuRef = useRef(null);

  //  command options
  const slashCommands = [
    {
      label: "Bold",
      icon: "B",
      command: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: "I",
      command: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Strikethrough",
      icon: "S",
      command: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: "Heading 1",
      icon: "H1",
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      icon: "H2",
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      icon: "H3",
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bullet List",
      icon: "•",
      command: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered List",
      icon: "1.",
      command: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Task List",
      icon: "✓",
      command: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      label: "Code",
      icon: "</>",
      command: () => editor.chain().focus().toggleCode().run(),
    },
    {
      label: "Code Block",
      icon: "{}",
      command: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
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
    editable: !isReadOnly, // Make editor read-only when no token
    onUpdate: ({ editor }) => {
      if (isReadOnly) return; // Skip updates in read-only mode
      
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
        class: `rich-text-content ${isReadOnly ? 'read-only' : ''}`,
        spellcheck: "false",
      },
      handleKeyDown: (view, event) => {
        if (isReadOnly) return false; // Disable all keyboard interactions in read-only mode
        
        // Handle slash command menu navigation
        if (showSlashMenu) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedSlashIndex((prev) =>
              prev < slashCommands.length - 1 ? prev + 1 : 0
            );
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedSlashIndex((prev) =>
              prev > 0 ? prev - 1 : slashCommands.length - 1
            );
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            executeSlashCommand(selectedSlashIndex);
            return true;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            hideSlashMenu();
            return true;
          }
        }

        // Detect slash command trigger
        if (event.key === "/") {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;

          // Check if we're at the start of a line or after whitespace
          const textBefore = $from.nodeBefore?.textContent || "";
          const isValidSlashPosition =
            textBefore === "" ||
            textBefore.endsWith(" ") ||
            textBefore.endsWith("\n");

          if (isValidSlashPosition) {
            // Store the position where slash was typed
            setSlashStartPos(selection.from);

            // Get cursor position for dropdown placement
            const coords = view.coordsAtPos(selection.from);
            setSlashMenuPosition({
              x: coords.left,
              y: coords.bottom + 5,
            });

            setShowSlashMenu(true);
            setSelectedSlashIndex(0);
          }
        }

        // Handle multiple spaces properly
        if (event.key === " " && event.ctrlKey) {
          event.preventDefault();
          view.dispatch(view.state.tr.insertText("\u00A0"));
          return true;
        }

        // Hide slash menu on other key presses
        if (
          showSlashMenu &&
          event.key !== "ArrowDown" &&
          event.key !== "ArrowUp" &&
          event.key !== "Enter" &&
          event.key !== "Escape"
        ) {
          hideSlashMenu();
        }

        return false;
      },
    },
  });

  // Execute slash command
  const executeSlashCommand = (index) => {
    if (!editor || !slashCommands[index] || isReadOnly) return;

    // Remove the "/" character
    if (slashStartPos !== null) {
      const tr = editor.state.tr.delete(slashStartPos, slashStartPos + 1);
      editor.view.dispatch(tr);
    }

    // Execute the command
    slashCommands[index].command();
    hideSlashMenu();
  };

  // Hide slash menu
  const hideSlashMenu = () => {
    setShowSlashMenu(false);
    setSlashStartPos(null);
    setSelectedSlashIndex(0);
  };

  // Click outside to close slash menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSlashMenu &&
        slashMenuRef.current &&
        !slashMenuRef.current.contains(event.target)
      ) {
        hideSlashMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSlashMenu]);

  // Load file content when file changes
  useEffect(() => {
    if (file && repository && editor) {
      loadFileContent();
    }
  }, [file, repository, editor]);

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

      let fileContent;
      
      if (isReadOnly) {
        // For read-only mode (no token), fetch directly from GitHub API
        const response = await fetch(file.download_url);
        if (!response.ok) throw new Error("Failed to fetch file content");
        fileContent = await response.text();
      } else {
        // For authenticated mode, use githubService
        const fileData = await githubService.getFileContent(
          token,
          repository.owner.login,
          repository.name,
          file.path
        );
        fileContent = fileData.content;
        setFileSha(fileData.sha);
      }

      console.log("✅ File content loaded");

      // Convert content based on file type
      let editorContent = "";
      if (isMarkdownFile(file.name)) {
        // For markdown files, convert markdown to HTML properly
        editorContent = convertMarkdownToHTML(fileContent);
      } else {
        // For text files, preserve formatting better
        editorContent = `<pre>${fileContent}</pre>`;
      }

      // Set content only once, no sync loop
      editor.commands.setContent(editorContent);
      originalContentRef.current = editor.getHTML();
      setLastSaved(new Date());
    } catch (err) {
      console.error("Error loading file:", err);
      setError(`Failed to load file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const convertMarkdownToHTML = (markdown) => {
    return (
      markdown
        // Convert headings
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
        .replace(/^##### (.*$)/gim, "<h5>$1</h5>")
        .replace(/^###### (.*$)/gim, "<h6>$1</h6>")

        // Convert bold and italic
        .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")

        // Convert inline code
        .replace(/`([^`]+)`/g, "<code>$1</code>")

        // Convert code blocks
        .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")

        // Convert blockquotes
        .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")

        // Convert unordered lists
        .replace(/^\* (.+)/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")

        // Convert ordered lists
        .replace(/^\d+\. (.+)/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>)/s, "<ol>$1</ol>")

        // Convert line breaks to paragraphs
        .split("\n\n")
        .map((paragraph) => {
          paragraph = paragraph.trim();
          if (paragraph === "") return "";
          // Don't wrap headings, lists, blockquotes, or code blocks in paragraphs
          if (paragraph.match(/^<(h[1-6]|ul|ol|blockquote|pre)/)) {
            return paragraph;
          }
          return `<p>${paragraph.replace(/\n/g, "<br>")}</p>`;
        })
        .join("")
    );
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || saving || isReadOnly) return;
    await saveFile(true);
  };

  const saveFile = async (isAutoSave = false) => {
    if (!editor || saving || isReadOnly) return;

    setSaving(true);
    setError(null);

    try {
      console.log(
        isAutoSave ? "Auto-saving file:" : "Saving file:",
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
    // Enhanced HTML to markdown conversion with proper line break handling
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, "### $1\n\n")
      .replace(/<h4[^>]*>(.*?)<\/h4>/g, "#### $1\n\n")
      .replace(/<h5[^>]*>(.*?)<\/h5>/g, "##### $1\n\n")
      .replace(/<h6[^>]*>(.*?)<\/h6>/g, "###### $1\n\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/g, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/g, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/g, "*$1*")
      .replace(/<code[^>]*>(.*?)<\/code>/g, "`$1`")
      .replace(
        /<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gs,
        "```\n$1\n```\n\n"
      )
      .replace(/<pre[^>]*>(.*?)<\/pre>/gs, "```\n$1\n```\n\n")
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, "> $1\n\n")
      .replace(/<ul[^>]*>(.*?)<\/ul>/gs, (match, content) => {
        const items = content.match(/<li[^>]*>(.*?)<\/li>/g) || [];
        return (
          items
            .map((item) => {
              const text = item.replace(/<li[^>]*>(.*?)<\/li>/, "$1");
              return `* ${text}`;
            })
            .join("\n") + "\n\n"
        );
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gs, (match, content) => {
        const items = content.match(/<li[^>]*>(.*?)<\/li>/g) || [];
        return (
          items
            .map((item, index) => {
              const text = item.replace(/<li[^>]*>(.*?)<\/li>/, "$1");
              return `${index + 1}. ${text}`;
            })
            .join("\n") + "\n\n"
        );
      })
      .replace(/<p[^>]*>(.*?)<\/p>/g, "$1\n\n")
      .replace(/<br[^>]*\/?>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\n{3,}/g, "\n\n") // Replace multiple consecutive newlines with double newlines
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
      <div className="h-full flex flex-col bg-vs-main text-vs-default">
        <div
          className="flex justify-between items-center px-4 py-3 border-b border-vs bg-vs-main"
          style={{ fontSize: "17px", fontWeight: 400 }}
        >
          <span>{file.name}</span>
          <div className="text-vs-muted">
            <span>Not editable</span>
          </div>
        </div>
        <div
          className="flex flex-col items-center justify-center text-vs-muted text-center p-5"
          style={{ height: "200px" }}
        >
          <p className="mb-3">
            This file type cannot be edited with the rich text editor.
          </p>
          <p>
            Supported formats: .md, .markdown, .txt, .json, .yml, .yaml, .xml
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-vs-main text-vs-default">
        <div
          className="flex justify-between items-center px-4 py-3 border-b border-vs bg-vs-main"
          style={{ fontSize: "17px", fontWeight: 400 }}
        >
          <h3 className="text-base font-medium text-vs-default m-0">
            {file.name}
          </h3>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-4 text-vs-muted"
          style={{ height: "200px" }}
        >
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-vs-main text-vs-default">
        <div
          className="flex justify-between items-center px-4 py-3 border-b border-vs bg-vs-main"
          style={{ fontSize: "17px", fontWeight: 400 }}
        >
          <h3 className="text-base font-medium text-vs-default m-0">
            {file.name}
          </h3>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-4 text-vs-muted"
          style={{ height: "200px" }}
        >
          <p>❌ {error}</p>
          <button
            onClick={loadFileContent}
            className="vs-button vs-button-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="m-auto pt-20 max-w-[40vw] h-full flex flex-col bg-[var(--bg)] text-vs-default">
      {/* Read-Only Header */}
      {isReadOnly && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 text-yellow-800">
          <Lock size={16} />
          <span className="text-sm font-medium">
            Repository opened in read-only mode - Editing not available
          </span>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative flex justify-center">
        <div className="w-full max-w-4xl">
          <EditorContent editor={editor} />
        </div>

        {/* Slash Command Menu - only show when not in read-only mode */}
        {showSlashMenu && !isReadOnly && (
          <div
            ref={slashMenuRef}
            className="fixed left-0 top-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-1 overflow-y-auto"
            style={{
              left: slashMenuPosition.x,
              top: slashMenuPosition.y,
              minWidth: "200px",
              maxHeight: "300px",
            }}
          >
            {slashCommands.map((command, index) => (
              <div
                key={index}
                className={`p-2 px-3 rounded cursor-pointer flex items-center gap-2 text-sm ${
                  index === selectedSlashIndex
                    ? "bg-slate-100"
                    : "bg-transparent"
                }`}
                onClick={() => executeSlashCommand(index)}
                onMouseEnter={() => setSelectedSlashIndex(index)}
              >
                <span
                  className="font-bold text-xs text-slate-500"
                  style={{ minWidth: "24px" }}
                >
                  {command.icon}
                </span>
                <span>{command.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hint text */}
      <div className="text-xs text-slate-500 px-4 py-2 border-t border-gray-200">
        {isReadOnly ? (
          <div className="flex items-center gap-2">
            <Eye size={12} />
            <span>Read-only mode - No editing available</span>
          </div>
        ) : (
          'Type "/" to open the command menu'
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;