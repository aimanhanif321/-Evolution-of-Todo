# Quickstart Guide: Taskora Full-Stack Todo Web Application

## Prerequisites

- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)
- PostgreSQL client tools
- Git for version control
- pnpm package manager (recommended) or npm/yarn

## Setup Instructions

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install in development mode (if applicable)
pip install -e .
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install
# Or if using npm:
npm install
```

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskora_db"

# JWT Configuration
BETTER_AUTH_SECRET="your-super-secret-jwt-key"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
APP_ENV="development"
DEBUG=True
```

### Frontend (.env.local)

Create a `.env.local` file in the `frontend` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_SECRET="your-super-secret-jwt-key"
```

## Database Setup

```bash
# From the backend directory
cd backend

# Run database migrations
alembic upgrade head
```

## Running the Application

### Start the Backend

```bash
# From the backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run the backend server
uvicorn src.main:app --reload --port 8000
```

### Start the Frontend

```bash
# From the frontend directory
cd frontend

# Run the development server
pnpm dev
# Or if using npm:
npm run dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend API Documentation: http://localhost:8000/docs

## Key Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/logout` - Logout

### Task Endpoints
- `GET /api/{user_id}/tasks` - Get all user tasks
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{task_id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update a task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle task completion

## Development Commands

### Backend Commands
```bash
# Run backend tests
pytest

# Run backend with auto-reload
uvicorn src.main:app --reload

# Run linter
flake8 src/

# Run type checker
mypy src/
```

### Frontend Commands
```bash
# Run frontend development server
pnpm dev

# Run frontend tests
pnpm test

# Build for production
pnpm build

# Run linter
pnpm lint

# Run type checker
pnpm type-check
```

## Architecture Overview

This project follows an API-first architecture with clear separation between frontend and backend:

- **Frontend**: Next.js 16+ application with App Router for all UI rendering and user interactions
- **Backend**: FastAPI application handling API endpoints, business logic, authentication, and database operations
- **Database**: PostgreSQL ensuring data persistence and user isolation