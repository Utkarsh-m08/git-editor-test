// src/contexts/AuthContext.jsx - Updated for your backend
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext({});

const API_BASE_URL = 'http://localhost:4000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Prevent duplicate verification calls
  const verifyingRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeAuth();
    }
  }, []);

  const initializeAuth = async () => {
    if (verifyingRef.current) {
      console.log('🛑 Auth already initializing, skipping...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check for existing token
      const savedToken = localStorage.getItem('github_token');
      if (savedToken) {
        console.log('🔑 Found saved token, verifying...');
        await verifyToken(savedToken);
      } else {
        console.log('❌ No saved token found');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      setError('Failed to initialize authentication');
      setLoading(false);
    }
  };

  const verifyToken = async (tokenToVerify) => {
    if (!tokenToVerify) {
      console.log('❌ No token to verify');
      setLoading(false);
      return false;
    }

    if (verifyingRef.current) {
      console.log('🛑 Token verification already in progress...');
      return false;
    }

    verifyingRef.current = true;

    try {
      console.log('🔍 Verifying token with your backend...');
      
      // 🎯 FIXED: Use GET method and correct endpoint for your backend
      const response = await fetch(`${API_BASE_URL}/auth/github/verify`, {
        method: 'GET', // Your backend uses GET, not POST
        headers: {
          'Authorization': `Bearer ${tokenToVerify}` // Raw GitHub token
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Token verified, user:', result.user.login);
        
        // 🎯 FIXED: Your backend returns { success: true, user: {...} }
        setUser(result.user);
        setToken(tokenToVerify);
        localStorage.setItem('github_token', tokenToVerify);
        setLoading(false);
        return true;
      } else {
        console.log('❌ Token verification failed:', response.status);
        clearAuth();
        return false;
      }
    } catch (err) {
      console.error('❌ Token verification error:', err);
      clearAuth();
      return false;
    } finally {
      verifyingRef.current = false;
    }
  };

  const login = () => {
    console.log('🚀 Starting GitHub login...');
    // 🎯 FIXED: Use correct login endpoint for your backend
    window.location.href = `${API_BASE_URL}/auth/github/login`;
  };

  const handleAuthSuccess = async (newToken) => {
    if (!newToken) {
      console.error('❌ No token provided to handleAuthSuccess');
      return;
    }

    console.log('🎉 Auth success, raw GitHub token received');
    
    // Clear any existing verification
    verifyingRef.current = false;
    
    // 🎯 FIXED: Store raw GitHub token (not JWT)
    setToken(newToken);
    localStorage.setItem('github_token', newToken);
    
    // Verify token to get user data
    await verifyToken(newToken);
  };

  const logout = () => {
    console.log('👋 Logging out...');
    clearAuth();
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setLoading(false);
    localStorage.removeItem('github_token');
    verifyingRef.current = false;
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!(user && token),
    login,
    logout,
    handleAuthSuccess,
    verifyToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};