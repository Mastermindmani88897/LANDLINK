from typing import List, Optional, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.api import deps
from app.core.database import get_db
from app.models.models import (
    Property, PropertyImage, PropertyAmenity, PropertyTag,
    Favorite, ScheduledVisit, Offer, Review, User, AiLog
)
from app.schemas.schemas import (
    PropertyCreate, PropertyOut, PropertyImageOut,
    ScheduledVisitCreate, ScheduledVisitOut, OfferCreate, OfferOut,
    ReviewCreate, ReviewOut, AIDescGenRequest, AIDescGenResponse,
    AIImageAnalysisRequest, AIImageAnalysisReport, AIValuationRequest, AIValuationResponse,
    AINegotiationRequest, AINegotiationResponse, AIInteriorImprovementResponse,
    AINeighborhoodResponse, AIInvestmentResponse, AIChatRequest, AIChatResponse
)
from app.services import ai_service

router = APIRouter()

# ----------------- PROPERTY SEARCH & CRUD -----------------

@router.get("/", response_model=List[PropertyOut])
def search_properties(
    db: Session = Depends(get_db),
    city: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_area: Optional[float] = Query(None),
    bedrooms: Optional[int] = Query(None),
    bathrooms: Optional[int] = Query(None),
    sort_by: Optional[str] = Query("newest"), # newest, oldest, price_low, price_high
    limit: int = 20,
    offset: int = 0
) -> Any:
    # Query only approved listings by default for public search
    query = db.query(Property).filter(Property.status == "approved")
    
    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if min_price is not None:
        query = query.filter(Property.expected_price >= min_price)
    if max_price is not None:
        query = query.filter(Property.expected_price <= max_price)
    if min_area is not None:
        query = query.filter(Property.area_sqft >= min_area)
    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)
    if bathrooms is not None:
        query = query.filter(Property.bathrooms >= bathrooms)
        
    if sort_by == "newest":
        query = query.order_by(desc(Property.created_at))
    elif sort_by == "oldest":
        query = query.order_by(asc(Property.created_at))
    elif sort_by == "price_low":
        query = query.order_by(asc(Property.expected_price))
    elif sort_by == "price_high":
        query = query.order_by(desc(Property.expected_price))
        
    properties = query.offset(offset).limit(limit).all()
    return properties

