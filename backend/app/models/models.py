import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="buyer")  # admin, seller, buyer, guest
    phone_number = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    properties = relationship("Property", back_populates="seller", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    saved_searches = relationship("SavedSearch", back_populates="user", cascade="all, delete-orphan")
    visits = relationship("ScheduledVisit", back_populates="buyer", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="buyer", cascade="all, delete-orphan")
    reviews_written = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="Review.reviewee_id", back_populates="reviewee")

class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    seller_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    property_type = Column(String, nullable=False)  # House, Villa, Apartment, Flat, Land, Farm Land, Commercial
    
    # Financials
    expected_price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    negotiable = Column(Boolean, default=True)
    
    # Features
    area_sqft = Column(Float, nullable=False)
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    floors = Column(Integer, default=1)
    parking = Column(Integer, default=0)
    year_built = Column(Integer, nullable=True)
    ownership_type = Column(String, nullable=True)  # Freehold, Leasehold, Power of Attorney, Co-Operative Society
    property_age = Column(Integer, nullable=True)
    furnished_status = Column(String, default="Unfurnished")  # Furnished, Semi-Furnished, Unfurnished
    
    # Location
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    country = Column(String, default="India")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    # Amenities & Infrastructure
    water_supply = Column(String, nullable=True)
    electricity = Column(String, nullable=True)
    road_access = Column(String, nullable=True)
    nearby_schools = Column(String, nullable=True)
    nearby_hospitals = Column(String, nullable=True)
    
    # Seller Info / Reason
    reason_for_selling = Column(Text, nullable=True)
    contact_number = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    
    # Status & Moderation
    status = Column(String, default="pending")  # pending, approved, rejected, sold
    is_flagged = Column(Boolean, default=False)
    
    # AI Analysis & Metrics
    neighborhood_score = Column(Float, default=0.0)
    safety_score = Column(Float, default=0.0)
    family_score = Column(Float, default=0.0)
    investment_score = Column(Float, default=0.0)
    overall_condition_score = Column(Float, default=0.0)
    fraud_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    seller = relationship("User", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")
    amenities = relationship("PropertyAmenity", back_populates="property", cascade="all, delete-orphan")
    tags = relationship("PropertyTag", back_populates="property", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    visits = relationship("ScheduledVisit", back_populates="property", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="property", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="property", cascade="all, delete-orphan")

class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String, nullable=False)
    
    # AI image features detected
    analyzed_cracks = Column(Boolean, default=False)
    analyzed_leakage = Column(Boolean, default=False)
    analyzed_paint = Column(String, default="Good") # Good, Moderate, Poor
    analyzed_flooring = Column(String, default="Good") # Good, Moderate, Poor
    analyzed_garden = Column(String, default="Good") # Good, Moderate, Poor, N/A
    analyzed_roof = Column(String, default="Good") # Good, Moderate, Poor
    condition_score = Column(Float, default=10.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    property = relationship("Property", back_populates="images")

class PropertyAmenity(Base):
    __tablename__ = "property_amenities"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    amenity_name = Column(String, nullable=False)

    # Relationships
    property = relationship("Property", back_populates="amenities")

class PropertyTag(Base):
    __tablename__ = "property_tags"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    tag_name = Column(String, nullable=False)

    # Relationships
    property = relationship("Property", back_populates="tags")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorites")

class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    filters_json = Column(Text, nullable=False)  # JSON representation of parameters
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_searches")

class ScheduledVisit(Base):
    __tablename__ = "scheduled_visits"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    visit_date = Column(DateTime, nullable=False)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    property = relationship("Property", back_populates="visits")
    buyer = relationship("User", back_populates="visits")

class Offer(Base):
    __tablename__ = "offers"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offer_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, accepted, rejected, countered
    counter_amount = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    property = relationship("Property", back_populates="offers")
    buyer = relationship("User", back_populates="offers")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id", ondelete="SET NULL"), nullable=True)
    sender_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message_text = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    read_receipt = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewee_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    verified_buyer = Column(Boolean, default=False)
    verified_seller = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    property = relationship("Property", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_written")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="reviews_received")

class AiLog(Base):
    __tablename__ = "ai_logs"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    feature_name = Column(String, nullable=False)
    prompt = Column(Text, nullable=True)
    response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
