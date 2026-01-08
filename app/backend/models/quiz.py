from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Rating mezők
    total_ratings = Column(Integer, default=0)
    sum_ratings = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Kapcsolatok
    creator = relationship("User", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    ratings = relationship("QuizRating", back_populates="quiz", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Quiz(id={self.id}, title='{self.title}', creator_id={self.creator_id})>"


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    
    # Kérdés típusok: 'single_choice', 'multiple_choice', 'number', 'order'
    question_type = Column(String(50), nullable=False)
    question_text = Column(Text, nullable=False)
    
    # Válaszlehetőségek
    options = Column(Text, nullable=True)
    
    # Helyes válasz
    # single_choice: "0" (index)
    # multiple_choice: "[0, 2]" (indexek)
    # number: "42.5"
    # order: "[2, 0, 1, 3]" (helyes sorrend indexei)
    correct_answer = Column(Text, nullable=False)
    
    # Időkorlát másodpercben
    time_limit = Column(Integer, default=30)
    
    # Pontszám és gyorsasági bónusz
    points = Column(Integer, default=10)
    speed_bonus = Column(Boolean, default=True)
    
    # Sorrend a kvízen belül
    order_index = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Kapcsolat
    quiz = relationship("Quiz", back_populates="questions")

    def __repr__(self):
        return f"<Question(id={self.id}, quiz_id={self.quiz_id}, type='{self.question_type}')>"


class QuizRating(Base):
    __tablename__ = "quiz_ratings"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    
    # Értékelés 1-5 csillag
    rating = Column(Integer, nullable=False)
    
    session_id = Column(String(100), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Kapcsolat
    quiz = relationship("Quiz", back_populates="ratings")

    def __repr__(self):
        return f"<QuizRating(id={self.id}, quiz_id={self.quiz_id}, rating={self.rating})>"
