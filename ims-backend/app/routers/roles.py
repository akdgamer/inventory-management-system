from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Role, Permission
from app.schemas import RoleSchema, RoleCreate, RoleUpdate, PermissionSchema
from app.services.auth_service import get_current_user
from app.routers.users import admin_required

router = APIRouter(prefix="/roles", tags=["roles"])

@router.post("/", response_model=RoleSchema, dependencies=[Depends(admin_required)])
def create_role(role_in: RoleCreate, db: Session = Depends(get_db)):
    # Prevent duplicate role names
    if db.query(Role).filter(Role.name == role_in.name).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role name already exists")
    role = Role(name=role_in.name, description=role_in.description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@router.get("/", response_model=List[RoleSchema])
def list_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()

@router.get("/{role_id}", response_model=RoleSchema)
def get_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).get(role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return role

@router.put("/{role_id}", response_model=RoleSchema, dependencies=[Depends(admin_required)])
def update_role(role_id: int, role_in: RoleUpdate, db: Session = Depends(get_db)):
    role = db.query(Role).get(role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    role.name = role_in.name
    role.description = role_in.description
    db.commit()
    db.refresh(role)
    return role

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).get(role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    db.delete(role)
    db.commit()

# Endpoint to list all permissions (moved to avoid conflict)
@router.get("/permissions/all", response_model=List[PermissionSchema], dependencies=[Depends(admin_required)])
def list_permissions(db: Session = Depends(get_db)):
    return db.query(Permission).all()

# Endpoint to update role permissions specifically
@router.patch("/{role_id}/permissions", response_model=RoleSchema, dependencies=[Depends(admin_required)])
def update_role_permissions(role_id: int, permission_ids: List[int] = Body(...), db: Session = Depends(get_db)):
    role = db.query(Role).get(role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    
    # Get all requested permissions
    perms = db.query(Permission).filter(Permission.id.in_(permission_ids)).all()
    if len(perms) != len(permission_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Some permissions not found")
    
    # Update role permissions
    role.permissions = perms
    db.commit()
    db.refresh(role)
    return role
