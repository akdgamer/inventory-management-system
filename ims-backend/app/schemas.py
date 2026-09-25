from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# ----- Auth Schemas -----
class TokenSchema(BaseModel):
    token: str
    expires_at: datetime

class TokenData(BaseModel):
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ----- Role & Permission Schemas -----
class PermissionSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    pass

class RoleSchema(RoleBase):
    id: int
    permissions: List[PermissionSchema] = []

    class Config:
        from_attributes = True

# ----- User Schemas -----
class UserBase(BaseModel):
    email: EmailStr
    role_id: int

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    role_id: Optional[int]
    password: Optional[str] = Field(None, min_length=6)

class UserSchema(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime]
    role: RoleSchema

    class Config:
        from_attributes = True

# ----- Category & Supplier Schemas -----
class CategoryBase(BaseModel):
    name: str

class CategorySchema(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    name: str
    contact_info: Optional[str]

class SupplierSchema(SupplierBase):
    id: int

    class Config:
        from_attributes = True

# ----- Item Schemas -----
class ItemBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    quantity: int
    min_threshold: int
    price: float = Field(0, ge=0)
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None

class ItemCreate(ItemBase):
    image: Optional[str] = None  # Base64 encoded image

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    min_threshold: Optional[int] = None
    price: Optional[float] = Field(None, ge=0)
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    image: Optional[str] = None  # Base64 encoded image

class ItemSchema(ItemBase):
    id: int
    updated_at: datetime
    last_updated_by: Optional[int] = None

    class Config:
        from_attributes = True

# ----- Notification Schemas -----
class NotificationBase(BaseModel):
    item_id: int
    message: str

class NotificationSchema(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----- Transaction Schemas -----
class TransactionBase(BaseModel):
    transaction_type: str = Field(..., pattern="^(IN|OUT)$")
    quantity: int = Field(..., gt=0)
    reason: str = Field(..., min_length=1)
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionSchema(TransactionBase):
    id: int
    item_id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True
