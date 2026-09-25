from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Category
from app.schemas import CategorySchema
from app.services.auth_service import get_current_user
from app.routers.users import admin_required

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=CategorySchema, dependencies=[Depends(admin_required)])
def create_category(category_in: CategorySchema, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.name == category_in.name).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")
    category = Category(name=category_in.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/", response_model=List[CategorySchema])
def list_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Category).all()

@router.get("/{category_id}", response_model=CategorySchema)
def get_category(category_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(Category).get(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=CategorySchema, dependencies=[Depends(admin_required)])
def update_category(category_id: int, category_in: CategorySchema, db: Session = Depends(get_db)):
    category = db.query(Category).get(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    category.name = category_in.name
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).get(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(category)
    db.commit()
