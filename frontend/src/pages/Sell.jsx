import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import {
  PROPERTY_TYPES, HOUSE_TYPES, VILLA_AMENITIES_OPTIONS,
  ACCESS_ROAD_TYPES, CROPPING_INTENSITY_OPTIONS,
  LAND_COST_FACTORS, SOIL_AND_INFRASTRUCTURE, COMMERCIAL_PLOT_OPTIONS, AREA_UNITS,
  FURNISHED_STATUS_OPTIONS, PLOT_FACING_OPTIONS
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
  const [houseTotalRooms, setHouseTotalRooms] = useState('5');
  const [houseTotalFloors, setHouseTotalFloors] = useState('2');

  // Villa Specific Fields
  const [villaBedrooms, setVillaBedrooms] = useState('4');
  const [villaBathrooms, setVillaBathrooms] = useState('4');
  const [villaTotalFloors, setVillaTotalFloors] = useState('2');
  const [villaPlotArea, setVillaPlotArea] = useState('3500');
  const [villaAmenities, setVillaAmenities] = useState(['Private Pool', 'Private Garden', 'Private Boundary Wall']);

  // Apartment Specific Fields
  const [apartmentTotalFloors, setApartmentTotalFloors] = useState('12');
  const [apartmentRoomsPerFloor, setApartmentRoomsPerFloor] = useState('4');
  const [apartmentUnitBedrooms, setApartmentUnitBedrooms] = useState('2');
  const [apartmentUnitBathrooms, setApartmentUnitBathrooms] = useState('2');
  const [apartmentUnitsPerFloor, setApartmentUnitsPerFloor] = useState('4');
  const [apartmentTotalFlats, setApartmentTotalFlats] = useState('48');
  const [flatFloorNumber, setFlatFloorNumber] = useState('3');

  // Land / Plot & Commercial Specific Fields
  const [accessRoadType, setAccessRoadType] = useState('Highway Road');
  const [cornerPlotStatus, setCornerPlotStatus] = useState(false);
  const [plotFacing, setPlotFacing] = useState('East');
  const [furnishedStatus, setFurnishedStatus] = useState('Semi-Furnished');

  // Agricultural Specific Fields
  const [croppingIntensity, setCroppingIntensity] = useState('Dual-crop');
  const [cropFallowDuration, setCropFallowDuration] = useState('1');
  const [waterPumpCount, setWaterPumpCount] = useState('1');
  const [solarGridIntegration, setSolarGridIntegration] = useState(false);

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

  // Edit mode: track the original property title for the banner
  const [editPropertyTitle, setEditPropertyTitle] = useState('');

  // Images state
  const [imageUrls, setImageUrls] = useState([]);
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

        // Set the banner title
        if (prop.title) {
          setEditPropertyTitle(prop.title);
          setTitle(prop.title);
        }

        if (prop.property_type) setPropertyType(prop.property_type);
        if (prop.house_type) setHouseType(prop.house_type);
        if (prop.area_unit) setAreaUnit(prop.area_unit);
        if (prop.expected_price) setExpectedPrice(String(prop.expected_price));
        if (prop.min_expected_price) setMinExpectedPrice(String(prop.min_expected_price));
        if (prop.max_expected_price) setMaxExpectedPrice(String(prop.max_expected_price));
        if (prop.area_sqft) setAreaSqft(String(prop.area_sqft));
        if (prop.bedrooms !== undefined && prop.bedrooms !== null) setBedrooms(String(prop.bedrooms));
        if (prop.bathrooms !== undefined && prop.bathrooms !== null) setBathrooms(String(prop.bathrooms));
        if (prop.floors !== undefined && prop.floors !== null) setFloors(String(prop.floors));
        if (prop.parking !== undefined && prop.parking !== null) setParking(String(prop.parking));
        if (prop.address) setAddress(prop.address);
        if (prop.city) setCity(prop.city);
        if (prop.state) setState(prop.state);
        if (prop.description) setDescription(prop.description);
        if (prop.reason_for_selling) setReasonForSelling(prop.reason_for_selling);
        // Contact details — try prop-level contact first, fall back to seller object
        const sellerObj = prop.seller && typeof prop.seller === 'object' ? prop.seller : null;
        if (prop.contact_number) setSellerPhone(prop.contact_number);
        else if (sellerObj?.phone || sellerObj?.phone_number) setSellerPhone(sellerObj.phone || sellerObj.phone_number);
        if (prop.contact_email) setSellerEmail(prop.contact_email);
        else if (sellerObj?.email) setSellerEmail(sellerObj.email);
        if (sellerObj?.full_name || sellerObj?.name) setSellerName(sellerObj.full_name || sellerObj.name);

        if (prop.land_factors?.length) setSelectedLandFactors(prop.land_factors);
        if (prop.soil_and_infrastructure?.length) setSelectedSoilAndInfra(prop.soil_and_infrastructure);
        if (prop.commercial_plot_features?.length) setCommercialPlotFeatures(prop.commercial_plot_features);
        if (prop.villa_amenities?.length) setVillaAmenities(prop.villa_amenities);

        // ── Images: extract URL strings from the images array ──────────────
        // Backend stores images as [{image_url, ...}]; we keep them as plain strings in state.
        if (prop.images?.length) {
          const urls = prop.images
            .map(img => (typeof img === 'string' ? img : img?.image_url || img?.url))
            .filter(Boolean);
          setImageUrls(urls);
        }

        // House
        if (prop.house_bedrooms !== undefined && prop.house_bedrooms !== null) setHouseBedrooms(String(prop.house_bedrooms));
        if (prop.house_bathrooms !== undefined && prop.house_bathrooms !== null) setHouseBathrooms(String(prop.house_bathrooms));
        if (prop.house_age !== undefined && prop.house_age !== null) setHouseAge(String(prop.house_age));
        if (prop.house_total_rooms !== undefined && prop.house_total_rooms !== null) setHouseTotalRooms(String(prop.house_total_rooms));
        if (prop.house_total_floors !== undefined && prop.house_total_floors !== null) setHouseTotalFloors(String(prop.house_total_floors));

        // Villa
        if (prop.villa_bedrooms !== undefined && prop.villa_bedrooms !== null) setVillaBedrooms(String(prop.villa_bedrooms));
        if (prop.villa_bathrooms !== undefined && prop.villa_bathrooms !== null) setVillaBathrooms(String(prop.villa_bathrooms));
        if (prop.villa_total_floors !== undefined && prop.villa_total_floors !== null) setVillaTotalFloors(String(prop.villa_total_floors));
        if (prop.villa_plot_area !== undefined && prop.villa_plot_area !== null) setVillaPlotArea(String(prop.villa_plot_area));

        // Apartment
        if (prop.apartment_total_floors !== undefined && prop.apartment_total_floors !== null) setApartmentTotalFloors(String(prop.apartment_total_floors));
        if (prop.apartment_rooms_per_floor !== undefined && prop.apartment_rooms_per_floor !== null) setApartmentRoomsPerFloor(String(prop.apartment_rooms_per_floor));
        if (prop.apartment_unit_bedrooms !== undefined && prop.apartment_unit_bedrooms !== null) setApartmentUnitBedrooms(String(prop.apartment_unit_bedrooms));
        if (prop.apartment_unit_bathrooms !== undefined && prop.apartment_unit_bathrooms !== null) setApartmentUnitBathrooms(String(prop.apartment_unit_bathrooms));
        if (prop.apartment_units_per_floor !== undefined && prop.apartment_units_per_floor !== null) setApartmentUnitsPerFloor(String(prop.apartment_units_per_floor));
        if (prop.apartment_total_flats !== undefined && prop.apartment_total_flats !== null) setApartmentTotalFlats(String(prop.apartment_total_flats));
        if (prop.flat_floor_number !== undefined && prop.flat_floor_number !== null) setFlatFloorNumber(String(prop.flat_floor_number));

        // Plots & Agricultural
        if (prop.access_road_type) setAccessRoadType(prop.access_road_type);
        if (prop.corner_plot_status !== undefined && prop.corner_plot_status !== null) setCornerPlotStatus(Boolean(prop.corner_plot_status));
        if (prop.plot_facing) setPlotFacing(prop.plot_facing);
        if (prop.furnished_status) setFurnishedStatus(prop.furnished_status);

        if (prop.cropping_intensity) setCroppingIntensity(prop.cropping_intensity);
        if (prop.crop_fallow_duration !== undefined && prop.crop_fallow_duration !== null) setCropFallowDuration(String(prop.crop_fallow_duration));
        if (prop.water_pump_count !== undefined && prop.water_pump_count !== null) setWaterPumpCount(String(prop.water_pump_count));
        if (prop.solar_grid_integration !== undefined && prop.solar_grid_integration !== null) setSolarGridIntegration(Boolean(prop.solar_grid_integration));

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

  const toggleCommercialPlotFeature = (feature) => {
    setCommercialPlotFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const toggleVillaAmenity = (amenity) => {
    setVillaAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
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

  // ── formData: single source of truth for preview & submit ────────────────
  // images is kept as a plain string array so the backend updateProperty handler
  // receives raw URL strings (it wraps them into {image_url,...} objects itself).
  const formData = {
    id: editId || 'preview-id',
    _id: editId || 'preview-id',
    title: title || `${propertyType} in ${city || 'Prime Area'}`,
    property_type: propertyType,
    house_type: propertyType === 'House' ? houseType : null,
    expected_price: parseFloat(expectedPrice || 100000),
    price: parseFloat(expectedPrice || 100000),
    min_expected_price: minExpectedPrice ? parseFloat(minExpectedPrice) : null,
    max_expected_price: maxExpectedPrice ? parseFloat(maxExpectedPrice) : null,
    area_sqft: parseFloat(areaSqft || 1000),
    area_unit: areaUnit,
    bedrooms: parseInt(bedrooms || 0),
    bathrooms: parseInt(bathrooms || 0),
    floors: parseInt(floors || 1),
    parking: parseInt(parking || 0),
    address,
    city: city || 'Mumbai',
    state,
    description,
    reason_for_selling: reasonForSelling,
    contact_number: sellerPhone,
    contact_email: sellerEmail,
    furnished_status: furnishedStatus,

    // House Specific
    house_bedrooms: parseInt(houseBedrooms || 0),
    house_bathrooms: parseInt(houseBathrooms || 0),
    house_age: parseFloat(houseAge || 0),
    house_total_rooms: parseInt(houseTotalRooms || 0),
    house_total_floors: parseInt(houseTotalFloors || 1),

    // Villa Specific
    villa_bedrooms: parseInt(villaBedrooms || 0),
    villa_bathrooms: parseInt(villaBathrooms || 0),
    villa_total_floors: parseInt(villaTotalFloors || 1),
    villa_plot_area: parseFloat(villaPlotArea || 0),
    villa_amenities: villaAmenities,

    // Apartment Specific
    apartment_total_floors: parseInt(apartmentTotalFloors || 1),
    apartment_rooms_per_floor: parseInt(apartmentRoomsPerFloor || 0),
    apartment_unit_bedrooms: parseInt(apartmentUnitBedrooms || 0),
    apartment_unit_bathrooms: parseInt(apartmentUnitBathrooms || 0),
    apartment_units_per_floor: parseInt(apartmentUnitsPerFloor || 1),
    apartment_total_flats: parseInt(apartmentTotalFlats || 0),
    flat_floor_number: parseInt(flatFloorNumber || 1),

    // Plots / Land / Access Road / Utilities
    access_road_type: accessRoadType,
    corner_plot_status: Boolean(cornerPlotStatus),
    plot_facing: plotFacing,

    // Agricultural
    cropping_intensity: croppingIntensity,
    crop_fallow_duration: parseFloat(cropFallowDuration || 0),
    water_pump_count: parseInt(waterPumpCount || 0),
    solar_grid_integration: Boolean(solarGridIntegration),
    agricultural_land_features: selectedSoilAndInfra,

    land_factors: selectedLandFactors,
    soil_and_infrastructure: selectedSoilAndInfra,
    commercial_plot_features: commercialPlotFeatures,

    // ── Image fields ──────────────────────────────────────────────────────
    // image_urls: plain strings — used for preview card display
    // images:     plain strings — sent to backend which wraps them into objects
    image_urls: imageUrls,
    images: imageUrls, // send raw URL strings; backend handles wrapping
    // For the PropertyCard preview we also supply the structured format
    imagesForCard: imageUrls.map(url => ({ image_url: url })),

    status: 'approved',
    is_verified: true,
    seller_type: 'owner',
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (isEditMode) {
        // Build the PUT payload — images MUST be a plain string array so the
        // backend updateProperty handler can wrap them into {image_url,...} objects.
        const updatePayload = {
          ...formData,
          images: imageUrls, // raw strings only
        };
        // Remove the preview-only field so it doesn't pollute the request
        delete updatePayload.imagesForCard;
        await api.updateProperty(editId, updatePayload);
        navigate(`/properties/${editId}`);
      } else {
        await api.createProperty(formData);
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

        {/* Edit Mode Context Banner */}
        {isEditMode && editPropertyTitle && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1.25rem', borderRadius: '0.875rem', marginBottom: '1.5rem',
            backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          }}>
            <Eye size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#818cf8' }}>
              Editing: &ldquo;{editPropertyTitle}&rdquo;
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              All existing data has been preloaded below.
            </span>
          </div>
        )}

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
                  <span style={{ fontSize: '0.6875rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#818cf8' : 'var(--text-secondary)' }}>
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
                  Step 3: Property Specs & Features ({propertyType})
                </h3>

                {/* Common Basic Specs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Total Area ({areaUnit})</label>
                    <input type="number" placeholder="1200" value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Area Unit</label>
                    <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                      {AREA_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>

                  {(propertyType === 'House' || propertyType === 'Villa' || propertyType === 'Apartment' || propertyType === 'Flat') && (
                    <>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Bedrooms</label>
                        <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Bathrooms</label>
                        <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Total Floors</label>
                    <input type="number" value={floors} onChange={(e) => setFloors(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Parking Spaces</label>
                    <input type="number" value={parking} onChange={(e) => setParking(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>

                {/* 1. HOUSE SPECIFIC SPECIFICATIONS */}
                {propertyType === 'House' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#818cf8' }}>House Specifications</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>House Construction Sub-Type</label>
                        <select value={houseType} onChange={(e) => setHouseType(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                          {HOUSE_TYPES.map((ht) => <option key={ht} value={ht}>{ht}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Furnished Status</label>
                        <select value={furnishedStatus} onChange={(e) => setFurnishedStatus(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                          {FURNISHED_STATUS_OPTIONS.map((fs) => <option key={fs} value={fs}>{fs}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Total Bedrooms in Structure</label>
                        <input type="number" value={houseBedrooms} onChange={(e) => setHouseBedrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Total Bathrooms in Structure</label>
                        <input type="number" value={houseBathrooms} onChange={(e) => setHouseBathrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Property Age (Years)</label>
                        <input type="number" value={houseAge} onChange={(e) => setHouseAge(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Total Rooms (Excl. Bathrooms)</label>
                        <input type="number" value={houseTotalRooms} onChange={(e) => setHouseTotalRooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Total House Floors</label>
                        <input type="number" value={houseTotalFloors} onChange={(e) => setHouseTotalFloors(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. VILLA SPECIFIC SPECIFICATIONS */}
                {propertyType === 'Villa' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#818cf8' }}>Villa Specifications</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Villa Private Bedrooms</label>
                        <input type="number" value={villaBedrooms} onChange={(e) => setVillaBedrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Villa Private Bathrooms</label>
                        <input type="number" value={villaBathrooms} onChange={(e) => setVillaBathrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Villa Structural Stories</label>
                        <input type="number" value={villaTotalFloors} onChange={(e) => setVillaTotalFloors(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Villa Private Plot Area (sq. ft.)</label>
                        <input type="number" value={villaPlotArea} onChange={(e) => setVillaPlotArea(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Villa Private Amenities Checklist</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem' }}>
                        {VILLA_AMENITIES_OPTIONS.map((item) => {
                          const selected = villaAmenities.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleVillaAmenity(item)}
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
                  </div>
                )}

                {/* 3. APARTMENT / FLAT SPECIFIC SPECIFICATIONS */}
                {(propertyType === 'Apartment' || propertyType === 'Flat') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#818cf8' }}>Apartment & Unit Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Total Complex Floors</label>
                        <input type="number" value={apartmentTotalFloors} onChange={(e) => setApartmentTotalFloors(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Flat Floor Level</label>
                        <input type="number" value={flatFloorNumber} onChange={(e) => setFlatFloorNumber(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Unit Bedrooms</label>
                        <input type="number" value={apartmentUnitBedrooms} onChange={(e) => setApartmentUnitBedrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Unit Bathrooms</label>
                        <input type="number" value={apartmentUnitBathrooms} onChange={(e) => setApartmentUnitBathrooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Units per Floor</label>
                        <input type="number" value={apartmentUnitsPerFloor} onChange={(e) => setApartmentUnitsPerFloor(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Rooms per Floor</label>
                        <input type="number" value={apartmentRoomsPerFloor} onChange={(e) => setApartmentRoomsPerFloor(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Total Flats in Complex</label>
                        <input type="number" value={apartmentTotalFlats} onChange={(e) => setApartmentTotalFlats(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Furnished Status</label>
                        <select value={furnishedStatus} onChange={(e) => setFurnishedStatus(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                          {FURNISHED_STATUS_OPTIONS.map((fs) => <option key={fs} value={fs}>{fs}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PLOTS, LAND, COMMERCIAL SPECIFIC SPECIFICATIONS */}
                {(propertyType === 'Residential Plot' || propertyType === 'Commercial Plot' || propertyType === 'Commercial Building' || propertyType === 'Commercial') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#818cf8' }}>Plot & Commercial Features</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Access Road Classification</label>
                        <select value={accessRoadType} onChange={(e) => setAccessRoadType(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                          {ACCESS_ROAD_TYPES.map((rt) => <option key={rt} value={rt}>{rt}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Plot Facing Direction</label>
                        <select value={plotFacing} onChange={(e) => setPlotFacing(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                          {PLOT_FACING_OPTIONS.map((pf) => <option key={pf} value={pf}>{pf}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Corner Plot (Dual-Road Access)</label>
                        <select value={cornerPlotStatus ? 'Yes' : 'No'} onChange={(e) => setCornerPlotStatus(e.target.value === 'Yes')} className="glass-input" style={{ fontSize: '0.875rem' }}>
                          <option value="No">No (Single Side Road)</option>
                          <option value="Yes">Yes (Corner Plot)</option>
                        </select>
                      </div>
                    </div>

                    {(propertyType === 'Commercial Plot' || propertyType === 'Commercial Building' || propertyType === 'Commercial') && (
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Commercial Infrastructure & Utility Options</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
                          {COMMERCIAL_PLOT_OPTIONS.map((item) => {
                            const selected = commercialPlotFeatures.includes(item);
                            return (
                              <div
                                key={item}
                                onClick={() => toggleCommercialPlotFeature(item)}
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
                    )}

                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Plot Access & Visibility Factors</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
                        {LAND_COST_FACTORS.map((item) => {
                          const selected = selectedLandFactors.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleLandFactor(item)}
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
                  </div>
                )}

                {/* 5. AGRICULTURAL LAND SPECIFICATIONS */}
                {propertyType === 'Agricultural Land' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#818cf8' }}>Agricultural Land Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Agricultural Cropping Intensity</label>
                        <select value={croppingIntensity} onChange={(e) => setCroppingIntensity(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }}>
                          {CROPPING_INTENSITY_OPTIONS.map((cio) => <option key={cio} value={cio}>{cio}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Crop Fallow Duration (Years)</label>
                        <input type="number" value={cropFallowDuration} onChange={(e) => setCropFallowDuration(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Irrigation Water Pumps / Borewells Count</label>
                        <input type="number" value={waterPumpCount} onChange={(e) => setWaterPumpCount(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Solar Power Grid Integration</label>
                        <select value={solarGridIntegration ? 'Yes' : 'No'} onChange={(e) => setSolarGridIntegration(e.target.value === 'Yes')} className="glass-input" style={{ fontSize: '0.875rem' }}>
                          <option value="No">No Integration</option>
                          <option value="Yes">Operational Solar Grid</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Land Cost & Access Factors</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
                        {LAND_COST_FACTORS.map((item) => {
                          const selected = selectedLandFactors.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => toggleLandFactor(item)}
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

                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Soil & Infrastructure Checklist</label>
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
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Photos — single authoritative block */}
            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  Step 4: Property Images {isEditMode && imageUrls.length > 0 && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#34d399', marginLeft: '0.5rem' }}>({imageUrls.length} existing image{imageUrls.length !== 1 ? 's' : ''} loaded)</span>}
                </h3>

                {/* Edit mode — existing images info */}
                {isEditMode && imageUrls.length > 0 && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.8125rem', color: '#34d399', fontWeight: 700 }}>
                    ✓ Existing images are preloaded below. You can keep them, remove individual ones, or upload additional photos.
                  </div>
                )}

                <div style={{ border: '2px dashed rgba(99,102,241,0.4)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(99,102,241,0.03)' }}>
                  <Upload size={32} style={{ color: '#818cf8', margin: '0 auto 0.75rem' }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Drag & Drop Property Photos Here
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Supports PNG, JPG, WEBP formats</p>
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} id="photo-upload-input" />
                  <label htmlFor="photo-upload-input" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', cursor: 'pointer', display: 'inline-block' }}>
                    {imageUrls.length > 0 ? 'Upload Additional Photos' : 'Select Files from Device'}
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

                {/* Image Thumbnails Grid — existing + newly added */}
                {imageUrls.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {imageUrls.map((img, i) => (
                      <div key={`${img}-${i}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.875rem', overflow: 'hidden', border: '2px solid var(--card-border)' }}>
                        <img
                          src={img}
                          alt={`Property image ${i + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        />
                        {/* Fallback for broken image URLs */}
                        <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.7)', color: '#64748b', fontSize: '0.625rem', fontWeight: 700, flexDirection: 'column', gap: '0.25rem' }}>
                          <ImageIcon size={18} />
                          <span>Load Error</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          title="Remove this image"
                          style={{ position: 'absolute', top: '0.3rem', right: '0.3rem', backgroundColor: 'rgba(239,68,68,0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                        >
                          <X size={13} />
                        </button>
                        <div style={{ position: 'absolute', bottom: '0.25rem', left: '0.25rem', backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', fontSize: '0.5625rem', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '0.25rem' }}>
                          {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed var(--card-border)', marginTop: '0.5rem' }}>
                    <ImageIcon size={32} style={{ color: '#475569' }} />
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>
                      No images yet. Upload property photos above to attract more buyers.
                    </p>
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
                  This is how your property card and specs will appear to prospective buyers on the LandLink AI marketplace.
                </p>

                <div style={{ maxWidth: '360px', margin: '0 auto 1.5rem', width: '100%' }}>
                  {/* Pass imagesForCard so PropertyCard sees the {image_url} format it expects */}
                  <PropertyCard property={{ ...formData, images: formData.imagesForCard }} />
                </div>

                {/* Detailed Category-Specific Preview Box */}
                <div style={{ padding: '1.5rem', borderRadius: '1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#818cf8', marginBottom: '1rem' }}>
                    {formData.property_type} Summary & Specifications
                  </h4>

                  {formData.property_type === 'House' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>House Sub-Type:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.house_type}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Bedrooms:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.house_bedrooms}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Bathrooms:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.house_bathrooms}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>House Age:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.house_age} Years</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Total Rooms:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.house_total_rooms}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>House Floors:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.house_total_floors}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Furnishing:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.furnished_status}</strong></div>
                    </div>
                  )}

                  {formData.property_type === 'Villa' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Villa Bedrooms:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.villa_bedrooms}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Villa Bathrooms:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.villa_bathrooms}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Villa Stories:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.villa_total_floors}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Plot Area:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.villa_plot_area} sq.ft</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Villa Amenities:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.villa_amenities.join(', ') || 'None selected'}</strong></div>
                    </div>
                  )}

                  {(formData.property_type === 'Apartment' || formData.property_type === 'Flat') && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Total Building Floors:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.apartment_total_floors}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Flat Floor Level:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.flat_floor_number}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Unit Bedrooms:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.apartment_unit_bedrooms}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Unit Bathrooms:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.apartment_unit_bathrooms}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Flats per Floor:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.apartment_units_per_floor}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Rooms per Floor:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.apartment_rooms_per_floor}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Total Flats in Complex:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.apartment_total_flats}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Furnishing:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.furnished_status}</strong></div>
                    </div>
                  )}

                  {(formData.property_type === 'Residential Plot' || formData.property_type === 'Commercial Plot' || formData.property_type === 'Commercial Building' || formData.property_type === 'Commercial') && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Access Road:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.access_road_type}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Plot Facing:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.plot_facing}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Corner Plot:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.corner_plot_status ? 'Yes (Dual Road Access)' : 'No (Single Road)'}</strong></div>
                      {formData.commercial_plot_features.length > 0 && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>Commercial Utilities:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.commercial_plot_features.join(', ')}</strong></div>
                      )}
                      {formData.land_factors.length > 0 && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>Land Factors:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.land_factors.join(', ')}</strong></div>
                      )}
                    </div>
                  )}

                  {formData.property_type === 'Agricultural Land' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Cropping Intensity:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.cropping_intensity}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Crop Fallow Duration:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.crop_fallow_duration} Years</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Water Pumps / Borewells:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.water_pump_count}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Solar Grid:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.solar_grid_integration ? 'Operational' : 'None'}</strong></div>
                      {formData.land_factors.length > 0 && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>Land Cost Factors:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.land_factors.join(', ')}</strong></div>
                      )}
                      {formData.soil_and_infrastructure.length > 0 && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>Soil & Infra:</span> <strong style={{ color: 'var(--text-primary)' }}>{formData.soil_and_infrastructure.join(', ')}</strong></div>
                      )}
                    </div>
                  )}
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
                  {isEditMode ? 'Listing Updated Successfully!' : 'Listing Published Successfully!'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
                  Your property is live on LandLink AI with direct owner contact details.
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
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Publish Listing Now'} <CheckCircle2 size={16} />
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
