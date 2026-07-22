import React from 'react';
import { AREA_UNITS, ACCESS_ROAD_TYPES, PLOT_FACING_OPTIONS, LAND_COST_FACTORS } from '../../utils/propertyConstants';

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

export default function ResidentialPlotFields({ formState, updateField }) {
  const landFactors = formState.selectedLandFactors || [];

  const toggleFactor = (item) => {
    updateField('selectedLandFactors', landFactors.includes(item)
      ? landFactors.filter(x => x !== item)
      : [...landFactors, item]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Grid>
        <div>
          <L>Plot Area *</L>
          <input type="number" required min="0" placeholder="e.g. 2400" value={formState.areaSqft} onChange={e => updateField('areaSqft', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Area Unit</L>
          <select value={formState.areaUnit} onChange={e => updateField('areaUnit', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <L>Plot Facing</L>
          <select value={formState.plotFacing} onChange={e => updateField('plotFacing', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {PLOT_FACING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <L>Access Road Type</L>
          <select value={formState.accessRoadType} onChange={e => updateField('accessRoadType', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {ACCESS_ROAD_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <L>Corner Plot</L>
          <select value={formState.cornerPlotStatus ? 'Yes' : 'No'} onChange={e => updateField('cornerPlotStatus', e.target.value === 'Yes')} className="glass-input" style={{ fontSize: '0.875rem' }}>
            <option value="No">Not a Corner Plot</option>
            <option value="Yes">Corner Plot (Premium)</option>
          </select>
        </div>
      </Grid>

      <div>
        <L>Land Value Factors</L>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {LAND_COST_FACTORS.map(item => {
            const sel = landFactors.includes(item);
            return (
              <div
                key={item}
                onClick={() => toggleFactor(item)}
                style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', cursor: 'pointer', userSelect: 'none', backgroundColor: sel ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: sel ? '1px solid #6366f1' : '1px solid var(--card-border)', color: sel ? '#818cf8' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700 }}
              >
                {sel ? '✓ ' : '+ '}{item}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <L>Property Description</L>
        <textarea rows={4} placeholder="Describe the plot — dimensions, legal status, neighbourhood, development potential..." value={formState.description} onChange={e => updateField('description', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', resize: 'vertical' }} />
      </div>
    </div>
  );
}
