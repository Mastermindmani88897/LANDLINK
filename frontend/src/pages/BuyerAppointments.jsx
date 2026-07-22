import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import SEO from '../components/SEO';
import { Calendar, Clock, CheckCircle2, XCircle, User, Phone, Mail, Building2, AlertCircle, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BuyerAppointments() {
  const { user } = useAppStore();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAppointments = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getBuyerAppointments();
      setAppointments(data || []);
    } catch (err) {
      console.error('Failed to fetch buyer appointments:', err);
      setErrorMsg(err.message || 'Failed to load your appointment requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const updated = await api.cancelAppointment(id);
      setSuccessMsg('Appointment request cancelled.');
      setAppointments((prev) => prev.map((a) => (a.id === id || a._id === id ? updated : a)));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel appointment request.');
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

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      <SEO title="My Appointment Requests" description="View and track your site visit appointment requests." />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.08em' }}>
          Buyer Portal
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
          My Appointment Requests
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Track status updates and owner responses for your site visit requests.
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

      {/* Main List */}
      {isLoading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading your appointment requests...
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', borderRadius: '1.5rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <Calendar size={40} style={{ color: '#475569', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Appointment Requests Yet</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            When you request site visits on LandLink AI properties, you can track owner approvals here.
          </p>
          <Link to="/properties" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block' }}>
            Browse Marketplace Properties
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {appointments.map((apt) => {
            const badge = getBadgeStyle(apt.status);
            const dateStr = apt.requestedDate
              ? new Date(apt.requestedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              : 'Date TBD';
            const imgUrl = apt.propertyImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop';
            const propId = apt.propertyId?._id || apt.propertyId?.id || apt.property_id;

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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={14} /> Requested Date: {dateStr}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={14} /> Slot: {apt.requestedTimeSlot}</span>
                  </div>

                  {apt.ownerName && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Property Owner: <strong style={{ color: 'var(--text-primary)' }}>{apt.ownerName}</strong>
                    </div>
                  )}

                  {/* Owner Status Responses */}
                  {apt.status === 'ACCEPTED' && (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} /> Appointment Accepted — Meeting Confirmed for {dateStr} at {apt.requestedTimeSlot}!
                    </div>
                  )}

                  {apt.status === 'REJECTED' && (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <XCircle size={16} /> Appointment Rejected — Reason: &ldquo;{apt.rejectionReason || 'Not available at this time'}&rdquo;
                    </div>
                  )}

                  {apt.status === 'PENDING' && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Your request has been sent to the property owner. You will be notified once they respond.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', minWidth: '130px' }}>
                  {propId && (
                    <Link
                      to={`/properties/${propId}`}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textDecoration: 'none', textAlign: 'center' }}
                    >
                      View Property
                    </Link>
                  )}

                  {['PENDING', 'ACCEPTED'].includes(apt.status) && (
                    <button
                      onClick={() => handleCancel(apt.id || apt._id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.75rem', border: '1px solid rgba(148,163,184,0.3)', backgroundColor: 'rgba(148,163,184,0.1)', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
