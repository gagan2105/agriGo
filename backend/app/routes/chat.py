from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Dict, Any
from app.database import get_db
from app.models.user import User
from app.models.chat import Chat
from app.schemas.chat import ChatCreate, ChatResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    chat_in: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify receiver exists
    receiver = db.query(User).filter(User.id == chat_in.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver user not found"
        )
        
    new_msg = Chat(
        sender_id=current_user.id,
        receiver_id=chat_in.receiver_id,
        message=chat_in.message
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@router.get("/history/{contact_id}", response_model=List[ChatResponse])
def get_chat_history(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(Chat).filter(
        or_(
            and_(Chat.sender_id == current_user.id, Chat.receiver_id == contact_id),
            and_(Chat.sender_id == contact_id, Chat.receiver_id == current_user.id)
        )
    ).order_by(Chat.timestamp.asc()).all()
    return messages

@router.get("/contacts", response_model=List[Dict[str, Any]])
def get_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find all users who exchanged messages with current_user
    sent_msgs = db.query(Chat.receiver_id).filter(Chat.sender_id == current_user.id).distinct().all()
    recv_msgs = db.query(Chat.sender_id).filter(Chat.receiver_id == current_user.id).distinct().all()
    
    contact_ids = set([r[0] for r in sent_msgs] + [r[0] for r in recv_msgs])
    
    contacts = []
    if contact_ids:
        users = db.query(User).filter(User.id.in_(contact_ids)).all()
        for u in users:
            contacts.append({
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "profile_image": u.profile_image
            })
            
    return contacts
