from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.routers import auth, users, roles, items, categories, suppliers, notifications
import os

# Create all tables (ensure migrations are applied in production)
Base.metadata.create_all(bind=engine)

# Create media directory if it doesn't exist
os.makedirs("./media/item_images", exist_ok=True)

app = FastAPI(
    title="Inventory Management API",
    description="A simple inventory system with auth, items, categories, suppliers, and notifications.",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including PATCH
    allow_headers=["*"],  # Allow all headers
)

# Mount the media directory
app.mount("/media", StaticFiles(directory="media"), name="media")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(items.router)
app.include_router(categories.router)
app.include_router(suppliers.router)
app.include_router(notifications.router)

# Root endpoint
@app.get("/")
def root():
    return {"message": "Inventory Management API is running."}
