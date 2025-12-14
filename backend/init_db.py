"""
Database initialization script for Kenya Power Staff Application Form

This script:
1. Creates all database tables
2. Seeds sample courses for testing
3. Initializes form status
"""

from database import engine, SessionLocal, Base
from models import Course, FormStatus, CourseCategoryEnum
from datetime import datetime


def init_db():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")


def seed_courses():
    """Add sample courses to the database"""
    db = SessionLocal()
    
    try:
        # Check if courses already exist
        existing_courses = db.query(Course).count()
        if existing_courses > 0:
            print(f"✓ Database already has {existing_courses} courses. Skipping seed.")
            return
        
        print("Seeding sample courses...")
        
        # Short Professional Courses
        short_professional_courses = [
            {
                "name": "Project Management Fundamentals",
                "category": CourseCategoryEnum.SHORT_PROFESSIONAL,
                "description": "Introduction to project management principles and practices"
            },
            {
                "name": "Leadership and Team Management",
                "category": CourseCategoryEnum.SHORT_PROFESSIONAL,
                "description": "Developing leadership skills for effective team management"
            },
            {
                "name": "Electrical Safety and Compliance",
                "category": CourseCategoryEnum.SHORT_PROFESSIONAL,
                "description": "Safety protocols and compliance in electrical operations"
            },
            {
                "name": "Customer Service Excellence",
                "category": CourseCategoryEnum.SHORT_PROFESSIONAL,
                "description": "Enhancing customer service skills and satisfaction"
            },
            {
                "name": "Digital Transformation in Utilities",
                "category": CourseCategoryEnum.SHORT_PROFESSIONAL,
                "description": "Understanding digital technologies in the utility sector"
            },
            {
                "name": "Financial Management for Non-Finance Managers",
                "category": CourseCategoryEnum.SHORT_PROFESSIONAL,
                "description": "Basic financial concepts for operational managers"
            },
            {
                "name": "Data Analytics and Reporting",
                "category": CourseCategoryEnum.SHORT_PROFESSIONAL,
                "description": "Using data analytics for business decision making"
            },
        ]
        
        # Academic Courses
        academic_courses = [
            {
                "name": "Bachelor of Science in Electrical Engineering",
                "category": CourseCategoryEnum.ACADEMIC,
                "description": "Undergraduate degree in electrical engineering"
            },
            {
                "name": "Master of Business Administration (MBA)",
                "category": CourseCategoryEnum.ACADEMIC,
                "description": "Graduate business administration program"
            },
            {
                "name": "Bachelor of Commerce (Accounting)",
                "category": CourseCategoryEnum.ACADEMIC,
                "description": "Undergraduate degree in accounting and finance"
            },
            {
                "name": "Master of Science in Energy Management",
                "category": CourseCategoryEnum.ACADEMIC,
                "description": "Graduate program in energy systems and management"
            },
            {
                "name": "Bachelor of Science in Information Technology",
                "category": CourseCategoryEnum.ACADEMIC,
                "description": "Undergraduate degree in IT and computer systems"
            },
            {
                "name": "Master of Engineering in Power Systems",
                "category": CourseCategoryEnum.ACADEMIC,
                "description": "Advanced engineering degree in power systems"
            },
            {
                "name": "Bachelor of Science in Environmental Science",
                "category": CourseCategoryEnum.ACADEMIC,
                "description": "Undergraduate degree in environmental studies"
            },
            {
                "name": "Diploma in Electrical Installation",
                "category": CourseCategoryEnum.ACADEMIC,
                "description": "Technical diploma in electrical installation and maintenance"
            },
        ]
        
        # Add all courses
        all_courses = short_professional_courses + academic_courses
        for course_data in all_courses:
            course = Course(**course_data)
            db.add(course)
        
        db.commit()
        print(f"✓ Successfully seeded {len(all_courses)} courses")
        print(f"  - {len(short_professional_courses)} Short Professional courses")
        print(f"  - {len(academic_courses)} Academic courses")
        
    except Exception as e:
        print(f"✗ Error seeding courses: {e}")
        db.rollback()
    finally:
        db.close()


def init_form_status():
    """Initialize form status"""
    db = SessionLocal()
    
    try:
        # Check if form status exists
        existing_status = db.query(FormStatus).first()
        if existing_status:
            print(f"✓ Form status already initialized (is_open={existing_status.is_open})")
            return
        
        print("Initializing form status...")
        status = FormStatus(id=1, is_open=True, updated_by="System")
        db.add(status)
        db.commit()
        print("✓ Form status initialized (form is OPEN)")
        
    except Exception as e:
        print(f"✗ Error initializing form status: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("Kenya Power Staff Application Form - Database Setup")
    print("="*60 + "\n")
    
    init_db()
    seed_courses()
    init_form_status()
    
    print("\n" + "="*60)
    print("Database initialization complete!")
    print("="*60 + "\n")
