from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User, Farmer
from app.models.crop import Crop
from app.schemas.crop import CropCreate, CropUpdate, CropResponse
from app.utils.auth import get_current_user, require_farmer, require_authorized

router = APIRouter(prefix="/crops", tags=["Crops"])

@router.get("", response_model=List[CropResponse])
def get_crops(
    q: Optional[str] = Query(None, description="Search crops by name"),
    category: Optional[str] = Query(None, description="Filter by crop category"),
    status: Optional[str] = Query("active", description="Filter by crop status"),
    db: Session = Depends(get_db)
):
    query = db.query(Crop)
    if status:
        query = query.filter(Crop.status == status)
    if q:
        query = query.filter(Crop.crop_name.ilike(f"%{q}%"))
    if category:
        query = query.filter(Crop.category == category)
    return query.all()

@router.get("/{crop_id}", response_model=CropResponse)
def get_crop_by_id(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found"
        )
    return crop

@router.post("/create", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def create_crop(
    crop_in: CropCreate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    farmer = current_user.farmer_profile
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer profile must be fully initialized to post listings"
        )
    
    new_crop = Crop(
        farmer_id=farmer.id,
        crop_name=crop_in.crop_name,
        category=crop_in.category,
        quantity=crop_in.quantity,
        unit=crop_in.unit,
        price_per_unit=crop_in.price_per_unit,
        harvest_date=crop_in.harvest_date,
        image_url=crop_in.image_url,
        status=crop_in.status or "active"
    )
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)
    return new_crop

@router.put("/update/{crop_id}", response_model=CropResponse)
def update_crop(
    crop_id: int,
    crop_in: CropUpdate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    farmer = current_user.farmer_profile
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found"
        )
    
    if crop.farmer_id != farmer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update another farmer's listing"
        )
        
    for field, value in crop_in.model_dump(exclude_unset=True).items():
        setattr(crop, field, value)
        
    db.commit()
    db.refresh(crop)
    return crop

@router.delete("/delete/{crop_id}")
def delete_crop(
    crop_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    farmer = current_user.farmer_profile
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found"
        )
        
    if crop.farmer_id != farmer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete another farmer's listing"
        )
        
    db.delete(crop)
    db.commit()
    return {"message": "Crop listing deleted successfully", "id": crop_id}
