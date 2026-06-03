from pydantic import BaseModel
from datetime import datetime

class ChatBase(BaseModel):
    receiver_id: int
    message: str

class ChatCreate(ChatBase):
    pass

class ChatResponse(ChatBase):
    id: int
    sender_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
