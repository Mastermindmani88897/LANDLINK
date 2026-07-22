import React from 'react';
import { HOUSE_TYPES, AREA_UNITS, FURNISHED_STATUS_OPTIONS } from '../../utils/propertyConstants';

const L = ({ children }) => (
  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>
    {children}
  </label>
);
const Grid = ({ children, cols = 'repeat(auto-fit, minmax(180px, 1fr))' }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '1.25rem' }}>
    {children}
  </div>
);

export default function HouseFields({ formState, updateField }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <Grid>
        {/* House Sub-Type */}
        <div>
          <L>House Sub-Type</L>
          <select value={formState.houseType} onChange={e => updateField('houseType', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {HOUSE_TYPES.map(ht => <option key={ht} value={ht}>{ht}</option>)}
          </select>
        </div>

        {/* Area */}
        <div>
          <L>Built-up Area *</L>
          <input type="number" required min="0" placeholder="e.g. 1400" value={formState.areaSqft} onChange={e => updateField('areaSqft', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>

        <div>
          <L>Area Unit</L>
          <select value={formState.areaUnit} onChange={e => updateField('areaUnit', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>

        {/* Core Specs */}
        <div>
          <L>Bedrooms</L>
          <input type="number" min="0" max="20" value={formState.bedrooms} onChange={e => updateField('bedrooms', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>

        <div>
          <L>Bathrooms</L>
          <input type="number" min="0" max="20" value={formState.bathrooms} onChange={e => updateField('bathrooms', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>

        <div>
          <L>Floors / Storeys</L>
          <input type="number" min="1" max="10" value={formState.floors} onChange={e => updateField('floors', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>

        <div>
          <L>Property Age (Years)</L>
          <input type="number" min="0" max="100" placeholder="0 = New" value={formState.houseAge} onChange={e => updateField('houseAge', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>

        <div>
          <L>Parking Slots</L>
          <input type="number" min="0" max="10" value={formState.parking} onChange={e => updateField('parking', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>

        <div>
          <L>Furnished Status</L>
          <select value={formState.furnishedStatus} onChange={e => updateField('furnishedStatus', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {FURNISHED_STATUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </Grid>

      {/* Description */}
      <div>
        <L>Property Description</L>
        <textarea
          rows={4}
          placeholder="Describe the property — layout, amenities, neighbourhood, unique features..."
          value={formState.description}
          onChange={e => updateField('description', e.target.value)}
          className="glass-input"
          style={{ fontSize: '0.875rem', resize: 'vertical' }}
        />
      </div>
    </div>
  );
}
