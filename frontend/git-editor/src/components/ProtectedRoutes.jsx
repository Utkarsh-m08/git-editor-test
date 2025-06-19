import React from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginCard from "./auth/LoginCard";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <LoginCard />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
