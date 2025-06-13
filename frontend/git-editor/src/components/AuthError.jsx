// src/components/AuthError.jsx
import React from "react";
import { Link } from "react-router-dom";

const AuthError = () => {
  return (
    <div className="container">
      <div className="error-card">
        <h1>❌ Authentication Failed</h1>
        <p>
          Sorry, there was an error during the GitHub authentication process.
        </p>
        <div className="error-actions">
          <Link to="/" className="button primary">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
