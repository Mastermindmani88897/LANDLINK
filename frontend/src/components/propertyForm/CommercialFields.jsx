import React from 'react';
import { AREA_UNITS, ACCESS_ROAD_TYPES, PLOT_FACING_OPTIONS, COMMERCIAL_PLOT_OPTIONS } from '../../utils/propertyConstants';

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

export default function CommercialFields({ formState, updateField, isBuilding = false }) {
  const features = formState.commercialPlotFeatures || [];

  const toggleFeature = (item) => {
    updateField('commercialPlotFeatures', features.includes(item)
      ? features.filter(x => x !== item)
      : [...features, item]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Grid>
        <div>
          <L>{isBuilding ? 'Built-up Area *' : 'Plot Area *'}</L>
          <input type="number" required min="0" placeholder="e.g. 5000" value={formState.areaSqft} onChange={e => updateField('areaSqft', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Area Unit</L>
          <select value={formState.areaUnit} onChange={e => updateField('areaUnit', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>

        {/* Plot specific */}
        {!isBuilding && (
          <>
            <div>
              <L>Plot Facing</L>
              <select value={formState.plotFacing} onChange={e => updateField('plotFacing', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                {PLOT_FACING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <L>Access Road</L>
              <select value={formState.accessRoadType} onChange={e => updateField('accessRoadType', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                {ACCESS_ROAD_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <L>Corner Plot</L>
              <select value={formState.cornerPlotStatus ? 'Yes' : 'No'} onChange={e => updateField('cornerPlotStatus', e.target.value === 'Yes')} className="glass-input" style={{ fontSize: '0.875rem' }}>
                <option value="No">Not Corner</option>
                <option value="Yes">Corner Plot (Premium)</option>
              </select>
            </div>
          </>
        )}

        {/* Building specific */}
        {isBuilding && (
          <>
            <div>
              <L>Floors / Levels</L>
              <input type="number" min="1" value={formState.floors} onChange={e => updateField('floors', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <L>Parking Slots</L>
              <input type="number" min="0" value={formState.parking} onChange={e => updateField('parking', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
            </div>
          </>
        )}
      </Grid>

      <div>
        <L>Commercial Infrastructure Features</L>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
          {COMMERCIAL_PLOT_OPTIONS.map(item => {
            const sel = features.includes(item);
            return (
              <div
                key={item}
                onClick={() => toggleFeature(item)}
                style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', cursor: 'pointer', userSelect: 'none', backgroundColor: sel ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)', border: sel ? '1px solid #ef4444' : '1px solid var(--card-border)', color: sel ? '#fb7185' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700 }}
              >
                {sel ? '✓ ' : '+ '}{item}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <L>Property Description</L>
        <textarea rows={4} placeholder={isBuilding ? 'Describe the building — floors, usage type, current tenants, connectivity...' : 'Describe the commercial plot — zoning, visibility, road frontage, development approvals...'} value={formState.description} onChange={e => updateField('description', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', resize: 'vertical' }} />
      </div>
    </div>
  );
}
