# Kenya Power Staff Application Form

A full-stack application form system for Kenya Power staff to apply for professional development courses.

## Features

- ✨ **Stunning Modern UI** - Glassmorphism design with smooth animations
- 🔐 **Staff Validation** - One application per staff number
- 📚 **Dynamic Course Selection** - Courses filtered by category (Short Professional / Academic)
- 🎓 **Multiple Study Modes** - Online, Blended, or Physical attendance
- 🎛️ **Admin Panel** - Control form open/closed status and view all applications
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile

## Tech Stack

### Backend

- **FastAPI** - Modern Python web framework
- **MariaDB** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation

### Frontend

- **Next.js 16** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+
- MariaDB Server

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure environment variables (already set in `.env`):

```
DATABASE_URL=mysql+pymysql://root:usa2025@localhost:3306/iesr_form_db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

5. Initialize the database (creates tables and seeds sample courses):

```bash
python init_db.py
```

6. Run the backend server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies (if not already installed):

```bash
npm install
```

3. Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### For Staff (Applicants)

1. Visit `http://localhost:3000`
2. Fill in all required fields:
   - Application Date
   - Staff Number (unique identifier)
   - Full Name
   - Designation
   - Division
   - Course Category (Short Professional or Academic)
   - Course (filtered based on category)
   - Mode of Study (Online, Blended, or Physical)
3. Submit the application

**Note:** Each staff number can only submit one application.

### For Administrators

1. Visit `http://localhost:3000/admin`
2. View all submitted applications
3. Open or close the form using the toggle button
4. When the form is closed, staff cannot submit new applications

## Database Schema

### Tables

**applications**

- Stores all staff applications
- Primary key: `id`
- Unique constraint: `staff_number`

**courses**

- Stores available courses
- Categories: Short Professional, Academic
- Can be activated/deactivated

**form_status**

- Controls whether the form accepts submissions
- Single row with `is_open` boolean

## Sample Courses

The database is pre-seeded with sample courses:

**Short Professional:**

- Project Management Fundamentals
- Leadership and Team Management
- Electrical Safety and Compliance
- Customer Service Excellence
- Digital Transformation in Utilities
- Financial Management for Non-Finance Managers
- Data Analytics and Reporting

**Academic:**

- Bachelor of Science in Electrical Engineering
- Master of Business Administration (MBA)
- Bachelor of Commerce (Accounting)
- Master of Science in Energy Management
- Bachelor of Science in Information Technology
- Master of Engineering in Power Systems
- Bachelor of Science in Environmental Science
- Diploma in Electrical Installation

## API Endpoints

### Courses

- `GET /api/courses/` - Get all courses (optional `?category=` filter)
- `GET /api/courses/{id}` - Get specific course
- `POST /api/courses/` - Create new course

### Applications

- `POST /api/applications/` - Submit application
- `GET /api/applications/validate/{staff_number}` - Check if staff has applied
- `GET /api/applications/` - Get all applications

### Form Status

- `GET /api/form-status/` - Get current form status
- `PUT /api/form-status/` - Update form status (open/close)

## Development

### Adding New Courses

You can add courses via the API or directly in the database:

```bash
curl -X POST http://localhost:8000/api/courses/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Course Name",
    "category": "short_professional",
    "description": "Course description",
    "is_active": true
  }'
```

### Building for Production

**Backend:**

```bash
# Use a production WSGI server like Gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Frontend:**

```bash
npm run build
npm start
```

## License

This project is created for Kenya Power internal use.
