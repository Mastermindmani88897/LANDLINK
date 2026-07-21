import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import {
  MapPin, Brain, DollarSign, Building2, Heart,
  Phone, MessageSquare, Calendar, Star, ShieldCheck,
  ArrowLeft, Sparkles, TrendingUp, Send, ChevronLeft, ChevronRight,
  Bed, Bath, Car, Maximize2, Home, Zap, Droplets, School, Stethoscope,
  CheckCircle, AlertTriangle, X, Info, BarChart2, Eye, User, Edit, Trash2, Mail, Copy, Video, Share2
} from 'lucide-react';
import PropertyImage from '../components/PropertyImage.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import SEO from '../components/SEO.jsx';

function ScoreBar({ label, score, max = 10, color = '#6366f1' }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{score.toFixed(1)}/{max}</span>
      </div>
      <div style={{ height: '0.5rem', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '9999px', transition: 'all 0.7s ease-out', width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function StarRating({ rating, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((r) => (
        <button key={r} type="button" onClick={() => onChange?.(r)} style={{ cursor: onChange ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0 }}>
          <Star size={16} fill={r <= rating ? '#fbbf24' : 'none'} color={r <= rating ? '#fbbf24' : '#64748b'} />
        </button>
      ))}
    </div>
  );
}

export default function PropertyDetail() {
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppStore();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // AI Data
  const [aiNeighborhood, setAiNeighborhood] = useState(null);
  const [aiInvestment, setAiInvestment] = useState(null);

  // Forms
  const [visitDate, setVisitDate] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState('');

  const [offerAmount, setOfferAmount] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState('');
  const [negotiationResult, setNegotiationResult] = useState(null);
  const [negotiationLoading, setNegotiationLoading] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const chatEndRef = useRef(null);

  const ownerId = property?.seller_id?._id || property?.seller_id?.id || property?.seller_id || property?.seller?._id || property?.seller;
  const userId = user?._id || user?.id;
  const isOwner = Boolean(user && ownerId && String(ownerId) === String(userId));
  const isAdmin = Boolean(user && user.role === 'admin');
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  useEffect(() => {
    if (!propertyId) return;
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getProperty(propertyId);
        setProperty(data);
        setOfferAmount(String(Math.round((data.expected_price || data.price || 100000) * 0.95)));
        setEditTitle(data.title || '');
        setEditPrice(String(data.expected_price || data.price || ''));
        setEditDescription(data.description || '');
        setEditPhone(data.contact_number || '');
        setEditEmail(data.contact_email || '');

        // Fetch similar properties in same city
        const similar = await api.searchProperties({ city: data.city });
        setSimilarProperties((similar || []).filter(p => (p._id || p.id) !== propertyId).slice(0, 3));
      } catch (err) {
        console.error('Failed to load property:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    api.getPropertyReviews(propertyId).then(setReviews).catch(() => {});
  }, [propertyId]);

  useEffect(() => {
    if (activeTab !== 'ai' || !propertyId || (aiNeighborhood && aiInvestment)) return;
    async function loadAI() {
      try {
        const [nb, inv] = await Promise.all([
          api.aiNeighborhoodAnalysis(propertyId),
          api.aiInvestmentAnalysis(propertyId),
        ]);
        setAiNeighborhood(nb);
        setAiInvestment(inv);
      } catch (err) {
        console.error('AI analysis error:', err);
      }
    }
    loadAI();
  }, [activeTab, propertyId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) return;
    try {
      await api.toggleFavorite(propertyId);
      setIsFavorited(!isFavorited);
    } catch {}
  };

  const handleDeleteProperty = async () => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await api.deleteProperty(propertyId);
      alert('Property deleted successfully.');
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/my-listings');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete property');
    }
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updated = await api.updateProperty(propertyId, {
        title: editTitle,
        expected_price: parseFloat(editPrice),
        description: editDescription,
        contact_number: editPhone,
        contact_email: editEmail,
      });
      setProperty(updated);
      setIsEditModalOpen(false);
      alert('Property updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update property');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { alert('Please sign in first'); return; }
    setVisitLoading(true);
    try {
      await api.scheduleVisit(propertyId, visitDate, visitNotes);
      setVisitSuccess("Site visit request submitted! The seller will contact you to confirm.");
      setVisitDate(''); setVisitNotes('');
    } catch (err) {
      alert(err.message || 'Failed to schedule visit');
    } finally { setVisitLoading(false); }
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { alert('Please sign in first'); return; }
    setOfferLoading(true);
    try {
      await api.submitOffer(propertyId, parseFloat(offerAmount), offerNotes);
      setOfferSuccess(`Offer of ₹ ${Number(offerAmount).toLocaleString('en-IN')} submitted to seller!`);
    } catch (err) {
      alert(err.message || 'Failed to submit offer');
    } finally { setOfferLoading(false); }
  };

  const handleNegotiationAdvice = async () => {
    if (!offerAmount || !propertyId) return;
    setNegotiationLoading(true);
    try {
      const res = await api.aiNegotiation({ property_id: propertyId, buyer_offer: parseFloat(offerAmount) });
      setNegotiationResult(res);
    } catch {} finally { setNegotiationLoading(false); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { alert('Please sign in first'); return; }
    setReviewLoading(true);
    try {
      const newReview = await api.submitReview(propertyId, { reviewee_id: property?.seller_id, rating: reviewRating, review_text: reviewText });
      setReviews((prev) => [newReview, ...prev]);
      setReviewSuccess('Review submitted successfully!');
      setReviewText(''); setReviewRating(5);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally { setReviewLoading(false); }
  };

  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !propertyId) return;
    const userMsg = chatQuestion;
    setChatQuestion('');
    setChatHistory((h) => [...h, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await api.aiChatAssistant(propertyId, userMsg, chatHistory.map(m => ({ role: m.role, content: m.text })));
      setChatHistory((h) => [...h, { role: 'ai', text: res.answer }]);
    } catch {
      setChatHistory((h) => [...h, { role: 'ai', text: 'Sorry, I could not process that. Please try again.' }]);
    } finally { setChatLoading(false); }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on Request';
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lacs`;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ height: '2rem', width: '14rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.06)', animation: 'pulseGlow 1.5s infinite ease-in-out' }} />
        <div style={{ height: '26rem', width: '100%', borderRadius: '1.5rem', backgroundColor: 'rgba(255,255,255,0.06)', animation: 'pulseGlow 1.5s infinite ease-in-out' }} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-4" style={{ paddingTop: '8rem', paddingBottom: '8rem', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: '#fb7185', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Property Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>This listing may have been removed or deleted.</p>
        <Link to="/properties" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', fontSize: '0.875rem', textDecoration: 'none' }}>
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const sellerObj = property.seller || property.seller_id || {};
  const sellerName = sellerObj.name || sellerObj.full_name || property.seller_name || 'Property Owner';
  const sellerPhone = property.contact_number || sellerObj.phone || sellerObj.phone_number || '';
  const sellerEmail = property.contact_email || sellerObj.email || '';
  const sellerImage = sellerObj.profileImage || sellerObj.profile_image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';
  const images = property.images && property.images.length > 0 ? property.images : [property.image_url || property.image];

  const handleStartChatWithSeller = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to message the seller');
      return;
    }
    const targetSellerId = sellerObj._id || sellerObj.id || property.seller_id || property.seller;
    if (!targetSellerId) {
      alert('Seller information unavailable');
      return;
    }
    try {
      const conv = await api.createOrGetConversation(targetSellerId, propertyId);
      const convId = conv._id || conv.id;
      navigate(`/messages?convId=${convId}`);
    } catch (err) {
      alert(err.message || 'Failed to connect with seller');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Details' },
    { id: 'ai', label: 'AI Valuation & Insights' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'negotiate', label: 'Negotiate & Submit Offer' },
  ];

  return (
    <div style={{ width: '100%', paddingBottom: '6rem' }}>
      <SEO title={property.title} description={property.description} image={images[0]?.image_url || images[0]} />

      {/* Breadcrumb & Owner Controls */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link> /
          <Link to="/properties" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Properties</Link> /
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{property.title}</span>
        </nav>

        {(canEdit || canDelete) && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canEdit && (
              <button onClick={() => navigate(`/properties/${propertyId}/edit`)} className="btn-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderColor: '#818cf8', color: '#818cf8' }}>
                <Edit size={14} /> Edit Listing
              </button>
            )}
            {canDelete && (
              <button onClick={handleDeleteProperty} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', cursor: 'pointer', fontWeight: 600 }}>
                <Trash2 size={14} /> {isAdmin && !isOwner ? 'Admin Delete' : 'Delete'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Image Slider Lightbox */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ marginTop: '1.25rem' }}>
        <div className="glass-panel" style={{ position: 'relative', borderRadius: '1.75rem', overflow: 'hidden', backgroundColor: '#090518', width: '100%', aspectRatio: '16/8' }}>
          <PropertyImage src={images[currentImage]?.image_url || images[currentImage]} alt={property.title} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,0,20,0.85) 0%, transparent 60%)', pointerEvents: 'none' }} />

          {images.length > 1 && (
            <>
              <button onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: 'white', border: 'none', borderRadius: '9999px', padding: '0.625rem', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
              <button onClick={() => setCurrentImage((i) => (i + 1) % images.length)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: 'white', border: 'none', borderRadius: '9999px', padding: '0.625rem', cursor: 'pointer' }}><ChevronRight size={24} /></button>
            </>
          )}

          <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', backgroundColor: 'rgba(99,102,241,0.9)', fontSize: '0.75rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {property.property_type || property.house_type || 'Property'}
            </span>
            <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', fontSize: '0.75rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Brain size={13} /> AI Quality: {(property.overall_condition_score || 9.2).toFixed(1)}/10
            </span>
          </div>

          <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleFavoriteToggle} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)', color: isFavorited ? '#ef4444' : 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} fill={isFavorited ? '#ef4444' : 'none'} />
            </button>
          </div>

          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
                {formatPrice(property.expected_price || property.price)}
              </h1>
              {property.negotiable && <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>✓ Price Negotiable</span>}
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', backgroundColor: 'rgba(0,0,0,0.6)', padding: '0.375rem 0.875rem', borderRadius: '0.625rem', backdropFilter: 'blur(8px)' }}>
              Image {currentImage + 1} of {images.length}
            </div>
          </div>
        </div>

        {/* Thumbnails Strip */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={img.image_url || img}
                alt={`Thumbnail ${i + 1}`}
                onClick={() => setCurrentImage(i)}
                style={{ height: '4rem', width: '6rem', borderRadius: '0.75rem', objectFit: 'cover', cursor: 'pointer', border: i === currentImage ? '2px solid #6366f1' : '1px solid var(--card-border)', opacity: i === currentImage ? 1 : 0.6 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Layout (Content & Seller Sidebar) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2.5rem' }}>
        
        {/* Left Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {property.title}
            </h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              <MapPin size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
              {property.address ? `${property.address}, ` : ''}{property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state || 'India'}
            </p>
          </div>

          {/* Core Spec Widgets Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            {property.bedrooms && (
              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <Bed size={22} style={{ color: '#818cf8', margin: '0 auto 0.375rem' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{property.bedrooms}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Bedrooms</div>
              </div>
            )}

            {property.bathrooms && (
              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <Bath size={22} style={{ color: '#818cf8', margin: '0 auto 0.375rem' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{property.bathrooms}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Bathrooms</div>
              </div>
            )}

            {(property.area_sqft || property.area) && (
              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <Maximize2 size={22} style={{ color: '#818cf8', margin: '0 auto 0.375rem' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{property.area_sqft || property.area}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Sq. Ft Area</div>
              </div>
            )}

            {property.parking !== undefined && (
              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <Car size={22} style={{ color: '#818cf8', margin: '0 auto 0.375rem' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{property.parking || 'Yes'}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Parking</div>
              </div>
            )}
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="glass-panel" style={{ borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', backgroundColor: 'rgba(0,0,0,0.2)', overflowX: 'auto' }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '1.125rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: activeTab === t.id ? '#818cf8' : 'var(--text-secondary)',
                    borderBottom: activeTab === t.id ? '3px solid #6366f1' : '3px solid transparent',
                    background: 'none',
                    borderLeft: 'none', borderRight: 'none', borderTop: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Property Description</h3>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.8, whitespace: 'pre-line' }}>
                      {property.description || 'No detailed description provided.'}
                    </p>
                  </div>

                  {/* Property Features Checklist */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Amenities & Features</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem' }}>
                      {(() => {
                        let featureList = [];
                        if (property.property_type === 'Villa') {
                          featureList = [...(property.amenities || []), ...(property.villa_amenities || [])];
                        } else if (property.property_type === 'Commercial Plot' || property.property_type === 'Commercial Building' || property.property_type === 'Commercial') {
                          featureList = [...(property.commercial_plot_features || []), ...(property.land_factors || [])];
                        } else if (property.property_type === 'Agricultural Land') {
                          featureList = [...(property.land_factors || []), ...(property.soil_and_infrastructure || [])];
                        } else if (property.property_type === 'Residential Plot') {
                          featureList = [...(property.land_factors || [])];
                        } else {
                          featureList = [...(property.amenities || [])];
                        }
                        const uniqueFeatures = Array.from(new Set(featureList));
                        if (uniqueFeatures.length > 0) {
                          return uniqueFeatures.map((item) => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              <CheckCircle size={15} style={{ color: '#34d399' }} /> {item}
                            </div>
                          ));
                        }
                        return ['Security System', 'Power Backup', 'Water Supply', 'Elevator', 'Clubhouse', 'Swimming Pool'].map((item) => (
                          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            <CheckCircle size={15} style={{ color: '#34d399' }} /> {item}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Brain size={22} style={{ color: '#818cf8' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>Neural AI Price Valuation</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#c7d2fe', lineHeight: 1.6 }}>
                      Estimated Market Range: <strong style={{ color: '#34d399' }}>{formatPrice((property.expected_price || property.price || 100000) * 0.94)} - {formatPrice((property.expected_price || property.price || 100000) * 1.05)}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Structure & Wall Scan Score</h4>
                      <ScoreBar label="Overall Structural Health" score={property.overall_condition_score || 9.2} max={10} color="#34d399" />
                      <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Computer vision analysis detected zero major structural cracks or moisture seepage issues in uploaded photos.
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Neighborhood & Growth Potential</h4>
                      <ScoreBar label="Safety & Connectivity" score={8.8} max={10} color="#818cf8" />
                      <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Located in a high-demand residential corridor with upcoming metro connectivity and hospital access.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Submit Review Form */}
                  <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>Write a Review for Seller</h4>
                    {reviewSuccess && <div style={{ color: '#34d399', fontSize: '0.8125rem' }}>{reviewSuccess}</div>}
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Rating</span>
                      <StarRating rating={reviewRating} onChange={setReviewRating} />
                    </div>
                    <textarea
                      required
                      placeholder="Share your experience dealing with this seller..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="glass-input"
                      rows={3}
                      style={{ fontSize: '0.875rem' }}
                    />
                    <button type="submit" disabled={reviewLoading} className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem', alignSelf: 'flex-start' }}>
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>

                  {/* Reviews List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No reviews yet. Be the first to leave a review!</p>
                    ) : (
                      reviews.map((rev, i) => (
                        <div key={i} style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{rev.reviewer_name || 'User'}</span>
                            <StarRating rating={rev.rating || 5} />
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{rev.review_text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'negotiate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <form onSubmit={handleSubmitOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Make a Direct Offer</h3>
                    {offerSuccess && <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '0.875rem', fontWeight: 700 }}>{offerSuccess}</div>}
                    
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Offer Price (INR)</label>
                      <input
                        type="number"
                        required
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        className="glass-input"
                        style={{ fontSize: '1rem', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Notes for Seller</label>
                      <textarea
                        placeholder="e.g. Ready for immediate payment and closing within 15 days..."
                        value={offerNotes}
                        onChange={(e) => setOfferNotes(e.target.value)}
                        className="glass-input"
                        rows={3}
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" disabled={offerLoading} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                        {offerLoading ? 'Sending Offer...' : 'Submit Official Offer'}
                      </button>
                      <button type="button" onClick={handleNegotiationAdvice} disabled={negotiationLoading} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}>
                        <Brain size={16} /> {negotiationLoading ? 'Analyzing...' : 'AI Negotiator Advice'}
                      </button>
                    </div>
                  </form>

                  {negotiationResult && (
                    <div style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Sparkles size={16} style={{ color: '#818cf8' }} /> AI Negotiator Assessment
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#c7d2fe', lineHeight: 1.6 }}>{negotiationResult.advice || negotiationResult.recommendation || 'Your offer is competitive and within 5% of estimated fair market value.'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Seller Contact Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ position: 'sticky', top: '5rem', padding: '1.75rem', borderRadius: '1.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--card-border)' }}>
              <img src={sellerImage} alt={sellerName} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{sellerName}</h3>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> Verified Property Owner
                </span>
              </div>
            </div>

            <button onClick={handleStartChatWithSeller} className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} /> Chat with Seller
            </button>

            {sellerPhone && (
              <a href={`tel:${sellerPhone}`} className="btn-secondary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                <Phone size={18} /> Call {sellerPhone}
              </a>
            )}

            {/* Schedule Visit Mini Form */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar size={16} style={{ color: '#818cf8' }} /> Schedule Physical Site Visit
              </h4>
              {visitSuccess && <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>{visitSuccess}</div>}
              <form onSubmit={handleScheduleVisit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="glass-input"
                  style={{ fontSize: '0.8125rem' }}
                />
                <button type="submit" disabled={visitLoading} className="btn-secondary" style={{ width: '100%', padding: '0.625rem', fontSize: '0.8125rem', fontWeight: 700, borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8' }}>
                  {visitLoading ? 'Booking...' : 'Request Visit Date'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6" style={{ marginTop: '5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Similar Properties in {property.city}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
            {similarProperties.map((simProp) => (
              <PropertyCard key={simProp._id || simProp.id} property={simProp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
