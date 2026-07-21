import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Home, Search, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <SEO title="404 Page Not Found" description="The page you are looking for does not exist on LandLink AI." />
      
      <div className="glass-panel" style={{ maxWidth: '36rem', width: '100%', padding: '3rem 2rem', borderRadius: '1.5rem', textAlign: 'center', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '1rem', backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8', marginBottom: '1.5rem' }}>
          <Building2 size={48} />
        </div>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--accent)', marginBottom: '0.5rem', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          We couldn't find the page or property you're looking for. It may have been moved or removed.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.875rem' }}>
            <Home size={16} /> Return Home
          </Link>
          <Link to="/properties" className="btn-secondary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.875rem' }}>
            <Search size={16} /> Browse Properties <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
