from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas

import auth

router = APIRouter(prefix="/api/form-status", tags=["form-status"])


@router.get("/", response_model=schemas.FormStatusResponse)
def get_form_status(db: Session = Depends(get_db)):
    """
    Get the current form status (open or closed).
    
    Returns whether the form is accepting applications.
    """
    status = crud.get_form_status(db)
    return status


@router.put("/", response_model=schemas.FormStatusResponse)
def update_form_status(
    status_update: schemas.FormStatusUpdate,
    db: Session = Depends(get_db),
    authorized: bool = Depends(auth.verify_admin)
):
    """
    Update the form status to open or close it (admin only).
    
    - **is_open**: True to open the form, False to close it
    - **updated_by**: Optional name of the admin making the change
    """
    status = crud.update_form_status(db, status_update)
    return status
