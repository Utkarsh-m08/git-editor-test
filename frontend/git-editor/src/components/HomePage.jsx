// src/components/HomePage.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginCard from "./LoginCard";
import Dashboard from "./Dashboard";
import LoadingSpinner from "./LoadingSpinner";

const HomePage = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  return (
    <>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <div className="container">
          <LoginCard />
        </div>
      )}
    </>
  );
};

export default HomePage;
