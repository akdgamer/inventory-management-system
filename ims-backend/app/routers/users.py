from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Role
from app.services.auth_service import hash_password, get_current_user
from app.schemas import UserCreate, UserUpdate, UserSchema

router = APIRouter(prefix="/users", tags=["users"])

# Dependency: only admin users

def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user

@router.post("/", response_model=UserSchema, dependencies=[Depends(admin_required)])
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check email uniqueness
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    # Hash password
    hashed = hash_password(user_in.password)
    user = User(email=user_in.email, password_hash=hashed, role_id=user_in.role_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/", response_model=List[UserSchema], dependencies=[Depends(admin_required)])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserSchema, dependencies=[Depends(admin_required)])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserSchema, dependencies=[Depends(admin_required)])
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user_in.password:
        user.password_hash = hash_password(user_in.password)
    if user_in.role_id:
        # Ensure role exists
        if not db.query(Role).get(user_in.role_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role_id")
        user.role_id = user_in.role_id
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
