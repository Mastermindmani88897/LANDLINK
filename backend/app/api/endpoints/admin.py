from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api import deps
from app.core.database import get_db
from app.models.models import Property, User, AiLog, Review
from app.schemas.schemas import PropertyOut, UserOut

router = APIRouter()

@router.get("/listings", response_model=List[PropertyOut])
def get_all_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    # Admins get all listings regardless of status
    return db.query(Property).order_by(desc(Property.created_at)).all()

@router.put("/listings/{property_id}/approve", response_model=PropertyOut)
def approve_listing(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")
        
    prop.status = "approved"
    prop.is_flagged = False
    db.commit()
    db.refresh(prop)
    return prop

@router.put("/listings/{property_id}/reject", response_model=PropertyOut)
def reject_listing(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")
        
    prop.status = "rejected"
    db.commit()
    db.refresh(prop)
    return prop

@router.put("/listings/{property_id}/flag", response_model=PropertyOut)
def toggle_flag(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")
        
    prop.is_flagged = not prop.is_flagged
    db.commit()
    db.refresh(prop)
    return prop

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    return db.query(User).all()

@router.put("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: str,
    new_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    if new_role not in ["buyer", "seller", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user

@router.get("/ai-logs", response_model=List[Dict[str, Any]])
def get_ai_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    logs = db.query(AiLog).order_by(desc(AiLog.created_at)).limit(50).all()
    out = []
    for l in logs:
        # Get user details
        u = db.query(User).filter(User.id == l.user_id).first() if l.user_id else None
        out.append({
            "id": l.id,
            "feature_name": l.feature_name,
            "prompt": l.prompt,
            "response": l.response,
            "created_at": l.created_at,
            "user_email": u.email if u else "Anonymous"
        })
    return out

@router.get("/analytics", response_model=Dict[str, Any])
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    total_users = db.query(User).count()
    total_listings = db.query(Property).count()
    flagged_listings = db.query(Property).filter(Property.is_flagged == True).count()
    pending_listings = db.query(Property).filter(Property.status == "pending").count()
    
    # Fraud rate calculation
    fraud_rate = (flagged_listings / total_listings * 100) if total_listings > 0 else 0.0
    
    # Simple list of flagged properties
    suspicious_listings = db.query(Property).filter(Property.is_flagged == True).all()
    
    return {
        "metrics": {
            "total_users": total_users,
            "total_listings": total_listings,
            "flagged_listings": flagged_listings,
            "pending_listings": pending_listings,
            "fraud_rate_percentage": round(fraud_rate, 2)
        },
        "suspicious_listings": suspicious_listings
    }
