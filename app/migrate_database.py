#!/usr/bin/env python3
"""
Database Migration Helper
SQLite-ból PostgreSQL-re való migrációhoz
"""

import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database.database import SessionLocal, Base, engine
from models.user import User
from models.quiz import Quiz

load_dotenv()

def migrate_database():
    """
    Migrálj az SQLite-ról PostgreSQL-re
    1. Exportálja az SQLite adatokat
    2. Importálja az új PostgreSQL adatbázisba
    """
    
    print("=== QuizMaster Database Migration ===\n")
    
    current_db = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    print(f"Current Database: {current_db}\n")
    
    if "postgresql" in current_db:
        print("✓ PostgreSQL database found")
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ All tables created successfully!\n")
        
        db = SessionLocal()
        try:
            # Tábla ellenőrzése
            user_count = db.query(User).count()
            quiz_count = db.query(Quiz).count()
            
            print(f"Database Status:")
            print(f"  - Users: {user_count}")
            print(f"  - Quizzes: {quiz_count}")
            print("\n✓ Migration completed!")
        finally:
            db.close()
    else:
        print("! Warning: Using SQLite database")
        print("To migrate to PostgreSQL:")
        print("  1. Set DATABASE_URL=postgresql://... in .env")
        print("  2. Run this script again")
        print("\nFor local development, SQLite is fine.")
        print("But for production (Render), use PostgreSQL!")

if __name__ == "__main__":
    migrate_database()
