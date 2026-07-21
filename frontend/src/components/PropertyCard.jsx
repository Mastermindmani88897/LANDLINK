import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Bed, Bath, Maximize, Heart, Share2, ShieldCheck, UserCheck, Sparkles
} from 'lucide-react';
import PropertyImage from './PropertyImage';
import { api } from '../services/api';
import { useAppStore } from '../store/store';

export default function PropertyCard({ property, onFavoriteToggle }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAppStore();
  const [isFavorite, setIsFavorite] = useState(property?.is_favorite || false);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const formatPrice = (price) => {
    if (!price) return 'Price on Call';
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lacs`;
    }
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const handleCardClick = () => {
    if (property?._id || property?.id) {
      navigate(`/properties/${property._id || property.id}`);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const propId = property?._id || property?.id;
    if (!propId) return;

    try {
      setIsFavorite(!isFavorite);
      await api.toggleFavorite(propId);
      if (onFavoriteToggle) onFavoriteToggle(propId, !isFavorite);
    } catch (err) {
      console.error('Favorite toggle error:', err);
      setIsFavorite(isFavorite);
    }
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();
    const propId = property?._id || property?.id;
    const url = `${window.location.origin}/properties/${propId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title || 'LandLink AI Listing',
          text: `Check out this property on LandLink AI: ${property?.title}`,
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const firstImage = property?.images && property.images.length > 0
    ? property.images[0]
    : property?.image_url || property?.image;

  const aiEstPrice = property?.ai_estimated_price || property?.ai_valuation || (property?.price ? Math.round(property.price * 0.96) : null);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-panel"
      style={{
        borderRadius: '1.25rem',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: isHovered
          ? '0 20px 40px -15px rgba(99, 102, 241, 0.25)'
          : '0 8px 30px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
        <motion.div
          animate={{ scale: isHovered ? 1.06 : 1 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', height: '100%' }}
        >
          <PropertyImage src={firstImage} alt={property?.title} />
        </motion.div>

        {/* Gradient Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,0,20,0.8) 0%, transparent 50%, rgba(3,0,20,0.4) 100%)', pointerEvents: 'none' }} />

        {/* Badges Top Left */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem', zIndex: 10 }}>
          <span style={{ backgroundColor: 'rgba(99,102,241,0.9)', color: 'white', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', backdropFilter: 'blur(8px)' }}>
            {property?.property_type || property?.house_type || 'Property'}
          </span>

          {property?.is_verified && (
            <span style={{ backgroundColor: 'rgba(16,185,129,0.9)', color: 'white', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(8px)' }}>
              <ShieldCheck size={12} /> Verified
            </span>
          )}

          {property?.seller_type === 'owner' && (
            <span style={{ backgroundColor: 'rgba(245,158,11,0.9)', color: 'white', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(8px)' }}>
              <UserCheck size={12} /> Owner
            </span>
          )}
        </div>

        {/* Top Right Action Buttons */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
          <button
            onClick={handleShareClick}
            title="Share Property"
            style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', color: copiedShare ? '#10b981' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Share2 size={16} />
          </button>

          <button
            onClick={handleFavoriteClick}
            title={isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
            style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', color: isFavorite ? '#ef4444' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart size={16} fill={isFavorite ? '#ef4444' : 'none'} />
          </button>
        </div>

        {/* Price & Location Bottom Left */}
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', right: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
          <div>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {formatPrice(property?.price)}
            </h4>
          </div>
          {aiEstPrice && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.5)', backdropFilter: 'blur(8px)', color: '#a5b4fc', fontSize: '0.6875rem', fontWeight: 700 }}>
              <Sparkles size={11} /> AI Est. {formatPrice(aiEstPrice)}
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '0.875rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.375rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            {property?.title || `${property?.property_type || 'Property'} in ${property?.city || 'Prime Location'}`}
          </h3>

          <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <MapPin size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {property?.locality ? `${property.locality}, ${property.city}` : property?.city || property?.location || 'Location available on request'}
            </span>
          </p>
        </div>

        {/* Property Specs Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}>
          {property?.bedrooms != null && property?.bedrooms > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <Bed size={15} style={{ color: '#818cf8' }} />
              <span>{property.bedrooms} Bed</span>
            </div>
          )}

          {property?.bathrooms != null && property?.bathrooms > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <Bath size={15} style={{ color: '#818cf8' }} />
              <span>{property.bathrooms} Bath</span>
            </div>
          )}

          {(property?.area_sqft || property?.area || property?.plot_area_sqft) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <Maximize size={15} style={{ color: '#818cf8' }} />
              <span>{property.area_sqft || property.area || property.plot_area_sqft} sq.ft</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
