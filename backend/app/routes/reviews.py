from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User, Buyer, Farmer
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewResponse
from app.utils.auth import require_buyer, get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    buyer = current_user.buyer_profile
    if not buyer:
        raise HTTPException(status_code=400, detail="Buyer profile not found")
        
    # Check if farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == review_in.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
        
    new_review = Review(
        buyer_id=buyer.id,
        farmer_id=review_in.farmer_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/{farmer_id}", response_model=List[ReviewResponse])
def get_farmer_reviews(farmer_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.farmer_id == farmer_id).all()
    return reviews
