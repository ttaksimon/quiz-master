from routes.auth import router as auth_router
from routes.quiz import router as quiz_router
from routes.ai import router as ai_router

__all__ = ["auth_router", "quiz_router", "ai_router"]
