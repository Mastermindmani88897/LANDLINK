import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import {
  User, Mail, Phone, MapPin, Calendar, Building2, Heart, Edit, Lock, LogOut,
  CheckCircle, ShieldCheck, Camera, Sparkles, X, Activity, ArrowRight, Eye, Trash2
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard.jsx';
import SEO from '../components/SEO.jsx';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, clearAuth, openAuthModal } = useAppStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [myProperties, setMyProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const [userRes, listingsRes, favsRes] = await Promise.all([
        api.getMe().catch(() => user),
        api.getMyListings().catch(() => []),
        api.getFavorites().catch(() => []),
      ]);
      setProfileData(userRes || user);
      setMyProperties(listingsRes || []);
      setFavorites(favsRes || []);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const openEditModal = () => {
    const cur = profileData || user;
    setEditName(cur?.full_name || cur?.name || '');
    setEditPhone(cur?.phone_number || cur?.phone || '');
    setEditCity(cur?.city || '');
    setEditState(cur?.state || '');
    setEditImage(cur?.profile_image_url || cur?.profileImage || '');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setErrorMsg('');
    try {
      const updated = await api.updateMe({
        full_name: editName,
        phone_number: editPhone,
        city: editCity,
        state: editState,
        profile_image_url: editImage,
      });
      updateUser(updated);
      setProfileData(updated);
      setIsEditProfileOpen(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <User size={48} style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sign In Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please sign in to view your profile dashboard and listings.</p>
        <button onClick={openAuthModal} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem' }}>
          Sign In Now
        </button>
      </div>
    );
  }

  const curUser = profileData || user;

  return (
    <div style={{ width: '100%', paddingBottom: '6rem' }}>
      <SEO title="User Profile Dashboard" description="Manage your listings, favorites, saved properties, and profile settings." />

      {/* Banner */}
      <div style={{ position: 'relative', width: '100%', height: '180px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ position: 'relative', height: '100%' }}>
          <div style={{ position: 'absolute', bottom: '-40px', left: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '1.25rem' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #030014', overflow: 'hidden', backgroundColor: '#0d0925' }}>
              <img
                src={curUser?.profile_image_url || curUser?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&fit=crop'}
                alt="Profile Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {curUser?.full_name || curUser?.name || 'LandLink User'}
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>{curUser?.email}</span>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '1rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button onClick={openEditModal} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              <Edit size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Tabs Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ marginTop: '4rem' }}>
        
        {/* Navigation Bar Tabs */}
        <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', overflowX: 'auto' }}>
            {[
              { id: 'overview', label: 'Overview & Stats' },
              { id: 'listings', label: `My Listings (${myProperties.length})` },
              { id: 'favorites', label: `Favorites (${favorites.length})` },
              { id: 'activity', label: 'Activity Log' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: activeTab === t.id ? '#818cf8' : 'var(--text-secondary)',
                  borderBottom: activeTab === t.id ? '3px solid #6366f1' : '3px solid transparent',
                  background: 'none', borderLeft: 'none', borderRight: 'none', borderTop: 'none',
                  cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Overview & Stats */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <Building2 size={24} style={{ color: '#818cf8', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{myProperties.length}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Listings</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <Heart size={24} style={{ color: '#ef4444', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{favorites.length}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saved Favorites</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <Eye size={24} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>1,420</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Listing Views</div>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>User Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Full Name</span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{curUser?.full_name || curUser?.name || 'Not provided'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Email Address</span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{curUser?.email || 'Not provided'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Phone Number</span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{curUser?.phone_number || curUser?.phone || 'Not provided'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Location</span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{curUser?.city ? `${curUser.city}, ${curUser.state || ''}` : 'Location on request'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Listings */}
        {activeTab === 'listings' && (
          <div>
            {myProperties.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1.25rem' }}>
                <Building2 size={36} style={{ color: '#818cf8', margin: '0 auto 0.75rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>You haven't posted any property listings yet.</p>
                <Link to="/sell" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block', padding: '0.5rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                  Post Property Free
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {myProperties.map((prop) => (
                  <PropertyCard key={prop._id || prop.id} property={prop} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Favorites */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1.25rem' }}>
                <Heart size={36} style={{ color: '#ef4444', margin: '0 auto 0.75rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No saved favorite properties yet.</p>
                <Link to="/properties" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block', padding: '0.5rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {favorites.map((prop) => (
                  <PropertyCard key={prop._id || prop.id} property={prop} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Activity Log */}
        {activeTab === 'activity' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Platform Activity</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} style={{ color: '#34d399' }} /> Profile authenticated successfully</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={16} style={{ color: '#818cf8' }} /> Gemini Neural AI price predictor accessed</li>
            </ul>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: '26rem', background: '#0c0728', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Edit Profile Information</h3>
              <button onClick={() => setIsEditProfileOpen(false)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>Phone Number</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>City</label>
                <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.25rem' }}>Profile Image URL</label>
                <input type="url" value={editImage} onChange={(e) => setEditImage(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>

              <button type="submit" disabled={isSavingProfile} className="btn-primary" style={{ padding: '0.75rem', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
