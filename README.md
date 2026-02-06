# Taskora - Phase II

A full-stack web application transforming the CLI-based todo application into a modern web application with user authentication, persistent storage, and enhanced UI/UX.

## Overview

This project implements the Taskora application, featuring:
- User authentication with JWT tokens
- Task management (CRUD operations)
- Responsive UI with Next.js and Tailwind CSS
- PostgreSQL database with proper user isolation
- API-first architecture with FastAPI backend

## Tech Stack

- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS
- **Backend**: Python 3.13+, FastAPI
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT with refresh tokens
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ (for frontend development)
- Python 3.13+ (for backend development)
- pnpm package manager (recommended) or npm/yarn
- PostgreSQL client tools (for database operations)
- Git for version control

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

# Install in development mode
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
DATABASE_URL="postgresql://username:password@localhost:5432/todos_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

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
NEXT_PUBLIC_JWT_SECRET="your-super-secret-jwt-key"
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
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate refresh token

### Task Endpoints
- `GET /tasks` - Get all user tasks
- `POST /tasks` - Create a new task
- `GET /tasks/{task_id}` - Get a specific task
- `PUT /tasks/{task_id}` - Update a task
- `DELETE /tasks/{task_id}` - Delete a task

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

## Architecture

This project follows an API-first architecture with clear separation between frontend and backend:

- **Frontend**: Next.js 16+ application with App Router for all UI rendering and user interactions
- **Backend**: FastAPI application handling API endpoints, business logic, authentication, and database operations
- **Database**: PostgreSQL ensuring data persistence and user isolation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details....