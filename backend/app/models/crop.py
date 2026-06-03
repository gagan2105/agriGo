from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)  # "Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Other"
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # "kg", "tons", "quintal", "crates"
    price_per_unit = Column(Float, nullable=False)
    harvest_date = Column(DateTime, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, default="active")  # "active", "sold_out", "draft", "emergency_sale"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="crops")
    order_items = relationship("OrderItem", back_populates="crop", cascade="all, delete-orphan")
    predictions = relationship("PricePrediction", back_populates="crop", cascade="all, delete-orphan")
    detections = relationship("DiseaseDetection", back_populates="crop", cascade="all, delete-orphan")
