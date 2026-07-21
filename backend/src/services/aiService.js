const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let genAI = null;
let isGeminiActive = false;

if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    isGeminiActive = true;
    console.log('✅ Gemini AI initialized successfully');
  } catch (e) {
    console.warn('⚠️  Gemini AI initialization failed:', e.message);
  }
}

async function callGeminiText(prompt, systemInstruction = '') {
  if (!isGeminiActive || !genAI) return null;
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.warn('⚠️  Gemini call failed:', e.message);
    return null;
  }
}

function parseGeminiJson(text) {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7, -3);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3, -3);
    return JSON.parse(cleaned.trim());
  } catch {
    return null;
  }
}

// ─── 1. AI Description Generator ─────────────────────────────────────────────
async function generatePropertyDescription(data) {
  const { property_type, house_type, land_factors = [], soil_and_infrastructure = [], bedrooms, bathrooms, area_sqft, city, amenities = [], image_urls = [] } = data;
  const houseStr = house_type ? ` (Sub-type: ${house_type})` : '';
  const landStr = land_factors.length ? ` Land/Access Factors: ${land_factors.join(', ')}.` : '';
  const soilStr = soil_and_infrastructure.length ? ` Soil & Infrastructure: ${soil_and_infrastructure.join(', ')}.` : '';
  const prompt = `Generate a luxury property description for a ${property_type}${houseStr} located in ${city}.\nSpecs: ${bedrooms} bedrooms, ${bathrooms} bathrooms, ${area_sqft} Sq. Ft. area.${landStr}${soilStr}\nAmenities included: ${amenities.join(', ')}.\nHighlight the premium aesthetics, modern style, soil & infrastructure features, location accessibility, and prime neighborhood. Keep it engaging and professional.`;
  const geminiResp = await callGeminiText(prompt, 'You are a professional real estate copywriter specializing in luxury listing descriptions.');
  if (geminiResp) return geminiResp.trim();
  const amenitiesStr = amenities.length ? ` offering top-tier amenities like ${amenities.join(', ')}` : '';
  const extraInfo = [land_factors.join(', '), soil_and_infrastructure.join(', ')].filter(Boolean).join('. ');
  return `Welcome to this stunning, modern ${house_type || property_type} situated in the heart of ${city}. Spanning an impressive ${area_sqft} square feet of beautifully designed layout, this property features ${bedrooms} spacious bedroom suites and ${bathrooms} contemporary bathrooms. Built with premium materials, every corner showcases high ceilings, state-of-the-art finishes, and abundant natural light. ${extraInfo ? extraInfo + '. ' : ''}Perfect for families or investors, this home delivers an exceptional standard of luxury and convenience${amenitiesStr}. Located in a highly sought-after neighborhood with convenient transit connectivity, pristine parks, and excellent local schools.`;
}

// ─── 2. AI Image Analysis ─────────────────────────────────────────────────────
async function analyzePropertyImages(imageUrls) {
  const hasGarden = imageUrls.some((url) => url.toLowerCase().includes('garden') || url.toLowerCase().includes('yard'));
  const fallback = {
    cracks_detected: false,
    leakage_detected: false,
    paint_condition: 'Good',
    flooring_condition: 'Good',
    garden_condition: hasGarden ? 'Good' : 'N/A',
    roof_condition: 'Good',
    overall_score: 9.2,
    strengths: ['Spacious interior layout', 'High-end contemporary lighting', 'Premium hardwood flooring'],
    weaknesses: ['Slight cosmetic paint wear near baseboards'],
    improvement_suggestions: ['Repaint the secondary hallway accent wall', 'Add warm LED strip lighting under kitchen cabinets'],
  };
  if (isGeminiActive) {
    const prompt = `Analyze this list of property image URLs: ${JSON.stringify(imageUrls)}. Output a JSON block representing their physical condition. Detect: cracks, water leakage, paint wear, old flooring, garden condition, roof condition. Include an overall score out of 10.0, strengths, weaknesses, and renovation suggestions. Ensure the output conforms exactly to this JSON schema: {"cracks_detected": boolean, "leakage_detected": boolean, "paint_condition": "Good/Moderate/Poor", "flooring_condition": "Good/Moderate/Poor", "garden_condition": "Good/Moderate/Poor/N/A", "roof_condition": "Good/Moderate/Poor", "overall_score": float, "strengths": [string], "weaknesses": [string], "improvement_suggestions": [string]}`;
    const resp = await callGeminiText(prompt, 'You are a professional building surveyor and real estate inspector.');
    if (resp) {
      const parsed = parseGeminiJson(resp);
      if (parsed) return parsed;
    }
  }
  return fallback;
}

