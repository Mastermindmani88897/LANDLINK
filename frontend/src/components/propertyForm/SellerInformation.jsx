import React from 'react';
import { User, Phone, Mail, FileText } from 'lucide-react';

const fieldStyle = {
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  display: 'block',
  marginBottom: '0.375rem',
};

export default function SellerInformation({ formState, updateField }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {/* Seller Name */}
        <div>
          <label style={fieldStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <User size={14} style={{ color: '#818cf8' }} /> Full Name *
            </span>
          </label>
          <input
            type="text"
            required
            placeholder="Property Owner / Contact Name"
            value={formState.sellerName}
            onChange={(e) => updateField('sellerName', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* Contact Number */}
        <div>
          <label style={fieldStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <Phone size={14} style={{ color: '#818cf8' }} /> Contact Phone Number *
            </span>
          </label>
          <input
            type="tel"
            required
            placeholder="+91 9876543210"
            value={formState.sellerPhone}
            onChange={(e) => updateField('sellerPhone', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* Email */}
        <div>
          <label style={fieldStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={14} style={{ color: '#818cf8' }} /> Contact Email
            </span>
          </label>
          <input
            type="email"
            placeholder="seller@example.com"
            value={formState.sellerEmail}
            onChange={(e) => updateField('sellerEmail', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Reason for Selling */}
      <div>
        <label style={fieldStyle}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <FileText size={14} style={{ color: '#818cf8' }} /> Reason for Selling (Optional)
          </span>
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Relocating to another city, upgrading to larger home..."
          value={formState.reasonForSelling}
          onChange={(e) => updateField('reasonForSelling', e.target.value)}
          className="glass-input"
          style={{ fontSize: '0.875rem', resize: 'vertical' }}
        />
      </div>
    </div>
  );
}
