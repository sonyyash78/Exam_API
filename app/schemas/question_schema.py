from pydantic import BaseModel, ConfigDict


class QuestionCreate(BaseModel):
    exam_id: int
    chapter_id: int | None = None
    question: str
    question_type: str = "mcq"
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    correct_answer: str
    solution: str | None = None
    year: int | None = None
    exam_session: str | None = None


class QuestionUpdate(BaseModel):
    chapter_id: int | None = None
    question: str | None = None
    question_type: str | None = None
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    correct_answer: str | None = None
    solution: str | None = None
    year: int | None = None
    exam_session: str | None = None


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exam_id: int
    chapter_id: int | None = None
    question: str
    question_type: str
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    correct_answer: str
    solution: str | None = None
    year: int | None = None
    exam_session: str | None = None


class QuestionPracticeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exam_id: int
    chapter_id: int | None = None
    question: str
    question_type: str
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    year: int | None = None
    exam_session: str | None = None


class AnswerSubmit(BaseModel):
    question_id: int
    selected_answer: str


class AnswerResult(BaseModel):
    question_id: int
    is_correct: bool
    correct_answer: str
    solution: str | None = None
