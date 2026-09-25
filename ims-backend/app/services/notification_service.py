from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config_and_database import Base, engine, SessionLocal
from app.routers import auth, users, roles, items, categories, suppliers, notifications
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.notification_service import generate_low_stock_notifications

# Create tables (use Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory Management API",
    description="A simple inventory system with auth, items, categories, suppliers, and notifications.",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APScheduler setup
scheduler = BackgroundScheduler(timezone="UTC")

def run_notification_job():
    db = SessionLocal()
    try:
        generate_low_stock_notifications(db)
    finally:
        db.close()

# Schedule daily low-stock alerts at 08:00 UTC
scheduler.add_job(
    run_notification_job,
    trigger="cron",
    hour=8,
    minute=0,
    id="low_stock_alerts",
    replace_existing=True
)
scheduler.start()

# Include API routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(items.router)
app.include_router(categories.router)
app.include_router(suppliers.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {"message": "Inventory Management API is running."}
