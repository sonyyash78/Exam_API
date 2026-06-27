from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.db import Base


class Exam(Base):

    __tablename__ = "exams"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    exam_name = Column(String(255), nullable=False)
    category = Column(String(200), nullable=False)
    image = Column(String(500), nullable=False)

    subjects = relationship(
        "Subject",
        back_populates="exam",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    questions = relationship(
        "Question",
        back_populates="exam",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )