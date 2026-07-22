import React, { useState } from 'react';
import { Sparkles, Brain, DollarSign, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function AISection({ formState, updateField }) {
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [aiPriceResult, setAiPriceResult] = useState(null);
  const [isPredictingPrice, setIsPredictingPrice] = useState(false);

  const handleGenerateDescription = async () => {
    setIsGeneratingDesc(true);
    try {
      const res = await api.aiGenerateDescription({
        property_type: formState.propertyType,
        bedrooms: formState.bedrooms,
        bathrooms: formState.bathrooms,
        area_sqft: formState.areaSqft,
        city: formState.city,
        address: formState.address,
        furnished_status: formState.furnishedStatus,
        house_type: formState.houseType,
      });

      if (res && res.description) {
        updateField('description', res.description);
      }
    } catch (err) {
      console.error('AI Description Generation error:', err);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handlePredictPrice = async () => {
    setIsPredictingPrice(true);
    try {
      const res = await api.aiPredictPrice({
        property_type: formState.propertyType,
        area_sqft: parseFloat(formState.areaSqft || 1000),
        bedrooms: parseInt(formState.bedrooms || 2),
        bathrooms: parseInt(formState.bathrooms || 2),
        city: formState.city || 'Mumbai',
      });
      setAiPriceResult(res);
      if (res && res.estimated_price) {
        updateField('expectedPrice', String(res.estimated_price));
      }
    } catch (err) {
      console.error('AI Price Prediction error:', err);
    } finally {
      setIsPredictingPrice(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* AI Description Generator */}
      <div style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
              <Sparkles size={16} style={{ color: '#818cf8' }} /> AI Smart Listing Description Generator
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>
              Automatically generate a high-converting property description based on your selected specifications.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGeneratingDesc}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', borderColor: '#818cf8', color: '#818cf8', flexShrink: 0 }}
          >
            {isGeneratingDesc ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isGeneratingDesc ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>

      {/* AI Price Valuation Benchmark */}
      <div style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
              <Brain size={16} style={{ color: '#34d399' }} /> AI Neural Market Price Benchmark
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>
              Estimate fair market value using local market trends and property parameters.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePredictPrice}
            disabled={isPredictingPrice}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', borderColor: '#34d399', color: '#34d399', flexShrink: 0 }}
          >
            {isPredictingPrice ? <RefreshCw size={14} className="animate-spin" /> : <DollarSign size={14} />}
            {isPredictingPrice ? 'Valuating...' : 'Valuate Price'}
          </button>
        </div>

        {aiPriceResult && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid var(--card-border)', fontSize: '0.8125rem', color: '#34d399', fontWeight: 700 }}>
            Estimated Fair Market Value: ₹ {Number(aiPriceResult.estimated_price || 0).toLocaleString('en-IN')} (Confidence: {((aiPriceResult.confidence || 0.92) * 100).toFixed(0)}%)
          </div>
        )}
      </div>
    </div>
  );
}
