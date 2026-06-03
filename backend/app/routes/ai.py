from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.crop import Crop
from app.models.ai import PricePrediction, DiseaseDetection
from app.models.order import Order, OrderItem
from app.schemas.ai import (
    PricePredictionRequest, PricePredictionResponse,
    DiseaseDetectionRequest, DiseaseDetectionResponse,
    AIChatRequest, AIChatResponse
)
from app.schemas.crop import CropResponse
from app.utils.auth import get_current_user, require_authorized, require_buyer
from app.utils.ai_helpers import price_predictor, disease_detector, get_recommendations, ai_assistant

router = APIRouter(prefix="/ai", tags=["AI Modules"])

@router.post("/predict-price", response_model=PricePredictionResponse)
def predict_crop_price(
    req: PricePredictionRequest,
    current_user: User = Depends(require_authorized),
    db: Session = Depends(get_db)
):
    predicted_val, confidence, reasoning = price_predictor.predict(
        crop_name=req.crop_name,
        market_price=req.market_price,
        season=req.season,
        demand=req.demand,
        rainfall=req.rainfall
    )
    
    # Optionally save to database
    db_pred = PricePrediction(
        predicted_price=predicted_val,
        confidence_score=confidence
    )
    db.add(db_pred)
    db.commit()
    
    return PricePredictionResponse(
        crop_name=req.crop_name,
        recommended_price=predicted_val,
        confidence_score=confidence,
        reasoning=reasoning
    )

@router.post("/detect-disease", response_model=DiseaseDetectionResponse)
def detect_crop_disease(
    req: DiseaseDetectionRequest,
    current_user: User = Depends(require_authorized),
    db: Session = Depends(get_db)
):
    result = disease_detector.detect(req.image_url)
    
    # Save detection log
    db_detect = DiseaseDetection(
        crop_id=req.crop_id,
        image_url=req.image_url,
        disease_name=result["disease_name"],
        confidence_score=result["confidence_score"]
    )
    db.add(db_detect)
    db.commit()
    
    return DiseaseDetectionResponse(
        disease_name=result["disease_name"],
        confidence_score=result["confidence_score"],
        remedy=result["remedy"],
        fertilizers=result["fertilizers"]
    )

@router.get("/recommend", response_model=List[CropResponse])
def recommend_crops(
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    buyer = current_user.buyer_profile
    if not buyer:
        raise HTTPException(status_code=400, detail="Buyer profile not found")

    # Fetch buyer's order history crop IDs
    buyer_orders = db.query(Order).filter(Order.buyer_id == buyer.id).all()
    user_history = []
    if buyer_orders:
        order_ids = [o.id for o in buyer_orders]
        items = db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).all()
        user_history = [item.crop_id for item in items]
        
    # Fetch all active crops to run categories match
    all_crops = db.query(Crop).filter(Crop.status == "active").all()
    
    recommended = get_recommendations(user_history, all_crops)
    return recommended

@router.post("/chatbot", response_model=AIChatResponse)
def farming_assistant_chat(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    answer = ai_assistant.get_response(req.message)
    return AIChatResponse(response=answer)
