import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import SEO from '../components/SEO';
import { Calendar, Clock, CheckCircle2, XCircle, User, Phone, Mail, MapPin, X, MessageSquare, AlertCircle, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const REJECTION_PRESETS = [
  'Already booked for this slot',
  'Not available at requested time',
  'Please choose another day or slot',
  'Personal emergency or travel',
];

export default function OwnerAppointments() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | ACCEPTED | REJECTED | COMPLETED | ALL
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reject Modal State
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getOwnerAppointments(activeTab);
      setAppointments(data || []);
    } catch (err) {
      console.error('Failed to fetch owner appointments:', err);
      setErrorMsg(err.message || 'Failed to load appointment requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, activeTab]);

  const handleAccept = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const updated = await api.acceptAppointment(id);
      setSuccessMsg(`Appointment for "${updated.propertyTitle || 'property'}" ACCEPTED! Slot is now confirmed and locked.`);
      setAppointments((prev) => prev.map((a) => (a.id === id || a._id === id ? updated : a)));
      fetchAppointments();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to accept appointment request.');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      setErrorMsg('Please select or enter a reason for declining.');
      return;
    }

    setIsRejecting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await api.rejectAppointment(rejectingId, rejectReason.trim());
      setSuccessMsg(`Appointment request declined. Reason sent to buyer.`);
      setRejectingId(null);
      setRejectReason('');
      fetchAppointments();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to decline appointment.');
    } finally {
      setIsRejecting(false);
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return { bg: 'rgba(52,211,153,0.15)', text: '#34d399', border: 'rgba(52,211,153,0.3)', label: 'Accepted ✓' };
      case 'REJECTED':
        return { bg: 'rgba(251,113,133,0.15)', text: '#fb7185', border: 'rgba(251,113,133,0.3)', label: 'Rejected ✗' };
      case 'COMPLETED':
        return { bg: 'rgba(56,189,248,0.15)', text: '#38bdf8', border: 'rgba(56,189,248,0.3)', label: 'Completed' };
      case 'CANCELLED':
        return { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)', label: 'Cancelled' };
      default:
        return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)', label: 'Pending Request' };
    }
  };

  const tabs = [
    { id: 'PENDING', label: 'Pending Requests' },
    { id: 'ACCEPTED', label: 'Accepted / Booked' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'ALL', label: 'All History' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      <SEO title="Appointment Requests Management" description="Manage and respond to site visit appointment requests from buyers." />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.08em' }}>
          Property Owner Workspace
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
          Appointment Requests & Approval Workflow
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Review site visit requests from prospective buyers, confirm time slots, or decline with feedback.
        </p>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '0.375rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === t.id ? '#6366f1' : 'transparent',
              color: activeTab === t.id ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main List */}
      {isLoading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading appointment requests...
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', borderRadius: '1.5rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <Calendar size={40} style={{ color: '#475569', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>No {activeTab} Appointments Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            When buyers request site visit appointments for your listed properties, they will appear here for your review.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {appointments.map((apt) => {
            const badge = getBadgeStyle(apt.status);
            const dateStr = apt.requestedDate
              ? new Date(apt.requestedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              : 'Date TBD';
            const imgUrl = apt.propertyImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop';

            return (
              <div
                key={apt.id || apt._id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderRadius: '1.25rem',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  display: 'grid',
                  gridTemplateColumns: '130px minmax(0, 1fr) auto',
                  gap: '1.5rem',
                  alignItems: 'center',
                }}
              >
                {/* Property Image */}
                <div style={{ position: 'relative', width: '130px', height: '95px', borderRadius: '0.875rem', overflow: 'hidden' }}>
                  <img src={imgUrl} alt={apt.propertyTitle || 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Main Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                      {apt.propertyTitle || 'Property Listing'}
                    </h3>
                    <span
                      style={{
                        padding: '0.2rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        backgroundColor: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: '#818cf8', fontWeight: 700, display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={14} /> {dateStr}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={14} /> {apt.requestedTimeSlot}</span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span>👤 Buyer: <strong style={{ color: 'var(--text-primary)' }}>{apt.buyerName || 'Buyer'}</strong></span>
                    {apt.buyerPhone && <span>📞 {apt.buyerPhone}</span>}
                    {apt.buyerEmail && <span>✉️ {apt.buyerEmail}</span>}
                  </div>

                  {apt.message && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                      Buyer Note: &ldquo;{apt.message}&rdquo;
                    </p>
                  )}

                  {apt.rejectionReason && (
                    <p style={{ fontSize: '0.8125rem', color: '#fb7185', fontWeight: 600, margin: 0 }}>
                      Rejection Reason: &ldquo;{apt.rejectionReason}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', minWidth: '140px' }}>
                  {apt.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleAccept(apt.id || apt._id)}
                        className="btn-primary"
                        style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem', fontWeight: 800, backgroundColor: '#34d399', color: '#064e3b' }}
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => { setRejectingId(apt.id || apt._id); setRejectReason(''); }}
                        style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: '0.75rem', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.1)', color: '#fb7185', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <Link
                      to={`/properties/${apt.propertyId?._id || apt.propertyId?.id || apt.property_id}`}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textDecoration: 'none', textAlign: 'center' }}
                    >
                      View Property
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: '28rem', backgroundColor: '#0d0927', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '1.5rem', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Decline Appointment Request
              </h3>
              <button onClick={() => setRejectingId(null)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Please provide a reason so the buyer knows why the requested slot was declined.
            </p>

            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {REJECTION_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setRejectReason(preset)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.625rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: rejectReason === preset ? '1px solid #fb7185' : '1px solid var(--card-border)',
                      backgroundColor: rejectReason === preset ? 'rgba(251,113,133,0.15)' : 'rgba(255,255,255,0.03)',
                      color: rejectReason === preset ? '#fb7185' : 'var(--text-secondary)',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={3}
                placeholder="Or type custom reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="glass-input"
                style={{ fontSize: '0.875rem' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setRejectingId(null)} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isRejecting} className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem', backgroundColor: '#ef4444' }}>
                  {isRejecting ? 'Declining...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
