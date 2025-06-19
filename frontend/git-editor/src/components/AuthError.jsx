import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react"; // substitute for <Failed>

const AuthError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[var(--bg)] text-[var(--text)]">
      <div className="bg-[var(--sidebar-bg)] border border-[var(--border)] rounded-[var(--radius)] p-10 max-w-md w-full text-center shadow-xl">
        <h1 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
          <AlertTriangle className="text-red-500" size={20} />
          Authentication Failed
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
          Sorry, there was an error during the GitHub authentication process.
        </p>
        <div className="flex justify-center">
          <Link
            to="/"
            className="px-4 py-2 rounded-[var(--radius)] bg-[var(--hover)] text-[var(--text)] text-sm font-medium hover:bg-[var(--bg)] transition"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
