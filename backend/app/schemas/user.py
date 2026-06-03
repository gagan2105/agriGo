from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- Farmer Profiles ---
class FarmerBase(BaseModel):
    farm_name: str
    farm_size: Optional[float] = None
    experience: Optional[int] = None
    certifications: Optional[str] = None
    bank_details: Optional[str] = None

class FarmerCreate(FarmerBase):
    pass

class FarmerResponse(FarmerBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- Buyer Profiles ---
class BuyerBase(BaseModel):
    business_name: Optional[str] = None
    buyer_type: str = "consumer"  # "consumer", "retailer", "restaurant", "supermarket", "wholesaler"

class BuyerCreate(BuyerBase):
    pass

class BuyerResponse(BuyerBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- General Users ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str  # "farmer", "buyer", "admin", "delivery"
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_image: Optional[str] = None

class UserCreate(UserBase):
    password: str
    # Conditional structures depending on role
    farmer: Optional[FarmerCreate] = None
    buyer: Optional[BuyerCreate] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_image: Optional[str] = None
    farmer: Optional[FarmerCreate] = None
    buyer: Optional[BuyerCreate] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    farmer_profile: Optional[FarmerResponse] = None
    buyer_profile: Optional[BuyerResponse] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None
