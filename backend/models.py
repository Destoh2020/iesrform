from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class CourseCategoryEnum(str, enum.Enum):
    SHORT_PROFESSIONAL = "short_professional"
    ACADEMIC = "academic"


class ModeOfStudyEnum(str, enum.Enum):
    ONLINE = "online"
    BLENDED = "blended"
    PHYSICAL = "physical"


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(SQLEnum(CourseCategoryEnum), nullable=False)
    description = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    applications = relationship("Application", back_populates="course")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    staff_number = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True)
    application_date = Column(Date, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    designation = Column(String(255), nullable=False)
    division = Column(String(255), nullable=False)
    course_category = Column(SQLEnum(CourseCategoryEnum), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    mode_of_study = Column(SQLEnum(ModeOfStudyEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    course = relationship("Course", back_populates="applications")


class FormStatus(Base):
    __tablename__ = "form_status"

    id = Column(Integer, primary_key=True)
    is_open = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(String(100))
