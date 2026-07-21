import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { api } from '../services/api';
import { translations } from '../utils/translations';
import {
  Building2, User, LogOut, Sun, Moon, Menu, X, Heart,
  MessageSquare, Sparkles, Globe, ShoppingBag, PlusCircle, Settings as SettingsIcon
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, clearAuth, language, setLanguage, isAuthModalOpen, openAuthModal, closeAuthModal } = useAppStore();
  const t = translations[language] || translations.en;

  const [isThemeLight, setIsThemeLight] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isLight = localStorage.getItem('landlink_theme') === 'light';
    setIsThemeLight(isLight);
    if (isLight) document.documentElement.classList.add('light-theme');
  }, []);

  const toggleTheme = () => {
    const next = !isThemeLight;
    setIsThemeLight(next);
    if (next) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('landlink_theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('landlink_theme', 'dark');
    }
  };

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

  const handleGoogleLoginMock = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await api.googleLogin({
        email: email || `google_${Math.floor(Math.random() * 1000)}@gmail.com`,
        name: fullName || 'Google User',
        profile_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      });
      closeAuthModal();
      navigate('/properties');
    } catch {
      setErrorMsg('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
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
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, width: '100%', backgroundColor: 'rgba(3,0,20,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
              <div style={{ borderRadius: '0.75rem', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', padding: '0.5rem', color: 'white', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
                <Building2 size={22} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.025em', background: 'linear-gradient(to right, #ffffff, #c7d2fe, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
                      if (!isAuthenticated) {
                        e.preventDefault();
                        openAuthModal();
                      }
                    }}
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: active ? '#818cf8' : '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <Icon size={16} style={{ color: active ? '#818cf8' : '#94a3b8' }} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Controls */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.5rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Globe size={14} style={{ color: '#818cf8' }} />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
                >
                  <option value="en" style={{ backgroundColor: '#0d0925' }}>English</option>
                  <option value="hi" style={{ backgroundColor: '#0d0925' }}>हिंदी (Hindi)</option>
                  <option value="te" style={{ backgroundColor: '#0d0925' }}>తెలుగు (Telugu)</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <button onClick={toggleTheme} style={{ borderRadius: '0.75rem', padding: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                {isThemeLight ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <Link to="/my-listings" style={{ color: '#818cf8', display: 'flex', alignItems: 'center', padding: '0.375rem' }} title="My Listings">
                    <Building2 size={18} />
                  </Link>
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', paddingLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ height: '2rem', width: '2rem', borderRadius: '9999px', overflow: 'hidden', border: '1.5px solid #6366f1' }}>
                      <img src={user?.profile_image_url || user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || user?.name || 'Profile'}</span>
                  </Link>
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
              <button onClick={toggleTheme} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                {isThemeLight ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ borderRadius: '0.75rem', padding: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div style={{ backgroundColor: 'rgba(3,0,20,0.98)', padding: '0.5rem 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openAuthModal();
                  }
                  setIsMobileMenuOpen(false);
                }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, color: '#cbd5e1', textDecoration: 'none', marginBottom: '0.25rem' }}>
                  <Icon size={18} style={{ color: '#818cf8' }} />
                  {link.name}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                  <img src={user?.profile_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt="Profile" style={{ height: '2.5rem', width: '2.5rem', borderRadius: '9999px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>{user?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email}</div>
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
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
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
                <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div style={{ position: 'relative', textAlign: 'center', margin: '1.25rem 0' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}><div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)' }}></div></div>
              <span style={{ position: 'relative', backgroundColor: '#0c0728', padding: '0 0.75rem', fontSize: '0.625rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Or continue with</span>
            </div>

            <button onClick={handleGoogleLoginMock} disabled={isLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>
              <svg style={{ height: '1rem', width: '1rem' }} viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.72 5.72 0 0 1 8.24 12.87a5.72 5.72 0 0 1 5.751-5.73c1.558 0 2.966.58 4.056 1.54l3.08-3.08A9.87 9.87 0 0 0 13.99 2 9.89 9.89 0 0 0 4.12 11.87a9.89 9.89 0 0 0 9.87 9.87 9.53 9.53 0 0 0 9.77-9.87c0-.52-.06-1.04-.18-1.585H12.24Z"/>
              </svg>
              Google OAuth Login
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
