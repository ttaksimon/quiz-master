"""
Subscription routes - előfizetés kezelés.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from schemas.user import UserResponse, SubscriptionRequest
from utils.dependencies import get_current_user


router = APIRouter(prefix="/api/subscription", tags=["subscription"])


def create_user_response(user: User) -> UserResponse:
    """
    Segédfüggvény UserResponse létrehozásához minden szükséges mezővel
    """
    response_data = UserResponse.model_validate(user)
    response_data.has_gemini_api_key = bool(user.gemini_api_key)
    response_data.quiz_limit = user.quiz_limit
    return response_data


@router.post("/request", response_model=UserResponse)
async def request_subscription_upgrade(
    subscription_data: SubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Előfizetés csomag igénylése. Az admin felhasználó jóvá kell hagyja.
    A requested_plan mező jelzi a függőben lévő igénylést.
    """
    # Nem lehet ugyanazt a csomagot igényelni, amit már használ
    if current_user.subscription_plan == subscription_data.requested_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jelenleg már ebben a csomagban vagy"
        )
    
    # Igénylés rögzítése - csak a requested_plan mezőt állítjuk be
    current_user.requested_plan = subscription_data.requested_plan
    
    db.commit()
    db.refresh(current_user)
    
    return create_user_response(current_user)


@router.delete("/cancel", response_model=UserResponse)
async def cancel_subscription_request(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Felhasználó visszavonja a függőben lévő előfizetés igénylését.
    """
    # Ellenőrizzük, hogy van-e függőben lévő igénylés
    if not current_user.requested_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nincs függőben lévő igénylés"
        )
    
    # Igénylés törlése
    current_user.requested_plan = None
    
    db.commit()
    db.refresh(current_user)
    
    return create_user_response(current_user)
