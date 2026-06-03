from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# Import all models to ensure they are registered on Metadata before create_all
from app.models.user import User, Farmer, Buyer
from app.models.crop import Crop
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.review import Review
from app.models.chat import Chat
from app.models.delivery import Delivery
from app.models.ai import PricePrediction, DiseaseDetection

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Import routes
from app.routes import auth, farmers, crops, orders, payments, reviews, chat, ai, delivery

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AntiGravity AgriMarket AI-Powered Platform Backend",
    version="1.0.0"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(farmers.router, prefix=settings.API_V1_STR)
app.include_router(crops.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(delivery.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to AntiGravity AgriMarket API Portal",
        "documentation": "/docs"
    }
