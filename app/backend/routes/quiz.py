from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
import json

from database.database import get_db
from models.quiz import Quiz, Question, QuizRating
from schemas.quiz import (
    QuizCreate, QuizUpdate, QuizResponse, QuizListResponse,
    QuestionCreate, QuestionUpdate, QuestionResponse,
    QuizRatingCreate, QuizRatingResponse
)
from utils.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


@router.post("", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Új kvíz létrehozása kérdésekkel együtt.
    Ellenőrzi a felhasználó kvíz limitjét (kivéve adminokat).
    """
    if not current_user.is_admin:
        user_quiz_count = db.query(Quiz).filter(
            Quiz.creator_id == current_user.id,
            Quiz.is_active == True
        ).count()
        
        quiz_limit = current_user.quiz_limit
        
        if quiz_limit is not None and user_quiz_count >= quiz_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Elérted a kvíz limitedet ({quiz_limit} kvíz). Válts magasabb csomagra!"
            )
    
    new_quiz = Quiz(
        title=quiz_data.title,
        description=quiz_data.description,
        creator_id=current_user.id
    )
    
    db.add(new_quiz)
    db.flush()
    
    for idx, question_data in enumerate(quiz_data.questions):
        question = Question(
            quiz_id=new_quiz.id,
            question_type=question_data.question_type,
            question_text=question_data.question_text,
            options=json.dumps(question_data.options) if question_data.options else None,
            correct_answer=question_data.correct_answer,
            time_limit=question_data.time_limit,
            order_index=question_data.order_index if question_data.order_index else idx
        )
        db.add(question)
    
    db.commit()
    db.refresh(new_quiz)
    
    return new_quiz


@router.get("", response_model=List[QuizListResponse])
async def list_quizzes(
    skip: int = 0,
    limit: int = 50,
    my_quizzes: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kvízek listázása.
    """
    query = db.query(
        Quiz,
        func.count(Question.id).label('question_count'),
        User.username
    ).outerjoin(Question).join(User, Quiz.creator_id == User.id).group_by(Quiz.id, User.username)
    
    if my_quizzes:
        query = query.filter(Quiz.creator_id == current_user.id)
    else:
        query = query.filter(Quiz.is_active == True)
    
    quizzes = query.order_by(desc(Quiz.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for quiz, question_count, username in quizzes:
        quiz_dict = {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "is_active": quiz.is_active,
            # "is_public": quiz.is_public,
            "creator_id": quiz.creator_id,
            "created_by_username": username,
            "total_ratings": quiz.total_ratings,
            "average_rating": quiz.average_rating,
            "question_count": question_count,
            "created_at": quiz.created_at
        }
        result.append(quiz_dict)
    
    return result


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Egy adott kvíz részletes adatai a kérdésekkel együtt.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kvíz nem található"
        )
    
    return quiz


@router.put("/{quiz_id}", response_model=QuizResponse)
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kvíz alapadatainak frissítése. Csak a tulajdonos módosíthatja.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kvíz nem található"
        )
    
    if quiz.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod ehhez a művelethez"
        )
    
    if quiz_data.title is not None:
        quiz.title = quiz_data.title
    if quiz_data.description is not None:
        quiz.description = quiz_data.description
    if quiz_data.is_active is not None:
        quiz.is_active = quiz_data.is_active
    
    db.commit()
    db.refresh(quiz)
    
    return quiz


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kvíz végleges törlése az adatbázisból. Csak a tulajdonos vagy admin törölheti.
    A cascade beállítás miatt automatikusan törlődnek a hozzá tartozó kérdések és értékelések is.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kvíz nem található"
        )
    
    if quiz.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod ehhez a művelethez"
        )
    
    db.delete(quiz)
    db.commit()
    
    return None


# ===== QUESTION ROUTES =====

@router.post("/{quiz_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def add_question(
    quiz_id: int,
    question_data: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Új kérdés hozzáadása egy kvízhez.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kvíz nem található"
        )
    
    if quiz.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod ehhez a művelethez"
        )
    
    question = Question(
        quiz_id=quiz_id,
        question_type=question_data.question_type,
        question_text=question_data.question_text,
        options=json.dumps(question_data.options) if question_data.options else None,
        correct_answer=question_data.correct_answer,
        time_limit=question_data.time_limit,
        order_index=question_data.order_index
    )
    
    db.add(question)
    db.commit()
    db.refresh(question)
    
    return question


