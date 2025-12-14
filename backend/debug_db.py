from database import SessionLocal
from models import Application
import sys

def check_db():
    db = SessionLocal()
    try:
        print("Attempting to query applications...")
        apps = db.query(Application).limit(1).all()
        print(f"Successfully queried {len(apps)} applications.")
        for app in apps:
            print(f"App: {app.first_name} {app.last_name}")
    except Exception as e:
        print(f"Error querying database: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
