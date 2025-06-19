// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthSuccess from "./components/AuthSuccess";
import AuthError from "./components/AuthError";
import { AuthProvider } from "./contexts/AuthContext";
import RepoLandingPage from "./pages/home/RepoLandingPage";
import EditorPage from "./pages/editor/EditorPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/repos" element={<RepoLandingPage />} />
            <Route path="/repos/:owner/:repo/file/*" element={<EditorPage />} />
            <Route path="/repos/:owner/:repo" element={<EditorPage />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/error" element={<AuthError />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
