import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import {
  ShieldCheck, Users, Building2, Calendar, DollarSign, AlertTriangle,
  CheckCircle, XCircle, Trash2, Eye, RefreshCw, LogOut, Filter, MapPin, Search
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAppStore();

  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [noticeMsg, setNoticeMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [statsRes, propsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProperties(),
        api.getAdminUsers(),
      ]);
      setStats(statsRes);
      setProperties(propsRes || []);
      setUsersList(usersRes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setErrorMsg(err.message || 'Failed to load administrator control data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (propId, newStatus) => {
    try {
      const updated = await api.updateAdminPropertyStatus(propId, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) => ((p.id || p._id) === propId ? { ...p, status: newStatus } : p))
      );
      setNoticeMsg(`Listing status updated to "${newStatus}".`);
      setTimeout(() => setNoticeMsg(''), 3000);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteProperty = async (propId) => {
    if (!window.confirm('ADMIN ACTION: Are you sure you want to permanently delete this property listing?')) return;
    try {
      await api.deleteAdminProperty(propId);
      setProperties((prev) => prev.filter((p) => (p.id || p._id) !== propId));
      setNoticeMsg('Property deleted successfully.');
      setTimeout(() => setNoticeMsg(''), 4000);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`;
    return price.toLocaleString('en-IN');
  };

  const filteredProperties = properties.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.property_type?.toLowerCase().includes(q) ||
        p.seller?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      
      {/* Admin Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <ShieldCheck size={14} /> Platform Control Center
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.25rem', letterSpacing: '-0.025em', color: '#f8fafc' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Logged in as <strong style={{ color: '#818cf8' }}>{user?.email}</strong> (Role: <span style={{ color: '#34d399', fontWeight: 700 }}>ADMIN</span>)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={loadAdminData} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem', borderRadius: '0.75rem' }}>
            <RefreshCw size={14} /> Refresh Data
          </button>
          <button onClick={handleLogout} style={{ fontSize: '0.8125rem', padding: '0.625rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <LogOut size={14} /> Admin Sign Out
          </button>
        </div>
      </div>

      {/* Notifications */}
      {noticeMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {noticeMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Stats Cards Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Users', val: stats?.total_users ?? usersList.length, icon: Users, color: '#818cf8' },
          { label: 'Total Listings', val: stats?.total_properties ?? properties.length, icon: Building2, color: '#38bdf8' },
          { label: 'Pending Moderation', val: stats?.pending_properties ?? 0, icon: AlertTriangle, color: '#facc15' },
          { label: 'Approved Listings', val: stats?.approved_properties ?? 0, icon: CheckCircle, color: '#34d399' },
          { label: 'Site Visits Scheduled', val: stats?.total_visits ?? 0, icon: Calendar, color: '#c084fc' },
          { label: 'Price Offers Sent', val: stats?.total_offers ?? 0, icon: DollarSign, color: '#f472b6' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <div style={{ fontSize: '1.625rem', fontWeight: 900, marginTop: '0.5rem', color: '#f8fafc' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Tab Controls */}
      <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <button
            onClick={() => setActiveTab('properties')}
            style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 800, color: activeTab === 'properties' ? '#818cf8' : '#94a3b8', borderBottom: activeTab === 'properties' ? '2px solid #6366f1' : '2px solid transparent', background: 'none', borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Building2 size={16} /> Property Moderation ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 800, color: activeTab === 'users' ? '#818cf8' : '#94a3b8', borderBottom: activeTab === 'users' ? '2px solid #6366f1' : '2px solid transparent', background: 'none', borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={16} /> Registered Users ({usersList.length})
          </button>
        </div>

        <div style={{ padding: '1.75rem' }}>
          
          {/* TAB 1: Property Moderation */}
          {activeTab === 'properties' && (
            <div>
              {/* Filters & Search bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Filter size={14} style={{ color: '#818cf8' }} />
                  {['all', 'pending', 'approved', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', border: '1px solid', backgroundColor: statusFilter === st ? '#6366f1' : 'transparent', color: statusFilter === st ? 'white' : '#94a3b8', borderColor: statusFilter === st ? '#6366f1' : 'rgba(255,255,255,0.1)' }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '16rem' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search by title, city, owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.75rem' }}
                  />
                </div>
              </div>

              {/* Properties Moderation Table / List */}
              {isLoading ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Loading platform properties...</p>
              ) : filteredProperties.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No listings match your filters.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredProperties.map((prop) => {
                    const pId = prop.id || prop._id;
                    const status = prop.status || 'approved';

                    return (
                      <div key={pId} style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
                          <img src={prop.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&fit=crop'} alt={prop.title} style={{ height: '4.5rem', width: '4.5rem', borderRadius: '0.75rem', objectFit: 'cover', flexShrink: 0 }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#f8fafc' }}>{prop.title}</h4>
                              <span style={{ fontSize: '10px', fontWeight: 800, padding: '0.125rem 0.5rem', borderRadius: '0.375rem', backgroundColor: status === 'approved' ? 'rgba(16,185,129,0.2)' : status === 'pending' ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)', color: status === 'approved' ? '#34d399' : status === 'pending' ? '#facc15' : '#fb7185', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {status.toUpperCase()}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, marginTop: '0.25rem' }}>
                              INR {formatPrice(prop.expected_price)} • {prop.property_type} • <MapPin size={11} style={{ display: 'inline' }} /> {prop.city}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '0.25rem' }}>
                              Owner: {prop.seller?.name || prop.seller?.full_name || 'User'} ({prop.contact_email || prop.seller?.email || 'N/A'})
                            </div>
                          </div>
                        </div>

                        {/* Status Controls */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Link to={`/properties/${pId}`} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Eye size={13} /> View
                          </Link>

                          {status !== 'approved' && (
                            <button onClick={() => handleUpdateStatus(pId, 'approved')} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircle size={13} /> Approve
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button onClick={() => handleUpdateStatus(pId, 'rejected')} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', color: '#facc15', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <XCircle size={13} /> Reject
                            </button>
                          )}

                          <button onClick={() => handleDeleteProperty(pId)} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fb7185', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Registered Users */}
          {activeTab === 'users' && (
            <div>
              {usersList.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No users registered yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>User / Full Name</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Phone Number</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id || u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={u.profile_image_url || u.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt={u.full_name} style={{ height: '2rem', width: '2rem', borderRadius: '9999px', objectFit: 'cover' }} />
                            {u.full_name || u.name || 'User'}
                          </td>
                          <td style={{ padding: '0.875rem 1rem' }}>{u.email}</td>
                          <td style={{ padding: '0.875rem 1rem' }}>{u.phone_number || u.phone || '—'}</td>
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.375rem', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', backgroundColor: u.role === 'admin' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? '#818cf8' : '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {u.role || 'user'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
