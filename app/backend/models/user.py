from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database.database import Base


class SubscriptionPlan(str, enum.Enum):
    BASIC = "basic"
    PREMIUM = "premium"
    PRO = "pro"
    ADMIN = "admin"  # Admin felhasználók speciális csomagja


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    PENDING = "pending"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Előfizetési adatok
    subscription_plan = Column(String, default='basic', nullable=False)
    subscription_status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    requested_plan = Column(String, nullable=True)
    
    # Gemini API kulcs - titkosítva tárolva
    gemini_api_key = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Kapcsolat a kvízekkel
    quizzes = relationship("Quiz", back_populates="creator")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}', is_admin={self.is_admin}, plan={self.subscription_plan})>"
    
    @property
    def quiz_limit(self):
        """Visszaadja a felhasználó kvíz limitjét"""
        limits = {
            'basic': 5,
            'premium': 15,
            'pro': None,  # Korlátlan
            'admin': None  # Korlátlan
        }
        return limits.get(self.subscription_plan, 5)
