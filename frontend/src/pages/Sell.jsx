import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import {
  PROPERTY_TYPES, HOUSE_TYPES, VILLA_AMENITIES_OPTIONS,
  ACCESS_ROAD_TYPES, CROPPING_INTENSITY_OPTIONS,
  LAND_COST_FACTORS, SOIL_AND_INFRASTRUCTURE, COMMERCIAL_PLOT_OPTIONS, AREA_UNITS
} from '../utils/propertyConstants';
import {
  Sparkles, DollarSign, Image as ImageIcon, Upload, X, Plus, Phone, Mail, User, MapPin,
  Home as HomeIcon, Sprout, Compass, Layers, ShieldCheck, Zap, Droplets, Building2, CheckCircle2,
  ArrowRight, ArrowLeft, Eye, AlertCircle
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import SEO from '../components/SEO';

export default function Sell() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = paramId || queryParams.get('edit');
  const isEditMode = Boolean(editId);

  const { user, isAuthenticated, language } = useAppStore();
  const t = translations[language] || translations.en;

  // Wizard Step State (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);

  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('House');
  const [houseType, setHouseType] = useState('Single-Family Detached Houses');
  const [areaUnit, setAreaUnit] = useState('sq ft');
  const [commercialPlotFeatures, setCommercialPlotFeatures] = useState([]);

  // House Specific Fields
  const [houseBedrooms, setHouseBedrooms] = useState('3');
  const [houseBathrooms, setHouseBathrooms] = useState('2');
  const [houseAge, setHouseAge] = useState('3');

  // Villa Specific Fields
  const [villaBedrooms, setVillaBedrooms] = useState('4');
  const [villaBathrooms, setVillaBathrooms] = useState('4');
  const [villaPlotArea, setVillaPlotArea] = useState('3500');
  const [villaAmenities, setVillaAmenities] = useState(['Private Pool', 'Private Garden', 'Private Boundary Wall']);

  // Apartment Specific Fields
  const [apartmentTotalFloors, setApartmentTotalFloors] = useState('12');
  const [apartmentUnitBedrooms, setApartmentUnitBedrooms] = useState('2');
  const [apartmentUnitBathrooms, setApartmentUnitBathrooms] = useState('2');

  const [selectedLandFactors, setSelectedLandFactors] = useState([]);
  const [selectedSoilAndInfra, setSelectedSoilAndInfra] = useState([]);
  const [expectedPrice, setExpectedPrice] = useState('');
  const [minExpectedPrice, setMinExpectedPrice] = useState('');
  const [maxExpectedPrice, setMaxExpectedPrice] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [floors, setFloors] = useState('1');
  const [parking, setParking] = useState('1');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [reasonForSelling, setReasonForSelling] = useState('');

  // Seller Contact Details
  const [sellerName, setSellerName] = useState(user?.full_name || '');
  const [sellerPhone, setSellerPhone] = useState(user?.phone_number || '');
  const [sellerEmail, setSellerEmail] = useState(user?.email || '');

  // Images state
  const [imageUrls, setImageUrls] = useState([
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&fit=crop'
  ]);
  const [urlInput, setUrlInput] = useState('');

  const [isAiDescLoading, setIsAiDescLoading] = useState(false);
  const [isAiPriceLoading, setIsAiPriceLoading] = useState(false);
  const [aiValuationResult, setAiValuationResult] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!editId) return;
    async function loadEditProperty() {
      try {
        const prop = await api.getProperty(editId);
        if (prop.title) setTitle(prop.title);
        if (prop.property_type) setPropertyType(prop.property_type);
        if (prop.house_type) setHouseType(prop.house_type);
        if (prop.area_unit) setAreaUnit(prop.area_unit);
        if (prop.expected_price) setExpectedPrice(String(prop.expected_price));
        if (prop.min_expected_price) setMinExpectedPrice(String(prop.min_expected_price));
        if (prop.max_expected_price) setMaxExpectedPrice(String(prop.max_expected_price));
        if (prop.area_sqft) setAreaSqft(String(prop.area_sqft));
        if (prop.bedrooms) setBedrooms(String(prop.bedrooms));
        if (prop.bathrooms) setBathrooms(String(prop.bathrooms));
        if (prop.floors) setFloors(String(prop.floors));
        if (prop.parking) setParking(String(prop.parking));
        if (prop.address) setAddress(prop.address);
        if (prop.city) setCity(prop.city);
        if (prop.state) setState(prop.state);
        if (prop.description) setDescription(prop.description);
        if (prop.reason_for_selling) setReasonForSelling(prop.reason_for_selling);
        if (prop.contact_number) setSellerPhone(prop.contact_number);
        if (prop.contact_email) setSellerEmail(prop.contact_email);
        if (prop.land_factors?.length) setSelectedLandFactors(prop.land_factors);
        if (prop.soil_and_infrastructure?.length) setSelectedSoilAndInfra(prop.soil_and_infrastructure);
        if (prop.images?.length) {
          setImageUrls(prop.images.map(img => typeof img === 'string' ? img : img.image_url));
        }
      } catch (err) {
        console.error('Failed to load property for editing:', err);
        setErrorMsg('Failed to load listing details.');
      }
    }
    loadEditProperty();
  }, [editId]);

  const toggleLandFactor = (factor) => {
    setSelectedLandFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

  const toggleSoilAndInfra = (item) => {
    setSelectedSoilAndInfra((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Str = uploadEvent.target.result;
        setImageUrls((prev) => [...prev, base64Str]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setImageUrls((prev) => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateAiDescription = async () => {
    if (!city || !propertyType) { alert('Please specify City and Property Type'); return; }
    setIsAiDescLoading(true);
    try {
      const res = await api.aiGenerateDescription({
        property_type: propertyType,
        house_type: propertyType === 'House' ? houseType : null,
        bedrooms: parseInt(bedrooms || 2),
        bathrooms: parseInt(bathrooms || 2),
        area_sqft: parseFloat(areaSqft || 1000),
        city,
        amenities: ['Gym', 'Parking', 'Security System'],
        image_urls: imageUrls,
      });
      setDescription(res.generated_description);
    } catch {
      alert('AI Description generation failed');
    } finally {
      setIsAiDescLoading(false);
    }
  };

  const handleAiValuation = async () => {
    if (!city || !areaSqft) { alert('Please specify City and Area (sq. ft)'); return; }
    setIsAiPriceLoading(true);
    try {
      const res = await api.aiPricePrediction({
        location: city,
        area_sqft: parseFloat(areaSqft),
        bedrooms: parseInt(bedrooms || 2),
        bathrooms: parseInt(bathrooms || 2),
        age: parseFloat(houseAge || 2),
      });
      setAiValuationResult(res);
      if (res.estimated_price) {
        setExpectedPrice(String(Math.round(res.estimated_price)));
      }
    } catch {
      alert('AI Valuation calculation failed');
    } finally {
      setIsAiPriceLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        title: title || `${propertyType} in ${city || 'Prime Area'}`,
        property_type: propertyType,
        house_type: propertyType === 'House' ? houseType : null,
        expected_price: parseFloat(expectedPrice || 100000),
        min_expected_price: minExpectedPrice ? parseFloat(minExpectedPrice) : null,
        max_expected_price: maxExpectedPrice ? parseFloat(maxExpectedPrice) : null,
        area_sqft: parseFloat(areaSqft || 1000),
        area_unit: areaUnit,
        bedrooms: parseInt(bedrooms || 2),
        bathrooms: parseInt(bathrooms || 2),
        floors: parseInt(floors || 1),
        parking: parseInt(parking || 1),
        address,
        city,
        state,
        description,
        reason_for_selling: reasonForSelling,
        contact_number: sellerPhone,
        contact_email: sellerEmail,
        land_factors: selectedLandFactors,
        soil_and_infrastructure: selectedSoilAndInfra,
        image_urls: imageUrls,
        status: 'approved',
      };

      if (isEditMode) {
        await api.updateProperty(editId, payload);
        navigate(`/properties/${editId}`);
      } else {
        const created = await api.createProperty(payload);
        setCurrentStep(7);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit property listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !title) {
      setErrorMsg('Please enter a Property Title.');
      return;
    }
    if (currentStep === 2 && !city) {
      setErrorMsg('Please enter City location.');
      return;
    }
    setErrorMsg('');
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const prevStep = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const stepsList = [
    'Basic Info', 'Location', 'Specs & Amenities', 'Photos', 'AI Copywriter', 'Preview', 'Publish'
  ];

  return (
    <div style={{ width: '100%', paddingBottom: '6rem', minHeight: '85vh' }}>
      <SEO title={isEditMode ? 'Edit Listing' : 'Post Property Listing'} description="List your property directly on LandLink AI with zero brokerage and AI copywriter assistance." />

      <div className="mx-auto max-w-5xl px-4 sm:px-6" style={{ paddingTop: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>
            Zero Brokerage Direct Listing
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {isEditMode ? 'Edit Property Listing' : 'Post Property - Step-by-Step Wizard'}
          </h1>
        </div>

        {/* Wizard Progress Indicator */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: '1rem' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: 'var(--card-border)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%`, height: '2px', backgroundColor: '#6366f1', zIndex: 0, transition: 'width 0.3s ease-out' }} />

            {stepsList.map((st, i) => {
              const num = i + 1;
              const isDone = num < currentStep;
              const isCurrent = num === currentStep;
              return (
                <div key={st} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                  <div
                    style={{
                      width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                      backgroundColor: isDone ? '#10b981' : isCurrent ? '#6366f1' : '#0d0925',
                      border: isCurrent ? '2px solid #818cf8' : '1px solid var(--card-border)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8125rem', fontWeight: 800, transition: 'all 0.25s',
                    }}
                  >
                    {isDone ? <CheckCircle2 size={16} /> : num}
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#818cf8' : 'var(--text-secondary)', display: 'none', smDisplay: 'block' }}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.875rem', borderRadius: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {/* Wizard Form Container */}
        <div className="glass-panel" style={{ borderRadius: '1.75rem', padding: '2.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <AnimatePresence mode="wait">
            
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  Step 1: Basic Property Details
                </h3>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Property Title</label>
                  <input type="text" required placeholder="e.g. Luxurious 3BHK Apartment with Sea View" value={title} onChange={(e) => setTitle(e.target.value)} className="glass-input" style={{ fontSize: '0.9375rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Property Category</label>
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                      {PROPERTY_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Expected Price (INR)</label>
                    <input type="number" required placeholder="e.g. 7500000" value={expectedPrice} onChange={(e) => setExpectedPrice(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  Step 2: Location Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>City</label>
                    <input type="text" required placeholder="e.g. Mumbai" value={city} onChange={(e) => setCity(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>State</label>
                    <input type="text" placeholder="e.g. Maharashtra" value={state} onChange={(e) => setState(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Street Address / Landmark</label>
                  <input type="text" placeholder="e.g. Bandra West, Near Hill Road" value={address} onChange={(e) => setAddress(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                </div>
              </motion.div>
            )}

            {/* Step 3: Specs & Amenities */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  Step 3: Property Specs & Features
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Area (Sq. Ft)</label>
                    <input type="number" placeholder="1200" value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Bedrooms</label>
                    <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Bathrooms</label>
                    <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Select Land & Infrastructure Features</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem' }}>
                    {SOIL_AND_INFRASTRUCTURE.map((item) => {
                      const selected = selectedSoilAndInfra.includes(item);
                      return (
                        <div
                          key={item}
                          onClick={() => toggleSoilAndInfra(item)}
                          style={{
                            padding: '0.625rem 0.875rem', borderRadius: '0.75rem', cursor: 'pointer',
                            backgroundColor: selected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                            border: selected ? '1px solid #6366f1' : '1px solid var(--card-border)',
                            color: selected ? '#818cf8' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700,
                          }}
                        >
                          {selected ? '✓ ' : '+ '}{item}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Photos */}
            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  Step 4: Upload Property Images
                </h3>

                <div style={{ border: '2px dashed rgba(99,102,241,0.4)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(99,102,241,0.03)' }}>
                  <Upload size={32} style={{ color: '#818cf8', margin: '0 auto 0.75rem' }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Drag & Drop Property Photos Here
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Supports PNG, JPG, WEBP formats</p>
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} id="photo-upload-input" />
                  <label htmlFor="photo-upload-input" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', cursor: 'pointer', display: 'inline-block' }}>
                    Select Files from Device
                  </label>
                </div>

                {/* Direct Image URL Add */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="glass-input"
                    style={{ fontSize: '0.8125rem' }}
                  />
                  <button type="button" onClick={handleAddUrl} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', flexShrink: 0 }}>
                    Add URL
                  </button>
                </div>

                {/* Uploaded Thumbnails Grid */}
                {imageUrls.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                    {imageUrls.map((img, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                        <img src={img} alt={`Upload ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => handleRemoveImage(i)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', backgroundColor: 'rgba(239,68,68,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: AI Copywriter & Valuation */}
            {currentStep === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  Step 5: AI Copywriter & Neural Valuation
                </h3>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleGenerateAiDescription} disabled={isAiDescLoading} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}>
                    <Sparkles size={16} /> {isAiDescLoading ? 'Generating...' : 'Auto-Generate AI Copywriting'}
                  </button>
                  <button type="button" onClick={handleAiValuation} disabled={isAiPriceLoading} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}>
                    <DollarSign size={16} /> {isAiPriceLoading ? 'Calculating...' : 'Run AI Price Benchmark'}
                  </button>
                </div>

                {aiValuationResult && (
                  <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.8125rem', fontWeight: 700 }}>
                    AI Estimated Value: ₹ {Math.round(aiValuationResult.estimated_price).toLocaleString('en-IN')} (High Precision Valuation)
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Property Description Narrative</label>
                  <textarea
                    rows={5}
                    placeholder="Describe key highlights, neighborhood features, and interior furnishings..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input"
                    style={{ fontSize: '0.875rem', lineHeight: 1.6 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 6: Live Preview */}
            {currentStep === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  Step 6: Listing Live Preview
                </h3>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  This is how your property card will appear to prospective buyers on the LandLink AI marketplace.
                </p>

                <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
                  <PropertyCard
                    property={{
                      title: title || 'Sample Property Title',
                      price: parseFloat(expectedPrice || 100000),
                      city: city || 'Mumbai',
                      property_type: propertyType,
                      bedrooms: parseInt(bedrooms || 2),
                      bathrooms: parseInt(bathrooms || 2),
                      area_sqft: parseFloat(areaSqft || 1000),
                      images: imageUrls,
                      is_verified: true,
                      seller_type: 'owner',
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 7: Confirmation / Success */}
            {currentStep === 7 && (
              <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <CheckCircle2 size={40} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Listing Published Successfully!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
                  Your property is now live on LandLink AI with direct owner contact details.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button onClick={() => navigate('/properties')} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                    Browse Marketplace
                  </button>
                  <button onClick={() => navigate('/my-listings')} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                    View My Listings
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Controls Bottom */}
          {currentStep < 7 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentStep === 1 ? 0.5 : 1 }}
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {currentStep === 6 ? (
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSubmitting ? 'Publishing...' : 'Publish Listing Now'} <CheckCircle2 size={16} />
                </button>
              ) : (
                <button type="button" onClick={nextStep} className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Next Step <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
