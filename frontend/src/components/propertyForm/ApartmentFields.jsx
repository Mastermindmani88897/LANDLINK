import React from 'react';
import { AREA_UNITS, FURNISHED_STATUS_OPTIONS } from '../../utils/propertyConstants';

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

export default function ApartmentFields({ formState, updateField }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Grid>
        <div>
          <L>Carpet Area *</L>
          <input type="number" required min="0" placeholder="e.g. 950" value={formState.areaSqft} onChange={e => updateField('areaSqft', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Area Unit</L>
          <select value={formState.areaUnit} onChange={e => updateField('areaUnit', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <L>Bedrooms</L>
          <input type="number" min="0" max="10" value={formState.bedrooms} onChange={e => updateField('bedrooms', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Bathrooms</L>
          <input type="number" min="0" max="10" value={formState.bathrooms} onChange={e => updateField('bathrooms', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Floor Number (Unit)</L>
          <input type="number" min="1" placeholder="Which floor is this unit on?" value={formState.flatFloorNumber} onChange={e => updateField('flatFloorNumber', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Total Floors in Building</L>
          <input type="number" min="1" placeholder="Total floors in the tower" value={formState.apartmentTotalFloors} onChange={e => updateField('apartmentTotalFloors', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Parking Slots</L>
          <input type="number" min="0" max="5" value={formState.parking} onChange={e => updateField('parking', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Furnished Status</L>
          <select value={formState.furnishedStatus} onChange={e => updateField('furnishedStatus', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {FURNISHED_STATUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </Grid>

      <div>
        <L>Property Description</L>
        <textarea rows={4} placeholder="Describe the apartment — layout, society amenities, connectivity..." value={formState.description} onChange={e => updateField('description', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', resize: 'vertical' }} />
      </div>
    </div>
  );
}
