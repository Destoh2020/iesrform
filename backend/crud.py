from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models import Course, Application, FormStatus, CourseCategoryEnum
from schemas import ApplicationCreate, CourseCreate, FormStatusUpdate
from typing import List, Optional


# Course CRUD operations
def get_courses(db: Session, category: Optional[CourseCategoryEnum] = None) -> List[Course]:
    """Get all courses or filter by category"""
    query = db.query(Course).filter(Course.is_active == True)
    if category:
        query = query.filter(Course.category == category)
    return query.all()


def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
    """Get a specific course by ID"""
    return db.query(Course).filter(Course.id == course_id, Course.is_active == True).first()


def create_course(db: Session, course: CourseCreate) -> Course:
    """Create a new course"""
    db_course = Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


# Application CRUD operations
def get_application_by_staff_number(db: Session, staff_number: str) -> Optional[Application]:
    """Check if staff member has already applied"""
    return db.query(Application).filter(Application.staff_number == staff_number).first()


def create_application(db: Session, application: ApplicationCreate) -> Application:
    """Create a new application"""
    # Check if staff has already applied
    existing = get_application_by_staff_number(db, application.staff_number)
    if existing:
        raise ValueError(f"Staff number {application.staff_number} has already submitted an application")
    
    # Verify course exists and is active
    course = get_course_by_id(db, application.course_id)
    if not course:
        raise ValueError(f"Course with ID {application.course_id} not found or inactive")
    
    # Verify course category matches
    if course.category != application.course_category:
        raise ValueError(f"Course category mismatch")
    
    db_application = Application(**application.model_dump())
    db.add(db_application)
    try:
        db.commit()
        db.refresh(db_application)
        return db_application
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Staff number {application.staff_number} has already submitted an application")


def update_application(db: Session, staff_number: str, application: ApplicationCreate) -> Application:
    """Update an existing application"""
    db_application = get_application_by_staff_number(db, staff_number)
    if not db_application:
        raise ValueError(f"Application for staff number {staff_number} not found")
    
    # Verify course exists and is active
    course = get_course_by_id(db, application.course_id)
    if not course:
        raise ValueError(f"Course with ID {application.course_id} not found or inactive")
    
    # Verify course category matches
    if course.category != application.course_category:
        raise ValueError(f"Course category mismatch")
    
    # Update fields
    db_application.applicant_name = application.applicant_name
    db_application.designation = application.designation
    db_application.division = application.division
    db_application.course_category = application.course_category
    db_application.course_id = application.course_id
    db_application.mode_of_study = application.mode_of_study
    # application_date stays as original or updates? Usually application date might update to today or stay same.
    # Requirement doesn't specify, but often edits update the date or keep original.
    # Let's keep the date from the input (which in frontend defaults to today)
    db_application.application_date = application.application_date
    
    db.commit()
    db.refresh(db_application)
    return db_application


def get_all_applications(db: Session) -> List[Application]:
    """Get all applications"""
    return db.query(Application).all()


# Form Status CRUD operations
def get_form_status(db: Session) -> FormStatus:
    """Get the current form status"""
    status = db.query(FormStatus).first()
    if not status:
        # Create default status if not exists
        status = FormStatus(id=1, is_open=True)
        db.add(status)
        db.commit()
        db.refresh(status)
    return status


def update_form_status(db: Session, status_update: FormStatusUpdate) -> FormStatus:
    """Update form status (open/close)"""
    status = get_form_status(db)
    status.is_open = status_update.is_open
    if status_update.updated_by:
        status.updated_by = status_update.updated_by
    db.commit()
    db.refresh(status)
    return status
