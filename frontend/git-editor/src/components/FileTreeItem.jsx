import React from "react";
import {
  // file-pen-line,
  FilePenLine,
  File,
  Atom,
  Globe,
  Palette,
  Settings,
  FolderOpen,
  FolderClosed,
  BookCopy,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CircleChevronDown,
  CircleChevronRight,
} from "lucide-react";
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
      return isExpanded ? (
        <FolderOpen></FolderOpen>
      ) : (
        <FolderClosed></FolderClosed>
      );
    }

    // File icons based on extension
    const extension = item.name.split(".").pop()?.toLowerCase();
    const iconMap = {
      js: <File size={12} />,
      jsx: <Atom size={12} />,
      ts: <File size={12} />,
      tsx: <Atom size={12} />,

      // Web files
      html: <Globe size={12} />,
      css: <Palette size={12} />,
      scss: <Palette size={12} />,
      sass: <Palette size={12} />,

      // Config files
      json: <Settings size={12} />,
      env: <Lock size={12} />,
      yml: <Settings size={12} />,
      yaml: <Settings size={12} />,
      // Documentation
      md: <FilePenLine size={12} />,
      txt: <FilePenLine size={12} />,

      // Images
      png: <Image></Image>,
      jpg: <Image></Image>,
      jpeg: <Image></Image>,
      gif: <Image></Image>,
      svg: <Image></Image>,

      // Other languages
      py: <BookCopy></BookCopy>,
      java: <BookCopy></BookCopy>,
      php: <BookCopy></BookCopy>,
      rb: <BookCopy></BookCopy>,
      go: <BookCopy></BookCopy>,
      rs: <BookCopy></BookCopy>,
      cpp: <BookCopy></BookCopy>,
      c: <BookCopy></BookCopy>,
    };

    return iconMap[extension] || <File></File>;
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
    <div>
      <div
        onClick={handleItemClick}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        className={`flex items-center text-sm cursor-pointer relative py-1 px-2 rounded transition select-none
        ${
          isSelected
            ? "bg-[var(--selection)] text-[var(--text)]"
            : "text-[var(--text-muted)] hover:bg-[var(--hover)]"
        }
        ${item.type === "dir" ? "font-medium" : ""}`}
      >
        <span className="flex items-center justify-center w-3 h-3 mr-2">
          {getFileIcon(item)}
        </span>

        <span
          className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm"
          title={item.path}
        >
          {item.name}
        </span>

        {item.type === "dir" && (
          <span className="ml-1 text-[10px] text-[var(--text-muted)] flex items-center justify-center w-4 h-4">
            {isExpanded ? (
              <CircleChevronDown size={12} />
            ) : (
              <CircleChevronRight size={12} />
            )}
          </span>
        )}
      </div>

      {children && (
        <div className="ml-1 border-l border-[var(--border)] pl-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default FileTreeItem;
