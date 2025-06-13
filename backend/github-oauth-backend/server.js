require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const githubRoutes = require("./routes/github.js");

const app = express();

// Middleware
// allows cross origin requests   
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/auth/github", authRoutes);
app.use("/api", githubRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "GitHub Code Editor API is running",
    timestamp: new Date().toISOString(),
    env: {
      CLIENT_ID: process.env.CLIENT_ID ? "Set" : "Missing",
      CLIENT_SECRET: process.env.CLIENT_SECRET ? "Set" : "Missing",
      FRONTEND_URL: process.env.FRONTEND_URL,
    },
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    error: `Not Found - ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// app.post("/auth/verify", async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const token = authHeader.substring(7); // Remove 'Bearer ' prefix

//     // Verify the JWT token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const githubToken = decoded.access_token;

//     // Verify token with GitHub API
//     const response = await fetch("https://api.github.com/user", {
//       headers: {
//         Authorization: `Bearer ${githubToken}`,
//         "User-Agent": "GitHub-Code-Editor",
//       },
//     });

//     if (!response.ok) {
//       return res.status(401).json({ error: "Invalid GitHub token" });
//     }

//     const userData = await response.json();

//     // Return user data (same format as login success)
//     res.json({
//       id: userData.id,
//       login: userData.login,
//       name: userData.name,
//       email: userData.email,
//       avatar_url: userData.avatar_url,
//       html_url: userData.html_url,
//     });
//   } catch (error) {
//     console.error("❌ Token verification error:", error);

//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({ error: "Invalid token format" });
//     }

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ error: "Token expired" });
//     }

//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// Also add a simple health check endpoint if you don't have one
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    server: "GitHub Code Editor Backend",
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 GitHub login: http://localhost:${PORT}/auth/github/login`);

  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.log("⚠️  Warning: GitHub OAuth credentials not found in .env file");
  } else {
    console.log("✅ GitHub OAuth credentials loaded");
  }
});
