from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import crud
import schemas
import auth

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.post("/", response_model=schemas.ApplicationResponse)
def submit_application(
    application: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a new course application.
    
    Validates:
    - Staff number is unique (one application per staff)
    - Course exists and is active
    - Course category matches selected course
    - Form is open for submissions
    
    Returns the created application with course details.
    """
    # Check if form is open
    form_status = crud.get_form_status(db)
    if not form_status.is_open:
        raise HTTPException(
            status_code=403,
            detail="The application form is currently closed. Please check back later."
        )
    
    try:
        db_application = crud.create_application(db, application)
        return db_application
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{staff_number}", response_model=schemas.ApplicationResponse)
def update_application(
    staff_number: str,
    application: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    """
    Update an existing course application.
    """
    # Check if form is open
    form_status = crud.get_form_status(db)
    if not form_status.is_open:
        raise HTTPException(
            status_code=403,
            detail="The application form is currently closed. Updates are not allowed."
        )

    try:
        # Check if application exists (crud.update_application handles this but good to have explicit check or handled error)
        # Note: We should ensure the path parameter matches the body staff_number or override it
        if staff_number != application.staff_number:
            raise HTTPException(status_code=400, detail="Staff number in path must match body")

        db_application = crud.update_application(db, staff_number, application)
        return db_application
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/validate/{staff_number}", response_model=schemas.StaffValidationResponse)
def validate_staff_number(staff_number: str, db: Session = Depends(get_db)):
    """
    Check if a staff number has already submitted an application.
    
    - **staff_number**: The staff number to validate
    
    Returns whether the staff has applied and their application details if they have.
    """
    existing_application = crud.get_application_by_staff_number(db, staff_number)
    
    return schemas.StaffValidationResponse(
        staff_number=staff_number,
        has_applied=existing_application is not None,
        application=existing_application
    )


@router.get("/", response_model=List[schemas.ApplicationResponse])
def get_all_applications(
    db: Session = Depends(get_db),
    authorized: bool = Depends(auth.verify_admin)
):
    """
    Get all applications (admin only).
    
    Returns all submitted applications with course details.
    """
    applications = crud.get_all_applications(db)
    return applications


@router.get("/export")
def export_applications_csv(
    db: Session = Depends(get_db),
    authorized: bool = Depends(auth.verify_admin)
):
    """
    Export all applications as a CSV file.
    """
    import csv
    import io
    from fastapi.responses import StreamingResponse

    applications = crud.get_all_applications(db)
    
    # Create CSV buffer
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Application ID", 
        "Staff Number", 
        "First Name",
        "Last Name",
        "Designation", 
        "Division", 
        "Course Name", 
        "Course Category", 
        "Mode of Study", 
        "Application Date"
    ])
    
    # Write data
    for app in applications:
        writer.writerow([
            app.id,
            app.staff_number,
            app.first_name,
            app.last_name,
            app.designation,
            app.division,
            app.course.name if app.course else "Unknown",
            app.course_category.value if app.course_category else "",
            app.mode_of_study.value if app.mode_of_study else "",
            app.application_date
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=applications.csv"}
    )