@router.put("/{quiz_id}/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    quiz_id: int,
    question_id: int,
    question_data: QuestionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kérdés frissítése.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz or quiz.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod ehhez a művelethez"
        )
    
    question = db.query(Question).filter(
        Question.id == question_id,
        Question.quiz_id == quiz_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kérdés nem található"
        )
    
    if question_data.question_type is not None:
        question.question_type = question_data.question_type
    if question_data.question_text is not None:
        question.question_text = question_data.question_text
    if question_data.options is not None:
        question.options = json.dumps(question_data.options)
    if question_data.correct_answer is not None:
        question.correct_answer = question_data.correct_answer
    if question_data.time_limit is not None:
        question.time_limit = question_data.time_limit
    if question_data.points is not None:
        question.points = question_data.points
    if question_data.speed_bonus is not None:
        question.speed_bonus = question_data.speed_bonus
    if question_data.order_index is not None:
        question.order_index = question_data.order_index
    
    db.commit()
    db.refresh(question)
    
    return question


@router.delete("/{quiz_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    quiz_id: int,
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kérdés törlése egy kvízből.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz or quiz.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod ehhez a művelethez"
        )
    
    question = db.query(Question).filter(
        Question.id == question_id,
        Question.quiz_id == quiz_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kérdés nem található"
        )
    
    db.delete(question)
    db.commit()
    
    return None


# ===== RATING ROUTES =====

@router.post("/{quiz_id}/rate", response_model=QuizRatingResponse)
async def rate_quiz(
    quiz_id: int,
    rating_data: QuizRatingCreate,
    db: Session = Depends(get_db)
):
    """
    Kvíz értékelése (nem kell bejelentkezés).
    Opcionálisan session_id alapján megelőzhető a duplikált értékelés.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kvíz nem található"
        )
    
    
    new_rating = QuizRating(
        quiz_id=quiz_id,
        rating=rating_data.rating,
        session_id=rating_data.session_id
    )
    
    db.add(new_rating)
    
    quiz.total_ratings += 1
    quiz.sum_ratings += rating_data.rating
    quiz.average_rating = quiz.sum_ratings / quiz.total_ratings
    
    db.commit()
    db.refresh(new_rating)
    
    return new_rating


# ===== ADMIN ENDPOINTS =====

@router.get("/admin/all", response_model=List[QuizListResponse])
async def get_all_quizzes_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Összes kvíz lekérése minden felhasználótól (adminok számára)
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod ehhez a művelethez"
        )
    
    quizzes = db.query(
        Quiz,
        func.count(Question.id).label('question_count'),
        User.username
    ).outerjoin(Question).join(User, Quiz.creator_id == User.id).group_by(Quiz.id, User.username).order_by(desc(Quiz.created_at)).all()
    
    result = []
    for quiz, question_count, username in quizzes:
        quiz_dict = {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "creator_id": quiz.creator_id,
            "created_by_username": username,
            "total_ratings": quiz.total_ratings,
            "average_rating": quiz.average_rating,
            "question_count": question_count,
            "created_at": quiz.created_at,
            "is_active": quiz.is_active
        }
        result.append(quiz_dict)
    
    return result


@router.get("/{quiz_id}/ratings")
async def get_quiz_ratings(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Egy kvíz összes értékelésének lekérése
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod ehhez a művelethez"
        )
    
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kvíz nem található"
        )
    
    ratings = db.query(QuizRating).filter(QuizRating.quiz_id == quiz_id).order_by(desc(QuizRating.created_at)).all()
    
    return {
        "quiz_id": quiz_id,
        "quiz_title": quiz.title,
        "ratings": [
            {
                "id": r.id,
                "rating": r.rating,
                "session_id": r.session_id,
                "created_at": r.created_at
            } for r in ratings
        ]
    }


@router.delete("/ratings/{rating_id}")
async def delete_rating(
    rating_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Értékelés törlése
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod ehhez a művelethez"
        )
    
    rating = db.query(QuizRating).filter(QuizRating.id == rating_id).first()
    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Értékelés nem található"
        )
    
    quiz = db.query(Quiz).filter(Quiz.id == rating.quiz_id).first()
    
    # Quiz statisztikák újraszámolása - a törlés ELŐTT kiszámoljuk, mi lesz az új érték
    if quiz:
        # Lekérjük a maradék értékeléseket (KIVÉVE az aktuálisan törlendőt)
        remaining_ratings = db.query(QuizRating).filter(
            QuizRating.quiz_id == quiz.id,
            QuizRating.id != rating_id
        ).all()
        
        if remaining_ratings:
            quiz.total_ratings = len(remaining_ratings)
            quiz.sum_ratings = sum(r.rating for r in remaining_ratings)
            quiz.average_rating = quiz.sum_ratings / quiz.total_ratings
        else:
            quiz.total_ratings = 0
            quiz.sum_ratings = 0
            quiz.average_rating = 0
    
    db.delete(rating)
    db.commit()
    
    return {"message": "Értékelés sikeresen törölve"}
