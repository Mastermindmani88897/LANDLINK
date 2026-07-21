from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.api import deps
from app.core.database import get_db
from app.models.models import ChatMessage, User, Property
from app.schemas.schemas import ChatMessageCreate, ChatMessageOut

router = APIRouter()

@router.get("/threads", response_model=List[Dict[str, Any]])
def get_chat_threads(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    # Get all messages sent or received by current user
    messages = db.query(ChatMessage).filter(
        or_(
            ChatMessage.sender_id == current_user.id,
            ChatMessage.receiver_id == current_user.id
        )
    ).order_by(desc(ChatMessage.created_at)).all()
    
    # Group messages into threads by recipient
    seen_users = set()
    threads = []
    
    for msg in messages:
        target_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        if target_id in seen_users:
            continue
        seen_users.add(target_id)
        
        target_user = db.query(User).filter(User.id == target_id).first()
        prop = db.query(Property).filter(Property.id == msg.property_id).first() if msg.property_id else None
        
        threads.append({
            "target_user": {
                "id": target_user.id,
                "full_name": target_user.full_name,
                "email": target_user.email,
                "profile_image_url": target_user.profile_image_url
            },
            "last_message": {
                "id": msg.id,
                "message_text": msg.message_text,
                "image_url": msg.image_url,
                "read_receipt": msg.read_receipt,
                "created_at": msg.created_at,
                "sender_id": msg.sender_id
            },
            "property": {
                "id": prop.id,
                "title": prop.title,
                "expected_price": prop.expected_price
            } if prop else None
        })
        
    return threads

@router.get("/history/{target_user_id}", response_model=List[ChatMessageOut])
def get_chat_history(
    target_user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    # Retrieve messages between user & target
    messages = db.query(ChatMessage).filter(
        or_(
            and_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == target_user_id),
            and_(ChatMessage.sender_id == target_user_id, ChatMessage.receiver_id == current_user.id)
        )
    ).order_by(ChatMessage.created_at).all()
    
    # Mark incoming messages as read
    unread_messages = [m for m in messages if m.receiver_id == current_user.id and not m.read_receipt]
    if unread_messages:
        for m in unread_messages:
            m.read_receipt = True
        db.commit()
        
    return messages

@router.post("/", response_model=ChatMessageOut)
def send_message(
    *,
    db: Session = Depends(get_db),
    message_in: ChatMessageCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    # Verify receiver exists
    receiver = db.query(User).filter(User.id == message_in.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient user not found")
        
    db_msg = ChatMessage(
        sender_id=current_user.id,
        receiver_id=message_in.receiver_id,
        property_id=message_in.property_id,
        message_text=message_in.message_text,
        image_url=message_in.image_url,
        read_receipt=False
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg
