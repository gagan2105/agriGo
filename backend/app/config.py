import os

class Settings:
    PROJECT_NAME: str = "AntiGravity AgriMarket"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agrimarket.db")
    
    # JWT Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "antigravity_agrimarket_secret_key_2026_super_secure")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Third Party Integrations (simulated keys)
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock_stripe_key_agrimarket")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "mock_google_maps_key")
    CLOUDINARY_URL: str = os.getenv("CLOUDINARY_URL", "cloudinary://mock_cloudinary_url")

settings = Settings()
