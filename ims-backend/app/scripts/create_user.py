from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User, Role, Permission, RolePermission
from app.services.auth_service import hash_password
import sys
sys.path.append("..")  # Add parent directory to Python path
 
def create_admin_user(db: Session, email: str, password: str):
    # Check if admin role exists
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        print("Creating admin role...")
        admin_role = Role(name="admin", description="Administrator with full access")
        db.add(admin_role)
        db.flush()
 
    # Create all permissions if they don't exist
    permissions = [
        "create:items", "read:items", "update:items", "delete:items",
        "create:categories", "read:categories", "update:categories", "delete:categories",
        "create:suppliers", "read:suppliers", "update:suppliers", "delete:suppliers",
        "create:users", "read:users", "update:users", "delete:users",
        "create:roles", "read:roles", "update:roles", "delete:roles"
    ]
 
    for perm_name in permissions:
        perm = db.query(Permission).filter(Permission.name == perm_name).first()
        if not perm:
            print(f"Creating permission: {perm_name}")
            perm = Permission(name=perm_name, description=f"Permission to {perm_name}")
            db.add(perm)
            db.flush()
 
            # Associate permission with admin role
            role_perm = RolePermission(role_id=admin_role.id, permission_id=perm.id)
            db.add(role_perm)
 
    # Create admin user if doesn't exist
    admin_user = db.query(User).filter(User.email == email).first()
    if not admin_user:
        print(f"Creating admin user: {email}")
        admin_user = User(
            email=email,
            hashed_password=hash_password(password),
            role_id=admin_role.id,
            is_active=True
        )
        db.add(admin_user)
 
    try:
        db.commit()
        print("Admin user created successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {str(e)}")
        raise
 
def main():
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)
 
    email = sys.argv[1]
    password = sys.argv[2]
 
    db = SessionLocal()
    try:
        create_admin_user(db, email, password)
    finally:
        db.close()
 
if __name__ == "__main__":
    main()
