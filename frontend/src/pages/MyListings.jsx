import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { Building2, Eye, Edit, Trash2, Plus, MapPin, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import PropertyImage from '../components/PropertyImage.jsx';

export default function MyListings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAppStore();

  const [myProperties, setMyProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Delete Confirmation Modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadListings = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getMyListings();
      setMyProperties(data || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
      setErrorMsg('Failed to load your property listings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadListings();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setErrorMsg('');
    try {
      await api.deleteProperty(deleteId);
      setMyProperties((prev) => prev.filter((p) => (p.id || p._id) !== deleteId));
      setNotice('Property deleted successfully.');
      setDeleteId(null);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete property listing');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`;
    return price.toLocaleString('en-IN');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="glass-panel" style={{ maxWidth: '30rem', margin: '0 auto', padding: '2.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Building2 size={48} style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Please Sign In</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Sign in to access and manage your property listings.
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
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <Building2 size={14} /> Owner Portfolio
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.25rem', letterSpacing: '-0.025em', color: '#f8fafc' }}>My Listings</h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Manage and edit all properties created by you ({myProperties.length})
          </p>
        </div>

        <Link to="/sell" className="btn-primary" style={{ fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '0.75rem' }}>
          <Plus size={16} /> Add New Property
        </Link>
      </div>

      {/* Notifications */}
      {notice && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {notice}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Listings Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ height: '20rem', borderRadius: '1.25rem', backgroundColor: 'rgba(255,255,255,0.04)', animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      ) : myProperties.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1.5rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Building2 size={56} style={{ color: '#64748b', margin: '0 auto 1.25rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>No Property Listings Found</h3>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem', maxWidth: '24rem', margin: '0.5rem auto 1.5rem' }}>
            You haven't posted any property listings yet. Click below to create your first real estate listing.
          </p>
          <Link to="/sell" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.875rem', textDecoration: 'none', borderRadius: '0.75rem' }}>
            Post a Property
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' }}>
          {myProperties.map((prop) => {
            const propId = prop.id || prop._id;
            const imageUrl = prop.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&fit=crop';
            const status = prop.status || 'approved';

            return (
              <div key={propId} className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '13rem', width: '100%' }}>
                  <PropertyImage src={prop.images?.[0]} alt={prop.title} />
                  
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.375rem' }}>
                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: '0.5rem', backgroundColor: 'rgba(79,70,229,0.9)', fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase' }}>
                      {prop.property_type}
                    </span>
                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: '0.5rem', backgroundColor: status === 'approved' ? 'rgba(16,185,129,0.9)' : 'rgba(234,179,8,0.9)', fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'capitalize' }}>
                      {status}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.625rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', fontSize: '1.0625rem', fontWeight: 900, color: '#f8fafc' }}>
                    INR {formatPrice(prop.expected_price)}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prop.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <MapPin size={14} style={{ color: '#818cf8', flexShrink: 0 }} /> {prop.address}, {prop.city}
                    </p>

                    <div style={{ marginTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={13} style={{ color: '#38bdf8' }} /> Views: <strong style={{ color: '#cbd5e1' }}>{prop.views || 0}</strong>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={13} style={{ color: '#a5b4fc' }} /> Posted: <strong style={{ color: '#cbd5e1' }}>{formatDate(prop.created_at)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <Link to={`/properties/${propId}`} className="btn-secondary" style={{ textAlign: 'center', fontSize: '0.75rem', padding: '0.5rem', textDecoration: 'none', fontWeight: 700, borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Eye size={13} /> View
                    </Link>
                    <Link to={`/properties/${propId}/edit`} className="btn-primary" style={{ textAlign: 'center', fontSize: '0.75rem', padding: '0.5rem', textDecoration: 'none', fontWeight: 700, borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Edit size={13} /> Edit
                    </Link>
                    <button onClick={() => setDeleteId(propId)} style={{ fontSize: '0.75rem', padding: '0.5rem', borderRadius: '0.625rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '26rem', padding: '1.75rem', borderRadius: '1.25rem', backgroundColor: 'var(--modal-bg)', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <AlertTriangle size={48} style={{ color: '#fb7185', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>Delete Property</h3>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this property?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteId(null)} disabled={isDeleting} className="btn-secondary" style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem', fontWeight: 700 }}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={isDeleting} style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem', fontWeight: 800, borderRadius: '0.75rem', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
