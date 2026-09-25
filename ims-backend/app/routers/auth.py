from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app import schemas
from app.models import User, Token
from app.database import get_db
from app.services.auth_service import (
    verify_password,
    hash_password,
    create_auth_token,
    get_user_by_token,
    get_current_user
)
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/validate")
def validate_token(current_user: User = Depends(get_current_user)):
    return {"valid": True, "user": {"id": current_user.id, "email": current_user.email}}

@router.post("/login", response_model=schemas.TokenSchema)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Fetch user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    # Update last_login
    user.last_login = datetime.utcnow()
    db.commit()
    # Create token
    token_obj = create_auth_token(db, user)
    return schemas.TokenSchema(token=token_obj.token, expires_at=token_obj.expires_at)

@router.post("/register", response_model=schemas.UserSchema)
def register(request: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(request.password)
    
    # Create new user
    new_user = User(
        email=request.email,
        password_hash=hashed_password,
        role_id=request.role_id,
        created_at=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/logout")
def logout(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Extract token
    token_str = authorization.split(" ", 1)[1] if authorization and authorization.startswith("Token ") else None
    if not token_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token for logout")
    # Delete token
    token_obj = db.query(Token).filter(Token.token == token_str, Token.user_id == current_user.id).first()
    if token_obj:
        db.delete(token_obj)
        db.commit()
    return {"detail": "Logged out successfully"}
