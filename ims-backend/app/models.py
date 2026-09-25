from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Table, DateTime, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid

from .config import ACCESS_TOKEN_EXPIRE_HOURS
from .database import Base

# Association table for Roles and Permissions
tbl_role_permission = Table(
    'role_permission', Base.metadata,
    Column('role_id', Integer, ForeignKey('role.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permission.id', ondelete='CASCADE'), primary_key=True)
)

class Role(Base):
    __tablename__ = 'role'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)

    permissions = relationship(
        'Permission', secondary=tbl_role_permission, back_populates='roles'
    )

class Permission(Base):
    __tablename__ = 'permission'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)

    roles = relationship(
        'Role', secondary=tbl_role_permission, back_populates='permissions'
    )

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey('role.id'))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_login = Column(DateTime(timezone=True), nullable=True)

    role = relationship('Role', backref='users')
    tokens = relationship('Token', back_populates='user', cascade='all, delete-orphan')

class Token(Base):
    __tablename__ = 'token'
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship('User', back_populates='tokens')

    def __init__(self, user_id: int):
        self.user_id = user_id
        self.token = str(uuid.uuid4())
        self.created_at = datetime.utcnow()
        self.expires_at = self.created_at + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

class Category(Base):
    __tablename__ = 'category'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    items = relationship('Item', back_populates='category')

class Supplier(Base):
    __tablename__ = 'supplier'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_info = Column(Text)
    items = relationship('Item', back_populates='supplier')

class Item(Base):
    __tablename__ = 'item'
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    quantity = Column(Integer, nullable=False, default=0)
    min_threshold = Column(Integer, nullable=False, default=0)
    price = Column(Numeric(10, 2), nullable=False, server_default="0")
    image_url = Column(String)
    category_id = Column(Integer, ForeignKey('category.id'))
    supplier_id = Column(Integer, ForeignKey('supplier.id'))
    last_updated_by = Column(Integer, ForeignKey('users.id'))
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship('Category', back_populates='items')
    supplier = relationship('Supplier', back_populates='items')
    updated_by_user = relationship('User', backref='updated_items')
    notifications = relationship('Notification', back_populates='item', cascade='all, delete-orphan')
    transactions = relationship('InventoryTransaction', back_populates='item', cascade='all, delete-orphan')

class Notification(Base):
    __tablename__ = 'notification'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    item_id = Column(Integer, ForeignKey('item.id', ondelete='CASCADE'))
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship('User', backref='notifications')
    item = relationship('Item', back_populates='notifications')

class InventoryTransaction(Base):
    __tablename__ = 'inventory_transaction'
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey('item.id', ondelete='CASCADE'), nullable=False)
    transaction_type = Column(String, nullable=False)  # 'IN' or 'OUT'
    quantity = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)  # 'PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', etc.
    reference_number = Column(String)  # PO number, invoice, etc.
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    item = relationship('Item', back_populates='transactions')
    created_by_user = relationship('User', backref='created_transactions')
