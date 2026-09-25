from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
from app.database import get_db
from app.models import Item, InventoryTransaction
from app.schemas import ItemCreate, ItemUpdate, ItemSchema, TransactionCreate, TransactionSchema
from app.services.auth_service import get_current_user
import base64
from datetime import datetime

router = APIRouter(prefix="/items", tags=["items"])

# Permission checker factory
def permission_required(permission_name: str):
    def checker(current_user = Depends(get_current_user)):
        print(f"Checking permission '{permission_name}' for user {current_user.email}")
        perm_names = [p.name for p in current_user.role.permissions]
        print(f"User has permissions: {perm_names}")
        if permission_name not in perm_names:
            print(f"Permission denied: {permission_name} not in {perm_names}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        print(f"Permission granted: {permission_name}")
        return current_user
    return checker

@router.get("/", response_model=List[ItemSchema])
def list_items(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Item)
    if search:
        term = f"%{search}%"
        query = query.filter((Item.sku.ilike(term)) | (Item.name.ilike(term)))
    return query.all()

@router.post("/", response_model=ItemSchema, dependencies=[Depends(permission_required("items.create"))])
def create_item(
    item_in: ItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Handle base64 image if provided
    image_url = None
    if item_in.image:
        try:
            # Create media directory if it doesn't exist
            save_dir = "./media/item_images"
            os.makedirs(save_dir, exist_ok=True)

            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"item_{timestamp}.jpg"
            file_path = os.path.join(save_dir, filename)

            print(f"Saving image to: {file_path}")
            print(f"Image data length: {len(item_in.image)}")

            # Decode and save image
            image_data = base64.b64decode(item_in.image)
            with open(file_path, "wb") as f:
                f.write(image_data)
            
            # Use a URL path instead of a file path
            image_url = f"/media/item_images/{filename}"
            print(f"Image URL: {image_url}")
            print(f"Full image URL: http://localhost:8000{image_url}")

            # Verify file exists
            if os.path.exists(file_path):
                print(f"File exists at: {file_path}")
                print(f"File size: {os.path.getsize(file_path)} bytes")
            else:
                print(f"File does not exist at: {file_path}")

        except Exception as e:
            print(f"Error saving image: {e}")
            import traceback
            print(traceback.format_exc())
            # Continue without image if there's an error

    # Create item with only the fields that are provided
    item_data = {
        "sku": item_in.sku,
        "name": item_in.name,
        "description": item_in.description,
        "quantity": item_in.quantity,
        "min_threshold": item_in.min_threshold,
        "price": item_in.price,
        "last_updated_by": current_user.id
    }

    # Only add optional fields if they are provided
    if image_url:
        item_data["image_url"] = image_url
        print(f"Added image_url to item_data: {image_url}")
    if item_in.category_id is not None:
        item_data["category_id"] = item_in.category_id
    if item_in.supplier_id is not None:
        item_data["supplier_id"] = item_in.supplier_id

    item = Item(**item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    print(f"Created item with image_url: {item.image_url}")
    return item

@router.put("/{item_id}", response_model=ItemSchema, dependencies=[Depends(permission_required("items.update"))])
def update_item(
    item_id: int,
    item_in: ItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    item = db.query(Item).get(item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    
    # Handle base64 image if provided
    if item_in.image:
        try:
            # Create media directory if it doesn't exist
            save_dir = "./media/item_images"
            os.makedirs(save_dir, exist_ok=True)
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"item_{item_id}_{timestamp}.jpg"
            file_path = os.path.join(save_dir, filename)
            
            # Decode and save image
            image_data = base64.b64decode(item_in.image)
            with open(file_path, "wb") as f:
                f.write(image_data)
            
            # Update image URL
            item.image_url = f"/media/item_images/{filename}"
        except Exception as e:
            print(f"Error saving image: {e}")
    
    # Update other fields
    for field, value in item_in.dict(exclude_unset=True, exclude={'image'}).items():
        setattr(item, field, value)
    
    item.last_updated_by = current_user.id
    db.commit()
    db.refresh(item)
    return item

@router.patch("/{item_id}/adjust", response_model=ItemSchema, dependencies=[Depends(permission_required("items.update"))])
def adjust_item(
    item_id: int,
    delta: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    item = db.query(Item).get(item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    item.quantity += delta
    item.last_updated_by = current_user.id
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(permission_required("items.delete"))])
def delete_item(item_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    item = db.query(Item).get(item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    db.delete(item)
    db.commit()

@router.get("/{item_id}", response_model=ItemSchema)
async def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Item = Depends(get_current_user)
):
    """
    Get a specific item by ID.
    """
    # Get item from database
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item

@router.post("/{item_id}/transactions", response_model=TransactionSchema, dependencies=[Depends(permission_required("inventory.transaction"))])
def create_transaction(
    item_id: int,
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Record a stock transaction (IN or OUT) for an item.
    Automatically updates the item's quantity.
    """
    # Check if item exists
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    
    # Calculate new quantity
    if transaction_in.transaction_type == "IN":
        new_quantity = item.quantity + transaction_in.quantity
    else:  # OUT
        new_quantity = item.quantity - transaction_in.quantity
        if new_quantity < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Available: {item.quantity}, Requested: {transaction_in.quantity}"
            )
    
    # Create transaction record
    transaction = InventoryTransaction(
        item_id=item_id,
        transaction_type=transaction_in.transaction_type,
        quantity=transaction_in.quantity,
        reason=transaction_in.reason,
        reference_number=transaction_in.reference_number,
        notes=transaction_in.notes,
        created_by=current_user.id
    )
    
    # Update item quantity
    item.quantity = new_quantity
    item.last_updated_by = current_user.id
    
    # Save both transaction and item
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction

@router.get("/{item_id}/transactions", response_model=List[TransactionSchema], dependencies=[Depends(permission_required("inventory.view_history"))])
def get_item_transactions(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Get all transactions for a specific item.
    """
    # Check if item exists
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    
    # Get transactions ordered by most recent first
    transactions = db.query(InventoryTransaction).filter(
        InventoryTransaction.item_id == item_id
    ).order_by(InventoryTransaction.created_at.desc()).all()
    
    return transactions

