import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import { Building2, Heart, Calendar, DollarSign, Edit, Trash2, Plus, User, MapPin, CheckCircle, Clock, Send, MessageSquare, Phone, Mail, X } from 'lucide-react';
import SEO from '../components/SEO';

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
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Sign in to access your dashboard, manage properties, and reply to visit requests.</p>
      </div>
    );
  }

  const myProperties = dashboardData?.my_properties || [];
  const favorites = dashboardData?.favorites || [];
  const receivedOffers = dashboardData?.received_offers || [];
  const receivedVisits = dashboardData?.received_visits || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      <SEO title="User Dashboard" description="Manage site visits, received offers, and property listings." />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dashboard Hub</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--text-primary)' }}>Welcome, {user.full_name}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{user.email} {user.phone_number ? `• ${user.phone_number}` : ''}</p>
        </div>
        <Link to="/sell" className="btn-primary" style={{ fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.75rem 1.5rem' }}>
          <Plus size={16} /> Post Free Property
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <Building2 size={24} style={{ color: '#818cf8', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{myProperties.length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Listed Properties</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <Calendar size={24} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{receivedVisits.length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Scheduled Site Visits</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <DollarSign size={24} style={{ color: '#fbbf24', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{receivedOffers.length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Received Offers</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <Heart size={24} style={{ color: '#ef4444', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{favorites.length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saved Favorites</div>
        </div>
      </div>

      {/* Appointment Portals Shortcut Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <Link to="/appointments/owner" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.875rem 1.5rem', fontSize: '0.875rem', fontWeight: 800, borderColor: '#34d399', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} /> Owner Appointment Management ({receivedVisits.length})
        </Link>
        <Link to="/appointments/buyer" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.875rem 1.5rem', fontSize: '0.875rem', fontWeight: 800, borderColor: '#818cf8', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} /> My Booked Requests ({dashboardData?.my_visits?.length || 0})
        </Link>
      </div>

      {/* 1. Received Site Visit Requests (As Property Owner) */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} style={{ color: '#34d399' }} /> Received Site Visit Requests (As Property Owner)
        </h2>

        {receivedVisits.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No site visit requests received for your properties yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {receivedVisits.map((v) => {
              const visitDateFormatted = v.visit_date ? new Date(v.visit_date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD';
              const statusColor = v.status === 'confirmed' ? '#34d399' : v.status === 'declined' ? '#fb7185' : '#f59e0b';

              return (
                <div key={v._id || v.id} style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {v.property_title || v.property?.title || 'Property Listing'}
                      </span>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                        {v.status || 'pending'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>👤 Buyer: <strong style={{ color: 'var(--text-primary)' }}>{v.buyer_name || v.buyer?.full_name || 'Interested Buyer'}</strong></span>
                      {v.buyer_phone && <span>📞 {v.buyer_phone}</span>}
                      {v.buyer_email && <span>✉️ {v.buyer_email}</span>}
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#818cf8', fontWeight: 700, display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
                      <span>📅 Date: {visitDateFormatted}</span>
                      <span>⏰ Slot: {v.time_slot || '10:00 AM - 11:00 AM'}</span>
                    </div>

                    {v.notes && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontStyle: 'italic' }}>&ldquo;{v.notes}&rdquo;</p>}
                    {v.seller_reply && <p style={{ fontSize: '0.8125rem', color: '#34d399', marginTop: '0.25rem', fontWeight: 600 }}>Your Reply: &ldquo;{v.seller_reply}&rdquo;</p>}
                  </div>

                  <button onClick={() => { setReplyVisitId(v._id || v.id); setReplyStatus(v.status === 'confirmed' ? 'confirmed' : 'confirmed'); }} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', borderColor: '#818cf8', color: '#818cf8', fontWeight: 700 }}>
                    Reply / Update Status
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. My Booked Site Visits (As Buyer) */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} style={{ color: '#818cf8' }} /> My Booked Appointments (As Buyer)
        </h2>

        {(dashboardData?.my_visits || []).length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>You haven't requested any site visit appointments yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(dashboardData?.my_visits || []).map((v) => {
              const visitDateFormatted = v.visit_date ? new Date(v.visit_date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD';
              const statusColor = v.status === 'confirmed' ? '#34d399' : v.status === 'declined' ? '#fb7185' : '#f59e0b';

              return (
                <div key={v._id || v.id} style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {v.property_title || v.property?.title || 'Property Listing'}
                      </span>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                        {v.status || 'pending'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#818cf8', fontWeight: 700, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>📅 Date: {visitDateFormatted}</span>
                      <span>⏰ Time Slot: {v.time_slot || '10:00 AM - 11:00 AM'}</span>
                    </div>

                    {v.owner_name && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Property Owner: <strong style={{ color: 'var(--text-primary)' }}>{v.owner_name}</strong>
                      </div>
                    )}

                    {v.notes && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontStyle: 'italic' }}>Your Note: &ldquo;{v.notes}&rdquo;</p>}
                    {v.seller_reply && <p style={{ fontSize: '0.8125rem', color: '#34d399', marginTop: '0.25rem', fontWeight: 600 }}>Owner Response: &ldquo;{v.seller_reply}&rdquo;</p>}
                  </div>

                  {(v.property?._id || v.property?.id || v.property_id?._id || v.property_id?.id) && (
                    <Link
                      to={`/properties/${v.property?._id || v.property?.id || v.property_id?._id || v.property_id?.id}`}
                      className="btn-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
                    >
                      View Property
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyVisitId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'var(--modal-overlay)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: '24rem', background: 'var(--modal-bg)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.25rem', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>Reply to Visit Request</h3>
              <button onClick={() => setReplyVisitId(null)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSendVisitReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>Status</label>
                <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                  <option value="confirmed">Confirm Visit</option>
                  <option value="reschedule">Propose Reschedule</option>
                  <option value="declined">Decline Request</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>Message</label>
                <textarea rows={3} placeholder="Provide address details or preferred time slot..." value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <button type="submit" disabled={isReplying} className="btn-primary" style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                {isReplying ? 'Sending...' : 'Send Confirmation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
