from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
from datetime import datetime

from database.database import get_db
from models.quiz import Quiz, Question
from models.user import User
from utils.dependencies import get_current_user
from services.export_service import generate_pdf_report, generate_excel_report
from services.game_manager import game_manager
from services.websocket_manager import manager
from schemas.game import (
    CreateGameRequest,
    CreateGameResponse,
    JoinGameRequest,
    StartQuestionRequest,
    SubmitAnswerRequest,
    FinishQuestionRequest
)

router = APIRouter(prefix="/api/game", tags=["game"])


@router.post("/create", response_model=CreateGameResponse)
async def create_game(
    request: CreateGameRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Új játék session létrehozása
    """
    quiz = db.query(Quiz).filter(
        Quiz.id == request.quiz_id,
        Quiz.creator_id == current_user.id,
        Quiz.is_active == True
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kvíz nem található vagy nincs jogosultságod"
        )
    
    questions = db.query(Question).filter(
        Question.quiz_id == quiz.id
    ).order_by(Question.order_index).all()
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A kvíznek nincs kérdése"
        )
    
    quiz_data = {
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'questions': [
            {
                'id': q.id,
                'question_type': q.question_type,
                'question_text': q.question_text,
                'options': json.loads(q.options) if q.options else None,
                'correct_answer': q.correct_answer,
                'time_limit': q.time_limit,
                'order_index': q.order_index,
                'points': 10,
                'speed_bonus': True
            }
            for q in questions
        ]
    }
    
    session = game_manager.create_session(
        quiz_id=quiz.id,
        host_user_id=current_user.id,
        quiz_data=quiz_data
    )
    
    return CreateGameResponse(
        game_code=session.game_code,
        quiz_title=quiz.title,
        question_count=len(questions)
    )


@router.get("/session/{game_code}")
async def get_session_info(
    game_code: str,
    current_user: User = Depends(get_current_user)
):
    """
    Session információk lekérése (host számára)
    """
    session = game_manager.get_session(game_code)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Játék session nem található"
        )
    
    if session.host_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Csak a host láthatja ezt"
        )
    
    leaderboard = game_manager.get_leaderboard(game_code, limit=10)
    
    results = None
    if session.current_question and session.current_question.finished:
        results = {}
        for nickname, answer_info in session.current_question.answers_received.items():
            if nickname in session.players:
                player = session.players[nickname]
                q_idx = session.current_question.question_index
                if q_idx in player.answers:
                    results[nickname] = player.answers[q_idx]
    
    current_question_data = None
    if session.current_question and not session.current_question.finished:
        current_question_data = {
            'question_index': session.current_question.question_index,
            'question_text': session.current_question.question_data.get('question_text'),
            'time_limit': session.current_question.question_data.get('time_limit', 30),
            'started_at': session.current_question.started_at.isoformat(),
            'answers_received': session.current_question.answers_received
        }
    
    return {
        'game_code': session.game_code,
        'status': session.status,
        'player_count': len(session.players),
        'players': [
            {
                'nickname': p.nickname,
                'score': p.score,
                'connected': p.connected
            }
            for p in session.players.values()
        ],
        'current_question_index': session.current_question_index,
        'total_questions': len(session.questions),
        'current_question': current_question_data,
        'leaderboard': leaderboard,
        'results': results,
        'question_finished': session.current_question.finished if session.current_question else False
    }


@router.post("/start-question")
async def start_question(
    request: StartQuestionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Kérdés indítása (host)
    """
    session = game_manager.get_session(request.game_code)
    
    if not session or session.host_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod"
        )
    
    success = game_manager.start_question(request.game_code, request.question_index)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nem sikerült a kérdést elindítani"
        )
    
    updated_session = game_manager.get_session(request.game_code)
    
    await manager.broadcast_to_game(
        {
            'type': 'question_started',
            'question_index': request.question_index,
            'started_at': updated_session.current_question.started_at.isoformat() if updated_session.current_question else None,
            'time_limit': updated_session.current_question.question_data.get('time_limit', 30) if updated_session.current_question else 30
        },
        request.game_code
    )
    
    return {'success': True, 'question_index': request.question_index}


@router.get("/current-question/{game_code}")
async def get_current_question(game_code: str):
    """
    Aktuális kérdés lekérése (játékosok számára)
    Nem igényel autentikációt!
    """
    session = game_manager.get_session(game_code)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Játék nem található"
        )
    
    if not session.current_question or session.current_question.finished:
        return {
            'question': None,
            'message': 'Nincs aktív kérdés'
        }
    
    current_q = session.current_question
    question_data = current_q.question_data.copy()
    
    question_data.pop('correct_answer', None)
    
    elapsed = (datetime.now() - current_q.started_at).total_seconds()
    time_limit = question_data.get('time_limit', 30)
    time_remaining = max(0, time_limit - elapsed)
    
    return {
        'question': question_data,
        'question_index': current_q.question_index,
        'time_remaining': time_remaining,
        'started_at': current_q.started_at.isoformat()
    }


