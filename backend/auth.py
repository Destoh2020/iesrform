from fastapi import Header, HTTPException
import os
from typing import Optional

def verify_admin(x_admin_password: Optional[str] = Header(None)):
    """
    Verify admin password from header.
    """
    admin_password = os.getenv("ADMIN_PASSWORD", "admin@2025")
    
    if x_admin_password != admin_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin password"
        )
    return True
