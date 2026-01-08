from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import google.generativeai as genai

from database.database import get_db
from models.user import User
from schemas.quiz import AIGenerateWrongAnswersRequest, AIGenerateWrongAnswersResponse
from utils.dependencies import get_current_user

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/generate-wrong-answers", response_model=AIGenerateWrongAnswersResponse)
async def generate_wrong_answers(
    request: AIGenerateWrongAnswersRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI segítségével rossz válaszok generálása egy kérdéshez.
    Gemini API kulcs szükséges. Csak prémium, profi csomagok és admin felhasználók esetén elérhető.
    """
    if current_user.subscription_plan == "basic" and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Az AI funkciók csak Prémium és Profi csomagok esetén érhetők el."
        )
    
    if not current_user.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nincs beállított Gemini API kulcs. Kérlek, add hozzá a fiók beállításokban!"
        )
    
    try:
        genai.configure(api_key=current_user.gemini_api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
Generálj {request.num_wrong_answers} darab HELYTELEN választ az alábbi kérdéshez.
A válaszoknak teljesen helytelennek kell lenniük, de hihető alternatíváknak kell látszaniuk.

Kérdés: {request.question_text}
Helyes válasz: {request.correct_answer}

Kérlek, adj vissza pontosan {request.num_wrong_answers} helytelen választ, soronként egyet, mindenféle számozás vagy extra szöveg nélkül.
Csak a válaszokat add vissza, semmi mást!
"""
        
        response = model.generate_content(prompt)
        
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Az AI nem adott választ"
            )
        
        wrong_answers = [line.strip() for line in response.text.strip().split('\n') if line.strip()]
        
        wrong_answers = wrong_answers[:request.num_wrong_answers]
        
        if len(wrong_answers) < request.num_wrong_answers:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Az AI nem generált elég választ"
            )
        
        return AIGenerateWrongAnswersResponse(wrong_answers=wrong_answers)
    
    except Exception as e:
        # Ha Gemini API hiba van
        error_message = str(e)
        if "API_KEY_INVALID" in error_message or "invalid" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Érvénytelen Gemini API kulcs. Kérlek, ellenőrizd a beállításokban!"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hiba történt az AI válaszok generálása során: {error_message}"
        )
