import React from 'react';

const AuthPage = ({ apiBase }) => {
  const handleLogin = () => {
    window.location.href = `${apiBase}/auth/github/login`;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>GitHub Code Editor</h1>
        <p>Sign in with GitHub to access your repositories</p>
        <button onClick={handleLogin} className="auth-button">
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
};

export default AuthPage;