from pydantic import BaseModel


class CreateGameRequest(BaseModel):
    quiz_id: int


class CreateGameResponse(BaseModel):
    game_code: str
    quiz_title: str
    question_count: int


class JoinGameRequest(BaseModel):
    game_code: str
    nickname: str


class StartQuestionRequest(BaseModel):
    game_code: str
    question_index: int


class SubmitAnswerRequest(BaseModel):
    game_code: str
    answer: str


class FinishQuestionRequest(BaseModel):
    game_code: str
