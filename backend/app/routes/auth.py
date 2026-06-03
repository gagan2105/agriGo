from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User, Farmer, Buyer
from app.schemas.user import UserCreate, UserResponse, Token
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    user_exists = db.query(User).filter(User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    phone_exists = db.query(User).filter(User.phone == user_in.phone).first()
    if phone_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )

    # Hash the password
    hashed_pwd = get_password_hash(user_in.password)
    
    # Create the user
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=hashed_pwd,
        role=user_in.role,
        address=user_in.address,
        latitude=user_in.latitude,
        longitude=user_in.longitude,
        profile_image=user_in.profile_image
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Add profile information based on role
    if user_in.role == "farmer":
        farmer_data = user_in.farmer or {}
        new_farmer = Farmer(
            user_id=new_user.id,
            farm_name=getattr(farmer_data, 'farm_name', f"{new_user.name}'s Farm"),
            farm_size=getattr(farmer_data, 'farm_size', 0.0),
            experience=getattr(farmer_data, 'experience', 0),
            certifications=getattr(farmer_data, 'certifications', ""),
            bank_details=getattr(farmer_data, 'bank_details', "")
        )
        db.add(new_farmer)
        db.commit()
        db.refresh(new_user)
        
    elif user_in.role == "buyer":
        buyer_data = user_in.buyer or {}
        new_buyer = Buyer(
            user_id=new_user.id,
            business_name=getattr(buyer_data, 'business_name', f"{new_user.name} Trade"),
            buyer_type=getattr(buyer_data, 'buyer_type', "consumer")
        )
        db.add(new_buyer)
        db.commit()
        db.refresh(new_user)

    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Issue JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": user.email,
        "email": user.email,
        "role": user.role,
        "user_id": user.id
    }
    access_token = create_access_token(data=token_data, expires_delta=access_token_expires)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out. Access token cleared."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
