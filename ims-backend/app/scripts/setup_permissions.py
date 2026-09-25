from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Permission, Role, User

def setup_permissions():
    db = SessionLocal()
    try:
        # Create permissions
        permissions = [
            Permission(name="items.create", description="Create new items"),
            Permission(name="items.read", description="View items"),
            Permission(name="items.update", description="Update items"),
            Permission(name="items.delete", description="Delete items"),
            Permission(name="users.manage", description="Manage users"),
            Permission(name="roles.manage", description="Manage roles"),
        ]
        
        for perm in permissions:
            if not db.query(Permission).filter(Permission.name == perm.name).first():
                db.add(perm)
        
        db.commit()
        
        # Create admin role with all permissions
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            admin_role = Role(name="admin", description="Administrator with full access")
            db.add(admin_role)
            db.commit()
        
        admin_role.permissions = permissions
        db.commit()
        
        # Create user role with basic permissions
        user_role = db.query(Role).filter(Role.name == "user").first()
        if not user_role:
            user_role = Role(name="user", description="Regular user with basic access")
            db.add(user_role)
            db.commit()
        
        basic_permissions = [
            perm for perm in permissions 
            if perm.name in ["items.read", "items.create", "items.update"]
        ]
        user_role.permissions = basic_permissions
        db.commit()
        
        print("Permissions and roles set up successfully!")
        
    except Exception as e:
        print(f"Error setting up permissions: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_permissions() 