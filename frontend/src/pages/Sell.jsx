import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import {
  PROPERTY_TYPES, HOUSE_TYPES, VILLA_AMENITIES_OPTIONS,
  ACCESS_ROAD_TYPES, CROPPING_INTENSITY_OPTIONS,
  LAND_COST_FACTORS, SOIL_AND_INFRASTRUCTURE, COMMERCIAL_PLOT_OPTIONS, AREA_UNITS
} from '../utils/propertyConstants';
import { Sparkles, DollarSign, Image as ImageIcon, Upload, X, Plus, Phone, Mail, User, MapPin, Home as HomeIcon, Sprout, Compass, Layers, ShieldCheck, Zap, Droplets, Building2 } from 'lucide-react';

export default function Sell() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = paramId || queryParams.get('edit');
  const isEditMode = Boolean(editId);

  const { user, isAuthenticated, language } = useAppStore();
  const t = translations[language] || translations.en;

  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('House');
  const [houseType, setHouseType] = useState('Single-Family Detached Houses');
  const [areaUnit, setAreaUnit] = useState('sq ft');
  const [commercialPlotFeatures, setCommercialPlotFeatures] = useState([]);

  // House Specific Fields
  const [houseBedrooms, setHouseBedrooms] = useState('3');
  const [houseBathrooms, setHouseBathrooms] = useState('2');
  const [houseAge, setHouseAge] = useState('3');
  const [houseTotalRooms, setHouseTotalRooms] = useState('6');
  const [houseTotalFloors, setHouseTotalFloors] = useState('2');

  // Villa Specific Fields
  const [villaBedrooms, setVillaBedrooms] = useState('4');
  const [villaBathrooms, setVillaBathrooms] = useState('4');
  const [villaTotalFloors, setVillaTotalFloors] = useState('2');
  const [villaPlotArea, setVillaPlotArea] = useState('3500');
  const [villaAmenities, setVillaAmenities] = useState(['Private Pool', 'Private Garden', 'Private Boundary Wall']);

  // Flat and Apartment Specific Fields
  const [apartmentTotalFloors, setApartmentTotalFloors] = useState('12');
  const [apartmentRoomsPerFloor, setApartmentRoomsPerFloor] = useState('10');
  const [apartmentUnitBedrooms, setApartmentUnitBedrooms] = useState('2');
  const [apartmentUnitBathrooms, setApartmentUnitBathrooms] = useState('2');
  const [apartmentUnitsPerFloor, setApartmentUnitsPerFloor] = useState('4');
  const [apartmentTotalFlats, setApartmentTotalFlats] = useState('48');
  const [flatFloorNumber, setFlatFloorNumber] = useState('3');

  // Road and Access Fields
  const [accessRoadType, setAccessRoadType] = useState('Main Arterial Road');
  const [cornerPlotStatus, setCornerPlotStatus] = useState(false);

  // Agricultural Cultivation Fields
  const [croppingIntensity, setCroppingIntensity] = useState('Dual-crop');
  const [cropFallowDuration, setCropFallowDuration] = useState('1');

  // Infrastructure and Utility Fields
  const [waterPumpCount, setWaterPumpCount] = useState('2');
  const [solarGridIntegration, setSolarGridIntegration] = useState(true);

  // Range states
  const [minExpectedPrice, setMinExpectedPrice] = useState('');
  const [maxExpectedPrice, setMaxExpectedPrice] = useState('');
  const [minAreaSqft, setMinAreaSqft] = useState('');
  const [maxAreaSqft, setMaxAreaSqft] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('2');
  const [maxBedrooms, setMaxBedrooms] = useState('4');
  const [minBathrooms, setMinBathrooms] = useState('1');
  const [maxBathrooms, setMaxBathrooms] = useState('3');
  const [minHouseAge, setMinHouseAge] = useState('1');
  const [maxHouseAge, setMaxHouseAge] = useState('5');
  const [minFloors, setMinFloors] = useState('1');
  const [maxFloors, setMaxFloors] = useState('3');
  const [minHouseTotalRooms, setMinHouseTotalRooms] = useState('4');
  const [maxHouseTotalRooms, setMaxHouseTotalRooms] = useState('8');
  const [minVillaPlotArea, setMinVillaPlotArea] = useState('3000');
  const [maxVillaPlotArea, setMaxVillaPlotArea] = useState('4000');
  const [minCropFallowDuration, setMinCropFallowDuration] = useState('1');
  const [maxCropFallowDuration, setMaxCropFallowDuration] = useState('2');
  const [minWaterPumpCount, setMinWaterPumpCount] = useState('1');
  const [maxWaterPumpCount, setMaxWaterPumpCount] = useState('3');

  const [selectedLandFactors, setSelectedLandFactors] = useState([]);
  const [selectedSoilAndInfra, setSelectedSoilAndInfra] = useState([]);
  const [expectedPrice, setExpectedPrice] = useState('');
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
  const [sellerWhatsapp, setSellerWhatsapp] = useState(user?.whatsapp_number || '');

  // Images state (supports both Base64 uploaded files and URL links)
  const [imageUrls, setImageUrls] = useState([
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&fit=crop'
  ]);
  const [urlInput, setUrlInput] = useState('');

  const [isAiDescLoading, setIsAiDescLoading] = useState(false);
  const [isAiPriceLoading, setIsAiPriceLoading] = useState(false);
  const [aiValuationResult, setAiValuationResult] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('approved');
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
        if (prop.min_area_sqft) setMinAreaSqft(String(prop.min_area_sqft));
        if (prop.max_area_sqft) setMaxAreaSqft(String(prop.max_area_sqft));
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
        if (prop.whatsapp_number) setSellerWhatsapp(prop.whatsapp_number);
        if (prop.status) setStatus(prop.status);
        if (prop.land_factors?.length) setSelectedLandFactors(prop.land_factors);
        if (prop.soil_and_infrastructure?.length) setSelectedSoilAndInfra(prop.soil_and_infrastructure);
        if (prop.commercial_plot_features?.length) setCommercialPlotFeatures(prop.commercial_plot_features);
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

  const toggleVillaAmenity = (amenity) => {
    setVillaAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleCommercialPlotFeature = (feature) => {
    setCommercialPlotFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  // Handle direct file uploads (convert to Base64 data URLs)
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
    if (!city || !propertyType) { alert('Please fill in City and Property Type first'); return; }
    setIsAiDescLoading(true);
    try {
      const res = await api.aiGenerateDescription({
        property_type: propertyType,
        house_type: propertyType === 'House' ? houseType : null,
        land_factors: selectedLandFactors,
        soil_and_infrastructure: selectedSoilAndInfra,
        bedrooms: parseInt(bedrooms || houseBedrooms || villaBedrooms || apartmentUnitBedrooms || 2),
        bathrooms: parseInt(bathrooms || houseBathrooms || villaBathrooms || apartmentUnitBathrooms || 2),
        area_sqft: parseFloat(areaSqft || villaPlotArea || 1000),
        city,
        amenities: ['Gym', 'Parking', '24/7 Security'],
        image_urls: imageUrls,
      });
      setDescription(res.generated_description);
    } catch {
      alert('AI Description generator failed.');
    } finally {
      setIsAiDescLoading(false);
    }
  };

  const handleAiValuation = async () => {
    if (!city || (!areaSqft && !villaPlotArea)) { alert('Please fill in City and Area (sqft)'); return; }
    setIsAiPriceLoading(true);
    try {
      const res = await api.aiPricePrediction({
        location: city,
        area_sqft: parseFloat(areaSqft || villaPlotArea || 1000),
        bedrooms: parseInt(bedrooms || houseBedrooms || villaBedrooms || apartmentUnitBedrooms || 2),
        bathrooms: parseInt(bathrooms || houseBathrooms || villaBathrooms || apartmentUnitBathrooms || 2),
        age: parseFloat(houseAge || 2),
        amenities: ['Gym', 'Parking'],
      });
      setAiValuationResult(res);
      if (res.predicted_market_value) setExpectedPrice(String(Math.round(res.predicted_market_value)));
    } catch {
      alert('AI Price Prediction failed.');
    } finally {
      setIsAiPriceLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { setErrorMsg('Please sign in first to list your property'); return; }
    if (imageUrls.length === 0) { setErrorMsg('Please upload at least one image photo of the building/property'); return; }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const finalP = parseFloat(expectedPrice || maxExpectedPrice || minExpectedPrice || 0);
      const finalA = parseFloat(areaSqft || maxAreaSqft || minAreaSqft || villaPlotArea || 1000);

      const payload = {
        title,
        property_type: propertyType,
        house_type: propertyType === 'House' ? houseType : null,
        land_factors: selectedLandFactors,
        soil_and_infrastructure: selectedSoilAndInfra,
        commercial_plot_features: commercialPlotFeatures,
        area_unit: areaUnit,

        expected_price: finalP,
        min_expected_price: parseFloat(minExpectedPrice || finalP),
        max_expected_price: parseFloat(maxExpectedPrice || finalP),

        area_sqft: finalA,
        min_area_sqft: parseFloat(minAreaSqft || finalA),
        max_area_sqft: parseFloat(maxAreaSqft || finalA),

        bedrooms: parseInt(bedrooms || maxBedrooms || houseBedrooms || villaBedrooms || apartmentUnitBedrooms || 0),
        min_bedrooms: parseInt(minBedrooms || bedrooms || 0),
        max_bedrooms: parseInt(maxBedrooms || bedrooms || 0),

        bathrooms: parseInt(bathrooms || maxBathrooms || houseBathrooms || villaBathrooms || apartmentUnitBathrooms || 0),
        min_bathrooms: parseInt(minBathrooms || bathrooms || 0),
        max_bathrooms: parseInt(maxBathrooms || bathrooms || 0),

        floors: parseInt(floors || maxFloors || houseTotalFloors || villaTotalFloors || apartmentTotalFloors || 1),
        min_floors: parseInt(minFloors || floors || 1),
        max_floors: parseInt(maxFloors || floors || 1),

        // Specific category fields
        house_bedrooms: parseInt(houseBedrooms || maxBedrooms || bedrooms || 0),
        house_bathrooms: parseInt(houseBathrooms || maxBathrooms || bathrooms || 0),
        house_age: parseFloat(houseAge || maxHouseAge || 0),
        min_property_age: parseFloat(minHouseAge || houseAge || 0),
        max_property_age: parseFloat(maxHouseAge || houseAge || 0),
        house_total_rooms: parseInt(houseTotalRooms || maxHouseTotalRooms || 0),
        min_house_total_rooms: parseInt(minHouseTotalRooms || 0),
        max_house_total_rooms: parseInt(maxHouseTotalRooms || 0),
        house_total_floors: parseInt(houseTotalFloors || maxFloors || floors || 1),

        villa_bedrooms: parseInt(villaBedrooms || maxBedrooms || 0),
        villa_bathrooms: parseInt(villaBathrooms || maxBathrooms || 0),
        villa_total_floors: parseInt(villaTotalFloors || maxFloors || 1),
        villa_plot_area: parseFloat(villaPlotArea || maxVillaPlotArea || finalA || 0),
        min_villa_plot_area: parseFloat(minVillaPlotArea || villaPlotArea || 0),
        max_villa_plot_area: parseFloat(maxVillaPlotArea || villaPlotArea || 0),
        villa_amenities: villaAmenities,

        apartment_total_floors: parseInt(apartmentTotalFloors || floors || 1),
        apartment_rooms_per_floor: parseInt(apartmentRoomsPerFloor || 0),
        apartment_unit_bedrooms: parseInt(apartmentUnitBedrooms || bedrooms || 0),
        apartment_unit_bathrooms: parseInt(apartmentUnitBathrooms || bathrooms || 0),
        apartment_units_per_floor: parseInt(apartmentUnitsPerFloor || 1),
        apartment_total_flats: parseInt(apartmentTotalFlats || (parseInt(apartmentTotalFloors || 1) * parseInt(apartmentUnitsPerFloor || 1))),
        flat_floor_number: parseInt(flatFloorNumber || 1),

        access_road_type: accessRoadType,
        corner_plot_status: cornerPlotStatus,

        cropping_intensity: croppingIntensity,
        crop_fallow_duration: parseFloat(cropFallowDuration || maxCropFallowDuration || 0),
        min_crop_fallow_duration: parseFloat(minCropFallowDuration || cropFallowDuration || 0),
        max_crop_fallow_duration: parseFloat(maxCropFallowDuration || cropFallowDuration || 0),

        water_pump_count: (propertyType === 'Villa' || propertyType === 'Flat') ? 0 : parseInt(waterPumpCount || maxWaterPumpCount || 0),
        min_water_pump_count: (propertyType === 'Villa' || propertyType === 'Flat') ? 0 : parseInt(minWaterPumpCount || waterPumpCount || 0),
        max_water_pump_count: (propertyType === 'Villa' || propertyType === 'Flat') ? 0 : parseInt(maxWaterPumpCount || waterPumpCount || 0),
        solar_grid_integration: solarGridIntegration,

        parking: parseInt(parking || 1),
        address,
        city,
        state,
        description,
        reason_for_selling: reasonForSelling,
        contact_number: sellerPhone,
        contact_email: sellerEmail,
        whatsapp_number: sellerWhatsapp || sellerPhone,
        images: imageUrls,
        amenities: ['Gym', 'Swimming Pool', 'Security', 'Power Backup'],
        tags: ['Verified', 'Luxury Listing'],
        status,
      };

      if (isEditMode) {
        await api.updateProperty(editId, payload);
        alert('Property updated successfully!');
        navigate(`/properties/${editId}`);
      } else {
        const newProp = await api.createProperty(payload);
        alert('Property listed successfully!');
        const createdId = newProp.id || newProp._id;
        navigate(`/properties/${createdId}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to publish property listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <Sparkles size={14} /> {isEditMode ? 'Property Listing Management' : 'Neural Assistant Property Listing'}
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.375rem', letterSpacing: '-0.025em' }}>
          {isEditMode ? 'Edit Property Listing' : 'Post Your Property Asset'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem', maxWidth: '36rem', margin: '0.5rem auto 0' }}>
          Upload actual photos of your building or apartment. Include your contact details so buyers can reach out directly.
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.875rem 1.25rem', borderRadius: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Section 1: Property Info */}
        <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} style={{ color: '#818cf8' }} /> Property Specifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Property Title</label>
              <input type="text" required placeholder="e.g. Luxurious 3BHK Penthouse with Sea View" value={title} onChange={(e) => setTitle(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                  {t.Field_Property_Type || 'Property Type Selection'}
                </label>
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', backgroundColor: '#0d0925' }}>
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                  <option value="Land">Land / Plot</option>
                  <option value="Commercial">Commercial Property</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Min Area</label>
                <input type="number" required placeholder="e.g. 1200" value={minAreaSqft} onChange={(e) => { setMinAreaSqft(e.target.value); if (!areaSqft) setAreaSqft(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Max Area</label>
                <input type="number" required placeholder="e.g. 1650" value={maxAreaSqft} onChange={(e) => { setMaxAreaSqft(e.target.value); setAreaSqft(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Area Metric Unit</label>
                <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', backgroundColor: '#0d0925' }}>
                  {AREA_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTION: HOUSE SPECIFIC FIELDS */}
            {propertyType === 'House' && (
              <div style={{ backgroundColor: 'rgba(99,102,241,0.06)', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <HomeIcon size={16} /> House Structural Details
                </h4>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>House Type Classification</label>
                  <select value={houseType} onChange={(e) => setHouseType(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', backgroundColor: '#0d0925' }}>
                    {HOUSE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_House_Bedrooms || 'House Bedrooms'}
                    </label>
                    <input type="number" value={houseBedrooms} onChange={(e) => { setHouseBedrooms(e.target.value); setBedrooms(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_House_Bathrooms || 'House Bathrooms'}
                    </label>
                    <input type="number" value={houseBathrooms} onChange={(e) => { setHouseBathrooms(e.target.value); setBathrooms(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_House_Age || 'House Age (Years)'}
                    </label>
                    <input type="number" value={houseAge} onChange={(e) => setHouseAge(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_House_Total_Rooms || 'Grand Total Rooms (Excl. Baths)'}
                    </label>
                    <input type="number" value={houseTotalRooms} onChange={(e) => setHouseTotalRooms(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_House_Total_Floors || 'Total Vertical Floors'}
                    </label>
                    <input type="number" value={houseTotalFloors} onChange={(e) => { setHouseTotalFloors(e.target.value); setFloors(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Parking Spaces</label>
                    <input type="number" value={parking} onChange={(e) => setParking(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: VILLA SPECIFIC FIELDS */}
            {propertyType === 'Villa' && (
              <div style={{ backgroundColor: 'rgba(139,92,246,0.06)', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <HomeIcon size={16} /> Private Villa Specifications
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Villa_Bedrooms || 'Villa Bedrooms'}
                    </label>
                    <input type="number" value={villaBedrooms} onChange={(e) => { setVillaBedrooms(e.target.value); setBedrooms(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Villa_Bathrooms || 'Villa Bathrooms'}
                    </label>
                    <input type="number" value={villaBathrooms} onChange={(e) => { setVillaBathrooms(e.target.value); setBathrooms(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Villa_Total_Floors || 'Villa Levels'}
                    </label>
                    <input type="number" value={villaTotalFloors} onChange={(e) => { setVillaTotalFloors(e.target.value); setFloors(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Villa_Plot_Area || 'Plot Area'}
                    </label>
                    <input type="number" value={villaPlotArea} onChange={(e) => setVillaPlotArea(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Parking Spaces</label>
                    <input type="number" value={parking} onChange={(e) => setParking(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem' }}>
                    {t.Field_Villa_Amenities || 'Villa Private Amenities Checklist'}
                  </label>
                  <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                    {VILLA_AMENITIES_OPTIONS.map((amenity) => {
                      const isSelected = villaAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleVillaAmenity(amenity)}
                          style={{
                            padding: '0.5rem 0.875rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.03)',
                            color: isSelected ? '#c084fc' : '#94a3b8',
                            border: isSelected ? '1px solid rgba(192,132,252,0.45)' : '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                          }}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: APARTMENT BUILDING SPECIFIC FIELDS */}
            {(propertyType === 'Apartment' || propertyType === 'Flat/Apartment') && (
              <div style={{ backgroundColor: 'rgba(56,189,248,0.06)', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Layers size={16} /> 🏢 Apartment Building / Complex Details
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                  An Apartment complex consists of multiple individual flats built across vertical floor levels.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Apartment_Total_Floors || 'Grand Total Vertical Floors in Apartment Building'}
                    </label>
                    <input type="number" value={apartmentTotalFloors} onChange={(e) => setApartmentTotalFloors(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Apartment_Units_Per_Floor || 'Total Individual Flats on a Single Floor'}
                    </label>
                    <input type="number" value={apartmentUnitsPerFloor} onChange={(e) => setApartmentUnitsPerFloor(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Apartment_Total_Flats || 'Total Flats in Apartment Complex'}
                    </label>
                    <input type="number" value={apartmentTotalFlats} onChange={(e) => setApartmentTotalFlats(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Apartment_Rooms_Per_Floor || 'Distribution Count of Rooms Built Across Each Floor Level'}
                    </label>
                    <input type="number" value={apartmentRoomsPerFloor} onChange={(e) => setApartmentRoomsPerFloor(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: FLAT UNIT SPECIFIC FIELDS */}
            {(propertyType === 'Flat' || propertyType === 'Flat/Apartment') && (
              <div style={{ backgroundColor: 'rgba(56,189,248,0.06)', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Layers size={16} /> 🚪 Individual Flat Unit Details
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                  An individual residential unit inside an apartment complex building.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Apartment_Unit_Bedrooms || 'Bedrooms in Flat'}
                    </label>
                    <input type="number" value={apartmentUnitBedrooms} onChange={(e) => { setApartmentUnitBedrooms(e.target.value); setBedrooms(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Apartment_Unit_Bathrooms || 'Bathrooms in Flat'}
                    </label>
                    <input type="number" value={apartmentUnitBathrooms} onChange={(e) => { setApartmentUnitBathrooms(e.target.value); setBathrooms(e.target.value); }} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Flat_Floor_Number || 'Floor Level of Flat'}
                    </label>
                    <input type="number" value={flatFloorNumber} onChange={(e) => setFlatFloorNumber(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Apartment_Total_Floors || 'Total Building Floors'}
                    </label>
                    <input type="number" value={apartmentTotalFloors} onChange={(e) => setApartmentTotalFloors(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Parking Spaces</label>
                    <input type="number" value={parking} onChange={(e) => setParking(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: COMMERCIAL PLOT SPECIFIC FIELDS */}
            {(propertyType === 'Commercial' || propertyType === 'Land' || propertyType === 'Land / Plot') && (
              <div style={{ backgroundColor: 'rgba(234,179,8,0.06)', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(234,179,8,0.25)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#facc15', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Building2 size={16} /> Commercial Plot Infrastructure & Connectivity Options
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                  Select available utility connections and infrastructure feasibility for commercial land/plot development.
                </p>

                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  {COMMERCIAL_PLOT_OPTIONS.map((feature) => {
                    const isSelected = commercialPlotFeatures.includes(feature);
                    return (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleCommercialPlotFeature(feature)}
                        style={{
                          padding: '0.5rem 0.875rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.03)',
                          color: isSelected ? '#facc15' : '#94a3b8',
                          border: isSelected ? '1px solid rgba(234,179,8,0.45)' : '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{feature}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION: AGRICULTURAL CULTIVATION FIELDS */}
            {(propertyType === 'Agricultural Land' || propertyType === 'Land' || propertyType === 'Land / Plot') && (
              <div style={{ backgroundColor: 'rgba(52,211,153,0.06)', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Sprout size={16} /> Agricultural Cultivation Metrics
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Land_Cropping_Intensity || 'Cropping Intensity'}
                    </label>
                    <select value={croppingIntensity} onChange={(e) => setCroppingIntensity(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', backgroundColor: '#0d0925' }}>
                      {CROPPING_INTENSITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Crop_Fallow_Duration || 'Fallow Duration (Years)'}
                    </label>
                    <input type="number" value={cropFallowDuration} onChange={(e) => setCropFallowDuration(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: ROAD & ACCESS FIELDS */}
            <div style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Compass size={16} style={{ color: '#38bdf8' }} /> Road & Access Specifications
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                    {t.Field_Access_Road_Type || 'Access Road Classification'}
                  </label>
                  <select value={accessRoadType} onChange={(e) => setAccessRoadType(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', backgroundColor: '#0d0925' }}>
                    {ACCESS_ROAD_TYPES.map((road) => (
                      <option key={road} value={road}>{road}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                    {t.Field_Corner_Plot_Status || 'Corner Plot (Dual Road Access)'}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setCornerPlotStatus(true)}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                        backgroundColor: cornerPlotStatus ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
                        color: cornerPlotStatus ? '#38bdf8' : '#94a3b8',
                        border: cornerPlotStatus ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setCornerPlotStatus(false)}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                        backgroundColor: !cornerPlotStatus ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)',
                        color: !cornerPlotStatus ? '#fb7185' : '#94a3b8',
                        border: !cornerPlotStatus ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: INFRASTRUCTURE & UTILITY FIELDS (Hidden for Flat as requested) */}
            {propertyType !== 'Flat' && (
              <div style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Zap size={16} style={{ color: '#facc15' }} /> Utility & Infrastructure Integration
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: (propertyType === 'Villa' || propertyType === 'Flat' || propertyType === 'Apartment' || propertyType === 'Commercial') ? '1fr' : 'repeat(2, 1fr)', gap: '1rem', alignItems: 'center' }}>
                  {!(propertyType === 'Villa' || propertyType === 'Flat' || propertyType === 'Apartment' || propertyType === 'Commercial') && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                        {t.Field_Water_Pump_Count || 'Functional Irrigation Water Pumps / Borewells'}
                      </label>
                      <input type="number" value={waterPumpCount} onChange={(e) => setWaterPumpCount(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>
                      {t.Field_Solar_Grid_Integration || 'Operational Solar Power Infrastructure'}
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setSolarGridIntegration(true)}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          backgroundColor: solarGridIntegration ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.03)',
                          color: solarGridIntegration ? '#facc15' : '#94a3b8',
                          border: solarGridIntegration ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setSolarGridIntegration(false)}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          backgroundColor: !solarGridIntegration ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)',
                          color: !solarGridIntegration ? '#fb7185' : '#94a3b8',
                          border: !solarGridIntegration ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Street Address</label>
                <input type="text" required placeholder="Building / Street Name" value={address} onChange={(e) => setAddress(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>City</label>
                <input type="text" required placeholder="e.g. Mumbai" value={city} onChange={(e) => setCity(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>State</label>
                <input type="text" required placeholder="e.g. Maharashtra" value={state} onChange={(e) => setState(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Upload Pictures of Building/Property */}
        <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={18} style={{ color: '#818cf8' }} /> Building & Room Photos
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Upload pictures directly from your device, or paste image URLs.
          </p>

          {/* Upload Dropzone */}
          <div style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '1rem', padding: '1.5rem', backgroundColor: 'rgba(99,102,241,0.03)', textAlign: 'center', marginBottom: '1.25rem', position: 'relative' }}>
            <input type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
            <Upload size={28} style={{ color: '#818cf8', margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0' }}>Click to Choose Image Files</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Supports PNG, JPG, JPEG, WebP photos</div>
          </div>

          {/* URL Input fallback */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input type="url" placeholder="Or paste image web link (https://...)" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', flex: 1 }} />
            <button type="button" onClick={handleAddUrl} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem' }}>
              <Plus size={16} /> Add Link
            </button>
          </div>

          {/* Uploaded Images Preview Gallery */}
          {imageUrls.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Attached Photos ({imageUrls.length}):</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '16/10', borderRadius: '0.625rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: '#1e293b' }}>
                    <img src={url} alt={`Upload ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => handleRemoveImage(i)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fb7185', border: 'none', padding: '0.25rem', cursor: 'pointer', display: 'flex' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Pricing & AI Predictor */}
        <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={16} /> Expected Price Range (INR)
            </label>
            <button type="button" onClick={handleAiValuation} disabled={isAiPriceLoading} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem', borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8' }}>
              {isAiPriceLoading ? 'Analyzing Valuation...' : '⚡ Calculate AI Price Benchmark'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>Min Expected Price (INR)</label>
              <input type="number" required placeholder="e.g. 15000000" value={minExpectedPrice} onChange={(e) => { setMinExpectedPrice(e.target.value); if (!expectedPrice) setExpectedPrice(e.target.value); }} className="glass-input" style={{ fontSize: '1rem', fontWeight: 800 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>Max Expected Price (INR)</label>
              <input type="number" required placeholder="e.g. 18000000" value={maxExpectedPrice} onChange={(e) => { setMaxExpectedPrice(e.target.value); setExpectedPrice(e.target.value); }} className="glass-input" style={{ fontSize: '1rem', fontWeight: 800 }} />
            </div>
          </div>
          {aiValuationResult && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>
              AI Estimated Market Valuation: INR {Number(aiValuationResult.predicted_market_value).toLocaleString('en-IN')} (Confidence: {aiValuationResult.confidence_percentage}%)
            </div>
          )}
        </div>

        {/* Section 4: Narrative Description */}
        <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>Property Description</label>
            <button type="button" onClick={handleGenerateAiDescription} disabled={isAiDescLoading} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}>
              {isAiDescLoading ? 'Drafting Copy...' : '✨ AI Copywriter Text'}
            </button>
          </div>
          <textarea rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem', lineHeight: 1.625 }} placeholder="Describe the interior, architectural highlights, neighborhood, and nearby landmarks..." />
        </div>

        {/* Section 5: Seller Contact Details for Buyer Interaction */}
        <div className="glass-panel" style={{ borderRadius: '1.25rem', padding: '1.75rem', backgroundColor: 'rgba(13,9,37,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} style={{ color: '#818cf8' }} /> Seller Contact Info (For Buyers to Reach Out)
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Buyers viewing your property will be provided these details to contact you directly.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Seller Full Name</label>
              <input type="text" required placeholder="e.g. Manikanta" value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Mobile / Phone Number</label>
              <input type="tel" required placeholder="+91 9876543210" value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Email Address (Gmail)</label>
              <input type="email" required placeholder="name@gmail.com" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>WhatsApp Number</label>
              <input type="tel" placeholder="+91 9876543210" value={sellerWhatsapp} onChange={(e) => setSellerWhatsapp(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Reason for Selling (optional)</label>
            <input type="text" placeholder="e.g. Moving to another city / Upgrading to larger villa" value={reasonForSelling} onChange={(e) => setReasonForSelling(e.target.value)} className="glass-input" style={{ fontSize: '0.875rem' }} />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 800, borderRadius: '0.875rem' }}>
          {isSubmitting ? 'Publishing Listing...' : 'Publish Property Listing'}
        </button>
      </form>
    </div>
  );
}
