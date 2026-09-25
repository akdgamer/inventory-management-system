from sqlalchemy.orm import Session
from uuid import UUID
from . import models, schemas
from datetime import datetime

### PRODUCT CRUD
def get_product(db: Session, product_id: UUID):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 50):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_prod = models.Product(
        sku=product.sku,
        name=product.name,
        description=product.description,
        reorder_level=product.reorder_level
    )
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

def delete_product(db: Session, product_id: UUID):
    db_prod = get_product(db, product_id=product_id)
    if db_prod:
        db.delete(db_prod)
        db.commit()
    return db_prod

### STOCK BATCH CRUD
def create_stock_batch(db: Session, batch: schemas.StockBatchCreate):
    db_batch = models.StockBatch(
        product_id=batch.product_id,
        warehouse=batch.warehouse,
        batch_number=batch.batch_number,
        quantity_received=batch.quantity_received,
        quantity_available=batch.quantity_received,
        expiry_date=batch.expiry_date
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    # Insert initial "IN" movement
    movement = models.InventoryMovement(
        product_id=db_batch.product_id,
        batch_id=db_batch.id,
        warehouse=db_batch.warehouse,
        movement_type="IN",
        quantity_change=db_batch.quantity_received,
        reference_type="BATCH_RECEIPT",
        reference_id=str(db_batch.id),
        performed_at=datetime.utcnow()
    )
    db.add(movement)
    db.commit()
    return db_batch

def get_stock_batches(db: Session, product_id: UUID = None, warehouse: str = None):
    query = db.query(models.StockBatch)
    if product_id:
        query = query.filter(models.StockBatch.product_id == product_id)
    if warehouse:
        query = query.filter(models.StockBatch.warehouse == warehouse)
    return query.all()

### INVENTORY MOVEMENT CRUD
def create_inventory_movement(db: Session, mv: schemas.InventoryMovementCreate):
    if mv.batch_id:
        batch = db.query(models.StockBatch).filter(models.StockBatch.id == mv.batch_id).first()
        if not batch:
            return None
        batch.quantity_available += mv.quantity_change
        db.add(batch)
    db_movement = models.InventoryMovement(
        product_id=mv.product_id,
        batch_id=mv.batch_id,
        warehouse=mv.warehouse,
        movement_type=mv.movement_type,
        quantity_change=mv.quantity_change,
        reference_type=mv.reference_type,
        reference_id=mv.reference_id
    )
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

def get_inventory_movements(db: Session, product_id: UUID = None, warehouse: str = None):
    query = db.query(models.InventoryMovement)
    if product_id:
        query = query.filter(models.InventoryMovement.product_id == product_id)
    if warehouse:
        query = query.filter(models.InventoryMovement.warehouse == warehouse)
    return query.all()
