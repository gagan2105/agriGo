from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeliveryBase(BaseModel):
    order_id: int
    driver_id: Optional[int] = None
    route: Optional[str] = None
    delivery_status: Optional[str] = "assigned"

class DeliveryUpdate(BaseModel):
    driver_id: Optional[int] = None
    route: Optional[str] = None
    delivery_status: Optional[str] = None

class DeliveryResponse(DeliveryBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True
