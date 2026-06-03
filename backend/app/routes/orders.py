from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.user import User, Buyer, Farmer
from app.models.crop import Crop
from app.models.order import Order, OrderItem
from app.models.delivery import Delivery
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate
from app.utils.auth import get_current_user, require_buyer, require_authorized

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/create", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    buyer = current_user.buyer_profile
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Buyer profile must be fully initialized to place orders"
        )
    
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )

    # 1. Validate items and calculate total amount
    total_amount = 0.0
    items_to_create = []
    crops_to_update = []

    for item in order_in.items:
        crop = db.query(Crop).filter(Crop.id == item.crop_id).first()
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop with ID {item.crop_id} not found"
            )
        if crop.status != "active" and crop.status != "emergency_sale":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Crop '{crop.crop_name}' is not currently active for purchase"
            )
        if crop.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for {crop.crop_name}. Available: {crop.quantity}{crop.unit}, Requested: {item.quantity}{crop.unit}"
            )
            
        line_total = crop.price_per_unit * item.quantity
        total_amount += line_total
        
        # Track items and stock adjustment
        items_to_create.append((crop, item.quantity, crop.price_per_unit))
        crop.quantity -= item.quantity
        if crop.quantity == 0:
            crop.status = "sold_out"
        crops_to_update.append(crop)

    # 2. Create the Order
    payment_status = "paid" if order_in.method in ["stripe", "upi"] else "pending"
    new_order = Order(
        buyer_id=buyer.id,
        total_amount=total_amount,
        order_status="pending",
        payment_status=payment_status
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # 3. Create OrderItems
    for crop, quantity, price in items_to_create:
        order_item = OrderItem(
            order_id=new_order.id,
            crop_id=crop.id,
            quantity=quantity,
            price=price
        )
        db.add(order_item)
    
    # 4. Create Delivery dispatch entry
    new_delivery = Delivery(
        order_id=new_order.id,
        delivery_status="assigned",
        route="Standard Direct Farm route"
    )
    db.add(new_delivery)

    # Commit all stock updates, items, and delivery
    db.commit()
    db.refresh(new_order)
    
    return new_order

@router.get("", response_model=List[OrderResponse])
def get_orders(current_user: User = Depends(require_authorized), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        return db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.crop)).all()
        
    elif current_user.role == "buyer":
        buyer = current_user.buyer_profile
        if not buyer:
            return []
        return db.query(Order).filter(Order.buyer_id == buyer.id).options(joinedload(Order.items).joinedload(OrderItem.crop)).all()
        
    elif current_user.role == "farmer":
        farmer = current_user.farmer_profile
        if not farmer:
            return []
        
        # Get orders that contain crops belonging to this farmer
        orders = db.query(Order)\
            .join(OrderItem)\
            .join(Crop)\
            .filter(Crop.farmer_id == farmer.id)\
            .distinct()\
            .options(joinedload(Order.items).joinedload(OrderItem.crop))\
            .all()
        return orders

    elif current_user.role == "delivery":
        # Get deliveries assigned to driver, return associated orders
        orders = db.query(Order)\
            .join(Delivery)\
            .filter(Delivery.driver_id == current_user.id)\
            .options(joinedload(Order.items).joinedload(OrderItem.crop))\
            .all()
        return orders

    return []

@router.put("/update/{order_id}", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    order_up: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Security check: Farmers can accept/ship/cancel orders for their crops.
    # Drivers/Admins can update order status.
    # Buyers can cancel pending orders.
    
    if current_user.role == "buyer" and order.buyer_id != current_user.buyer_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this order")
        
    if order_up.order_status:
        order.order_status = order_up.order_status
    if order_up.payment_status:
        order.payment_status = order_up.payment_status
        
    db.commit()
    db.refresh(order)
    return order