@router.post("/finish-question")
async def finish_question(
    request: FinishQuestionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Kérdés lezárása és eredmények kiosztása (host)
    """
    session = game_manager.get_session(request.game_code)
    
    if not session or session.host_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod"
        )
    
    results = game_manager.finish_question(request.game_code)
    leaderboard = game_manager.get_leaderboard(request.game_code, limit=10)
    
    await manager.broadcast_to_game(
        {
            'type': 'question_finished',
            'results': results,
            'leaderboard': leaderboard,
            'correct_answer': session.current_question.question_data.get('correct_answer')
        },
        request.game_code
    )
    
    return {
        'results': results,
        'leaderboard': leaderboard
    }


@router.post("/finish-game")
async def finish_game(
    game_code: str,
    current_user: User = Depends(get_current_user)
):
    """
    Játék befejezése (host)
    """
    session = game_manager.get_session(game_code)
    
    if not session or session.host_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs jogosultságod"
        )
    
    game_manager.finish_game(game_code)
    final_leaderboard = game_manager.get_leaderboard(game_code, limit=999)
    
    await manager.broadcast_to_game(
        {
            'type': 'game_finished',
            'leaderboard': final_leaderboard,
            'quiz_id': session.quiz_id  # Küldjük el a quiz_id-t az értékeléshez
        },
        game_code
    )
    
    return {'leaderboard': final_leaderboard, 'quiz_id': session.quiz_id}


@router.get("/leaderboard/{game_code}")
async def get_leaderboard(game_code: str):
    """
    Ranglista lekérése
    """
    session = game_manager.get_session(game_code)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Játék nem található"
        )
    
    leaderboard = game_manager.get_leaderboard(game_code)
    return {'leaderboard': leaderboard}


@router.get("/export/pdf/{game_code}")
async def export_pdf(
    game_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eredmények exportálása PDF formátumban
    """
    session = game_manager.get_session(game_code)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Játék nem található"
        )
    
    if session.host_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Csak a host exportálhatja az eredményeket"
        )
    
    leaderboard = game_manager.get_leaderboard(game_code, limit=999, include_question_details=True)
    
    game_data = {
        'game_code': session.game_code,
        'quiz_title': session.quiz_data.get('title', 'Kvíz Játék') if session.quiz_data else 'Kvíz Játék',
        'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'question_count': len(session.questions),
        'questions': session.questions
    }
    
    pdf_buffer = generate_pdf_report(game_data, leaderboard)
    
    return StreamingResponse(
        pdf_buffer,
        media_type='application/pdf',
        headers={
            'Content-Disposition': f'attachment; filename="kviz_eredmenyek_{game_code}.pdf"'
        }
    )


@router.get("/export/excel/{game_code}")
async def export_excel(
    game_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eredmények exportálása Excel formátumban
    """
    session = game_manager.get_session(game_code)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Játék nem található"
        )
    
    if session.host_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Csak a host exportálhatja az eredményeket"
        )
    
    leaderboard = game_manager.get_leaderboard(game_code, limit=999, include_question_details=True)
    
    game_data = {
        'game_code': session.game_code,
        'quiz_title': session.quiz_data.get('title', 'Kvíz Játék') if session.quiz_data else 'Kvíz Játék',
        'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'question_count': len(session.questions),
        'questions': session.questions
    }
    
    excel_buffer = generate_excel_report(game_data, leaderboard)
    
    return StreamingResponse(
        excel_buffer,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            'Content-Disposition': f'attachment; filename="kviz_eredmenyek_{game_code}.xlsx"'
        }
    )


# ===== WebSocket ENDPOINT =====

@router.websocket("/ws/{game_code}/{nickname}")
async def websocket_endpoint(websocket: WebSocket, game_code: str, nickname: str):
    """
    WebSocket kapcsolat játékosoknak
    """
    connection_id = f"{game_code}_{nickname}_{datetime.now().timestamp()}"
    
    await websocket.accept()
    
    success, message = game_manager.join_session(game_code, nickname, connection_id)
    
    if not success:
        await websocket.send_json({
            'type': 'error',
            'message': message
        })
        await websocket.close(code=1008, reason=message)
        return
    
    manager.active_connections[connection_id] = websocket
    
    if game_code not in manager.game_connections:
        manager.game_connections[game_code] = []
    manager.game_connections[game_code].append(connection_id)
    
    await manager.send_personal_message(
        {
            'type': 'connected',
            'message': message,
            'nickname': nickname
        },
        connection_id
    )
    
    await manager.broadcast_to_game(
        {
            'type': 'player_joined',
            'nickname': nickname
        },
        game_code
    )
    
    try:
        while True:
            data = await websocket.receive_json()
            
            message_type = data.get('type')
            
            if message_type == 'submit_answer':
                answer = data.get('answer')
                success = game_manager.submit_answer(game_code, nickname, answer)
                
                await manager.send_personal_message(
                    {
                        'type': 'answer_submitted',
                        'success': success
                    },
                    connection_id
                )
                
                session = game_manager.get_session(game_code)
                if session and session.current_question:
                    answers_count = len(session.current_question.answers_received)
                    total_players = len(session.players)
                    
                    await manager.broadcast_to_game(
                        {
                            'type': 'answer_received',
                            'nickname': nickname,
                            'answers_count': answers_count,
                            'total_players': total_players
                        },
                        game_code
                    )
            
            elif message_type == 'ping':
                await manager.send_personal_message({'type': 'pong'}, connection_id)
    
    except WebSocketDisconnect:
        manager.disconnect(connection_id, game_code)
        game_manager.disconnect_player(connection_id)
        
        await manager.broadcast_to_game(
            {
                'type': 'player_disconnected',
                'nickname': nickname
            },
            game_code
        )
