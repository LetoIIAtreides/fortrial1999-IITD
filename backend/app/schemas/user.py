from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "responder" # "responder" or "admin"
    badge_number: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    role: str
    full_name: str
    badge_number: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
