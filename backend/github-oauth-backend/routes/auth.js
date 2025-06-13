const express = require("express");
const axios = require("axios");
const router = express.Router();

const { CLIENT_ID, CLIENT_SECRET, FRONTEND_URL } = process.env;

// OAuth login initiation

router.get("/login", (req, res) => {
  const scope = "repo user";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${scope}`;

  console.log("🔐 Initiating GitHub OAuth flow");
  res.redirect(githubAuthUrl);
});

// OAuth callback
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  console.log(
    "📝 Received OAuth callback, code:",
    code ? "Present" : "Missing"
  );

  if (!code) {
    console.log("❌ No authorization code received");
    return res.redirect(`${FRONTEND_URL}/auth/error?message=no_code`);
  }

  try {
    console.log("🔄 Exchanging code for access token...");
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const { access_token, error } = response.data;

    if (error) {
      console.log("❌ GitHub OAuth error:", error);
      return res.redirect(`${FRONTEND_URL}/auth/error?message=${error}`);
    }

    if (!access_token) {
      console.log("❌ No access token received");
      return res.redirect(`${FRONTEND_URL}/auth/error?message=no_token`);
    }

    console.log("✅ Successfully received access token");
    res.redirect(`${FRONTEND_URL}/auth/success?token=${access_token}`);
  } catch (error) {
    console.error("❌ OAuth callback error:", error.message);
    res.redirect(`${FRONTEND_URL}/auth/error?message=server_error`);
  }
});

// Token verification
router.get("/verify", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Token verified for user:", response.data.login);

    res.json({
      success: true,
      user: {
        login: response.data.login,
        name: response.data.name,
        avatar_url: response.data.avatar_url,
        email: response.data.email,
        public_repos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,
      },
    });
  } catch (error) {
    console.log("❌ Token verification failed:", error.response?.status);
    res.status(401).json({
      error: "Invalid token",
      details: error.response?.data || error.message,
    });
  }
});


module.exports = router;
