from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Supplier
from app.schemas import SupplierSchema
from app.services.auth_service import get_current_user
from app.routers.users import admin_required

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.post("/", response_model=SupplierSchema, dependencies=[Depends(admin_required)])
def create_supplier(supplier_in: SupplierSchema, db: Session = Depends(get_db)):
    supplier = Supplier(name=supplier_in.name, contact_info=supplier_in.contact_info)
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.get("/", response_model=List[SupplierSchema])
def list_suppliers(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Supplier).all()

@router.get("/{supplier_id}", response_model=SupplierSchema)
def get_supplier(supplier_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    supplier = db.query(Supplier).get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return supplier

@router.put("/{supplier_id}", response_model=SupplierSchema, dependencies=[Depends(admin_required)])
def update_supplier(supplier_id: int, supplier_in: SupplierSchema, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    supplier.name = supplier_in.name
    supplier.contact_info = supplier_in.contact_info
    db.commit()
    db.refresh(supplier)
    return supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).get(supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    db.delete(supplier)
    db.commit()
