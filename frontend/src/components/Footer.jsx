import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { language } = useAppStore();
  const t = translations[language] || translations.en;

  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(3,0,20,0.6)', backdropFilter: 'blur(16px)', paddingTop: '3rem', paddingBottom: '2rem' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <div style={{ borderRadius: '0.75rem', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', padding: '0.5rem', color: 'white' }}>
                <Building2 size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(to right, #c7d2fe, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t.appName}
              </span>
            </Link>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.625' }}>
              {t.brandTagline}. Verified building scans, AI price predictor, and direct buyer-seller connection.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>{t.appName} Hub</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              <li><Link to="/properties" style={{ color: '#94a3b8', textDecoration: 'none' }}>{t.navBrowse}</Link></li>
              <li><Link to="/sell" style={{ color: '#94a3b8', textDecoration: 'none' }}>{t.navSell}</Link></li>
              <li><Link to="/settings" style={{ color: '#94a3b8', textDecoration: 'none' }}>{t.navSettings}</Link></li>
            </ul>
          </div>

          {/* AI Tools */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Neural Assistants</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              <li>{t.aiValuation}</li>
              <li>{t.aiScanner}</li>
              <li>{t.aiCopywriter}</li>
              <li>{t.aiNegotiator}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Direct Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={13} /> support@landlink.ai</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={13} /> +91 (22) 555-0199</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={13} style={{ flexShrink: 0 }} /> Mumbai, MH, India</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
          &copy; {new Date().getFullYear()} {t.appName}. Designed with luxury precision. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