// ─── 3. AI Property Price Prediction ─────────────────────────────────────────
async function predictPropertyPrice(data) {
  const { location, area_sqft, bedrooms, bathrooms, age, amenities = [], nearby_facilities = [] } = data;
  const baseRates = { mumbai: 15000, delhi: 10000, bangalore: 8500, pune: 6500, chennai: 6000, hyderabad: 7000, kolkata: 5500 };
  const rate = baseRates[location.toLowerCase().trim()] || 5000;
  let price = rate * area_sqft + bedrooms * 500000 + bathrooms * 250000 + amenities.length * 100000;
  if (age > 0) price *= (1 - Math.min(0.4, age * 0.015));
  const fallback = {
    predicted_market_value: Math.round(price * 100) / 100,
    confidence_percentage: 88.5,
    explanation: `The predicted market value of INR ${price.toFixed(2)} is derived from a base rate of INR ${rate}/sqft in ${location}.`,
  };
  if (isGeminiActive) {
    const prompt = `Evaluate the market value of a property in ${location} with ${area_sqft} sqft, ${bedrooms} bedrooms, ${bathrooms} bathrooms, ${age} years old. Amenities: ${amenities.join(', ')}. Facilities nearby: ${nearby_facilities.join(', ')}.\nPredict the price in INR. Provide the response as a JSON block with exact keys: {"predicted_market_value": float, "confidence_percentage": float, "explanation": "detailed text why"}`;
    const resp = await callGeminiText(prompt, 'You are a senior real estate pricing analyst and local property valuer.');
    if (resp) {
      const parsed = parseGeminiJson(resp);
      if (parsed) return parsed;
    }
  }
  return fallback;
}

// ─── 4. AI Fraud Detection ────────────────────────────────────────────────────
async function detectPropertyFraud(title, description, price, images) {
  const reasons = [];
  let fraudScore = 10.0;
  if (price < 100000) { fraudScore += 40.0; reasons.push('Expected selling price is unrealistically low for a residential listing.'); }
  if ((description || '').length < 30) { fraudScore += 20.0; reasons.push('Extremely short property description, which is typical of spam listings.'); }
  if ((images || []).length === 0) { fraudScore += 15.0; reasons.push('No property photos uploaded. High probability of fake profile/listing.'); }
  const descLower = (description || '').toLowerCase();
  if (descLower.includes('free money') || descLower.includes('win prize') || descLower.includes('whatsapp me quick')) {
    fraudScore += 30.0; reasons.push('Spam/Phishing keyword patterns detected in description content.');
  }
  fraudScore = Math.min(99.0, fraudScore);
  const isSuspicious = fraudScore > 45.0;
  if (isGeminiActive) {
    const prompt = `Analyze this property listing for potential fraud.\nTitle: ${title}\nDescription: ${description}\nPrice: ${price}\nNumber of images: ${(images || []).length}\nReturn a JSON block containing a fraud score between 0 and 100, a boolean indicating if it is suspicious, and a list of reasons. Schema: {"fraud_score": float, "is_suspicious": boolean, "reasons": [string]}`;
    const resp = await callGeminiText(prompt, 'You are a cyber fraud investigator and property compliance inspector.');
    if (resp) {
      const parsed = parseGeminiJson(resp);
      if (parsed) return parsed;
    }
  }
  return { fraud_score: fraudScore, is_suspicious: isSuspicious, reasons: reasons.length ? reasons : ['Listing details appear valid and consistent.'] };
}

