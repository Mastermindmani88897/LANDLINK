import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import {
  User, Mail, Phone, MapPin, Calendar, Building2, Heart, Edit, Lock, LogOut,
  CheckCircle, ShieldCheck, Camera, Sparkles, X, Activity, ArrowRight, Eye, Trash2
} from 'lucide-react';
import PropertyImage from '../components/PropertyImage.jsx';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, clearAuth, openAuthModal } = useAppStore();

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

  // Change Password Modal
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setIsSavingPassword(true);
    setErrorMsg('');
    try {
      await api.updateMe({ password: newPassword });
      setIsChangePasswordOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Password changed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`;
    return price.toLocaleString('en-IN');
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="glass-panel" style={{ maxWidth: '30rem', margin: '0 auto', padding: '2.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <User size={48} style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Please Sign In</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Sign in to view and edit your profile details and property listings.
          </p>
          <button onClick={openAuthModal} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.75rem 1.75rem', fontSize: '0.875rem', borderRadius: '0.75rem' }}>
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  const currentUser = profileData || user || {};
  const profileImg = currentUser.profile_image_url || currentUser.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
  const joinedDate = formatDate(currentUser.created_at);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      
      {/* Toast Notifications */}
      {successMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Header Profile Card */}
      <div className="glass-panel" style={{ borderRadius: '1.5rem', padding: '2rem', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', height: '6rem', width: '6rem', borderRadius: '9999px', overflow: 'hidden', border: '3px solid #6366f1', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
              <img src={profileImg} alt={currentUser.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.025em' }}>
                  {currentUser.full_name || currentUser.name || 'User Profile'}
                </h1>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', backgroundColor: 'rgba(52,211,153,0.1)', padding: '0.2rem 0.6rem', borderRadius: '9999px', border: '1px solid rgba(52,211,153,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={13} /> Verified
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.625rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Mail size={14} style={{ color: '#818cf8' }} /> {currentUser.email} (Read-only)
                </span>
                {currentUser.phone_number && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Phone size={14} style={{ color: '#818cf8' }} /> {currentUser.phone_number}
                  </span>
                )}
                {(currentUser.city || currentUser.state) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <MapPin size={14} style={{ color: '#818cf8' }} /> {currentUser.city}{currentUser.city && currentUser.state ? ', ' : ''}{currentUser.state}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8' }}>
                  <Calendar size={14} style={{ color: '#a5b4fc' }} /> Date Joined: {joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button onClick={openEditModal} className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.625rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', borderRadius: '0.75rem' }}>
              <Edit size={14} /> Edit Profile
            </button>
            <button onClick={() => setIsChangePasswordOpen(true)} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.625rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', borderRadius: '0.75rem', borderColor: '#818cf8', color: '#818cf8' }}>
              <Lock size={14} /> Change Password
            </button>
            <button onClick={handleLogout} style={{ fontSize: '0.8125rem', padding: '0.625rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Properties Listed</span>
            <Building2 size={18} style={{ color: '#818cf8' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem', color: '#f8fafc' }}>
            {currentUser.listed_properties_count || myProperties.length}
          </div>
          <Link to="/my-listings" style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', textDecoration: 'none' }}>
            View My Listings <ArrowRight size={12} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Favorite Properties</span>
            <Heart size={18} style={{ color: '#fb7185' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem', color: '#f8fafc' }}>
            {currentUser.favorites_count || favorites.length}
          </div>
          <Link to="/favorites" style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', textDecoration: 'none' }}>
            View Wishlist <ArrowRight size={12} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Account Status</span>
            <Activity size={18} style={{ color: '#34d399' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.75rem', color: '#34d399' }}>
            Active & Verified
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
            Member since {joinedDate}
          </span>
        </div>
      </div>

      {/* Embedded My Listings Section */}
      <div className="glass-panel" style={{ borderRadius: '1.5rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} style={{ color: '#818cf8' }} /> My Listings
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>All properties created by you</p>
          </div>
          <Link to="/sell" className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none', borderRadius: '0.625rem' }}>
            + Create New Listing
          </Link>
        </div>

        {myProperties.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            No properties posted yet. Click "+ Create New Listing" to add your property.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {myProperties.slice(0, 4).map((p) => {
              const pId = p.id || p._id;
              return (
                <div key={pId} style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                  <div style={{ height: '4rem', width: '4rem', borderRadius: '0.75rem', overflow: 'hidden', flexShrink: 0 }}>
                    <PropertyImage src={p.images?.[0]} alt={p.title} iconSize={16} fontSize="9px" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, marginTop: '0.125rem' }}>INR {formatPrice(p.expected_price)}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '0.25rem' }}>{p.city} • Views: {p.views || 0}</div>
                  </div>
                  <Link to={`/properties/${pId}`} style={{ color: '#cbd5e1', padding: '0.375rem' }}>
                    <Eye size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '30rem', backgroundColor: '#0c0728', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <button onClick={() => setIsEditProfileOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={18} style={{ color: '#818cf8' }} /> Edit Profile
            </h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Email Address (Read-only)</label>
                <input type="email" readOnly value={currentUser.email || ''} className="glass-input" style={{ fontSize: '0.875rem', opacity: 0.6, cursor: 'not-allowed' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Full Name</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Phone Number</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} placeholder="+91 9876543210" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>City</label>
                  <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} placeholder="e.g. Mumbai" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>State</label>
                  <input type="text" value={editState} onChange={(e) => setEditState(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} placeholder="e.g. Maharashtra" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Profile Picture Link</label>
                <input type="url" value={editImage} onChange={(e) => setEditImage(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} placeholder="https://..." />
              </div>

              <button type="submit" disabled={isSavingProfile} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 800, marginTop: '0.5rem' }}>
                {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '26rem', backgroundColor: '#0c0728', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <button onClick={() => setIsChangePasswordOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} style={{ color: '#818cf8' }} /> Change Password
            </h3>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>New Password</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} placeholder="Enter new password" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Confirm New Password</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} placeholder="Re-enter new password" />
              </div>

              <button type="submit" disabled={isSavingPassword} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 800, marginTop: '0.5rem' }}>
                {isSavingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
