import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from typing import List, Dict, Any

# ==========================================
# 1. CROP PRICE PREDICTION (Random Forest)
# ==========================================

class PricePredictorModel:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.crop_encoder = LabelEncoder()
        self.season_encoder = LabelEncoder()
        self.demand_encoder = LabelEncoder()
        self._train_dummy_model()

    def _train_dummy_model(self):
        # Generate training data: [crop_name, market_price, season, demand, rainfall]
        crops = ["tomatoes", "rice", "wheat", "onions", "potatoes", "cotton", "maize", "chili"]
        seasons = ["monsoon", "winter", "summer"]
        demands = ["low", "medium", "high"]

        # Fit encoders
        self.crop_encoder.fit(crops)
        self.season_encoder.fit(seasons)
        self.demand_encoder.fit(demands)

        # Generate mock records (150 observations)
        np.random.seed(42)
        data_x = []
        data_y = []

        for _ in range(200):
            crop = np.random.choice(crops)
            season = np.random.choice(seasons)
            demand = np.random.choice(demands)
            
            # Base price
            base_price = 25.0
            if crop == "rice": base_price = 45.0
            elif crop == "wheat": base_price = 40.0
            elif crop == "chili": base_price = 120.0
            elif crop == "tomatoes": base_price = 20.0
            
            # Season effect
            season_mult = 1.0
            if season == "monsoon" and crop == "tomatoes": season_mult = 1.4  # higher price during rains due to rot
            elif season == "summer" and crop == "rice": season_mult = 1.2
            
            # Demand effect
            demand_mult = 1.0
            if demand == "high": demand_mult = 1.25
            elif demand == "low": demand_mult = 0.85

            market_price = base_price * season_mult * demand_mult * np.random.uniform(0.9, 1.1)
            rainfall = np.random.uniform(50.0, 350.0) if season == "monsoon" else np.random.uniform(10.0, 80.0)
            
            # Label/Output: recommended selling price (usually 10-15% higher than local broker price to increase profit)
            rec_price = market_price * 1.12

            data_x.append([
                self.crop_encoder.transform([crop])[0],
                market_price,
                self.season_encoder.transform([season])[0],
                self.demand_encoder.transform([demand])[0],
                rainfall
            ])
            data_y.append(rec_price)

        self.model.fit(np.array(data_x), np.array(data_y))

    def predict(self, crop_name: str, market_price: float, season: str, demand: str, rainfall: float) -> tuple[float, float, str]:
        try:
            c_name = crop_name.lower().strip()
            # Handle out-of-vocabulary crop names
            if c_name not in self.crop_encoder.classes_:
                # Use a default class
                c_idx = 0
            else:
                c_idx = self.crop_encoder.transform([c_name])[0]

            s_name = season.lower().strip()
            if s_name not in self.season_encoder.classes_:
                s_idx = 0
            else:
                s_idx = self.season_encoder.transform([s_name])[0]

            d_name = demand.lower().strip()
            if d_name not in self.demand_encoder.classes_:
                d_idx = 1
            else:
                d_idx = self.demand_encoder.transform([d_name])[0]

            features = np.array([[c_idx, market_price, s_idx, d_idx, rainfall]])
            prediction = float(self.model.predict(features)[0])
            
            # Calculate a pseudo-confidence score
            confidence = 0.94 if c_name in self.crop_encoder.classes_ else 0.78
            reason = f"Based on Random Forest regression analysis of seasonal {season} rainfall ({rainfall}mm) and {demand} demand patterns. Directly selling eliminates middlemen brokers, allowing a ~12% increase over the local market price of ₹{market_price:.2f}/kg."
            
            return round(prediction, 2), confidence, reason
        except Exception as e:
            # Fallback
            return round(market_price * 1.12, 2), 0.80, f"Fallback calculation. Original error: {str(e)}"

price_predictor = PricePredictorModel()


# ==========================================
# 2. CROP DISEASE DETECTION (CNN Simulator)
# ==========================================

