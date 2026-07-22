import React from 'react';
import { PROPERTY_TYPES } from '../../utils/propertyConstants';

const fieldStyle = {
  fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)',
  display: 'block', marginBottom: '0.375rem',
};
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' };

export default function PropertyBasicInfo({ formState, updateField }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <label style={fieldStyle}>Property Title *</label>
        <input
          type="text"
          required
          placeholder="e.g. Spacious 3BHK House with Garden in Bandra"
          value={formState.title}
          onChange={e => updateField('title', e.target.value)}
          className="glass-input"
          style={{ fontSize: '0.9375rem' }}
        />
      </div>

      <div style={gridStyle}>
        {/* Property Type */}
        <div>
          <label style={fieldStyle}>Property Category *</label>
          <select
            value={formState.propertyType}
            onChange={e => updateField('propertyType', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          >
            {PROPERTY_TYPES.map(pt => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
        </div>

        {/* Expected Price */}
        <div>
          <label style={fieldStyle}>Expected Price (INR) *</label>
          <input
            type="number"
            required
            min="0"
            placeholder="e.g. 7500000"
            value={formState.expectedPrice}
            onChange={e => updateField('expectedPrice', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* Price Range (optional) */}
        <div>
          <label style={fieldStyle}>Min Price (optional)</label>
          <input
            type="number"
            min="0"
            placeholder="Minimum asking price"
            value={formState.minExpectedPrice}
            onChange={e => updateField('minExpectedPrice', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={fieldStyle}>Max Price (optional)</label>
          <input
            type="number"
            min="0"
            placeholder="Maximum asking price"
            value={formState.maxExpectedPrice}
            onChange={e => updateField('maxExpectedPrice', e.target.value)}
            className="glass-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
      </div>
    </div>
  );
}
