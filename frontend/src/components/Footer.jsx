import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import { Building2, Mail, Phone, MapPin, Send, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const { language } = useAppStore();
  const t = translations[language] || translations.en;
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--card-border)', backgroundColor: 'rgba(3,0,20,0.85)', backdropFilter: 'blur(16px)', paddingTop: '4rem', paddingBottom: '2.5rem' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
              <div style={{ borderRadius: '0.75rem', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', padding: '0.5rem', color: 'white', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
                <Building2 size={20} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, background: 'linear-gradient(to right, #c7d2fe, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t.appName}
              </span>
            </Link>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
              The next-generation AI real estate platform connecting buyers and sellers directly with neural price estimations, structure audits, and zero brokerage fees.
            </p>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>
              <Sparkles size={14} /> Gemini AI Neural Engine Powered
            </span>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/properties" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>{t.navBrowse}</Link></li>
              <li><Link to="/sell" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>{t.navSell}</Link></li>
              <li><Link to="/favorites" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Favorites</Link></li>
              <li><Link to="/messages" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Messages & Chat</Link></li>
              <li><Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>User Profile</Link></li>
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Neural AI Tools
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li>AI Price Estimator & Valuation</li>
              <li>AI Image Crack & Quality Audit</li>
              <li>AI Marketing Copywriter</li>
              <li>AI Counter-Offer Negotiator</li>
              <li>AI Neighborhood Growth Score</li>
              <li>AI Investment Yield Analyzer</li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Subscribe to Insights
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
              Get weekly market updates and top zero-brokerage AI deals straight to your inbox.
            </p>

            {subscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} /> Subscribed to market report!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.875rem', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  <Send size={14} />
                </button>
              </form>
            )}

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1.25rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={13} style={{ color: '#818cf8' }} /> support@landlink.ai</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={13} style={{ color: '#818cf8' }} /> +91 (22) 555-0199</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={13} style={{ color: '#818cf8', flexShrink: 0 }} /> BKC, Mumbai, Maharashtra, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.75rem', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>
            &copy; {new Date().getFullYear()} {t.appName} Inc. All rights reserved. Precision-engineered for real estate excellence.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Security</span>
            <span style={{ cursor: 'pointer' }}>Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
