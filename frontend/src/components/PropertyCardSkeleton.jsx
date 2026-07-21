import React from 'react';

export default function PropertyCardSkeleton() {
  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: '1.25rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
      }}
    >
      {/* Image Skeleton */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16/10',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          animation: 'pulseGlow 1.5s infinite ease-in-out',
        }}
      />

      {/* Body Skeleton */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ width: '70%', height: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '0.375rem', animation: 'pulseGlow 1.5s infinite ease-in-out' }} />
        <div style={{ width: '40%', height: '0.875rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.375rem', animation: 'pulseGlow 1.5s infinite ease-in-out' }} />
        
        <div style={{ width: '100%', height: '2.5rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.75rem', marginTop: '0.5rem', animation: 'pulseGlow 1.5s infinite ease-in-out' }} />
      </div>
    </div>
  );
}
