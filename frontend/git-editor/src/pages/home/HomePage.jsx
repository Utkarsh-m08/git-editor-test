// src/components/HomePage.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoginCard from "../auth/LoginCard";
import Dashboard from "../../components/Dashboard";
import LoadingSpinner from "../../components/LoadingSpinner";

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
        <div className="mx-auto">
          <LoginCard />
        </div>
      )}
    </>
  );
};

export default HomePage;
