from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from models.user import User
from schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdateApiKey
from utils.auth import hash_password, verify_password, create_access_token
from utils.dependencies import get_current_user
from datetime import timedelta
import os

router = APIRouter(prefix="/api/auth", tags=["authentication"])


def create_user_response(user: User) -> UserResponse:
    """
    Segédfüggvény UserResponse létrehozásához minden szükséges mezővel
    """
    response_data = UserResponse.model_validate(user)
    response_data.has_gemini_api_key = bool(user.gemini_api_key)
    response_data.quiz_limit = user.quiz_limit
    return response_data


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Új felhasználó regisztrálása.
    Az első regisztrált felhasználó automatikusan admin jogosultságot kap.
    """
    if user_data.password != user_data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A jelszavak nem egyeznek"
        )
    
    existing_user_by_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_user_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ez az email cím már regisztrálva van"
        )
    
    existing_user_by_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_user_by_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ez a felhasználónév már foglalt"
        )
    
    user_count = db.query(User).count()
    is_first_user = user_count == 0
    
    password_hash = hash_password(user_data.password)
    
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash,
        is_admin=is_first_user  # Az első felhasználó admin lesz
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Felhasználó bejelentkeztetése email és jelszó alapján.
    Sikeres bejelentkezés esetén JWT tokent ad vissza.
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Helytelen email vagy jelszó",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Helytelen email vagy jelszó",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A felhasználói fiók inaktív"
        )
    
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")))
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    A bejelentkezett felhasználó adatainak lekérése.
    Ehhez az endpointhoz JWT token szükséges.
    """
    return create_user_response(current_user)


@router.put("/api-key", response_model=UserResponse)
async def update_gemini_api_key(
    api_key_data: UserUpdateApiKey,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Gemini API kulcs hozzáadása vagy frissítése.
    Csak prémium, profi csomagok és admin felhasználók esetén elérhető.
    """
    if current_user.subscription_plan == "basic" and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="A Gemini API kulcs megadása csak Prémium és Profi csomagok esetén érhető el."
        )
    
    current_user.gemini_api_key = api_key_data.gemini_api_key
    db.commit()
    db.refresh(current_user)
    
    return create_user_response(current_user)


@router.delete("/api-key", response_model=UserResponse)
async def delete_gemini_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Gemini API kulcs törlése.
    Csak prémium, profi csomagok és admin felhasználók esetén elérhető.
    """
    if current_user.subscription_plan == "basic" and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="A Gemini API kulcs kezelése csak Prémium és Profi csomagok esetén érhető el."
        )
    
    current_user.gemini_api_key = None
    db.commit()
    db.refresh(current_user)
    
    return create_user_response(current_user)


@router.put("/change-password", response_model=UserResponse)
async def change_password(
    password_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Felhasználó jelszavának módosítása.
    """
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    confirm_password = password_data.get("confirm_password")
    
    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mindkét jelszó megadása kötelező"
        )
    
    if confirm_password and new_password != confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Az új jelszavak nem egyeznek"
        )
    
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Helytelen jelenlegi jelszó"
        )
    
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Az új jelszónak legalább 8 karakter hosszúnak kell lennie"
        )
    
    current_user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(current_user)
    
    return create_user_response(current_user)
