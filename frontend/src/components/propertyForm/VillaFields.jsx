import React from 'react';
import { AREA_UNITS, FURNISHED_STATUS_OPTIONS, VILLA_AMENITIES_OPTIONS } from '../../utils/propertyConstants';

const L = ({ children }) => (
  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>
    {children}
  </label>
);
const Grid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
    {children}
  </div>
);

export default function VillaFields({ formState, updateField }) {
  const amenities = formState.villaAmenities || [];

  const toggleAmenity = (item) => {
    const next = amenities.includes(item)
      ? amenities.filter(a => a !== item)
      : [...amenities, item];
    updateField('villaAmenities', next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Grid>
        <div>
          <L>Built-up Area *</L>
          <input type="number" required min="0" placeholder="e.g. 4500" value={formState.areaSqft} onChange={e => updateField('areaSqft', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Area Unit</L>
          <select value={formState.areaUnit} onChange={e => updateField('areaUnit', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <L>Villa Plot Area (sq ft)</L>
          <input type="number" min="0" placeholder="e.g. 6000" value={formState.villaPlotArea} onChange={e => updateField('villaPlotArea', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Bedrooms</L>
          <input type="number" min="0" max="20" value={formState.bedrooms} onChange={e => updateField('bedrooms', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Bathrooms</L>
          <input type="number" min="0" max="20" value={formState.bathrooms} onChange={e => updateField('bathrooms', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Floors</L>
          <input type="number" min="1" max="10" value={formState.floors} onChange={e => updateField('floors', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Parking Slots</L>
          <input type="number" min="0" max="20" value={formState.parking} onChange={e => updateField('parking', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Furnished Status</L>
          <select value={formState.furnishedStatus} onChange={e => updateField('furnishedStatus', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {FURNISHED_STATUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </Grid>

      {/* Villa Amenities */}
      <div>
        <L>Villa Exclusive Amenities</L>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.625rem', marginTop: '0.25rem' }}>
          {VILLA_AMENITIES_OPTIONS.map(item => {
            const sel = amenities.includes(item);
            return (
              <div
                key={item}
                onClick={() => toggleAmenity(item)}
                style={{ padding: '0.625rem 0.875rem', borderRadius: '0.75rem', cursor: 'pointer', userSelect: 'none', backgroundColor: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', border: sel ? '1px solid #6366f1' : '1px solid var(--card-border)', color: sel ? '#818cf8' : 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 700, transition: 'all 0.15s' }}
              >
                {sel ? '✓ ' : '+ '}{item}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <L>Property Description</L>
        <textarea rows={4} placeholder="Describe this exclusive villa — views, amenities, privacy features..." value={formState.description} onChange={e => updateField('description', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', resize: 'vertical' }} />
      </div>
    </div>
  );
}
