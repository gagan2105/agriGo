from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
from app.database import get_db
from app.models.order import Order
from app.models.payment import Payment
from app.utils.auth import require_buyer, User

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentCreateRequest(BaseModel):
    order_id: int
    payment_method: str = "upi"  # "upi" or "cash_on_delivery"

@router.post("/create")
def create_payment(
    req: PaymentCreateRequest,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == req.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Simulate a transaction
    tx_prefix = "tx_upi" if req.payment_method == "upi" else "tx_stripe"
    tx_id = f"{tx_prefix}_{uuid.uuid4().hex[:12]}"
    
    new_payment = Payment(
        order_id=order.id,
        amount=order.total_amount,
        method=req.payment_method,
        transaction_id=tx_id,
        payment_status="completed" if req.payment_method in ["stripe", "upi"] else "pending"
    )
    db.add(new_payment)
    
    # Update order payment state
    if req.payment_method in ["stripe", "upi"]:
        order.payment_status = "paid"
    
    db.commit()
    db.refresh(new_payment)
    
    return {
        "message": f"Payment processed successfully (simulated {req.payment_method.upper()} checkout)",
        "payment_id": new_payment.id,
        "transaction_id": tx_id,
        "amount": new_payment.amount,
        "status": new_payment.payment_status
    }
