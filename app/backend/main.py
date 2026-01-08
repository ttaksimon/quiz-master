from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base
from routes.auth import router as auth_router
from routes.quiz import router as quiz_router
from routes.ai import router as ai_router
from routes.game import router as game_router
from routes.admin import router as admin_router
from routes.subscription import router as subscription_router
from middleware.token_refresh import TokenRefreshMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

# Adatbázis táblák létrehozása
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Full-Stack Quiz Application API",
    description="Kvíz alkalmazás FastAPI és React alapokon",
    version="2.0.0"
)

app.add_middleware(TokenRefreshMiddleware)

# CORS middleware configuration
env_origins = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")

# Use a set to avoid duplicates and allow multiple env values
allowed_origins = set(origin.strip() for origin in env_origins if origin.strip())

if os.getenv("ENVIRONMENT") == "production":
    # Production defaults (Netlify + future custom domain)
    allowed_origins.update([
        "https://quizmaster323.netlify.app",
        "https://www.quizmaster323.netlify.app",
        "https://quizmaster.taksimon.hu",
        "https://www.quizmaster.taksimon.hu",
    ])
else:
    # Development defaults
    allowed_origins.update([
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5000",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-New-Token"],
)

app.include_router(auth_router)
app.include_router(quiz_router)
app.include_router(ai_router)
app.include_router(game_router)
app.include_router(admin_router)
app.include_router(subscription_router)


@app.get("/")
async def root():
    return {
        "message": "Full-Stack Quiz Application API",
        "version": "2.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "development")
    }
