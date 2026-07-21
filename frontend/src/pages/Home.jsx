import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import {
  Building2, Sparkles, ShieldAlert, ArrowRight, Brain,
  MapPin, HelpCircle, DollarSign, PlusCircle
} from 'lucide-react';

import PropertyImage from '../components/PropertyImage.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal, language } = useAppStore();
  const t = translations[language] || translations.en;

  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const [featured, setFeatured] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await api.searchProperties({});
        setFeatured(data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured listings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleGuardedAction = (e, path) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
    } else if (path) {
      navigate(path);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
    } else {
      navigate(`/properties?city=${encodeURIComponent(searchCity)}&property_type=${encodeURIComponent(searchType)}`);
    }
  };

  const categories = [
    { name: 'House', count: 12, img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&fit=crop' },
    { name: 'Villa', count: 8, img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&fit=crop' },
    { name: 'Apartment', count: 16, img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&fit=crop' },
    { name: 'Flat', count: 14, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&fit=crop' },
    { name: 'Commercial', count: 5, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&fit=crop' },
  ];

  const aiFeaturesList = [
    { title: t.aiScanner, desc: 'Auto-scan uploaded pictures of buildings to audit wall cracks, dampness, and paint quality.', icon: Brain },
    { title: t.aiValuation, desc: 'Calculate market value with high precision using real-time local neighborhood metrics.', icon: DollarSign },
    { title: t.aiCopywriter, desc: 'Instantly generate engaging, professional marketing copy for your property photos.', icon: Sparkles },
    { title: t.aiNegotiator, desc: 'Smart counter-offer evaluation for buyers and sellers during price discussions.', icon: ShieldAlert },
  ];

  return (
    <div style={{ width: '100%', position: 'relative', paddingBottom: '4rem' }}>
      {/* Background decorative glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '500px', height: '500px', backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: '9999px', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '10%', width: '400px', height: '400px', backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: '9999px', filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '5rem', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.35)', backgroundColor: 'rgba(99,102,241,0.1)', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <Sparkles size={14} /> Powered by Gemini Neural Engine
        </span>
        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
          {t.heroTitle} <br />
          <span className="gradient-text">Directly with Property Owners</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.0625rem', maxWidth: '42rem', margin: '0 auto 2.5rem', lineHeight: 1.625 }}>
          {t.heroSubtitle}
        </p>

        {/* Action Buttons — Require Auth */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button onClick={(e) => handleGuardedAction(e, '/properties')} className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{t.searchButton}</span> <ArrowRight size={18} />
          </button>
          <button onClick={(e) => handleGuardedAction(e, '/sell')} className="btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8' }}>
            <PlusCircle size={18} /> {t.sellButton}
          </button>
        </div>

        {/* Hero Search Panel — Guarded */}
        <form onSubmit={handleHeroSearch} className="glass-panel" style={{ maxWidth: '48rem', margin: '0 auto', backgroundColor: 'rgba(12,7,40,0.7)', borderRadius: '1.25rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', padding: '0 0.75rem', flex: 1, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.searchCity}</span>
            <input type="text" placeholder="e.g. Mumbai, Bangalore, Pune" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#f1f5f9', fontFamily: 'inherit' }} />
          </div>
          <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', padding: '0 0.75rem', flex: 1, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.searchCategory}</span>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#cbd5e1', fontFamily: 'inherit' }}>
              <option value="">{t.allCategories}</option>
              <option value="House">{t.house}</option>
              <option value="Villa">{t.villa}</option>
              <option value="Apartment">{t.apartment}</option>
              <option value="Flat">{t.flat}</option>
              <option value="Land">{t.land}</option>
              <option value="Commercial">{t.commercial}</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem 2rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexShrink: 0, border: 'none', cursor: 'pointer' }}>
            <span>{t.searchButton}</span> <ArrowRight size={16} />
          </button>
        </form>
      </section>

      {/* Asset Categories — Guarded */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#f8fafc' }}>Browse Property Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat) => (
            <div key={cat.name} onClick={(e) => handleGuardedAction(e, `/properties?property_type=${cat.name}`)}>
              <div className="glass-panel" style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', aspectRatio: '16/9', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid rgba(255,255,255,0.08)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <img src={cat.img} alt={cat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,0,20,0.85), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.25rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'white' }}>{cat.name}s</h4>
                  <p style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>Explore listings →</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties — Guarded */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Featured Marketplace Listings</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Verified listings posted by owners with complete contact details</p>
          </div>
          <button onClick={(e) => handleGuardedAction(e, '/properties')} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span>View All Listings</span> <ArrowRight size={14} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
            {[1, 2, 3].map((n) => <div key={n} style={{ height: '20rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.75rem' }}>
            {featured.map((prop) => (
              <div key={prop.id} onClick={(e) => handleGuardedAction(e, `/properties/${prop.id}`)}>
                <div className="glass-panel" style={{ position: 'relative', display: 'flex', flexDirection: 'column', borderRadius: '1.25rem', overflow: 'hidden', backgroundColor: 'rgba(13,9,37,0.4)', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid rgba(255,255,255,0.08)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#0f172a' }}>
                    <PropertyImage src={prop.images?.[0]} alt={prop.title} />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', padding: '0.375rem 0.625rem', borderRadius: '0.5rem', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', fontSize: '10px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Brain size={11} /> AI Score: {(prop.overall_condition_score || 9.2).toFixed(1)}/10
                    </div>
                    <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', padding: '0.375rem 0.875rem', borderRadius: '0.625rem', backgroundColor: 'rgba(79,70,229,0.9)', fontSize: '0.875rem', fontWeight: 800, color: 'white' }}>
                      INR {((prop.expected_price || 0) / 100000).toFixed(0)} L
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{prop.property_type}</span>
                      <h4 style={{ fontWeight: 800, fontSize: '1.0625rem', marginTop: '0.25rem', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prop.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.625 }}>{prop.description}</p>
                    </div>
                    <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#cbd5e1' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} style={{ color: '#818cf8' }} /> {prop.city}</span>
                      <span>{prop.bedrooms} Bed &bull; {prop.bathrooms} Bath</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="glass-panel" style={{ backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '1.5rem', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '42rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8' }}>Intelligent Real Estate AI</span>
            <h3 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, marginTop: '0.375rem' }}>Powered by Google Gemini</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: 1.625 }}>
              Scan building photos, compute real-time property valuations, draft luxury marketing text, and negotiate pricing with smart counter-offer advice.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '2rem' }}>
            {aiFeaturesList.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ borderRadius: '0.875rem', backgroundColor: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', padding: '0.875rem', color: '#818cf8', flexShrink: 0, height: 'fit-content' }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#f8fafc' }}>{feat.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', lineHeight: 1.625 }}>{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
