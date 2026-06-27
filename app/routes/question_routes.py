from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.question_schema import (
    AnswerResult,
    AnswerSubmit,
    QuestionCreate,
    QuestionPracticeResponse,
    QuestionResponse,
    QuestionUpdate,
)
from app.services.question_service import (
    add_question,
    delete_question,
    get_practice_questions,
    get_question_by_id,
    get_questions_by_chapter,
    get_questions_by_exam,
    submit_answer,
    update_question,
)
from app.utils.dependencies import get_admin_user

router = APIRouter(prefix="/api/questions", tags=["Questions"])


@router.post(
    "/",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new question",
    description="Create a question for an exam and optional chapter. Admin only.",
)
def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    return add_question(db, question)


@router.get("/exam/{exam_id}", response_model=list[QuestionResponse])
def list_questions_by_exam(
    exam_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return get_questions_by_exam(db, exam_id, skip, limit)


@router.get("/chapter/{chapter_id}", response_model=list[QuestionResponse])
def list_questions_by_chapter(
    chapter_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return get_questions_by_chapter(db, chapter_id, skip, limit)


@router.get(
    "/chapter/{chapter_id}/practice",
    response_model=list[QuestionPracticeResponse],
)
def practice_questions(
    chapter_id: int,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return get_practice_questions(db, chapter_id, limit)


@router.post("/submit-answer", response_model=AnswerResult)
def check_answer(payload: AnswerSubmit, db: Session = Depends(get_db)):
    return submit_answer(db, payload)


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    return get_question_by_id(db, question_id)


@router.put("/{question_id}", response_model=QuestionResponse)
def update_question_route(
    question_id: int,
    question_update: QuestionUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    return update_question(db, question_id, question_update)


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question_route(
    question_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    delete_question(db, question_id)
    return None


import csv
import io
from fastapi import UploadFile, File
from app.models.question_model import Question

@router.post("/bulk-upload")
def bulk_upload_questions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a CSV file."
        )

    try:
        content = file.file.read().decode("utf-8")
        csv_reader = csv.DictReader(io.StringIO(content))
        
        inserted_count = 0
        for row in csv_reader:
            exam_id_str = row.get("exam_id")
            if not exam_id_str:
                continue
                
            chap_id_str = row.get("chapter_id")
            chapter_id = int(chap_id_str) if chap_id_str and chap_id_str.strip() else None
            
            year_str = row.get("year")
            year = int(year_str) if year_str and year_str.strip() else None
            
            marks_str = row.get("marks")
            marks = float(marks_str) if marks_str and marks_str.strip() else 4.0
            
            neg_marks_str = row.get("negative_marks")
            neg_marks = float(neg_marks_str) if neg_marks_str and neg_marks_str.strip() else -1.0
            
            q_time_str = row.get("time")
            q_time = int(q_time_str) if q_time_str and q_time_str.strip() else 60

            new_q = Question(
                exam_id=int(exam_id_str),
                chapter_id=chapter_id,
                question=row.get("question", ""),
                question_type=row.get("question_type", "mcq"),
                option_a=row.get("option_a"),
                option_b=row.get("option_b"),
                option_c=row.get("option_c"),
                option_d=row.get("option_d"),
                correct_answer=row.get("correct_answer", "A"),
                solution=row.get("solution"),
                year=year,
                exam_session=row.get("exam_session"),
                difficulty=row.get("difficulty", "Medium"),
                marks=marks,
                negative_marks=neg_marks,
                time=q_time,
                topic=row.get("topic")
            )
            db.add(new_q)
            inserted_count += 1

        db.commit()
        return {"status": "success", "inserted_questions": inserted_count}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process CSV upload: {str(e)}"
        )

