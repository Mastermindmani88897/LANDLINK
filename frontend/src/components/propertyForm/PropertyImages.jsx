import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function PropertyImages({ formState, updateField, isEditMode = false }) {
  const imageUrls = formState.imageUrls || [];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateField('imageUrls', [...imageUrls, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleRemove = (index) => {
    updateField('imageUrls', imageUrls.filter((_, i) => i !== index));
  };

  const [urlInput, setUrlInput] = React.useState('');
  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    updateField('imageUrls', [...imageUrls, trimmed]);
    setUrlInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Edit mode info banner */}
      {isEditMode && imageUrls.length > 0 && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.8125rem', color: '#34d399', fontWeight: 700 }}>
          ✓ {imageUrls.length} existing image{imageUrls.length !== 1 ? 's' : ''} loaded. Keep, remove, or add more below.
        </div>
      )}

      {/* Upload Zone */}
      <div style={{ border: '2px dashed rgba(99,102,241,0.4)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(99,102,241,0.03)', transition: 'border-color 0.2s' }}>
        <Upload size={32} style={{ color: '#818cf8', margin: '0 auto 0.75rem' }} />
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Drag & Drop Property Photos Here
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          PNG, JPG, WEBP — Recommended: min. 1200×800px
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="property-photo-upload"
        />
        <label
          htmlFor="property-photo-upload"
          className="btn-primary"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', cursor: 'pointer', display: 'inline-block' }}
        >
          {imageUrls.length > 0 ? 'Upload More Photos' : 'Select Files from Device'}
        </label>
      </div>

      {/* URL Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="url"
          placeholder="Or paste an image URL (https://...)"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
          className="glass-input"
          style={{ fontSize: '0.8125rem' }}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', flexShrink: 0 }}
        >
          Add URL
        </button>
      </div>

      {/* Image Grid */}
      {imageUrls.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
          {imageUrls.map((img, i) => (
            <div
              key={`${i}-${img.substring(0, 30)}`}
              style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.875rem', overflow: 'hidden', border: '2px solid var(--card-border)', backgroundColor: 'rgba(15,23,42,0.5)' }}
            >
              <img
                src={img}
                alt={`Property image ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
              />
              {/* Error fallback */}
              <div style={{ display: 'none', width: '100%', height: '100%', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.25rem', color: '#64748b', fontSize: '0.625rem', fontWeight: 700, backgroundColor: 'rgba(15,23,42,0.8)' }}>
                <ImageIcon size={18} />
                <span>Error</span>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                title="Remove image"
                style={{ position: 'absolute', top: '0.3rem', right: '0.3rem', width: '22px', height: '22px', backgroundColor: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
              >
                <X size={12} />
              </button>

              {/* Index badge */}
              <div style={{ position: 'absolute', bottom: '0.25rem', left: '0.25rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.5625rem', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '0.25rem', lineHeight: 1.2 }}>
                {i === 0 ? 'Cover' : i + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed var(--card-border)' }}>
          <ImageIcon size={32} style={{ color: '#475569' }} />
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>
            No images yet. Upload photos to attract more buyers.
          </p>
        </div>
      )}
    </div>
  );
}