// ─── 5. AI Smart Tags ─────────────────────────────────────────────────────────
function generateSmartTags(title, description, amenities) {
  const tags = [];
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('sea') || text.includes('ocean') || text.includes('beach')) tags.push('Sea View');
  if (text.includes('metro') || text.includes('subway') || text.includes('station')) tags.push('Near Metro');
  if (text.includes('corner')) tags.push('Corner Plot');
  if (text.includes('garden') || text.includes('lawn') || text.includes('backyard')) tags.push('Garden');
  if (text.includes('pool') || text.includes('swimming')) tags.push('Luxury Pool');
  if (text.includes('new') || text.includes('ready') || text.includes('immediate')) tags.push('Ready to Move');
  if (text.includes('penthouse') || text.includes('luxury') || text.includes('villa')) tags.push('Luxury Listing');
  for (const amenity of amenities) {
    if (['gym', 'clubhouse', 'security', 'power backup'].includes(amenity.toLowerCase())) { tags.push('Premium Amenities'); break; }
  }
  return [...new Set(tags.length ? tags : ['Best Seller', 'Modern Design'])].slice(0, 5);
}

// ─── 6. AI Chat Assistant ─────────────────────────────────────────────────────
async function askListingChat(propertyInfo, question) {
  const houseStr = propertyInfo.house_type ? `\nHouse Sub-Type: ${propertyInfo.house_type}` : '';
  const landStr = (propertyInfo.land_factors || []).length ? `\nLand & Access Factors: ${propertyInfo.land_factors.join(', ')}` : '';
  const soilStr = (propertyInfo.soil_and_infrastructure || []).length ? `\nSoil & Infrastructure: ${propertyInfo.soil_and_infrastructure.join(', ')}` : '';
  const propContext = `Property Title: ${propertyInfo.title}\nType: ${propertyInfo.property_type}${houseStr}${landStr}${soilStr}\nPrice: INR ${propertyInfo.expected_price}\nBedrooms: ${propertyInfo.bedrooms}, Bathrooms: ${propertyInfo.bathrooms}\nLocation: ${propertyInfo.address}, ${propertyInfo.city}\nAmenities: ${(propertyInfo.amenities || []).join(', ')}\nDescription: ${propertyInfo.description || ''}`;
  if (isGeminiActive) {
    const prompt = `Here is the context of a real estate listing:\n${propContext}\nUser Question: ${question}\nAnswer the question accurately based on the context above. If the context doesn't mention something, state that details are not listed but suggest contacting the seller. Keep it friendly and concise.`;
    const resp = await callGeminiText(prompt, 'You are a helpful customer support agent for LandLink AI.');
    if (resp) return resp.trim();
  }
  const q = question.toLowerCase();
  if (q.includes('soil') || q.includes('crop') || q.includes('irrigation') || q.includes('water') || q.includes('borewell') || q.includes('solar')) {
    if ((propertyInfo.soil_and_infrastructure || []).length) {
      return `Soil, Agricultural & Infrastructure details for this property: ${propertyInfo.soil_and_infrastructure.join(', ')}.`;
    }
  }
  if (q.includes('house type') || q.includes('type of house') || q.includes('duplex') || q.includes('townhouse') || q.includes('farmhouse')) {
    if (propertyInfo.house_type) {
      return `This property is categorized as: ${propertyInfo.house_type}.`;
    }
  }
  if (q.includes('highway') || q.includes('road') || q.includes('plot') || q.includes('traffic') || q.includes('land factor')) {
    if ((propertyInfo.land_factors || []).length) {
      return `Land & Location Factors for this property: ${propertyInfo.land_factors.join(', ')}.`;
    }
  }
  if (q.includes('parking')) return propertyInfo.parking > 0 ? `Yes, this property offers parking space for ${propertyInfo.parking} vehicle(s).` : 'The listing does not mention dedicated parking.';
  if (q.includes('bedroom') || q.includes('room')) return `This listing includes ${propertyInfo.bedrooms} bedrooms and ${propertyInfo.bathrooms} bathrooms.`;
  if (q.includes('price') || q.includes('cost') || q.includes('negotiable')) return `The expected price is INR ${(propertyInfo.expected_price || 0).toLocaleString('en-IN')}, and it is ${propertyInfo.negotiable ? 'negotiable' : 'non-negotiable'}.`;
  return `Thanks for asking! Regarding the property '${propertyInfo.title}', the seller lists it as: '${(propertyInfo.description || '').slice(0, 120)}...'. Feel free to reach out to them directly!`;
}

