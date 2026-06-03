from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CropBase(BaseModel):
    crop_name: str
    category: str  # "Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Other"
    quantity: float = Field(gt=0)
    unit: str  # "kg", "tons", "quintal", "crates"
    price_per_unit: float = Field(gt=0)
    harvest_date: Optional[datetime] = None
    image_url: Optional[str] = None
    status: Optional[str] = "active"  # "active", "sold_out", "draft", "emergency_sale"

class CropCreate(CropBase):
    pass

class CropUpdate(BaseModel):
    crop_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    price_per_unit: Optional[float] = None
    harvest_date: Optional[datetime] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class CropResponse(CropBase):
    id: int
    farmer_id: int
    created_at: datetime

    class Config:
        from_attributes = True
