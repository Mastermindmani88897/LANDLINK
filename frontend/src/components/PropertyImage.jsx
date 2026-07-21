import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function PropertyImage({ src, alt, className = '', style = {}, iconSize = 24, fontSize = '0.75rem' }) {
  const imageUrl = typeof src === 'string' ? src : (src?.image_url || src?.url);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt || 'Property'}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        color: '#94a3b8',
        padding: '0.75rem',
        textAlign: 'center',
        ...style,
      }}
    >
      <ImageIcon size={iconSize} style={{ color: '#64748b', marginBottom: '0.375rem' }} />
      <span style={{ fontSize, fontWeight: 700, color: '#cbd5e1', letterSpacing: '-0.01em' }}>No Images Available.</span>
    </div>
  );
}
