import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import { Building2, Heart, Calendar, DollarSign, Edit, Trash2, Plus, User, MapPin, CheckCircle, Clock, Send, MessageSquare, Phone, Mail } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, language } = useAppStore();
  const t = translations[language] || translations.en;

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reply visit state
  const [replyVisitId, setReplyVisitId] = useState(null);
  const [replyStatus, setReplyStatus] = useState('confirmed');
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const handleDeleteListing = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await api.deleteProperty(id);
      setDashboardData((prev) => ({
        ...prev,
        my_properties: prev.my_properties.filter((p) => p.id !== id && p._id !== id),
      }));
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  const handleSendVisitReply = async (e) => {
    e.preventDefault();
    if (!replyVisitId) return;
    setIsReplying(true);
    try {
      await api.replyVisit(replyVisitId, replyStatus, replyMessage);
      alert('Reply sent to buyer successfully!');
      setReplyVisitId(null);
      setReplyMessage('');
      loadDashboard();
    } catch (err) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Please Sign In</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>Sign in to access your Selling Options, manage properties, and reply to buyer visit requests.</p>
      </div>
    );
  }

  const myProperties = dashboardData?.my_properties || [];
  const favorites = dashboardData?.favorites || [];
  const receivedOffers = dashboardData?.received_offers || [];
  const receivedVisits = dashboardData?.received_visits || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.navSell} Hub</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.25rem', letterSpacing: '-0.025em' }}>Welcome, {user.full_name}</h1>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>{user.email} {user.phone_number ? `• Mobile: ${user.phone_number}` : ''}</p>
        </div>
        <Link to="/sell" className="btn-primary" style={{ fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.625rem 1.25rem' }}>
          <Plus size={16} /> {t.sellButton}
        </Link>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: t.myProperties, val: myProperties.length, icon: Building2 },
          { label: t.savedFavorites, val: favorites.length, icon: Heart },
          { label: 'Offers Received', val: receivedOffers.length, icon: DollarSign },
          { label: 'Site Visit Requests', val: receivedVisits.length, icon: Calendar },
        ].map(({ label, val, icon: Icon }) => (
          <div key={label} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
              <Icon size={16} style={{ color: '#818cf8' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '0.5rem', color: '#f8fafc' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Section 1: Buyer Site Visit Requests & Seller Reply */}
      <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: '#818cf8' }} /> {t.receivedVisits}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>When a buyer books a site visit, you can accept, confirm, or reply with your availability.</p>
          </div>
        </div>

        {receivedVisits.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
            No visit requests received yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {receivedVisits.map((v, i) => {
              const visitId = v.id || v._id;
              const buyerName = v.buyer?.full_name || 'Buyer';
              const buyerMobile = v.buyer?.phone_number || '';
              const buyerEmail = v.buyer?.email || '';

              return (
                <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Requested for: {v.property?.title || 'Property'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
                        Buyer Details: {buyerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {buyerMobile && <span><Phone size={12} style={{ display: 'inline', color: '#34d399' }} /> {buyerMobile}</span>}
                        {buyerEmail && <span><Mail size={12} style={{ display: 'inline', color: '#818cf8' }} /> {buyerEmail}</span>}
                        <span><Clock size={12} style={{ display: 'inline', color: '#fbbf24' }} /> {new Date(v.visit_date).toLocaleString()}</span>
                      </div>
                      {v.notes && <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.375rem' }}>Buyer Note: "{v.notes}"</div>}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '0.25rem 0.625rem', borderRadius: '0.5rem', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', backgroundColor: v.status === 'confirmed' ? 'rgba(16,185,129,0.2)' : 'rgba(234,179,8,0.2)', color: v.status === 'confirmed' ? '#34d399' : '#facc15' }}>
                        {v.status === 'confirmed' ? t.confirmed : t.pending}
                      </span>
                    </div>
                  </div>

                  {v.seller_reply && (
                    <div style={{ padding: '0.75rem', borderRadius: '0.625rem', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.75rem', color: '#c7d2fe' }}>
                      <span style={{ fontWeight: 700, color: '#818cf8' }}>Your Reply to Buyer:</span> {v.seller_reply}
                    </div>
                  )}

                  {/* Reply Controls */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={() => { setReplyVisitId(visitId); setReplyStatus('confirmed'); setReplyMessage('Yes, I will be available at the property at this time. Looking forward to meeting you!'); }} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}>
                      <CheckCircle size={14} /> Accept / Confirm Visit
                    </button>
                    <button onClick={() => { setReplyVisitId(visitId); setReplyStatus('rescheduled'); setReplyMessage('Hi! Could we reschedule this visit to tomorrow evening instead?'); }} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}>
                      Reschedule / Send Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyVisitId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '28rem', background: '#0c0728', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem' }}>Reply to Buyer Visit Request</h3>
            
            <form onSubmit={handleSendVisitReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Visit Status</label>
                <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', backgroundColor: '#0d0925' }}>
                  <option value="confirmed">Confirmed (I will be there at requested time)</option>
                  <option value="rescheduled">Reschedule (Propose a different time)</option>
                  <option value="cancelled">Decline / Cancel</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Message / Reply Note to Buyer</label>
                <textarea rows={3} required value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} placeholder="Type message to buyer..." />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setReplyVisitId(null)} className="btn-secondary" style={{ flex: 1, fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" disabled={isReplying} className="btn-primary" style={{ flex: 1, fontSize: '0.875rem' }}>{isReplying ? 'Sending...' : 'Send Reply'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section 2: My Listed Properties (Seller Management) */}
      <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc' }}>{t.myProperties}</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Manage, edit details, upload photos, or delete your posted listings</p>
          </div>
        </div>

        {isLoading ? (
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Loading listings...</p>
        ) : myProperties.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
            <Building2 size={36} style={{ color: '#64748b', margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0' }}>You haven't listed any properties yet</h4>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', marginBottom: '1rem' }}>Post your apartment, house, villa, or land plot to find buyers.</p>
            <Link to="/sell" className="btn-primary" style={{ fontSize: '0.75rem', display: 'inline-block', textDecoration: 'none' }}>+ {t.sellButton}</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {myProperties.map((p) => {
              const propId = p.id || p._id;
              return (
                <div key={propId} className="glass-panel" style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ position: 'relative', aspectRatio: '16/10', backgroundColor: '#0f172a' }}>
                    <img src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&fit=crop'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', backgroundColor: 'rgba(16,185,129,0.9)', fontSize: '9px', fontWeight: 800, color: 'white' }}>Active</div>
                  </div>
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, marginTop: '0.25rem' }}>INR {((p.expected_price || 0) / 100000).toFixed(0)} Lakh</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '0.25rem' }}>{p.city}, {p.state}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <Link to={`/properties/${propId}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', padding: '0.375rem', textDecoration: 'none' }}>View</Link>
                      <button onClick={(e) => handleDeleteListing(e, propId)} style={{ padding: '0.375rem 0.625rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Saved Favorites */}
      <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>{t.savedFavorites}</h3>
        {favorites.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No saved favorite properties yet. Click the heart icon on any property in Buying Options to save it here!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {favorites.map((p) => {
              const propId = p.id || p._id;
              return (
                <Link key={propId} to={`/properties/${propId}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-panel" style={{ borderRadius: '1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '0.875rem', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, marginTop: '0.25rem' }}>{p.city} • INR {((p.expected_price || 0) / 100000).toFixed(0)} Lakh</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
