import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import SEO from '../components/SEO';
import {
  DEFAULT_FORM_STATE,
  getTypeConfig,
  buildPropertyPayload,
  propertyToFormState,
  resolvePropertyType,
} from '../utils/propertyFieldConfig';

// Form Sub-Components
import PropertyBasicInfo from '../components/propertyForm/PropertyBasicInfo';
import PropertyLocation from '../components/propertyForm/PropertyLocation';
import PropertyImages from '../components/propertyForm/PropertyImages';
import SellerInformation from '../components/propertyForm/SellerInformation';
import PropertyPreview from '../components/propertyForm/PropertyPreview';
import AISection from '../components/propertyForm/AISection';
import HouseFields from '../components/propertyForm/HouseFields';
import VillaFields from '../components/propertyForm/VillaFields';
import ApartmentFields from '../components/propertyForm/ApartmentFields';
import AgriculturalFields from '../components/propertyForm/AgriculturalFields';
import ResidentialPlotFields from '../components/propertyForm/ResidentialPlotFields';
import CommercialFields from '../components/propertyForm/CommercialFields';

import {
  Sparkles, Eye, CheckCircle2, ArrowRight, ArrowLeft, Building2, AlertCircle
} from 'lucide-react';

const WIZARD_STEPS = [
  { step: 1, title: 'Category & Price', desc: 'Select property type and price' },
  { step: 2, title: 'Location', desc: 'City, state and address' },
  { step: 3, title: 'Property Specs', desc: 'Category-specific details' },
  { step: 4, title: 'Photos', desc: 'Upload property images' },
  { step: 5, title: 'AI Copywriter', desc: 'Generate description & valuation' },
  { step: 6, title: 'Seller & Preview', desc: 'Contact details & review' },
];

