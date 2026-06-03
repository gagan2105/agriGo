from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.order import Order
from app.models.delivery import Delivery
from app.schemas.delivery import DeliveryResponse, DeliveryUpdate
from app.utils.auth import require_delivery, require_authorized, get_current_user

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])

@router.get("", response_model=List[DeliveryResponse])
def get_deliveries(
    current_user: User = Depends(require_authorized),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        return db.query(Delivery).all()
    elif current_user.role == "delivery":
        # Returns deliveries assigned to driver or unassigned deliveries they can pick up
        deliveries = db.query(Delivery).filter(
            (Delivery.driver_id == current_user.id) | (Delivery.driver_id == None)
        ).all()
        return deliveries
    return []

@router.put("/{delivery_id}", response_model=DeliveryResponse)
def update_delivery(
    delivery_id: int,
    delivery_up: DeliveryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery assignment not found"
        )
        
    # Check authorization
    if current_user.role == "delivery" and delivery.driver_id and delivery.driver_id != current_user.id:
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN,
             detail="This delivery is assigned to another driver"
         )
         
    if delivery_up.driver_id is not None:
        delivery.driver_id = delivery_up.driver_id
    if delivery_up.route is not None:
        delivery.route = delivery_up.route
    if delivery_up.delivery_status is not None:
        delivery.delivery_status = delivery_up.delivery_status
        
        # Cascade order status updates
        order = db.query(Order).filter(Order.id == delivery.order_id).first()
        if order:
            if delivery_up.delivery_status == "delivered":
                order.order_status = "delivered"
                order.payment_status = "paid"
            elif delivery_up.delivery_status == "picked_up":
                order.order_status = "shipped"
            elif delivery_up.delivery_status == "failed":
                order.order_status = "cancelled"
                
    db.commit()
    db.refresh(delivery)
    return delivery