class DiseaseDetectorCNN:
    def detect(self, image_url: str) -> Dict[str, Any]:
        """
        Simulates CNN feature mapping and convolutional outputs on uploaded image.
        Uses image path names or content cues to detect diseases deterministically.
        """
        url_lower = image_url.lower()
        
        # Determine disease class from string or default to healthy
        if "tomato" in url_lower:
            if "spot" in url_lower or "leaf" in url_lower:
                return {
                    "disease_name": "Tomato Bacterial Leaf Spot",
                    "confidence_score": 0.89,
                    "remedy": "Apply copper-based fungicides early in the morning. Space plants out to improve air circulation.",
                    "fertilizers": ["Calcium nitrate", "Potassium sulfate"]
                }
            elif "blight" in url_lower:
                return {
                    "disease_name": "Tomato Early Blight",
                    "confidence_score": 0.93,
                    "remedy": "Remove infected lower leaves. Spray organic neem oil or chlorothalonil fungicide.",
                    "fertilizers": ["Compost manure", "Balanced 10-10-10 NPK"]
                }
        
        if "rice" in url_lower or "blast" in url_lower:
            return {
                "disease_name": "Rice Blast (Pyricularia oryzae)",
                "confidence_score": 0.91,
                "remedy": "Avoid excessive nitrogen application. Maintain proper water levels. Use tricyclazole fungicide if severe.",
                "fertilizers": ["Silicon fertilizer", "Potash enrichment"]
            }

        if "rust" in url_lower or "wheat" in url_lower:
            return {
                "disease_name": "Wheat Leaf Rust",
                "confidence_score": 0.88,
                "remedy": "Grow rust-resistant wheat varieties. Spray triazole-based chemical fungicides when symptoms first appear.",
                "fertilizers": ["Phosphorus booster", "Urea (limited)"]
            }

        # Default healthy response
        return {
            "disease_name": "Healthy / No Disease Detected",
            "confidence_score": 0.97,
            "remedy": "Keep maintaining soil moisture and weed control. Clean farming equipment after use.",
            "fertilizers": ["Organic vermicompost", "Micro-nutrients spray"]
        }

disease_detector = DiseaseDetectorCNN()


# ==========================================
# 3. RECOMMENDATION ENGINE (Collaborative Filtering)
# ==========================================

def get_recommendations(user_history: List[int], all_crops: List[Any], limit: int = 4) -> List[Any]:
    """
    Implements a content-category recommendation logic.
    If purchase history is empty, falls back to recommending popular active crops.
    """
    if not all_crops:
        return []

    # Category matching
    if user_history:
        # User bought these categories previously
        purchased_categories = set([crop.category for crop in all_crops if crop.id in user_history])
        recommendations = [crop for crop in all_crops if crop.category in purchased_categories and crop.id not in user_history]
        
        # If not enough, fill with remaining crops
        if len(recommendations) < limit:
            remaining = [crop for crop in all_crops if crop.id not in user_history and crop not in recommendations]
            recommendations.extend(remaining)
    else:
        recommendations = all_crops

    return recommendations[:limit]


# ==========================================
# 4. AI FARMING ASSISTANT CHATBOT
# ==========================================

class AIFarmingAssistant:
    def get_response(self, query: str) -> str:
        q = query.lower()
        
        if "tomato" in q:
            if "harvest" in q or "when" in q:
                return "Tomatoes should be harvested when they are firm and changing color (light red or pink). Let them ripen fully at room temperature away from direct sunlight for the best flavor."
            elif "fertilizer" in q or "feed" in q:
                return "Tomatoes are heavy feeders. Use a balanced 10-10-10 fertilizer at planting, then switch to low-nitrogen, high-potassium fertilizers (like 5-10-10) once they start setting fruit to promote larger tomatoes instead of just leaves."
            return "Tomatoes grow best in warm weather, needing 6-8 hours of direct sunlight. Watch out for Early Blight and Bacterial Leaf Spot during humid or rainy weather."

        if "rice" in q or "paddy" in q:
            return "Rice cultivation requires clayey or loamy soils that hold water well. Apply nitrogen in split doses: at transplanting, active tillering, and panicle initiation. Silicon fertilizers increase resistance to Rice Blast disease."

        if "fertilizer" in q or "npk" in q:
            return "NPK stands for Nitrogen (for leafy growth), Phosphorus (for root and flower development), and Potassium (for overall plant health and disease resistance). Always perform a soil test before applying large amounts."

        if "weather" in q or "rain" in q:
            return "Before heavy rainfall, ensure your fields have proper drainage outlets to prevent root rot. Avoid spraying pesticides or applying top-dress fertilizers right before a heavy storm."

        if "pest" in q or "insect" in q:
            return "For organic pest control, spray neem oil mixed with mild liquid soap and water. For whiteflies or aphids, introducing ladybugs or using yellow sticky traps is highly effective."

        # Default fallback general agronomy answer
        return (
            "AntiGravity AgriMarket AI Assistant: I can help you with crop advice, weather-safe harvest dates, fertilizer ratios (NPK), and disease management. "
            "Try asking: 'What fertilizer is best for tomatoes?' or 'How do I prevent pest infestations?'"
        )

ai_assistant = AIFarmingAssistant()
