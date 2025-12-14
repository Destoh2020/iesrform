from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import courses, applications, form_status

load_dotenv()

app = FastAPI(
    title="Kenya Power Staff Application Form API",
    description="API for managing staff course applications",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses.router)
app.include_router(applications.router)
app.include_router(form_status.router)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Kenya Power Staff Application Form API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
