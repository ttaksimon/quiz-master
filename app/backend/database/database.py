from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - SQLite by default, PostgreSQL for production
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Engine configuration based on database type
if "postgresql" in DATABASE_URL:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Test connections before using them
        pool_size=10,
        max_overflow=20,
    )
else:
    # SQLite configuration (for development)
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