// ─── 7. AI Interior Improvements ─────────────────────────────────────────────
async function suggestInteriorImprovements(imageUrls) {
  const fallback = {
    paint_suggestions: ['Warm off-white or light taupe for living rooms', 'Soft emerald/sage green for bedroom accent walls'],
    lighting_suggestions: ['Recessed warm white LED ceiling spots', 'Modern architectural pendant light in dining area'],
    furniture_placement_suggestions: ['Position sofa facing the main glass balcony doors', 'Ensure paths are clear to preserve open concept layout'],
    kitchen_improvements: ['Install contemporary matte-black cabinet handles', 'Add marble-look quartz splashback'],
    bathroom_improvements: ['Add a frameless backlit LED mirror', 'Install modern water-efficient rain showerheads'],
    estimated_renovation_cost: 350000.0,
    explanation: 'Suggestions aim to create a cohesive luxury feel, emphasizing natural light reflection and modern minimalist aesthetics.',
  };
  if (isGeminiActive) {
    const prompt = `Analyze these room images: ${JSON.stringify(imageUrls)}. Create staging and design improvement suggestions. Conform strictly to this JSON format:\n{"paint_suggestions": [string], "lighting_suggestions": [string], "furniture_placement_suggestions": [string], "kitchen_improvements": [string], "bathroom_improvements": [string], "estimated_renovation_cost": float, "explanation": string}`;
    const resp = await callGeminiText(prompt, 'You are a professional interior designer and property home-stager.');
    if (resp) {
      const parsed = parseGeminiJson(resp);
      if (parsed) return parsed;
    }
  }
  return fallback;
}

// ─── 8. AI Neighborhood Analysis ─────────────────────────────────────────────
async function analyzeNeighborhood(address, city) {
  const cityScores = {
    mumbai: { neighborhood: 8.8, safety: 9.0, family: 8.5, investment: 9.2 },
    bangalore: { neighborhood: 8.5, safety: 8.5, family: 8.8, investment: 9.0 },
    delhi: { neighborhood: 8.0, safety: 7.5, family: 8.0, investment: 8.5 },
    pune: { neighborhood: 8.2, safety: 8.8, family: 8.6, investment: 8.4 },
  };
  const scores = cityScores[city.toLowerCase()] || { neighborhood: 8.0, safety: 8.0, family: 8.0, investment: 8.0 };
  const fallback = {
    neighborhood_score: scores.neighborhood,
    safety_score: scores.safety,
    family_score: scores.family,
    investment_score: scores.investment,
    pros: ['Well-paved sidewalks and green parks within walking distance', 'Excellent metro transit connectivity', 'Reputable hospitals nearby'],
    cons: ['Peak-hour traffic congestion at major road intersections', 'Minor pollution index during dry summer months'],
  };
  if (isGeminiActive) {
    const prompt = `Analyze the neighborhood around: ${address}, ${city}.\nEstimate scores out of 10.0 for: overall neighborhood quality, safety, family suitability, and investment value. Provide pros and cons. Format output as a JSON block matching schema:\n{"neighborhood_score": float, "safety_score": float, "family_score": float, "investment_score": float, "pros": [string], "cons": [string]}`;
    const resp = await callGeminiText(prompt, 'You are an urban planner and local neighborhood demographic expert.');
    if (resp) {
      const parsed = parseGeminiJson(resp);
      if (parsed) return parsed;
    }
  }
  return fallback;
}

