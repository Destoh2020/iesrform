from database import engine, Base
from init_db import init_db, seed_courses, init_form_status
from models import * # Import all models to ensure they are registered

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✓ Tables dropped")
    
    print("\nRe-initializing database...")
    init_db()
    seed_courses()
    init_form_status()

if __name__ == "__main__":
    confirm = input("This will DELETE ALL DATA. Are you sure? (y/N): ")
    if confirm.lower() == 'y':
        reset_db()
        print("\nDatabase reset complete.")
    else:
        print("Operation cancelled.")
