import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import {
  MapPin, Brain, DollarSign, Building2, Heart,
  Phone, MessageSquare, Calendar, Star, ShieldCheck,
  ArrowLeft, Sparkles, TrendingUp, Send, ChevronLeft, ChevronRight,
  Bed, Bath, Car, Maximize2, Home, Zap, Droplets, School, Stethoscope,
  CheckCircle, AlertTriangle, X, Info, BarChart2, Eye, User, Edit, Trash2, Mail
} from 'lucide-react';

function ScoreBar({ label, score, max = 10, color = '#6366f1' }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{score.toFixed(1)}/{max}</span>
      </div>
      <div style={{ height: '0.375rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '9999px', transition: 'all 0.7s', width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function StarRating({ rating, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((r) => (
        <button key={r} type="button" onClick={() => onChange?.(r)} style={{ cursor: onChange ? 'pointer' : 'default', background: 'none', border: 'none' }}>
          <Star size={14} className={r <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
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

  // Modals & Chat
  const [chatOpen, setChatOpen] = useState(false);

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
  const chatEndRef = useRef(null);

  const isOwner = user && property && (
    (property.seller_id?.id || property.seller_id) === (user.id || user._id)
  );

  useEffect(() => {
    if (!propertyId) return;
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getProperty(propertyId);
        setProperty(data);
        setOfferAmount(String(Math.round(data.expected_price * 0.95)));
        setEditTitle(data.title);
        setEditPrice(String(data.expected_price));
        setEditDescription(data.description || '');
        setEditPhone(data.contact_number || '');
        setEditEmail(data.contact_email || '');
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
      alert('Listing deleted successfully.');
      navigate('/dashboard');
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
      setOfferSuccess(`Offer of INR ${Number(offerAmount).toLocaleString('en-IN')} submitted to seller!`);
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
    if (!price) return '0';
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`;
    return price.toLocaleString('en-IN');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ height: '2rem', width: '12rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }} />
        <div style={{ height: '22rem', width: '100%', borderRadius: '1.25rem', backgroundColor: 'rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-4" style={{ paddingTop: '8rem', paddingBottom: '8rem', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: '#fb7185', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Property Not Found</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>This listing may have been removed or deleted.</p>
        <Link to="/properties" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', fontSize: '0.875rem', textDecoration: 'none' }}>
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const sellerName = property.seller?.full_name || property.seller_id?.full_name || 'Property Owner';
  const sellerPhone = property.contact_number || property.seller?.phone_number || '';
  const sellerEmail = property.contact_email || property.seller?.email || '';
  const sellerWhatsapp = property.whatsapp_number || property.seller?.whatsapp_number || sellerPhone;

  const tabs = [
    { id: 'overview', label: 'Overview & Details' },
    { id: 'ai', label: 'AI Condition & Valuation' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'negotiate', label: 'Negotiate & Submit Offer' },
  ];

  return (
    <div style={{ width: '100%', paddingBottom: '5rem' }}>
      {/* Breadcrumb & Owner Controls */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link> /
          <Link to="/properties" style={{ color: '#94a3b8', textDecoration: 'none' }}>Properties</Link> /
          <span style={{ color: '#cbd5e1' }}>{property.title}</span>
        </nav>

        {isOwner && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIsEditModalOpen(true)} className="btn-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderColor: '#818cf8', color: '#818cf8' }}>
              <Edit size={14} /> Edit Listing
            </button>
            <button onClick={handleDeleteProperty} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', cursor: 'pointer', fontWeight: 600 }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Hero Photo Carousel */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ marginTop: '1rem' }}>
        <div className="glass-panel" style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: '#090518', width: '100%', aspectRatio: '16/7' }}>
          <img src={property.images?.[currentImage]?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&fit=crop'} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,0,20,0.85), transparent)' }} />
          
          {property.images.length > 1 && (
            <>
              <button onClick={() => setCurrentImage((i) => (i - 1 + property.images.length) % property.images.length)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '9999px', padding: '0.5rem', cursor: 'pointer' }}><ChevronLeft size={22} /></button>
              <button onClick={() => setCurrentImage((i) => (i + 1) % property.images.length)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '9999px', padding: '0.5rem', cursor: 'pointer' }}><ChevronRight size={22} /></button>
            </>
          )}

          <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
            <span style={{ padding: '0.375rem 0.75rem', borderRadius: '0.625rem', backgroundColor: 'rgba(79,70,229,0.9)', fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{property.property_type}</span>
            <span style={{ padding: '0.375rem 0.75rem', borderRadius: '0.625rem', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', fontSize: '11px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Brain size={12} /> AI Score: {(property.overall_condition_score || 9.2).toFixed(1)}/10
            </span>
          </div>

          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#cbd5e1', border: 'none', cursor: 'pointer' }}><ArrowLeft size={18} /></button>
            <button onClick={handleFavoriteToggle} style={{ padding: '0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.7)', color: isFavorited ? '#fb7185' : '#cbd5e1', border: 'none', cursor: 'pointer' }}><Heart size={18} /></button>
          </div>

          <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.5rem', textAlign: 'right' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              INR {property.min_expected_price && property.max_expected_price && property.min_expected_price !== property.max_expected_price
                ? `${formatPrice(property.min_expected_price)} - ${formatPrice(property.max_expected_price)}`
                : formatPrice(property.expected_price)}
            </div>
            {property.negotiable && <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>Price Negotiable</span>}
          </div>
        </div>

        {/* Thumbnail strip */}
        {property.images.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {property.images.map((img, i) => (
              <img key={i} src={img.image_url} alt={`Thumb ${i}`} onClick={() => setCurrentImage(i)} style={{ height: '3.5rem', width: '5rem', borderRadius: '0.5rem', objectFit: 'cover', cursor: 'pointer', border: i === currentImage ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', opacity: i === currentImage ? 1 : 0.6 }} />
            ))}
          </div>
        )}
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{property.title}</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              <MapPin size={16} style={{ color: '#818cf8' }} /> {property.address}, {property.city}, {property.state}
            </p>
          </div>

          {/* Quick Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem' }}>
            {[
              { icon: Bed, label: 'Bedrooms', value: property.min_bedrooms && property.max_bedrooms && property.min_bedrooms !== property.max_bedrooms ? `${property.min_bedrooms} - ${property.max_bedrooms}` : (property.bedrooms || '—') },
              { icon: Bath, label: 'Bathrooms', value: property.min_bathrooms && property.max_bathrooms && property.min_bathrooms !== property.max_bathrooms ? `${property.min_bathrooms} - ${property.max_bathrooms}` : (property.bathrooms || '—') },
              { icon: Maximize2, label: 'Carpet Area', value: property.min_area_sqft && property.max_area_sqft && property.min_area_sqft !== property.max_area_sqft ? `${property.min_area_sqft} - ${property.max_area_sqft} sqft` : `${property.area_sqft} sqft` },
              { icon: Car, label: 'Parking', value: property.parking || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass-panel" style={{ padding: '1.125rem', borderRadius: '1rem', backgroundColor: 'rgba(13,9,37,0.4)', textAlign: 'center' }}>
                <Icon size={20} style={{ color: '#818cf8', margin: '0 auto 0.375rem' }} />
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc' }}>{value}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tabs Navigation */}
          <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', fontWeight: 700, color: activeTab === t.id ? '#818cf8' : '#94a3b8', borderBottom: activeTab === t.id ? '2px solid #6366f1' : '2px solid transparent', background: 'none', borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '1.75rem' }}>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.625rem' }}>Property Narrative</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.75 }}>{property.description || 'No detailed description provided.'}</p>
                  </div>

                  {property.reason_for_selling && (
                    <div style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', fontSize: '0.8125rem', color: '#fef08a' }}>
                      <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', color: '#facc15', marginBottom: '0.25rem' }}>Reason for Selling</span>
                      {property.reason_for_selling}
                    </div>
                  )}

                  {/* House Type, Villa, Apartment, Land Factors & Soil Infrastructure Panels */}
                  {property.house_type && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                      <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', color: '#a5b4fc', marginBottom: '0.25rem' }}>House Classification</span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#f8fafc' }}>{property.house_type}</span>
                    </div>
                  )}

                  {/* House Specific Breakdown */}
                  {property.property_type === 'House' && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.75rem' }}>House Structure Breakdown</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.75rem' }}>
                        <div><span style={{ color: '#94a3b8' }}>Bedrooms:</span> <strong style={{ color: '#f8fafc' }}>{property.house_bedrooms || property.bedrooms}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Bathrooms:</span> <strong style={{ color: '#f8fafc' }}>{property.house_bathrooms || property.bathrooms}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>House Age:</span> <strong style={{ color: '#f8fafc' }}>{property.house_age || property.property_age} Years</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Total Rooms:</span> <strong style={{ color: '#f8fafc' }}>{property.house_total_rooms || 'N/A'}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Total Floors:</span> <strong style={{ color: '#f8fafc' }}>{property.house_total_floors || property.floors}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Villa Specific Breakdown */}
                  {property.property_type === 'Villa' && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.75rem' }}>Private Villa Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.75rem' }}>
                        <div><span style={{ color: '#94a3b8' }}>Bedrooms:</span> <strong style={{ color: '#f8fafc' }}>{property.villa_bedrooms || property.bedrooms}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Bathrooms:</span> <strong style={{ color: '#f8fafc' }}>{property.villa_bathrooms || property.bathrooms}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Villa Levels:</span> <strong style={{ color: '#f8fafc' }}>{property.villa_total_floors || property.floors}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Private Plot:</span> <strong style={{ color: '#f8fafc' }}>{property.villa_plot_area || property.area_sqft} Sq.Ft</strong></div>
                      </div>
                      {property.villa_amenities?.length > 0 && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                          {property.villa_amenities.map((va, i) => (
                            <span key={i} style={{ padding: '0.25rem 0.625rem', borderRadius: '0.375rem', backgroundColor: 'rgba(192,132,252,0.15)', color: '#c084fc', fontSize: '11px', fontWeight: 600 }}>
                              ✓ {va}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Apartment Building Complex Breakdown */}
                  {(property.property_type === 'Apartment' || property.property_type === 'Flat/Apartment') && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)' }}>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>🏢 Apartment Building / Complex Details</h4>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>An apartment complex consists of multiple individual flats built across building floors.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.75rem' }}>
                        <div><span style={{ color: '#94a3b8' }}>Grand Total Vertical Floors in Apartment Building:</span> <strong style={{ color: '#f8fafc' }}>{property.apartment_total_floors || property.floors}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Total Individual Flats on a Single Floor:</span> <strong style={{ color: '#f8fafc' }}>{property.apartment_units_per_floor || 'N/A'}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Total Flats in Apartment Complex:</span> <strong style={{ color: '#38bdf8' }}>{property.apartment_total_flats || ((property.apartment_total_floors || 1) * (property.apartment_units_per_floor || 1))} Flats</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Distribution Count of Rooms Built Across Each Floor Level:</span> <strong style={{ color: '#f8fafc' }}>{property.apartment_rooms_per_floor || 'N/A'}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Individual Flat Unit Breakdown */}
                  {(property.property_type === 'Flat' || property.property_type === 'Flat/Apartment') && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)' }}>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>🚪 Individual Flat Unit Details</h4>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>An individual flat unit situated inside an apartment building complex.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.75rem' }}>
                        <div><span style={{ color: '#94a3b8' }}>Bedrooms in Flat:</span> <strong style={{ color: '#f8fafc' }}>{property.apartment_unit_bedrooms || property.bedrooms} BHK</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Bathrooms in Flat:</span> <strong style={{ color: '#f8fafc' }}>{property.apartment_unit_bathrooms || property.bathrooms} Baths</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Flat Floor Level:</span> <strong style={{ color: '#38bdf8' }}>Floor {property.flat_floor_number || 1}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Building Total Floors:</span> <strong style={{ color: '#f8fafc' }}>{property.apartment_total_floors || property.floors} Floors</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Agricultural Cultivation & Infrastructure */}
                  {(property.property_type === 'Agricultural Land' || property.property_type === 'Land' || property.property_type === 'Land / Plot') && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#34d399', marginBottom: '0.75rem' }}>Agricultural Cultivation Metrics</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.75rem' }}>
                        <div><span style={{ color: '#94a3b8' }}>Cropping Intensity:</span> <strong style={{ color: '#f8fafc' }}>{property.cropping_intensity || 'Single-crop'}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Fallow Duration:</span> <strong style={{ color: '#f8fafc' }}>{property.crop_fallow_duration || 0} Years</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Commercial Plot Infrastructure & Connectivity */}
                  {(property.commercial_plot_features?.length > 0 || property.property_type === 'Commercial') && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#facc15', marginBottom: '0.75rem' }}>⚡ Commercial Plot Infrastructure & Connectivity</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {(property.commercial_plot_features || []).map((cp, i) => (
                          <span key={i} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(234,179,8,0.15)', color: '#facc15', fontSize: '11px', fontWeight: 600 }}>
                            ✓ {cp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Road & Utilities Panel (Hidden for Flat as requested) */}
                  {property.property_type !== 'Flat' && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Road & Utility Infrastructure</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.75rem' }}>
                        <div><span style={{ color: '#94a3b8' }}>Access Road:</span> <strong style={{ color: '#f8fafc' }}>{property.access_road_type || property.road_access || 'Highway Road'}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Corner Plot (Dual Access):</span> <strong style={{ color: property.corner_plot_status ? '#38bdf8' : '#94a3b8' }}>{property.corner_plot_status ? 'Yes (Dual Road)' : 'No'}</strong></div>
                        {property.property_type !== 'Villa' && property.property_type !== 'Flat' && (
                          <div><span style={{ color: '#94a3b8' }}>Irrigation Water Pumps:</span> <strong style={{ color: '#f8fafc' }}>{property.water_pump_count || 0} Pumps / Borewells</strong></div>
                        )}
                        <div><span style={{ color: '#94a3b8' }}>Solar Grid Infrastructure:</span> <strong style={{ color: property.solar_grid_integration ? '#facc15' : '#94a3b8' }}>{property.solar_grid_integration ? 'Yes (Operational)' : 'No'}</strong></div>
                      </div>
                    </div>
                  )}

                  {property.land_factors?.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        Land Cost & Accessibility Factors
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                        {property.land_factors.map((lf, i) => (
                          <span key={i} style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: '1px solid rgba(56,189,248,0.3)', backgroundColor: 'rgba(56,189,248,0.08)', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                            ✦ {lf}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.soil_and_infrastructure?.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        Soil Type, Agricultural Fertility & Utility Infrastructure
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                        {property.soil_and_infrastructure.map((si, i) => (
                          <span key={i} style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: '1px solid rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.08)', fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                            🌱 {si}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.amenities?.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>Amenities & Building Features</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                        {property.amenities.map((a, i) => (
                          <span key={i} style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', fontSize: '0.75rem', color: '#f1f5f9', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <CheckCircle size={13} style={{ color: '#34d399' }} /> {typeof a === 'string' ? a : a.amenity_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Brain size={16} style={{ color: '#818cf8' }} /> Neural Condition & Valuation Benchmark
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ScoreBar label="Overall Building Condition" score={property.overall_condition_score || 9.2} />
                    <ScoreBar label="Neighborhood Infrastructure" score={property.neighborhood_score || 8.8} color="#8b5cf6" />
                    <ScoreBar label="Safety Index" score={property.safety_score || 9.0} color="#10b981" />
                    <ScoreBar label="Family Suitability" score={property.family_score || 8.5} color="#f59e0b" />
                    <ScoreBar label="Investment ROI Potential" score={property.investment_score || 9.2} color="#3b82f6" />
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {isAuthenticated && (
                    <form onSubmit={handleSubmitReview} style={{ padding: '1.25rem', borderRadius: '0.875rem', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>Write a Review for Seller</span>
                        <StarRating rating={reviewRating} onChange={setReviewRating} />
                      </div>
                      <textarea rows={3} required placeholder="Share your experience inspecting or interacting..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="glass-input" style={{ fontSize: '0.75rem' }} />
                      <button type="submit" disabled={reviewLoading} className="btn-primary" style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '0.5rem 1.25rem' }}>
                        {reviewLoading ? 'Posting...' : 'Post Review'}
                      </button>
                      {reviewSuccess && <p style={{ fontSize: '0.75rem', color: '#34d399' }}>{reviewSuccess}</p>}
                    </form>
                  )}
                  {reviews.length === 0 ? <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No reviews yet for this listing.</p> : reviews.map((r, i) => (
                    <div key={i} style={{ padding: '1rem 1.25rem', borderRadius: '0.875rem', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        <span style={{ color: '#f8fafc' }}>{r.reviewer?.full_name || 'Buyer'}</span>
                        <StarRating rating={r.rating} />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.375rem', lineHeight: 1.625 }}>{r.review_text}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'negotiate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>Price Offer & AI Negotiator</h3>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', flex: 1 }} placeholder="Enter your offer price in INR" />
                    <button type="button" onClick={handleNegotiationAdvice} disabled={negotiationLoading} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                      {negotiationLoading ? 'Analyzing...' : 'AI Negotiator Advice'}
                    </button>
                  </div>
                  {negotiationResult && (
                    <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.75rem', color: '#cbd5e1' }}>
                      <div style={{ fontWeight: 800, color: '#a5b4fc', marginBottom: '0.375rem' }}>AI Suggested Counter: INR {formatPrice(negotiationResult.counter_offer)}</div>
                      <p style={{ lineHeight: 1.625 }}>{negotiationResult.evaluation_text}</p>
                    </div>
                  )}
                  <button onClick={handleSubmitOffer} disabled={offerLoading} className="btn-primary" style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}>
                    {offerLoading ? 'Submitting...' : 'Send Formal Price Offer to Seller'}
                  </button>
                  {offerSuccess && <p style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>{offerSuccess}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Seller Contact Card */}
          <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: '#818cf8' }} /> Seller Contact Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ height: '3rem', width: '3rem', borderRadius: '9999px', overflow: 'hidden', border: '2px solid #6366f1', flexShrink: 0 }}>
                  <img src={property.seller?.profile_image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'} alt={sellerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc' }}>{sellerName}</div>
                  <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>Verified Seller</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                {sellerPhone && (
                  <a href={`tel:${sellerPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', textDecoration: 'none' }}>
                    <Phone size={14} style={{ color: '#818cf8' }} /> Mobile: {sellerPhone}
                  </a>
                )}
                {sellerEmail && (
                  <a href={`mailto:${sellerEmail}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', textDecoration: 'none' }}>
                    <Mail size={14} style={{ color: '#818cf8' }} /> Gmail: {sellerEmail}
                  </a>
                )}
                {sellerWhatsapp && (
                  <a href={`https://wa.me/${sellerWhatsapp.replace(/\D/g, '')}?text=Hi ${encodeURIComponent(sellerName)}, I'm interested in your property: ${encodeURIComponent(property.title)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#34d399', textDecoration: 'none' }}>
                    <MessageSquare size={14} style={{ color: '#34d399' }} /> WhatsApp: {sellerWhatsapp}
                  </a>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '1rem' }}>
              <button onClick={() => setChatOpen(true)} className="btn-primary" style={{ flex: 1, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem' }}>
                <MessageSquare size={15} /> Instant Chat with Seller
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal for Owner */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '30rem', background: '#0c0728', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <button onClick={() => setIsEditModalOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Edit Listing Details</h3>
            
            <form onSubmit={handleUpdateProperty} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Property Title</label>
                <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Expected Price (INR)</label>
                <input type="number" required value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Contact Mobile Number</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Contact Email (Gmail)</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Description</label>
                <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <button type="submit" disabled={isUpdating} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 800 }}>
                {isUpdating ? 'Saving Changes...' : 'Save Updated Listing'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Chat Drawer */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', width: '22rem', height: '28rem', zIndex: 50 }} className="glass-panel">
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Brain size={14} /> Direct Seller Chat</span>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
          </div>
          <div style={{ height: '18rem', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
            {chatHistory.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: m.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', maxWidth: '85%', color: '#e2e8f0' }}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleAiChat} style={{ padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
            <input type="text" value={chatQuestion} onChange={(e) => setChatQuestion(e.target.value)} placeholder="Type a message..." className="glass-input" style={{ fontSize: '0.75rem', flex: 1 }} />
            <button type="submit" disabled={chatLoading} className="btn-primary" style={{ padding: '0.5rem', borderRadius: '0.5rem' }}><Send size={13} /></button>
          </form>
        </div>
      )}
    </div>
  );
}
