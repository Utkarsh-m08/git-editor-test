import React from "react";

const FileTreeItem = ({
  item,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onClick,
  children,
}) => {
  const getFileIcon = (item) => {
    if (item.type === "dir") {
      return isExpanded ? "📂" : "📁";
    }

    // File icons based on extension
    const extension = item.name.split(".").pop()?.toLowerCase();
    const iconMap = {
      js: "📄",
      jsx: "⚛️",
      ts: "📘",
      tsx: "⚛️",

      // Web files
      html: "🌐",
      css: "🎨",
      scss: "🎨",
      sass: "🎨",

      // Config files
      json: "⚙️",
      env: "🔐",
      yml: "⚙️",
      yaml: "⚙️",

      // Documentation
      md: "📝",
      txt: "📄",

      // Images
      png: "🖼️",
      jpg: "🖼️",
      jpeg: "🖼️",
      gif: "🖼️",
      svg: "🎭",

      // Other languages
      py: "🐍",
      java: "☕",
      php: "🐘",
      rb: "💎",
      go: "🐹",
      rs: "🦀",
      cpp: "⚡",
      c: "⚡",
    };

    return iconMap[extension] || "📄";
  };

  const handleItemClick = (e) => {
    e.stopPropagation();

    if (item.type === "dir") {
      onToggle();
    } else {
      onClick();
    }
  };

  return (
    <div className="file-tree-item">
      <div
        className={`file-item ${item.type} ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleItemClick}
      >
        <span className="file-icon">{getFileIcon(item)}</span>
        <span className="file-name" title={item.path}>
          {item.name}
        </span>
        {item.type === "dir" && (
          <span className="folder-arrow">{isExpanded ? "▼" : "▶"}</span>
        )}
      </div>
      {children && <div className="file-children">{children}</div>}
    </div>
  );
};

export default FileTreeItem;
