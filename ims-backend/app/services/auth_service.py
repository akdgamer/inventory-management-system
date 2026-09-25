from datetime import datetime, timedelta, timezone
import uuid
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status, Depends, Header

from app.models import User, Token, Role
from app.database import get_db
from app.config import ACCESS_TOKEN_EXPIRE_HOURS

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Token management

def create_auth_token(db: Session, user: User) -> Token:
    # Delete any existing tokens for this user
    db.query(Token).filter(Token.user_id == user.id).delete()
    # Create new token
    token_obj = Token(user_id=user.id)
    db.add(token_obj)
    db.commit()
    db.refresh(token_obj)
    return token_obj

def get_user_by_token(db: Session, token_str: str) -> User:
    print(f"Looking up token: {token_str}")
    token_obj = db.query(Token).filter(Token.token == token_str).first()
    if not token_obj:
        print("Token not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Convert to UTC and make both timestamps timezone-aware
    current_time = datetime.now(timezone.utc)
    token_expiry = token_obj.expires_at.replace(tzinfo=timezone.utc)
    
    print(f"Token expiry: {token_expiry}, Current time: {current_time}")
    
    if token_expiry < current_time:
        print("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    
    # Eagerly load the user with role and permissions
    user = db.query(User).options(
        joinedload(User.role).joinedload(Role.permissions)
    ).get(token_obj.user_id)
    
    if not user:
        print("User not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    print(f"Token valid, returning user: {user.email}")
    print(f"User role: {user.role.name if user.role else 'None'}")
    print(f"User permissions: {[p.name for p in user.role.permissions] if user.role else []}")
    return user

# Dependency to extract token
def get_current_user(db: Session = Depends(get_db), authorization: str = Header(None)) -> User:
    print(f"Authorization header: {authorization}")
    if not authorization:
        print("No authorization header")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")
    
    if not authorization.startswith("Token "):
        print("Invalid authorization format")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization format")
    
    token_str = authorization.split(" ", 1)[1]
    print(f"Extracted token: {token_str}")
    return get_user_by_token(db, token_str)
