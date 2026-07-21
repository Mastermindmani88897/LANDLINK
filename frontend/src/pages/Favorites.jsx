import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { Heart, MapPin, Eye, Trash2, Building2, ArrowRight, ShieldCheck } from 'lucide-react';

import PropertyImage from '../components/PropertyImage.jsx';

export default function Favorites() {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAppStore();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadFavorites = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setErrorMsg('Failed to load favorite properties.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemoveFavorite = async (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.toggleFavorite(propertyId);
      setFavorites((prev) => prev.filter((p) => (p.id || p._id) !== propertyId));
    } catch (err) {
      alert(err.message || 'Failed to remove favorite');
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`;
    return price.toLocaleString('en-IN');
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="glass-panel" style={{ maxWidth: '30rem', margin: '0 auto', padding: '2.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Heart size={48} style={{ color: '#fb7185', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Please Sign In</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            You need to be logged in to view and save your favorite properties.
          </p>
          <button onClick={openAuthModal} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.75rem 1.75rem', fontSize: '0.875rem', borderRadius: '0.75rem' }}>
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <Heart size={14} className="fill-rose-500 text-rose-500" /> Saved Properties
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.25rem', letterSpacing: '-0.025em', color: '#f8fafc' }}>My Favorites</h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Properties you've saved to your personal wishlist ({favorites.length})
          </p>
        </div>
        <Link to="/properties" className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          Browse Marketplace <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ height: '18rem', borderRadius: '1.25rem', backgroundColor: 'rgba(255,255,255,0.04)', animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1.5rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Heart size={56} style={{ color: '#64748b', margin: '0 auto 1.25rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>You haven't added any favorite properties yet.</h3>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem', maxWidth: '24rem', margin: '0.5rem auto 1.5rem' }}>
            Explore our real estate marketplace and tap the heart icon on any property to save it here for later.
          </p>
          <Link to="/properties" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.875rem', textDecoration: 'none', borderRadius: '0.75rem' }}>
            Explore Properties Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {favorites.map((prop) => {
            const propId = prop.id || prop._id;
            const imageUrl = prop.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&fit=crop';

            return (
              <div key={propId} className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
                <div style={{ position: 'relative', height: '12rem', width: '100%' }}>
                  <PropertyImage src={prop.images?.[0]} alt={prop.title} />
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', backgroundColor: 'rgba(79,70,229,0.9)', fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase' }}>
                    {prop.property_type}
                  </div>
                  <button onClick={(e) => handleRemoveFavorite(e, propId)} title="Remove from Favorites" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fb7185', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={16} />
                  </button>
                  <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.625rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', fontSize: '1rem', fontWeight: 900, color: '#f8fafc' }}>
                    INR {formatPrice(prop.expected_price)}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prop.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <MapPin size={14} style={{ color: '#818cf8', flexShrink: 0 }} /> {prop.address}, {prop.city}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <Link to={`/properties/${propId}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.8125rem', padding: '0.5rem', textDecoration: 'none', fontWeight: 700, borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                      <Eye size={14} /> View Details
                    </Link>
                    <button onClick={(e) => handleRemoveFavorite(e, propId)} className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#fb7185', borderColor: 'rgba(239,68,68,0.3)', borderRadius: '0.625rem' }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
