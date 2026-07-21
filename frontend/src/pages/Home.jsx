import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import {
  Building2, Sparkles, ShieldAlert, ArrowRight, Brain,
  MapPin, HelpCircle, DollarSign, PlusCircle, CheckCircle,
  TrendingUp, Users, ShieldCheck, Star, Award, Zap
} from 'lucide-react';

import PropertyCard from '../components/PropertyCard.jsx';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton.jsx';
import SEO from '../components/SEO.jsx';

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
        setFeatured(data.slice(0, 6));
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
    if (!isAuthenticated && path !== '/properties') {
      openAuthModal();
    } else if (path) {
      navigate(path);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?city=${encodeURIComponent(searchCity)}&property_type=${encodeURIComponent(searchType)}`);
  };

  const categories = [
    { name: 'House', count: '1,240+', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&fit=crop' },
    { name: 'Villa', count: '850+', img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&fit=crop' },
    { name: 'Apartment', count: '3,420+', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&fit=crop' },
    { name: 'Flat', count: '2,190+', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&fit=crop' },
    { name: 'Land', count: '940+', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&fit=crop' },
    { name: 'Commercial', count: '460+', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&fit=crop' },
  ];

  const trendingLocations = [
    { city: 'Mumbai', listings: '4,250+ properties', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&fit=crop' },
    { city: 'Bangalore', listings: '3,800+ properties', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&fit=crop' },
    { city: 'Pune', listings: '2,100+ properties', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&fit=crop' },
    { city: 'Delhi NCR', listings: '5,100+ properties', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&fit=crop' },
    { city: 'Hyderabad', listings: '2,900+ properties', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&fit=crop' },
    { city: 'Goa', listings: '820+ properties', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&fit=crop' },
  ];

  const aiFeaturesList = [
    { title: t.aiScanner, desc: 'Auto-scan uploaded pictures of buildings to audit wall cracks, dampness, structural issues, and paint quality with neural precision.', icon: Brain, badge: 'Structure AI' },
    { title: t.aiValuation, desc: 'Calculate true market value using real-time local neighborhood sales data and predictive price trend analytics.', icon: DollarSign, badge: 'Valuation AI' },
    { title: t.aiCopywriter, desc: 'Instantly generate engaging, high-converting marketing property descriptions tailored for high buyer response rates.', icon: Sparkles, badge: 'Copywriter AI' },
    { title: t.aiNegotiator, desc: 'Smart counter-offer evaluation providing real-time negotiation strategies for buyers and sellers.', icon: ShieldAlert, badge: 'Negotiator AI' },
  ];

  const stats = [
    { label: 'Properties Listed', value: '12,500+', icon: Building2 },
    { label: 'Zero Brokerage Saved', value: '₹42+ Cr', icon: TrendingUp },
    { label: 'AI Valuations Run', value: '180,000+', icon: Brain },
    { label: 'Happy Buyers & Owners', value: '45,000+', icon: Users },
  ];

  const testimonials = [
    {
      name: 'Aarav Sharma',
      role: 'Property Owner, Mumbai',
      text: 'LandLink AI predicted the exact price range for my 3BHK flat and generated the marketing copy in seconds. Sold directly to a buyer with zero brokerage!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop',
      rating: 5,
    },
    {
      name: 'Priya Patel',
      role: 'Homebuyer, Bangalore',
      text: 'The AI structure scanner detected minor wall dampness before I made an offer. The seller transparency and direct chat feature saved me weeks.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&fit=crop',
      rating: 5,
    },
    {
      name: 'Rohan Mehta',
      role: 'Real Estate Investor, Pune',
      text: 'The AI Neighborhood analysis and investment yield scores are game changers for identifying high-growth capital appreciation properties.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&fit=crop',
      rating: 5,
    },
  ];

  return (
    <div style={{ width: '100%', position: 'relative', overflowX: 'hidden' }}>
      <SEO title="Home - Direct Owner Real Estate Platform" description="Buy, sell, and analyze properties with zero brokerage powered by Gemini AI neural valuations and instant chat." />

      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: '-5%', left: '20%', width: '600px', height: '600px', backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: '9999px', filter: 'blur(140px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '35%', right: '10%', width: '500px', height: '500px', backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: '9999px', filter: 'blur(140px)', pointerEvents: 'none' }} />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '4.5rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.4)', backgroundColor: 'rgba(99,102,241,0.12)', fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Sparkles size={14} /> Powered by Gemini Neural Engine
          </span>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)', fontWeight: 900, letterSpacing: '-0.035em', marginBottom: '1.25rem', lineHeight: 1.1, color: 'var(--text-primary)' }}>
            {t.heroTitle} <br />
            <span className="gradient-text">Directly with Property Owners</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '44rem', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
            Zero brokerage, verified AI building scans, instant seller messaging, and instant AI market price valuations.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
            <button onClick={(e) => handleGuardedAction(e, '/properties')} className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Browse All Properties</span> <ArrowRight size={18} />
            </button>
            <button onClick={(e) => handleGuardedAction(e, '/sell')} className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8' }}>
              <PlusCircle size={18} /> List Your Property Free
            </button>
          </div>
        </motion.div>

        {/* Hero Search Box */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleHeroSearch}
          className="glass-panel"
          style={{ maxWidth: '54rem', margin: '0 auto', backgroundColor: 'rgba(12,7,40,0.85)', borderRadius: '1.5rem', padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', textAlign: 'left', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.searchCity}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
              <input type="text" placeholder="e.g. Mumbai, Bangalore, Pune" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9375rem', color: '#f1f5f9', fontFamily: 'inherit', fontWeight: 600 }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', textAlign: 'left', padding: '0 0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.searchCategory}</span>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9375rem', color: '#f1f5f9', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
              <option value="" style={{ backgroundColor: '#0d0925' }}>{t.allCategories}</option>
              <option value="House" style={{ backgroundColor: '#0d0925' }}>{t.house}</option>
              <option value="Villa" style={{ backgroundColor: '#0d0925' }}>{t.villa}</option>
              <option value="Apartment" style={{ backgroundColor: '#0d0925' }}>{t.apartment}</option>
              <option value="Flat" style={{ backgroundColor: '#0d0925' }}>{t.flat}</option>
              <option value="Land" style={{ backgroundColor: '#0d0925' }}>{t.land}</option>
              <option value="Commercial" style={{ backgroundColor: '#0d0925' }}>{t.commercial}</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '0.875rem 1.75rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', height: '100%', minHeight: '48px' }}>
            <span>Search Properties</span> <ArrowRight size={18} />
          </button>
        </motion.form>
      </section>

      {/* Live Statistics Counter Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ borderRadius: '1.5rem', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          {stats.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.625rem', borderRadius: '0.75rem', backgroundColor: 'rgba(99,102,241,0.12)', color: '#818cf8', marginBottom: '0.25rem' }}>
                  <Icon size={24} />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{st.value}</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{st.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Property Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>Explore Options</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>Property Categories</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat) => (
            <div key={cat.name} onClick={(e) => handleGuardedAction(e, `/properties?property_type=${cat.name}`)}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="glass-panel"
                style={{ position: 'relative', borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/3', cursor: 'pointer', border: '1px solid var(--card-border)' }}
              >
                <img src={cat.img} alt={cat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,0,20,0.9), transparent 70%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>{cat.name}s</h3>
                  <p style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>{cat.count}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>Top Picks</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>Featured Marketplace Listings</h2>
          </div>
          <button onClick={(e) => handleGuardedAction(e, '/properties')} style={{ fontSize: '0.875rem', fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span>View All Listings</span> <ArrowRight size={16} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {[1, 2, 3].map((n) => <PropertyCardSkeleton key={n} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {featured.map((prop) => (
              <PropertyCard key={prop._id || prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Locations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>High Demand Areas</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>Trending Locations</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1.25rem' }}>
          {trendingLocations.map((loc) => (
            <div key={loc.city} onClick={(e) => handleGuardedAction(e, `/properties?city=${loc.city}`)}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-panel"
                style={{ position: 'relative', borderRadius: '1.25rem', overflow: 'hidden', height: '140px', cursor: 'pointer', border: '1px solid var(--card-border)' }}
              >
                <img src={loc.img} alt={loc.city} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,0,20,0.85), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'white' }}>{loc.city}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>{loc.listings}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose LandLink AI */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 3rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>Core Advantages</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>Why Choose LandLink AI</h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Eliminating traditional real estate friction with direct peer-to-peer owner connectivity and neural AI intelligence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.75rem' }}>
          <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Zero Brokerage Fees</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Connect directly with verified property owners without middleman commissions or broker fees.
            </p>
          </div>

          <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Brain size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>AI Price Valuations</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Get instant, unbiased neural property valuations built on hyper-local neighborhood sales data.
            </p>
          </div>

          <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Building Crack Audit</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Computer vision scans photo uploads to detect structural cracks, dampness, and paint quality.
            </p>
          </div>

          <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: 'rgba(236,72,153,0.15)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Instant Seller Chat</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Negotiate price, request virtual tours, and schedule physical site visits via direct chat.
            </p>
          </div>
        </div>
      </section>

      {/* AI Features Section Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '1rem', paddingBottom: '5rem' }}>
        <div className="glass-panel" style={{ backgroundColor: 'rgba(13,9,37,0.7)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '2rem', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '44rem', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8' }}>PropTech Intelligence</span>
            <h2 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)', fontWeight: 900, marginTop: '0.375rem', color: 'white' }}>Powered by Gemini AI</h2>
            <p style={{ fontSize: '0.9375rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: 1.65 }}>
              Revolutionizing real estate search and transactions with computer vision image analysis, automated copy generation, and price negotiation models.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {aiFeaturesList.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ borderRadius: '0.75rem', backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.75rem', color: '#818cf8' }}>
                      <Icon size={22} />
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#a5b4fc', backgroundColor: 'rgba(99,102,241,0.2)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>
                      {feat.badge}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'white', marginBottom: '0.5rem' }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '1rem', paddingBottom: '5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '40rem', margin: '0 auto 3rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>User Feedback</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>Trusted by Thousands</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          {testimonials.map((t) => (
            <div key={t.name} className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', color: '#fbbf24', marginBottom: '0.875rem' }}>
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, italic: 'true' }}>
                  "{t.text}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={t.avatar} alt={t.name} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '1rem', paddingBottom: '6rem' }}>
        <div className="glass-panel" style={{ borderRadius: '2rem', padding: '3.5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(124,58,237,0.2) 100%)', border: '1px solid rgba(99,102,241,0.4)' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>
            Ready to Buy or List Your Property?
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#c7d2fe', maxWidth: '38rem', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
            Join thousands of property owners and buyers closing direct zero-brokerage deals with AI accuracy.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={(e) => handleGuardedAction(e, '/sell')} className="btn-primary" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} /> Post Free Property Listing
            </button>
            <button onClick={(e) => handleGuardedAction(e, '/properties')} className="btn-secondary" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              Explore Properties <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
