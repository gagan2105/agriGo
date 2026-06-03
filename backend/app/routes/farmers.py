from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User, Farmer
from app.schemas.user import FarmerResponse, FarmerBase
from app.utils.auth import get_current_user, require_farmer

router = APIRouter(prefix="/farmers", tags=["Farmers"])

@router.get("", response_model=List[FarmerResponse])
def get_farmers(db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    return farmers

@router.get("/profile", response_model=FarmerResponse)
def get_farmer_profile(current_user: User = Depends(require_farmer), db: Session = Depends(get_db)):
    if not current_user.farmer_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found"
        )
    return current_user.farmer_profile

@router.put("/profile", response_model=FarmerResponse)
def update_farmer_profile(
    profile_in: FarmerBase,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    farmer = current_user.farmer_profile
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found"
        )
    
    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(farmer, field, value)
        
    db.commit()
    db.refresh(farmer)
    return farmer
