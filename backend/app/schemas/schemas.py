from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "buyer"  # guest, buyer, seller, admin
    phone_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    profile_image_url: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Amenities & Tags
class PropertyAmenityBase(BaseModel):
    amenity_name: str

class PropertyAmenityOut(PropertyAmenityBase):
    id: str
    class Config:
        from_attributes = True

class PropertyTagBase(BaseModel):
    tag_name: str

class PropertyTagOut(PropertyTagBase):
    id: str
    class Config:
        from_attributes = True

# Property Image Schemas
class PropertyImageBase(BaseModel):
    image_url: str

class PropertyImageCreate(PropertyImageBase):
    analyzed_cracks: Optional[bool] = False
    analyzed_leakage: Optional[bool] = False
    analyzed_paint: Optional[str] = "Good"
    analyzed_flooring: Optional[str] = "Good"
    analyzed_garden: Optional[str] = "Good"
    analyzed_roof: Optional[str] = "Good"
    condition_score: Optional[float] = 10.0

class PropertyImageOut(PropertyImageCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Property Schemas
class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: str  # House, Villa, Apartment, Flat, Land, Farm Land, Commercial
    expected_price: float
    original_price: Optional[float] = None
    negotiable: bool = True
    area_sqft: float
    bedrooms: int = 0
    bathrooms: int = 0
    floors: int = 1
    parking: int = 0
    year_built: Optional[int] = None
    ownership_type: Optional[str] = None
    property_age: Optional[int] = None
    furnished_status: str = "Unfurnished"
    address: str
    city: str
    state: str
    country: str = "India"
    lat: Optional[float] = None
    lng: Optional[float] = None
    water_supply: Optional[str] = None
    electricity: Optional[str] = None
    road_access: Optional[str] = None
    nearby_schools: Optional[str] = None
    nearby_hospitals: Optional[str] = None
    reason_for_selling: Optional[str] = None
    contact_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    contact_email: Optional[str] = None

class PropertyCreate(PropertyBase):
    images: List[str] = []
    amenities: List[str] = []
    tags: List[str] = []

class PropertyOut(PropertyBase):
    id: str
    seller_id: str
    status: str
    is_flagged: bool
    neighborhood_score: float
    safety_score: float
    family_score: float
    investment_score: float
    overall_condition_score: float
    fraud_score: float
    created_at: datetime
    updated_at: datetime
    images: List[PropertyImageOut] = []
    amenities: List[PropertyAmenityOut] = []
    tags: List[PropertyTagOut] = []
    seller: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None

class ReviewCreate(ReviewBase):
    property_id: str
    reviewee_id: str

class ReviewOut(ReviewBase):
    id: str
    property_id: str
    reviewer_id: str
    reviewee_id: str
    verified_buyer: bool
    verified_seller: bool
    created_at: datetime
    reviewer: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Scheduled Visit Schemas
class ScheduledVisitCreate(BaseModel):
    property_id: str
    visit_date: datetime
    notes: Optional[str] = None

class ScheduledVisitOut(BaseModel):
    id: str
    property_id: str
    buyer_id: str
    visit_date: datetime
    status: str
    notes: Optional[str] = None
    created_at: datetime
    property: Optional[PropertyOut] = None
    buyer: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Offer Schemas
class OfferCreate(BaseModel):
    property_id: str
    offer_amount: float
    notes: Optional[str] = None

class OfferCounter(BaseModel):
    counter_amount: float
    notes: Optional[str] = None

class OfferOut(BaseModel):
    id: str
    property_id: str
    buyer_id: str
    offer_amount: float
    status: str
    counter_amount: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    property: Optional[PropertyOut] = None
    buyer: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessageCreate(BaseModel):
    property_id: Optional[str] = None
    receiver_id: str
    message_text: str
    image_url: Optional[str] = None

class ChatMessageOut(BaseModel):
    id: str
    property_id: Optional[str] = None
    sender_id: str
    receiver_id: str
    message_text: str
    image_url: Optional[str] = None
    read_receipt: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Saved Search
class SavedSearchCreate(BaseModel):
    name: str
    filters_json: str

class SavedSearchOut(BaseModel):
    id: str
    user_id: str
    name: str
    filters_json: str
    created_at: datetime

    class Config:
        from_attributes = True

# AI Feature Payload / Response Schemas

class AIDescGenRequest(BaseModel):
    property_type: str
    bedrooms: int
    bathrooms: int
    area_sqft: float
    city: str
    amenities: List[str] = []
    image_urls: List[str] = []

class AIDescGenResponse(BaseModel):
    generated_description: str

class AIImageAnalysisRequest(BaseModel):
    image_urls: List[str]

class AIImageAnalysisReport(BaseModel):
    cracks_detected: bool
    leakage_detected: bool
    paint_condition: str  # Good, Moderate, Poor
    flooring_condition: str  # Good, Moderate, Poor
    garden_condition: str  # Good, Moderate, Poor, N/A
    roof_condition: str  # Good, Moderate, Poor
    overall_score: float  # out of 10.0
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]

class AIValuationRequest(BaseModel):
    location: str
    area_sqft: float
    bedrooms: int
    bathrooms: int
    age: int
    amenities: List[str]
    nearby_facilities: List[str]

class AIValuationResponse(BaseModel):
    predicted_market_value: float
    confidence_percentage: float
    explanation: str

class AIFraudResponse(BaseModel):
    fraud_score: float  # 0 to 100
    is_suspicious: bool
    reasons: List[str]

class AIChatRequest(BaseModel):
    property_id: str
    question: str
    chat_history: Optional[List[Dict[str, str]]] = []

class AIChatResponse(BaseModel):
    answer: str

class AIInteriorImprovementResponse(BaseModel):
    paint_suggestions: List[str]
    lighting_suggestions: List[str]
    furniture_placement_suggestions: List[str]
    kitchen_improvements: List[str]
    bathroom_improvements: List[str]
    estimated_renovation_cost: float
    explanation: str

class AINeighborhoodResponse(BaseModel):
    neighborhood_score: float
    safety_score: float
    family_score: float
    investment_score: float
    pros: List[str]
    cons: List[str]

class AIInvestmentResponse(BaseModel):
    roi_percentage: float
    rental_yield: float
    future_appreciation_5yr: float
    investment_rating: str  # AAA, AA, A, B, C
    explanation: str

class AINegotiationRequest(BaseModel):
    property_id: str
    buyer_offer: float

class AINegotiationResponse(BaseModel):
    counter_offer: float
    market_average: float
    negotiation_tips: List[str]
    evaluation_text: str
