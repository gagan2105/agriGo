from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "farmer", "buyer", "admin", "delivery"
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    profile_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer_profile = relationship("Farmer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("Buyer", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    farm_name = Column(String, nullable=False)
    farm_size = Column(Float, nullable=True)  # in acres
    experience = Column(Integer, nullable=True)  # in years
    certifications = Column(String, nullable=True)  # comma separated or json
    bank_details = Column(String, nullable=True)  # encrypted or simple string

    # Relationships
    user = relationship("User", back_populates="farmer_profile")
    crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")

class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String, nullable=True)
    buyer_type = Column(String, nullable=False)  # "consumer", "retailer", "restaurant", "supermarket", "wholesaler"

    # Relationships
    user = relationship("User", back_populates="buyer_profile")
    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")
