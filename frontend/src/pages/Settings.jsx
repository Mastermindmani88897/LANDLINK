import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/store';
import { api } from '../services/api';
import { translations } from '../utils/translations';
import { User, Phone, Mail, MapPin, MessageSquare, Check, Sparkles, Shield } from 'lucide-react';

export default function Settings() {
  const { user, language, updateUser } = useAppStore();
  const t = translations[language] || translations.en;

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsapp_number || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.profile_address || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      setWhatsappNumber(user.whatsapp_number || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await api.updateMe({
        full_name: fullName,
        phone_number: phoneNumber,
        whatsapp_number: whatsappNumber || phoneNumber,
        email,
        profile_image_url: profileImage,
      });
      updateUser(updated);
      setSuccessMsg('Personal details saved successfully! Buyers and sellers can now view your updated information.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Please Sign In</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>Sign in to manage your account and contact settings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <Sparkles size={14} /> Account Management
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '0.375rem', letterSpacing: '-0.025em' }}>{t.settingsTitle}</h1>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>{t.settingsDesc}</p>
      </div>

      {successMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel" style={{ borderRadius: '1.25rem', padding: '2rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ height: '4.5rem', width: '4.5rem', borderRadius: '9999px', overflow: 'hidden', border: '3px solid #6366f1', flexShrink: 0 }}>
            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc' }}>{fullName || 'User'}</div>
            <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <Shield size={12} /> Verified Account Profile
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>{t.fullName}</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>{t.email}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>{t.mobile}</label>
            <input type="tel" placeholder="+91 9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>{t.whatsapp}</label>
            <input type="tel" placeholder="+91 9876543210" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>{t.address}</label>
          <input type="text" placeholder="e.g. Bandra West, Mumbai, MH" value={address} onChange={(e) => setAddress(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.375rem' }}>Profile Picture Link</label>
          <input type="url" placeholder="https://..." value={profileImage} onChange={(e) => setProfileImage(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>

        <button type="submit" disabled={isSaving} className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 800, marginTop: '0.5rem' }}>
          {isSaving ? 'Saving Details...' : t.saveSettings}
        </button>
      </form>
    </div>
  );
}
