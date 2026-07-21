from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.api import deps
from app.models.models import User
from app.schemas.schemas import UserCreate, UserOut, UserUpdate, Token, LoginRequest

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate
) -> Any:
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system."
        )
    
    # Create new user
    db_user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        phone_number=user_in.phone_number,
        whatsapp_number=user_in.whatsapp_number,
        profile_image_url=user_in.profile_image_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # Standard OAuth2 login form handling
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login-json", response_model=Token)
def login_json(
    db: Session = Depends(get_db),
    *,
    login_in: LoginRequest
) -> Any:
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not security.verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/google-login", response_model=Token)
def google_login(
    *,
    db: Session = Depends(get_db),
    payload: dict  # expected to have email, name, profile_url, google_token
) -> Any:
    email = payload.get("email")
    name = payload.get("name", "Google User")
    picture = payload.get("profile_url")
    
    if not email:
        raise HTTPException(status_code=400, detail="Google authentication payload invalid.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create user automatically
        user = User(
            email=email,
            password_hash=security.get_password_hash(security.generate_uuid()),
            full_name=name,
            role="buyer",
            profile_image_url=picture
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserOut)
def read_user_me(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    if user_in.email is not None:
        # Check uniqueness of new email
        existing = db.query(User).filter(User.email == user_in.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use.")
        current_user.email = user_in.email
        
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.phone_number is not None:
        current_user.phone_number = user_in.phone_number
    if user_in.whatsapp_number is not None:
        current_user.whatsapp_number = user_in.whatsapp_number
    if user_in.profile_image_url is not None:
        current_user.profile_image_url = user_in.profile_image_url
        
    if user_in.password is not None:
        current_user.password_hash = security.get_password_hash(user_in.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
