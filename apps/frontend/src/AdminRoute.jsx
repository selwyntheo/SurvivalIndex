import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import api from './api/client';
import './admin.css';

export default function AdminRoute() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      if (api.auth.isAuthenticated()) {
        const user = await api.auth.getCurrentUser();
        if (user && user.role === 'admin') {
          setCurrentUser(user);
        } else {
          setShowLoginModal(true);
        }
      } else {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setShowLoginModal(true);
    } finally {
      setChecking(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const result = await api.auth.login(loginEmail, loginPassword);
      if (result.user.role !== 'admin') {
        setLoginError('Access denied. Admin privileges required.');
        await api.auth.logout();
        return;
      }
      setCurrentUser(result.user);
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    try {
      await api.auth.logout();
      setCurrentUser(null);
      setShowLoginModal(true);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  if (checking) {
    return (
      <div className="admin-loading">
        <Loader2 className="spinning" size={48} />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!currentUser || showLoginModal) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <h1>Admin Access</h1>
          <p>Please login with your administrator credentials</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@survivalindex.org"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="submit-btn"
              disabled={loggingIn}
            >
              {loggingIn ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <div className="back-link">
            <a href="/">← Back to SurvivalIndex</a>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel currentUser={currentUser} onLogout={handleLogout} />;
}
