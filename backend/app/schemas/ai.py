from pydantic import BaseModel, Field
from typing import Optional, List

class PricePredictionRequest(BaseModel):
    crop_name: str
    market_price: float = Field(gt=0)
    season: str  # "monsoon", "winter", "summer"
    demand: str  # "high", "medium", "low"
    rainfall: float = Field(ge=0)  # in mm

class PricePredictionResponse(BaseModel):
    crop_name: str
    recommended_price: float
    confidence_score: float
    reasoning: str

class DiseaseDetectionRequest(BaseModel):
    crop_id: Optional[int] = None
    image_url: str

class DiseaseDetectionResponse(BaseModel):
    disease_name: str
    confidence_score: float
    remedy: str
    fertilizers: List[str]

class AIChatRequest(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    response: str