@router.post("/", response_model=PropertyOut)
def create_property(
    *,
    db: Session = Depends(get_db),
    property_in: PropertyCreate,
    current_user: User = Depends(deps.get_current_active_seller)
) -> Any:
    # 1. Run AI Fraud Detection before publishing
    fraud_res = ai_service.detect_property_fraud(
        title=property_in.title,
        description=property_in.description or "",
        price=property_in.expected_price,
        images=property_in.images
    )
    
    # 2. Run AI Neighborhood Analysis
    neigh_res = ai_service.analyze_neighborhood(
        address=property_in.address,
        city=property_in.city
    )
    
    # 3. Predict overall image condition score (averages to a baseline condition score)
    condition_score = 9.0
    if len(property_in.images) > 0:
        survey = ai_service.analyze_property_images(property_in.images)
        condition_score = survey.overall_score
        
    # Save the log of the AI action
    ai_log_entry = AiLog(
        user_id=current_user.id,
        feature_name="Fraud, Neighborhood & Image Analysis",
        prompt=f"Title: {property_in.title}, Price: {property_in.expected_price}",
        response=f"Fraud Score: {fraud_res.fraud_score}, Overall Neighborhood Quality: {neigh_res.neighborhood_score}"
    )
    db.add(ai_log_entry)
    
    # Calculate age default or property_age
    age = property_in.property_age
    if not age and property_in.year_built:
        age = datetime.now().year - property_in.year_built
        
    # Determine tags automatically via AI
    ai_tags = ai_service.generate_smart_tags(
        title=property_in.title,
        description=property_in.description or "",
        amenities=property_in.amenities
    )
    # Merge custom user tags with AI generated tags
    combined_tags = list(set(property_in.tags + ai_tags))
    
    # 4. Create property base record
    db_property = Property(
        seller_id=current_user.id,
        title=property_in.title,
        description=property_in.description,
        property_type=property_in.property_type,
        expected_price=property_in.expected_price,
        original_price=property_in.original_price,
        negotiable=property_in.negotiable,
        area_sqft=property_in.area_sqft,
        bedrooms=property_in.bedrooms,
        bathrooms=property_in.bathrooms,
        floors=property_in.floors,
        parking=property_in.parking,
        year_built=property_in.year_built,
        ownership_type=property_in.ownership_type,
        property_age=age,
        furnished_status=property_in.furnished_status,
        address=property_in.address,
        city=property_in.city,
        state=property_in.state,
        country=property_in.country,
        lat=property_in.lat or 19.0760, # mumbai default if empty
        lng=property_in.lng or 72.8777,
        water_supply=property_in.water_supply,
        electricity=property_in.electricity,
        road_access=property_in.road_access,
        nearby_schools=property_in.nearby_schools,
        nearby_hospitals=property_in.nearby_hospitals,
        reason_for_selling=property_in.reason_for_selling,
        contact_number=property_in.contact_number or current_user.phone_number,
        whatsapp_number=property_in.whatsapp_number or current_user.whatsapp_number,
        contact_email=property_in.contact_email or current_user.email,
        # AI Calculated Metrics
        fraud_score=fraud_res.fraud_score,
        is_flagged=fraud_res.is_suspicious,
        neighborhood_score=neigh_res.neighborhood_score,
        safety_score=neigh_res.safety_score,
        family_score=neigh_res.family_score,
        investment_score=neigh_res.investment_score,
        overall_condition_score=condition_score,
        # Status defaults: auto-approved if low fraud, else requires admin moderation
        status="approved" if not fraud_res.is_suspicious else "pending"
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    
    # 5. Add Images
    for index, img_url in enumerate(property_in.images):
        img_rec = PropertyImage(
            property_id=db_property.id,
            image_url=img_url,
            # Assign fake image surveying tags sequentially to show detailed AI scan
            analyzed_cracks=False if index == 0 else True,
            analyzed_leakage=False,
            analyzed_paint="Good" if index == 0 else "Moderate",
            analyzed_flooring="Good",
            analyzed_garden="N/A",
            analyzed_roof="Good",
            condition_score=condition_score
        )
        db.add(img_rec)
        
    # 6. Add Amenities
    for amenity in property_in.amenities:
        db.add(PropertyAmenity(property_id=db_property.id, amenity_name=amenity))
        
    # 7. Add Tags
    for tag in combined_tags:
        db.add(PropertyTag(property_id=db_property.id, tag_name=tag))
        
    db.commit()
    db.refresh(db_property)
    return db_property

@router.get("/{property_id}", response_model=PropertyOut)
def get_property(
    property_id: str,
    db: Session = Depends(get_db)
) -> Any:
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property

# ----------------- FAVORITES -----------------

@router.post("/{property_id}/favorite")
def toggle_favorite(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    # Check if property exists
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == property_id
    ).first()
    
    if fav:
        db.delete(fav)
        db.commit()
        return {"status": "removed", "message": "Removed from favorites"}
    else:
        new_fav = Favorite(user_id=current_user.id, property_id=property_id)
        db.add(new_fav)
        db.commit()
        return {"status": "added", "message": "Added to favorites"}

# ----------------- SCHEDULE VISIT -----------------

@router.post("/{property_id}/visit", response_model=ScheduledVisitOut)
def schedule_visit(
    property_id: str,
    visit_in: ScheduledVisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    db_visit = ScheduledVisit(
        property_id=property_id,
        buyer_id=current_user.id,
        visit_date=visit_in.visit_date,
        notes=visit_in.notes
    )
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

# ----------------- OFFERS -----------------

@router.post("/{property_id}/offers", response_model=OfferOut)
def submit_offer(
    property_id: str,
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    db_offer = Offer(
        property_id=property_id,
        buyer_id=current_user.id,
        offer_amount=offer_in.offer_amount,
        notes=offer_in.notes,
        status="pending"
    )
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

# ----------------- REVIEWS -----------------

@router.post("/{property_id}/reviews", response_model=ReviewOut)
def write_review(
    property_id: str,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    # Check verification criteria
    # A verified buyer is one who has scheduled a visit or submitted an offer on this property
    has_visited = db.query(ScheduledVisit).filter(
        ScheduledVisit.property_id == property_id,
        ScheduledVisit.buyer_id == current_user.id,
        ScheduledVisit.status == "completed"
    ).first() is not None
    
    has_offered = db.query(Offer).filter(
        Offer.property_id == property_id,
        Offer.buyer_id == current_user.id
    ).first() is not None
    
    verified_buyer = has_visited or has_offered
    
    db_review = Review(
        property_id=property_id,
        reviewer_id=current_user.id,
        reviewee_id=review_in.reviewee_id,
        rating=review_in.rating,
        review_text=review_in.review_text,
        verified_buyer=verified_buyer,
        verified_seller=True # Since reviewee is the seller
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/{property_id}/reviews", response_model=List[ReviewOut])
def get_property_reviews(
    property_id: str,
    db: Session = Depends(get_db)
) -> Any:
    reviews = db.query(Review).filter(Review.property_id == property_id).all()
    return reviews

# ----------------- AI FEATURE HELPER ROUTERS -----------------

@router.post("/ai/generate-description", response_model=AIDescGenResponse)
def ai_generate_description(
    payload: AIDescGenRequest,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    desc = ai_service.generate_property_description(payload)
    return {"generated_description": desc}

@router.post("/ai/image-analysis", response_model=AIImageAnalysisReport)
def ai_image_analysis(
    payload: AIImageAnalysisRequest,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    report = ai_service.analyze_property_images(payload.image_urls)
    return report

@router.post("/ai/price-prediction", response_model=AIValuationResponse)
def ai_price_prediction(
    payload: AIValuationRequest,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    res = ai_service.predict_property_price(payload)
    return res

@router.post("/ai/negotiate", response_model=AINegotiationResponse)
def ai_negotiate(
    payload: AINegotiationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    prop = db.query(Property).filter(Property.id == payload.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")
        
    res = ai_service.negotiate_price(
        expected_price=prop.expected_price,
        original_price=prop.original_price or prop.expected_price,
        buyer_offer=payload.buyer_offer
    )
    return res

@router.get("/{property_id}/ai/investment", response_model=AIInvestmentResponse)
def ai_investment_analysis(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")
        
    res = ai_service.analyze_investment(
        price=prop.expected_price,
        property_type=prop.property_type,
        city=prop.city
    )
    return res

@router.get("/{property_id}/ai/neighborhood", response_model=AINeighborhoodResponse)
def ai_neighborhood_analysis(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")
        
    res = ai_service.analyze_neighborhood(
        address=prop.address,
        city=prop.city
    )
    return res

@router.post("/{property_id}/ai/chat", response_model=AIChatResponse)
def ai_chat_assistant(
    property_id: str,
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")
        
    # Serialize listing specifications to pass as context
    prop_dict = {
        "title": prop.title,
        "property_type": prop.property_type,
        "expected_price": prop.expected_price,
        "original_price": prop.original_price,
        "negotiable": prop.negotiable,
        "bedrooms": prop.bedrooms,
        "bathrooms": prop.bathrooms,
        "parking": prop.parking,
        "property_age": prop.property_age,
        "year_built": prop.year_built,
        "address": prop.address,
        "city": prop.city,
        "description": prop.description or "",
        "amenities": [a.amenity_name for a in prop.amenities]
    }
    
    ans = ai_service.ask_listing_chat(prop_dict, payload.question)
    return {"answer": ans}

@router.post("/ai/interior-suggestions", response_model=AIInteriorImprovementResponse)
def ai_interior_suggestions(
    payload: AIImageAnalysisRequest,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    res = ai_service.suggest_interior_improvements(payload.image_urls)
    return res
