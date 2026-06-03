from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id", ondelete="RESTRICT"), nullable=False)
    total_amount = Column(Float, nullable=False)
    order_status = Column(String, default="pending")  # "pending", "accepted", "shipped", "delivered", "cancelled"
    payment_status = Column(String, default="pending")  # "pending", "paid", "refunded"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    buyer = relationship("Buyer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False, cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)  # Captured historical price

    # Relationships
    order = relationship("Order", back_populates="items")
    crop = relationship("Crop", back_populates="order_items")