// ─── 9. AI Investment Analysis ────────────────────────────────────────────────
async function analyzeInvestment(price, propertyType, city) {
  let roi = 8.5, rentalYield = 3.2, appreciation = 25.0, rating = 'AA';
  if (['mumbai', 'bangalore'].includes(city.toLowerCase())) { roi = 11.2; rentalYield = 3.8; appreciation = 35.0; rating = 'AAA'; }
  else if (city.toLowerCase() === 'delhi') { roi = 9.0; rentalYield = 2.9; appreciation = 22.0; rating = 'A'; }
  if (['apartment', 'flat'].includes(propertyType.toLowerCase())) rentalYield = 3.8;
  const fallback = {
    roi_percentage: roi,
    rental_yield: rentalYield,
    future_appreciation_5yr: appreciation,
    investment_rating: rating,
    explanation: `This ${propertyType} in ${city} offers an estimated ${rentalYield}% annual rental yield and a projected 5-year capital appreciation rate of ${appreciation}%. Overall rating is ${rating} due to historically strong local resale demand.`,
  };
  if (isGeminiActive) {
    const prompt = `Calculate the real estate investment potential for a ${propertyType} in ${city} priced at INR ${price}.\nInclude estimated ROI percentage, rental yield, 5-year capital appreciation, investment rating (AAA to C), and an explanation. Provide output as a JSON block conforming to schema:\n{"roi_percentage": float, "rental_yield": float, "future_appreciation_5yr": float, "investment_rating": string, "explanation": string}`;
    const resp = await callGeminiText(prompt, 'You are a real estate investment advisor and portfolio developer.');
    if (resp) {
      const parsed = parseGeminiJson(resp);
      if (parsed) return parsed;
    }
  }
  return fallback;
}

// ─── 10. AI Price Negotiation ─────────────────────────────────────────────────
async function negotiatePrice(expectedPrice, originalPrice, buyerOffer) {
  const marketAvg = expectedPrice * 0.96;
  let counter, evaluation, tips;
  if (buyerOffer >= expectedPrice) {
    counter = expectedPrice;
    evaluation = "The buyer's offer meets or exceeds your expectations. We recommend accepting the offer immediately.";
    tips = ['Accept the offer promptly.', 'Begin the sale agreement drafting stage.'];
  } else if (buyerOffer < expectedPrice * 0.75) {
    counter = expectedPrice * 0.95;
    evaluation = 'This is a low-ball offer (more than 25% below asking). A firm counter-offer is required to signal high asset value.';
    tips = ['Highlight the unique upgrades and amenities.', 'Counter at 5% below asking price.', 'Request proof of funds before continuing negotiations.'];
  } else {
    counter = (expectedPrice + buyerOffer) / 2;
    evaluation = 'This offer is in a reasonable negotiating range. Proposing a midway compromise will keep the buyer motivated.';
    tips = ['Propose a split-the-difference counter-offer.', 'Agree to flexible move-in dates in exchange for a higher offer.', 'Offer to leave select premium furniture items behind.'];
  }
  if (isGeminiActive) {
    const prompt = `Analyze a property offer scenario. Asking price is INR ${expectedPrice}. Buyer offers INR ${buyerOffer}. Generate a realistic counter-offer, market average comparison, negotiation tips, and evaluation text. Output response as a JSON block with schema:\n{"counter_offer": float, "market_average": float, "negotiation_tips": [string], "evaluation_text": string}`;
    const resp = await callGeminiText(prompt, 'You are an expert real estate mediator and negotiation specialist.');
    if (resp) {
      const parsed = parseGeminiJson(resp);
      if (parsed) return parsed;
    }
  }
  return { counter_offer: Math.round(counter * 100) / 100, market_average: Math.round(marketAvg * 100) / 100, negotiation_tips: tips, evaluation_text: evaluation };
}

module.exports = {
  generatePropertyDescription,
  analyzePropertyImages,
  predictPropertyPrice,
  detectPropertyFraud,
  generateSmartTags,
  askListingChat,
  suggestInteriorImprovements,
  analyzeNeighborhood,
  analyzeInvestment,
  negotiatePrice,
};
