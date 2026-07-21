import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import {
  ShieldCheck, Users, Building2, Calendar, DollarSign, AlertTriangle,
  CheckCircle, XCircle, Trash2, Eye, RefreshCw, LogOut, Filter, MapPin, Search
} from 'lucide-react';
import SEO from '../components/SEO';

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
        api.getAdminStats().catch(() => null),
        api.getAdminProperties().catch(() => []),
        api.getAdminUsers().catch(() => []),
      ]);
      setStats(statsRes);
      setProperties(propsRes || []);
      setUsersList(usersRes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setErrorMsg(err.message || 'Failed to load admin control data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (propId, newStatus) => {
    try {
      await api.updateAdminPropertyStatus(propId, { status: newStatus });
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
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lacs`;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const filteredProperties = properties.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.property_type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      <SEO title="Admin Moderation Portal" description="LandLink AI Administrator Control & Moderation Panel." />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>Admin Control Panel</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Moderation, user accounts, and platform metrics overview</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadAdminData} className="btn-secondary" style={{ padding: '0.625rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handleLogout} style={{ padding: '0.625rem 1rem', fontSize: '0.8125rem', borderRadius: '0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', color: '#fb7185', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {noticeMsg && (
        <div style={{ padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          {noticeMsg}
        </div>
      )}

      {/* Admin Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <Building2 size={24} style={{ color: '#818cf8', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats?.total_properties || properties.length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Properties</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <Users size={24} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats?.total_users || usersList.length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Registered Users</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <CheckCircle size={24} style={{ color: '#fbbf24', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats?.approved_properties || properties.filter(p => p.status === 'approved').length}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Approved Listings</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-panel" style={{ borderRadius: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
          <button onClick={() => setActiveTab('properties')} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'properties' ? '#6366f1' : 'transparent', color: activeTab === 'properties' ? 'white' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.875rem' }}>
            Property Moderation ({properties.length})
          </button>
          <button onClick={() => setActiveTab('users')} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'users' ? '#6366f1' : 'transparent', color: activeTab === 'users' ? 'white' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.875rem' }}>
            User Management ({usersList.length})
          </button>
        </div>

        {activeTab === 'properties' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input"
                style={{ maxW: '300px', fontSize: '0.8125rem' }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem' }}>Property</th>
                    <th style={{ padding: '0.75rem' }}>Location</th>
                    <th style={{ padding: '0.75rem' }}>Price</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((p) => (
                    <tr key={p.id || p._id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{p.title}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.city}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{formatPrice(p.expected_price || p.price)}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.6875rem', fontWeight: 800, backgroundColor: p.status === 'approved' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: p.status === 'approved' ? '#34d399' : '#fbbf24' }}>
                          {p.status || 'Approved'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => navigate(`/properties/${p._id || p.id}`)} style={{ padding: '0.375rem', color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}><Eye size={16} /></button>
                          <button onClick={() => handleDeleteProperty(p._id || p.id)} style={{ padding: '0.375rem', color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>User Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id || u._id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{u.full_name || u.name || 'User'}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.6875rem', fontWeight: 800, backgroundColor: u.role === 'admin' ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.2)', color: u.role === 'admin' ? '#fbbf24' : '#818cf8' }}>
                        {u.role || 'User'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
