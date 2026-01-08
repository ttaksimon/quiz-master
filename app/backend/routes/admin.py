from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from models.user import User
from schemas.user import UserResponse, AdminUserUpdate
from utils.dependencies import get_current_admin_user


router = APIRouter(prefix="/api/admin", tags=["admin"])


def create_user_response(user: User) -> UserResponse:
    """
    Segédfüggvény UserResponse létrehozásához minden szükséges mezővel
    """
    response_data = UserResponse.model_validate(user)
    response_data.has_gemini_api_key = bool(user.gemini_api_key)
    response_data.quiz_limit = user.quiz_limit
    return response_data


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Összes felhasználó listázása (csak adminok számára).
    """
    users = db.query(User).all()
    
    return [create_user_response(user) for user in users]


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_by_admin(
    user_id: int,
    update_data: AdminUserUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Felhasználó adatainak módosítása admin által.
    Lehet változtatni: is_admin, is_active, subscription_plan
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Felhasználó nem található"
        )
    
    # Admin ne változtathassa meg a saját admin státuszát vagy aktív státuszát
    if user.id == current_admin.id:
        if update_data.is_admin is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nem változtathatod meg a saját admin státuszodat"
            )
        if update_data.is_active is not None and not update_data.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nem inaktiválhatod a saját fiókodat"
            )
    
    # Frissítések alkalmazása
    if update_data.is_admin is not None:
        user.is_admin = update_data.is_admin
        if update_data.is_admin:
            user.subscription_plan = 'admin'
            user.requested_plan = None
        elif update_data.subscription_plan is None:
            user.subscription_plan = 'basic'
    
    if update_data.is_active is not None:
        user.is_active = update_data.is_active
    
    # Csak akkor módosítjuk a subscription_plan-t, ha nem admin a felhasználó
    if update_data.subscription_plan is not None and not user.is_admin:
        user.subscription_plan = update_data.subscription_plan
        user.requested_plan = None
    
    db.commit()
    db.refresh(user)
    
    return create_user_response(user)


@router.post("/approve-request/{user_id}", response_model=UserResponse)
async def approve_subscription_request(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Csomag igénylés jóváhagyása - áthelyezi a felhasználót az igényelt csomagba.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Felhasználó nem található"
        )
    
    if not user.requested_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nincs függőben lévő igénylés"
        )
    
    user.subscription_plan = user.requested_plan
    user.requested_plan = None
    
    db.commit()
    db.refresh(user)
    
    return create_user_response(user)


@router.post("/reject-request/{user_id}", response_model=UserResponse)
async def reject_subscription_request(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Csomag igénylés elutasítása - egyszerűen törli a requested_plan mezőt.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Felhasználó nem található"
        )
    
    if not user.requested_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nincs függőben lévő igénylés"
        )
    
    user.requested_plan = None
    
    db.commit()
    db.refresh(user)
    
    return create_user_response(user)


@router.get("/pending-requests", response_model=List[UserResponse])
async def get_pending_requests(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Összes függőben lévő csomag igénylés lekérése.
    """
    users_with_requests = db.query(User).filter(User.requested_plan.isnot(None)).all()
    
    return [create_user_response(user) for user in users_with_requests]
