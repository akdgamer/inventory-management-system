from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Notification
from app.schemas import NotificationSchema
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationSchema])
def list_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).all()

@router.patch("/{notification_id}", response_model=NotificationSchema)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notification = db.query(Notification).get(notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
