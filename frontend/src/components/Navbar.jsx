import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAppStore } from '../store/store';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { translations } from '../utils/translations';
import {
  Building2, User, LogOut, Sun, Moon, Laptop, Menu, X, Heart,
  MessageSquare, Sparkles, Globe, ShoppingBag, PlusCircle, Shield, Settings as SettingsIcon
} from 'lucide-react';
import PasswordInput from './PasswordInput';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, clearAuth, language, setLanguage, isAuthModalOpen, openAuthModal, closeAuthModal } = useAppStore();
  const { theme, setTheme } = useTheme();
  const t = translations[language] || translations.en;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (authMode === 'login') {
        await api.login({ email, password });
        closeAuthModal();
        navigate('/properties');
      } else {
        await api.register({ email, password, full_name: fullName, phone_number: phoneNumber });
        setAuthMode('login');
        setErrorMsg('Account registered successfully! Please sign in.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google OAuth — opens the account chooser popup
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        // Pass the Google access_token to our backend.
        // The backend verifies it with Google's tokeninfo + userinfo endpoints.
        await api.googleLoginWithAccessToken(tokenResponse.access_token);
        closeAuthModal();
        navigate('/properties');
      } catch (err) {
        setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      if (error.type === 'popup_closed') {
        setErrorMsg('Sign-in popup was closed. Please try again.');
      } else if (error.type === 'popup_blocked') {
        setErrorMsg('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setErrorMsg('Google sign-in failed. Please try again.');
      }
    },
  });

  const logout = () => {
    clearAuth();
    // Also revoke Google token if available (best-effort)
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    navigate('/');
  };

  const navLinks = [
    { name: t.navBrowse, path: '/properties', icon: ShoppingBag },
    { name: t.navSell, path: '/sell', icon: PlusCircle },
    { name: 'Favorites', path: '/favorites', icon: Heart },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, width: '100%', backgroundColor: 'rgba(3,0,20,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--card-border)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
              <div style={{ borderRadius: '0.75rem', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', padding: '0.5rem', color: 'white', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
                <Building2 size={22} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.025em', background: 'linear-gradient(to right, #ffffff, #c7d2fe, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t.appName}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={(e) => {
                      if (!isAuthenticated && link.path !== '/properties') {
                        e.preventDefault();
                        openAuthModal();
                      }
                    }}
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: active ? '#818cf8' : 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <Icon size={16} style={{ color: active ? '#818cf8' : 'var(--text-secondary)' }} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Controls */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.5rem', borderRadius: '0.625rem', border: '1px solid var(--card-border)' }}>
                <Globe size={14} style={{ color: '#818cf8' }} />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
                >
                  <option value="en" style={{ backgroundColor: '#0d0925', color: '#fff' }}>English</option>
                  <option value="hi" style={{ backgroundColor: '#0d0925', color: '#fff' }}>हिंदी (Hindi)</option>
                  <option value="te" style={{ backgroundColor: '#0d0925', color: '#fff' }}>తెలుగు (Telugu)</option>
                </select>
              </div>

              {/* Theme Dropdown Toggle */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  title="Switch Theme"
                  style={{ borderRadius: '0.75rem', padding: '0.5rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Laptop size={18} />}
                </button>

                {showThemeMenu && (
                  <div style={{ position: 'absolute', right: 0, marginTop: '0.5rem', width: '130px', backgroundColor: '#0d0925', border: '1px solid var(--card-border)', borderRadius: '0.75rem', padding: '0.375rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 50 }}>
                    <button onClick={() => { setTheme('light'); setShowThemeMenu(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: theme === 'light' ? '#818cf8' : 'white', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.5rem' }}>
                      <Sun size={14} /> Light Mode
                    </button>
                    <button onClick={() => { setTheme('dark'); setShowThemeMenu(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: theme === 'dark' ? '#818cf8' : 'white', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.5rem' }}>
                      <Moon size={14} /> Dark Mode
                    </button>
                    <button onClick={() => { setTheme('system'); setShowThemeMenu(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: theme === 'system' ? '#818cf8' : 'white', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.5rem' }}>
                      <Laptop size={14} /> System
                    </button>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <NotificationCenter />
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', paddingLeft: '0.5rem', borderLeft: '1px solid var(--card-border)' }}>
                    <div style={{ height: '2.1rem', width: '2.1rem', borderRadius: '9999px', overflow: 'hidden', border: '1.5px solid #6366f1' }}>
                      <img src={user?.profile_image_url || user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || user?.name || 'Profile'}</span>
                  </Link>

                  {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', padding: '0.375rem' }} title="Admin Dashboard">
                      <Shield size={18} />
                    </Link>
                  )}

                  <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#fb7185', border: '1px solid rgba(239,68,68,0.25)', padding: '0.375rem 0.75rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.05)', cursor: 'pointer' }}>
                    <LogOut size={13} /> {t.signOut}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setAuthMode('login'); openAuthModal(); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <User size={15} /> {t.navSignIn}
                </button>
              )}
            </div>

            {/* Mobile toggle */}
            <div className="flex md:hidden items-center gap-3">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ borderRadius: '0.75rem', padding: '0.5rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div style={{ backgroundColor: 'rgba(3,0,20,0.98)', padding: '0.5rem 1rem 1rem', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Globe size={14} style={{ color: '#818cf8' }} />
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="glass-input" style={{ fontSize: '0.75rem' }}>
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path} onClick={(e) => {
                  if (!isAuthenticated && link.path !== '/properties') {
                    e.preventDefault();
                    openAuthModal();
                  }
                  setIsMobileMenuOpen(false);
                }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', marginBottom: '0.25rem' }}>
                  <Icon size={18} style={{ color: '#818cf8' }} />
                  {link.name}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--card-border)', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                  <img src={user?.profile_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt="Profile" style={{ height: '2.5rem', width: '2.5rem', borderRadius: '9999px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
                  </div>
                </div>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '0.625rem 0.75rem', color: '#fb7185', background: 'rgba(239,68,68,0.05)', border: 'none', cursor: 'pointer', borderRadius: '0.75rem', fontWeight: 600 }}>{t.signOut}</button>
              </div>
            ) : (
              <button onClick={() => { setAuthMode('login'); openAuthModal(); setIsMobileMenuOpen(false); }} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', textAlign: 'center' }}>{t.navSignIn}</button>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '26rem', background: '#0c0728', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.25rem', padding: '1.75rem 2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <button onClick={() => closeAuthModal()} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#818cf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                <Sparkles size={13} /> {t.appName}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Sign in to access Buying Options, Selling Options, and Personal Settings
              </p>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: errorMsg.includes('successfully') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: errorMsg.includes('successfully') ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)', color: errorMsg.includes('successfully') ? '#34d399' : '#fb7185' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authMode === 'register' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>{t.fullName}</label>
                    <input type="text" required placeholder="e.g. Manikanta" value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>{t.mobile}</label>
                    <input type="tel" placeholder="+91 9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>{t.email}</label>
                <input type="email" required placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Password</label>
                <PasswordInput
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div style={{ position: 'relative', textAlign: 'center', margin: '1.25rem 0' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}><div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)' }}></div></div>
              <span style={{ position: 'relative', backgroundColor: '#0c0728', padding: '0 0.75rem', fontSize: '0.625rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Or continue with</span>
            </div>

            <button
              onClick={() => { setErrorMsg(''); googleLogin(); }}
              disabled={isLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.625rem', padding: '0.625rem 1rem', borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.12)', background: isLoading ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '0.8125rem',
                fontWeight: 600, color: 'white', transition: 'background 0.2s',
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              {/* Official Google 'G' logo */}
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              {authMode === 'login' ? (
                <>Don't have an account?{' '}<button onClick={() => { setAuthMode('register'); setErrorMsg(''); }} style={{ color: '#818cf8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Register here</button></>
              ) : (
                <>Already registered?{' '}<button onClick={() => { setAuthMode('login'); setErrorMsg(''); }} style={{ color: '#818cf8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Sign in here</button></>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
