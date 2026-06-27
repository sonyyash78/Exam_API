from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database.db import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="SET NULL"), nullable=True)

    question = Column(Text, nullable=False)
    question_type = Column(String(50), default="mcq")

    option_a = Column(String(500), nullable=True)
    option_b = Column(String(500), nullable=True)
    option_c = Column(String(500), nullable=True)
    option_d = Column(String(500), nullable=True)

    correct_answer = Column(String(100), nullable=False)
    solution = Column(Text, nullable=True)

    year = Column(Integer, nullable=True)
    exam_session = Column(String(200), nullable=True)

    exam = relationship(
        "Exam",
        back_populates="questions",
        passive_deletes=True,
    )
    chapter = relationship(
        "Chapter",
        back_populates="questions",
        passive_deletes=True,
    )