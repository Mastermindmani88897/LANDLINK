from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.core.database import get_db
from app.models.models import Property, Offer, ScheduledVisit, Favorite, User, ChatMessage
from app.schemas.schemas import PropertyOut, OfferOut, ScheduledVisitOut

router = APIRouter()

@router.get("/seller", response_model=Dict[str, Any])
def get_seller_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_seller)
) -> Any:
    # 1. Active & Sold Listings
    properties = db.query(Property).filter(Property.seller_id == current_user.id).all()
    active_properties = [p for p in properties if p.status == "approved"]
    pending_properties = [p for p in properties if p.status == "pending"]
    sold_properties = [p for p in properties if p.status == "sold"]
    
    # 2. Total favorites across all seller properties
    property_ids = [p.id for p in properties]
    favorites_count = db.query(Favorite).filter(Favorite.property_id.in_(property_ids)).count() if property_ids else 0
    
    # 3. Scheduled visits pending
    pending_visits = db.query(ScheduledVisit).filter(
        ScheduledVisit.property_id.in_(property_ids),
        ScheduledVisit.status == "scheduled"
    ).all() if property_ids else []
    
    # 4. Offers received
    received_offers = db.query(Offer).filter(
        Offer.property_id.in_(property_ids)
    ).all() if property_ids else []
    
    # 5. Charts / Metrics (Monthly growth simulation & Price trends)
    monthly_growth = [
        {"month": "Jan", "listings": len(properties) - 2 if len(properties) > 2 else 0, "views": 120},
        {"month": "Feb", "listings": len(properties) - 1 if len(properties) > 1 else 0, "views": 250},
        {"month": "Mar", "listings": len(properties), "views": 480}
    ]
    
    price_trends = []
    for p in properties:
        price_trends.append({
            "title": p.title[:15],
            "expected": p.expected_price,
            "original": p.original_price or p.expected_price
        })
        
    return {
        "stats": {
            "total_listings": len(properties),
            "active_listings": len(active_properties),
            "pending_listings": len(pending_properties),
            "sold_listings": len(sold_properties),
            "favorites_received": favorites_count,
            "views_count": len(properties) * 145 # simulated
        },
        "visits": pending_visits,
        "offers": received_offers,
        "monthly_growth": monthly_growth,
        "price_trends": price_trends
    }

@router.get("/buyer", response_model=Dict[str, Any])
def get_buyer_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    # 1. Favorite properties list
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    fav_properties = [f.property for f in favs if f.property]
    
    # 2. Offer history
    my_offers = db.query(Offer).filter(Offer.buyer_id == current_user.id).all()
    
    # 3. Scheduled visits
    my_visits = db.query(ScheduledVisit).filter(ScheduledVisit.buyer_id == current_user.id).all()
    
    return {
        "favorites": fav_properties,
        "offers": my_offers,
        "visits": my_visits
    }
