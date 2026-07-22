import React from 'react';
import { MapPin } from 'lucide-react';

const fieldStyle = { fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' };

export default function PropertyLocation({ formState, updateField }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontSize: '0.8125rem', fontWeight: 700 }}>
        <MapPin size={16} /> Location Details
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div>
          <label style={fieldStyle}>City *</label>
          <input
            type="text"
            required
            placeholder="e.g. Mumbai"
            value={formState.city}
            onChange={e => updateField('city', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={fieldStyle}>State</label>
          <input
            type="text"
            placeholder="e.g. Maharashtra"
            value={formState.state}
            onChange={e => updateField('state', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
      </div>

      <div>
        <label style={fieldStyle}>Street Address / Landmark</label>
        <input
          type="text"
          placeholder="e.g. 42 Hill Road, Bandra West"
          value={formState.address}
          onChange={e => updateField('address', e.target.value)}
          className="glass-input"
          style={{ fontSize: '0.875rem' }}
        />
      </div>
    </div>
  );
}
