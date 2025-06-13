import React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const UserProfile = ({ user }) => {
  const { logout, token } = useAuth();

  return (
    <div className="card">
      <h1>✅ Welcome back!</h1>
      <div className="user-info">
        <img src={user.avatar_url} alt={user.login} className="avatar" />
        <div className="user-details">
          <h2>{user.name || user.login}</h2>
          <p>@{user.login}</p>
          {user.email && <p>📧 {user.email}</p>}
        </div>
      </div>

      <div className="actions">
        <button className="button primary">Browse Repositories</button>
        <button onClick={logout} className="button secondary">
          Logout
        </button>
      </div>

      <div className="debug-info">
        <h3>🔧 Debug Info:</h3>
        <p>Token: {token ? `${token.substring(0, 10)}...` : "None"}</p>
        <p>Status: Authenticated ✅</p>
      </div>
    </div>
  );
};

export default UserProfile;
