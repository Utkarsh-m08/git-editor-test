import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AuthCallback = ({ onTokenReceived }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeToken = async () => {
      const code = searchParams.get('code');
      if (!code) {
        navigate('/auth/error');
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/auth/github/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        if (response.ok) {
          const data = await response.json();
          onTokenReceived(data.access_token);
          navigate('/');
        } else {
          navigate('/auth/error');
        }
      } catch (error) {
        console.error('Token exchange failed:', error);
        navigate('/auth/error');
      }
    };

    exchangeToken();
  }, [searchParams, navigate, onTokenReceived]);

  return <div className="loading">Completing authentication...</div>;
};

export default AuthCallback;