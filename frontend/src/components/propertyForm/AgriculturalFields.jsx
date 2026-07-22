import React from 'react';
import { AREA_UNITS, CROPPING_INTENSITY_OPTIONS, ACCESS_ROAD_TYPES, PLOT_FACING_OPTIONS, LAND_COST_FACTORS, SOIL_AND_INFRASTRUCTURE } from '../../utils/propertyConstants';

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

function Checklist({ items, selected, onToggle, label }) {
  return (
    <div>
      <L>{label}</L>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
        {items.map(item => {
          const sel = selected.includes(item);
          return (
            <div
              key={item}
              onClick={() => onToggle(item)}
              style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', cursor: 'pointer', userSelect: 'none', backgroundColor: sel ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', border: sel ? '1px solid #10b981' : '1px solid var(--card-border)', color: sel ? '#34d399' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.15s' }}
            >
              {sel ? '✓ ' : '+ '}{item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AgriculturalFields({ formState, updateField }) {
  const toggle = (field, item) => {
    const arr = formState[field] || [];
    updateField(field, arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Grid>
        <div>
          <L>Land Area *</L>
          <input type="number" required min="0" placeholder="e.g. 5" value={formState.areaSqft} onChange={e => updateField('areaSqft', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Area Unit</L>
          <select value={formState.areaUnit} onChange={e => updateField('areaUnit', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <L>Cropping Intensity</L>
          <select value={formState.croppingIntensity} onChange={e => updateField('croppingIntensity', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {CROPPING_INTENSITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <L>Water Pumps / Borewells</L>
          <input type="number" min="0" placeholder="Count" value={formState.waterPumpCount} onChange={e => updateField('waterPumpCount', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Crop Fallow Duration (Years)</L>
          <input type="number" min="0" placeholder="e.g. 1" value={formState.cropFallowDuration} onChange={e => updateField('cropFallowDuration', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <L>Solar Grid Integration</L>
          <select value={formState.solarGridIntegration ? 'Yes' : 'No'} onChange={e => updateField('solarGridIntegration', e.target.value === 'Yes')} className="glass-input" style={{ fontSize: '0.875rem' }}>
            <option value="No">No Solar Grid</option>
            <option value="Yes">Operational Solar Grid</option>
          </select>
        </div>
        <div>
          <L>Access Road Type</L>
          <select value={formState.accessRoadType} onChange={e => updateField('accessRoadType', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {ACCESS_ROAD_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <L>Plot Facing</L>
          <select value={formState.plotFacing} onChange={e => updateField('plotFacing', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
            {PLOT_FACING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <L>Corner Plot</L>
          <select value={formState.cornerPlotStatus ? 'Yes' : 'No'} onChange={e => updateField('cornerPlotStatus', e.target.value === 'Yes')} className="glass-input" style={{ fontSize: '0.875rem' }}>
            <option value="No">Not a Corner Plot</option>
            <option value="Yes">Corner Plot</option>
          </select>
        </div>
      </Grid>

      <Checklist label="Land Cost & Access Factors" items={LAND_COST_FACTORS} selected={formState.selectedLandFactors || []} onToggle={item => toggle('selectedLandFactors', item)} />
      <Checklist label="Soil & Infrastructure Checklist" items={SOIL_AND_INFRASTRUCTURE} selected={formState.selectedSoilAndInfra || []} onToggle={item => toggle('selectedSoilAndInfra', item)} />

      <div>
        <L>Property Description</L>
        <textarea rows={4} placeholder="Describe the land — soil quality, water availability, cultivation history..." value={formState.description} onChange={e => updateField('description', e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', resize: 'vertical' }} />
      </div>
    </div>
  );
}
