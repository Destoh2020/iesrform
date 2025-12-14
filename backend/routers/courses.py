from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import CourseCategoryEnum
import crud
import schemas

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("/", response_model=List[schemas.CourseResponse])
def get_courses(
    category: Optional[CourseCategoryEnum] = None,
    db: Session = Depends(get_db)
):
    """
    Get all active courses, optionally filtered by category.
    
    - **category**: Optional filter by course category (short_professional or academic)
    """
    courses = crud.get_courses(db, category=category)
    return courses


@router.get("/{course_id}", response_model=schemas.CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """
    Get a specific course by ID.
    
    - **course_id**: The ID of the course to retrieve
    """
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/", response_model=schemas.CourseResponse)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    """
    Create a new course (admin only).
    
    - **name**: Course name
    - **category**: Course category (short_professional or academic)
    - **description**: Optional course description
    """
    return crud.create_course(db, course)
