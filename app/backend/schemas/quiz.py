from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum


class QuestionType(str, Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    NUMBER = "number"
    ORDER = "order"


class QuestionBase(BaseModel):
    question_type: QuestionType
    question_text: str = Field(..., min_length=3, max_length=1000)
    options: Optional[List[str]] = None
    correct_answer: str
    time_limit: int = Field(default=30, ge=5, le=300)
    points: int = Field(default=10, ge=1, le=100)
    speed_bonus: bool = Field(default=True)
    order_index: int = Field(default=0, ge=0)


class QuestionCreate(QuestionBase):
    @field_validator('options')
    @classmethod
    def validate_options(cls, v, info):
        question_type = info.data.get('question_type')
        
        if question_type in [QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE]:
            if not v or len(v) < 2 or len(v) > 4:
                raise ValueError('Single/Multiple choice questions must have 2-4 options')
        
        if question_type == QuestionType.ORDER:
            if not v or len(v) < 2 or len(v) > 6:
                raise ValueError('Order questions must have 2-6 items')
        
        return v

    @field_validator('correct_answer')
    @classmethod
    def validate_correct_answer(cls, v, info):
        question_type = info.data.get('question_type')
        options = info.data.get('options', [])
        
        if question_type == QuestionType.SINGLE_CHOICE:
            try:
                idx = int(v)
                if idx < 0 or idx >= len(options):
                    raise ValueError('Invalid option index')
            except (ValueError, TypeError):
                raise ValueError('Single choice answer must be a valid option index')
        
        elif question_type == QuestionType.MULTIPLE_CHOICE:
            try:
                import json
                indices = json.loads(v)
                if not isinstance(indices, list) or not indices:
                    raise ValueError('Multiple choice answer must be a non-empty list')
                for idx in indices:
                    if idx < 0 or idx >= len(options):
                        raise ValueError('Invalid option index')
            except (json.JSONDecodeError, TypeError):
                raise ValueError('Multiple choice answer must be a valid JSON list')
        
        elif question_type == QuestionType.NUMBER:
            try:
                float(v)
            except (ValueError, TypeError):
                raise ValueError('Number answer must be a valid number')
        
        elif question_type == QuestionType.ORDER:
            try:
                import json
                order = json.loads(v)
                if not isinstance(order, list):
                    raise ValueError('Order answer must be a list')
                if len(order) != len(options):
                    raise ValueError('Order must include all items')
            except (json.JSONDecodeError, TypeError):
                raise ValueError('Order answer must be a valid JSON list')
        
        return v
    pass


class QuestionUpdate(BaseModel):
    question_type: Optional[QuestionType] = None
    question_text: Optional[str] = Field(None, min_length=3, max_length=1000)
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    time_limit: Optional[int] = Field(None, ge=5, le=300)
    points: Optional[int] = Field(None, ge=1, le=100)
    speed_bonus: Optional[bool] = None
    order_index: Optional[int] = Field(None, ge=0)


class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    @field_validator('options', mode='before')
    @classmethod
    def parse_options(cls, v):
        # Parse JSON string from database
        if isinstance(v, str):
            import json
            return json.loads(v) if v else None
        return v

    model_config = ConfigDict(from_attributes=True)


class QuizBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)


class QuizCreate(QuizBase):
    questions: List[QuestionCreate] = []


class QuizUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    is_active: Optional[bool] = None


class QuizResponse(QuizBase):
    id: int
    creator_id: int
    total_ratings: int
    average_rating: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    questions: List[QuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)


class QuizListResponse(QuizBase):
    id: int
    creator_id: int
    created_by_username: Optional[str] = None
    total_ratings: int
    average_rating: float
    question_count: int
    is_active: Optional[bool] = True
    is_public: Optional[bool] = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuizRatingCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    session_id: Optional[str] = None


class QuizRatingResponse(BaseModel):
    id: int
    quiz_id: int
    rating: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIGenerateWrongAnswersRequest(BaseModel):
    question_text: str = Field(..., min_length=3)
    correct_answer: str = Field(..., min_length=1)
    num_wrong_answers: int = Field(default=3, ge=1, le=3)


class AIGenerateWrongAnswersResponse(BaseModel):
    wrong_answers: List[str]
