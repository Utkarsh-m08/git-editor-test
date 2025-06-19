import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center text-[var(--text)]">
      <div className="flex flex-col items-center gap-4 text-sm text-[var(--text-muted)]">
        <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
