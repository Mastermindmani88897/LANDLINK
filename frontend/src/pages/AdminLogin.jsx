import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { ShieldCheck, Lock, Mail, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in as admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    navigate('/admin/dashboard', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.adminLogin({ email, password });
      if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setErrorMsg('Access denied. This account does not have admin privileges.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Admin authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        
        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ inlineFlex: 'block', padding: '0.875rem', borderRadius: '1.25rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', width: 'fit-content', margin: '0 auto 1rem' }}>
            <ShieldCheck size={36} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <Sparkles size={13} /> LandLink AI Command Portal
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.25rem', letterSpacing: '-0.025em', color: '#f8fafc' }}>
            Admin Portal Login
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Secure role-based access for LandLink platform administrators.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ borderRadius: '1.5rem', padding: '2rem', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
              <input
                type="email"
                required
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>
              Administrator Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 800, borderRadius: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isLoading ? 'Authenticating Admin...' : 'Authenticate & Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          <p>Protected by LandLink AI System Security & Role Verification.</p>
        </div>
      </div>
    </div>
  );
}
