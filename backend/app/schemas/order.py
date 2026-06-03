from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.crop import CropResponse

class OrderItemBase(BaseModel):
    crop_id: int
    quantity: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    price: float
    crop: Optional[CropResponse] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_amount: float
    order_status: Optional[str] = "pending"
    payment_status: Optional[str] = "pending"

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    method: str = "upi"  # "upi" or "cash_on_delivery"

class OrderUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    buyer_id: int
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