export default function Sell() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = paramId || queryParams.get('edit');
  const isEditMode = Boolean(editId);

  const { user } = useAppStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editPropertyTitle, setEditPropertyTitle] = useState('');

  // Main Unified Form State
  const [formState, setFormState] = useState(() => ({
    ...DEFAULT_FORM_STATE,
    sellerName: user?.full_name || '',
    sellerPhone: user?.phone_number || '',
    sellerEmail: user?.email || '',
  }));

  const updateField = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Update seller default info when user logs in
  useEffect(() => {
    if (user && !isEditMode) {
      setFormState((prev) => ({
        ...prev,
        sellerName: prev.sellerName || user.full_name || '',
        sellerPhone: prev.sellerPhone || user.phone_number || '',
        sellerEmail: prev.sellerEmail || user.email || '',
      }));
    }
  }, [user, isEditMode]);

  // Load existing property data for editing
  useEffect(() => {
    if (!editId) return;
    async function loadEditProperty() {
      try {
        const prop = await api.getProperty(editId);
        if (prop) {
          if (prop.title) setEditPropertyTitle(prop.title);
          const loadedState = propertyToFormState(prop);
          setFormState(loadedState);
        }
      } catch (err) {
        console.error('Failed to load property for editing:', err);
        setErrorMsg('Failed to load listing details.');
      }
    }
    loadEditProperty();
  }, [editId]);

  const typeConfig = useMemo(() => {
    return getTypeConfig(formState.propertyType);
  }, [formState.propertyType]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = buildPropertyPayload(formState, editId);
      if (isEditMode) {
        await api.updateProperty(editId, payload);
        navigate(`/properties/${editId}`);
      } else {
        await api.createProperty(payload);
        setCurrentStep(7); // Success Step
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit property listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formState.title.trim()) {
      setErrorMsg('Please enter a property title before proceeding.');
      return;
    }
    if (currentStep === 1 && !formState.expectedPrice) {
      setErrorMsg('Please enter an expected price.');
      return;
    }
    if (currentStep === 2 && !formState.city.trim()) {
      setErrorMsg('Please enter a city.');
      return;
    }
    setErrorMsg('');
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Render Type-Specific Field Component for Step 3
  const renderCategoryFields = () => {
    const canonicalType = resolvePropertyType(formState.propertyType);
    switch (canonicalType) {
      case 'House':
        return <HouseFields formState={formState} updateField={updateField} />;
      case 'Villa':
        return <VillaFields formState={formState} updateField={updateField} />;
      case 'Apartment':
        return <ApartmentFields formState={formState} updateField={updateField} />;
      case 'Agricultural Land':
        return <AgriculturalFields formState={formState} updateField={updateField} />;
      case 'Residential Plot':
        return <ResidentialPlotFields formState={formState} updateField={updateField} />;
      case 'Commercial Plot':
        return <CommercialFields formState={formState} updateField={updateField} isBuilding={false} />;
      case 'Commercial Building':
        return <CommercialFields formState={formState} updateField={updateField} isBuilding={true} />;
      default:
        return <HouseFields formState={formState} updateField={updateField} />;
    }
  };

  return (
    <div style={{ width: '100%', paddingBottom: '6rem', minHeight: '85vh' }}>
      <SEO
        title={isEditMode ? `Edit ${editPropertyTitle || 'Listing'}` : 'Post Property Listing'}
        description="List your property directly on LandLink AI with zero brokerage and smart AI assistance."
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6" style={{ paddingTop: '2.5rem' }}>
        {/* Edit Mode Context Banner */}
        {isEditMode && editPropertyTitle && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.875rem',
              marginBottom: '1.5rem',
              backgroundColor: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <Eye size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#818cf8' }}>
              Editing Listing: &ldquo;{editPropertyTitle}&rdquo;
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              All saved data has been preloaded below.
            </span>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#818cf8',
            }}
          >
            Zero Brokerage Direct Listing
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {isEditMode ? 'Edit Property Listing' : 'Post Property — Smart Wizard'}
          </h1>
        </div>

        {/* Wizard Stepper Bar (Steps 1 to 6) */}
        {currentStep <= 6 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '0.5rem',
              marginBottom: '2.5rem',
            }}
          >
            {WIZARD_STEPS.map((s) => {
              const isCurrent = currentStep === s.step;
              const isCompleted = currentStep > s.step;
              return (
                <div
                  key={s.step}
                  onClick={() => isCompleted && setCurrentStep(s.step)}
                  style={{
                    cursor: isCompleted ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: isCompleted
                        ? '#34d399'
                        : isCurrent
                        ? typeConfig.color
                        : 'rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      color: isCurrent
                        ? typeConfig.color
                        : isCompleted
                        ? '#34d399'
                        : 'var(--text-secondary)',
                    }}
                  >
                    Step {s.step}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMsg && (
          <div
            style={{
              padding: '0.875rem 1.25rem',
              borderRadius: '0.875rem',
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fb7185',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Wizard Step Container */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            borderRadius: '1.5rem',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          }}
        >
          <AnimatePresence mode="wait">
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--card-border)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  Step 1: Category & Expected Price
                </h3>
                <PropertyBasicInfo formState={formState} updateField={updateField} />
              </motion.div>
            )}

            {/* STEP 2: Location */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--card-border)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  Step 2: Location Details
                </h3>
                <PropertyLocation formState={formState} updateField={updateField} />
              </motion.div>
            )}

            {/* STEP 3: Dynamic Category-Specific Fields */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--card-border)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Step 3: {typeConfig.label} Specifications
                  </h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: typeConfig.color,
                      backgroundColor: 'rgba(99,102,241,0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {typeConfig.emoji} {typeConfig.label}
                  </span>
                </div>
                {renderCategoryFields()}
              </motion.div>
            )}

            {/* STEP 4: Photos */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--card-border)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  Step 4: Property Images
                </h3>
                <PropertyImages formState={formState} updateField={updateField} isEditMode={isEditMode} />
              </motion.div>
            )}

            {/* STEP 5: AI Copywriter & Price Valuation */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--card-border)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  Step 5: AI Assistant & Copywriter
                </h3>
                <AISection formState={formState} updateField={updateField} />
              </motion.div>
            )}

            {/* STEP 6: Seller Contact & Live Preview */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--card-border)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  Step 6: Seller Contact Information & Final Preview
                </h3>
                <SellerInformation formState={formState} updateField={updateField} />
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                  <PropertyPreview formState={formState} />
                </div>
              </motion.div>
            )}

            {/* STEP 7: Success Confirmation */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '3rem 1rem' }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(52,211,153,0.15)',
                    border: '2px solid #34d399',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>
                  Property Listed Successfully!
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem' }}>
                  Your direct listing is now published on the LandLink AI zero-brokerage marketplace.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/my-listings')}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
                  >
                    View My Listings
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/properties')}
                    className="btn-secondary"
                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
                  >
                    Browse Marketplace
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Control Buttons */}
          {currentStep <= 6 && (
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                marginTop: '2rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--card-border)',
              }}
            >
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn-secondary"
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary"
                  style={{
                    padding: '0.625rem 1.5rem',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    backgroundColor: '#34d399',
                    color: '#064e3b',
                  }}
                >
                  {isSubmitting
                    ? 'Publishing Listing...'
                    : isEditMode
                    ? 'Save Changes'
                    : 'Publish Property Listing'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
