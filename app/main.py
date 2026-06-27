from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import Base, engine
from app.routes.auth_routes import router as auth_router
from app.routes.exam_routes import router as exam_router
from app.routes.subject_routes import router as subject_router
from app.routes.chapter_routes import router as chapter_router
from app.routes.question_routes import router as question_router
from app.routes.browse_routes import router as browse_router
from app.routes.progress_routes import router as progress_router
from app.routes.mock_test_routes import router as mock_test_router
from app.models.progress_model import Bookmark, TestAttempt, QuestionAttempt
from app.utils.config import ALLOW_ORIGINS

from app.utils.logger import logger


logger.info("Starting ExamSIDE API")


app = FastAPI(
    title="ExamSIDE API",
    description="Past year exam questions API inspired by ExamSIDE",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Ensure tables are available before the app starts
Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(subject_router)
app.include_router(chapter_router)
app.include_router(question_router)
app.include_router(browse_router)
app.include_router(progress_router)
app.include_router(mock_test_router)


@app.get("/")
def root():
    return {
        "message": "ExamSIDE API is running",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "exams": "/api/exams",
            "subjects": "/api/subjects",
            "chapters": "/api/chapters",
            "questions": "/api/questions",
            "browse": "/api/browse",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
