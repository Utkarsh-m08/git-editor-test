import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Book,
  LayoutDashboard,
  FileText,
  Loader,
  Folder,
  Pencil,
  Save,
  Lock,
} from "lucide-react";

const LoginCard = () => {
  const { login } = useAuth();

  return (
    <div className="max-w min-h-screen flex items-center justify-center p-5 bg- text-text">
      <div className="bg-sidebar border border-border rounded-[var(--radius)] p-10  text-center shadow-xl ">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-2 text-text">
            <Loader size={25} />
            <h1 className="text-xl font-semibold">GitHub Code Editor</h1>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            A VS Code-like editor for your GitHub repositories
          </p>
        </div>

        <div className="mb-8 space-y-3 text-sm text-text-muted">
          <div className="flex items-center gap-3">
            <Folder className="w-5 h-5" />
            <span>Browse repository files</span>
          </div>
          <div className="flex items-center gap-3">
            <Pencil className="w-5 h-5" />
            <span>Edit code with syntax highlighting</span>
          </div>
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5" />
            <span>Save changes directly to GitHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5" />
            <span>Secure OAuth authentication</span>
          </div>
        </div>

        <button
          onClick={login}
          className="flex items-center justify-center gap-2 w-full text-sm font-semibold px-6 py-3 rounded-[var(--radius)] bg-[#24292e] text-white hover:bg-[#2f363d] hover:-translate-y-px shadow-md transition"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59...Z" />
          </svg>
          Sign in with GitHub
        </button>

        <div className="border-t border-border mt-6 pt-4">
          <p className="text-xs text-text-muted leading-relaxed">
            Your data stays secure. We only access public repository
            information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
