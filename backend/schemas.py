from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from models import CourseCategoryEnum, ModeOfStudyEnum


# Course Schemas
class CourseBase(BaseModel):
    name: str
    category: CourseCategoryEnum
    description: Optional[str] = None
    is_active: bool = True


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Application Schemas
class ApplicationBase(BaseModel):
    staff_number: str = Field(..., min_length=1, max_length=50)
    email: Optional[str] = None
    application_date: date
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    designation: str = Field(..., min_length=1, max_length=255)
    division: str = Field(..., min_length=1, max_length=255)
    course_category: CourseCategoryEnum
    course_id: int
    mode_of_study: ModeOfStudyEnum


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationResponse(ApplicationBase):
    id: int
    created_at: datetime
    course: CourseResponse

    class Config:
        from_attributes = True


# Form Status Schemas
class FormStatusResponse(BaseModel):
    id: int
    is_open: bool
    updated_at: datetime
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True


class FormStatusUpdate(BaseModel):
    is_open: bool
    updated_by: Optional[str] = None


# Validation Response
class StaffValidationResponse(BaseModel):
    staff_number: str
    has_applied: bool
    application: Optional[ApplicationResponse] = None
