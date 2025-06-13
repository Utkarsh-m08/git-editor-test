// src/components/AuthSuccess.jsx - Updated for your backend
import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const AuthSuccess = () => {
  const { handleAuthSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Debug: Log the full URL
        console.log("🔍 Full URL:", window.location.href);
        console.log("🔍 Search params:", window.location.search);

        // 🎯 FIXED: Your backend sends raw GitHub token as ?token=...
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        console.log(
          "🔍 Extracted token:",
          token ? `${token.substring(0, 10)}...` : "None"
        );

        if (token) {
          console.log("✅ Raw GitHub token found, processing auth success...");
          await handleAuthSuccess(token);
          navigate("/");
        } else {
          console.error("❌ No token found in URL");
          console.log("Available URL params:", Array.from(urlParams.entries()));

          // Check if there's an error message
          const error = urlParams.get("message");
          if (error) {
            console.error("❌ OAuth error:", error);
          }

          // Redirect to error page after a delay so user can see debug info
          setTimeout(() => {
            navigate("/auth/error");
          }, 3000);
        }
      } catch (error) {
        console.error("❌ Auth success handling error:", error);
        navigate("/auth/error");
      }
    };

    handleAuth();
  }, [handleAuthSuccess, navigate]);

  return (
    <div className="container">
      <LoadingSpinner message="Completing authentication..." />
      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          fontSize: "12px",
          color: "#969696",
        }}
      >
        <p>Processing GitHub token...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
