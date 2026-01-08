from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class SubscriptionPlan(str, Enum):
    BASIC = "basic"
    PREMIUM = "premium"
    PRO = "pro"
    ADMIN = "admin"  # Admin felhasználók speciális csomagja


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"
    REJECTED = "rejected"


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    password_confirm: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    subscription_plan: SubscriptionPlan
    subscription_status: SubscriptionStatus
    requested_plan: Optional[SubscriptionPlan] = None
    quiz_limit: Optional[int] = None
    has_gemini_api_key: bool = False  # Nem küldjük el magát a kulcsot!
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserUpdateApiKey(BaseModel):
    gemini_api_key: str = Field(..., min_length=10, max_length=500)


class SubscriptionRequest(BaseModel):
    requested_plan: SubscriptionPlan


class AdminUserUpdate(BaseModel):
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    subscription_plan: Optional[SubscriptionPlan] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
