
# Data Model: Taskora Full-Stack Todo Web Application

## Entity Definitions

### User Entity
- **Fields**:
  - id (integer, primary key)
  - email (string, required, unique)
  - name (string, required)
  - created_at (timestamp, required)
- **Relationships**:
  - One-to-many with Task (user has many tasks)
- **Validation**:
  - Email must be valid email format
  - Name must be non-empty
  - Email must be unique across all users
- **State Transitions**:
  - Registered → Active (upon successful registration)
  - Active → Inactive (if account deactivated)

### Task Entity
- **Fields**:
  - id (integer, primary key)
  - user_id (string, indexed, foreign key to User)
  - title (string, required)
  - description (string, optional)
  - completed (boolean, default: false)
  - created_at (timestamp, required)
  - updated_at (timestamp, required)
- **Relationships**:
  - Many-to-one with User (task belongs to one user)
- **Validation**:
  - Title must be non-empty
  - user_id must reference an existing user
  - completed must be boolean
- **State Transitions**:
  - Created → Incomplete (default state)
  - Incomplete ↔ Completed (toggle via API)

## Database Schema

### Users Table
```
users
├── id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
├── email (VARCHAR, UNIQUE, NOT NULL)
├── name (VARCHAR, NOT NULL)
└── created_at (TIMESTAMP, NOT NULL)
```

### Tasks Table
```
tasks
├── id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
├── user_id (VARCHAR, INDEXED, NOT NULL, FOREIGN KEY references users.id)
├── title (VARCHAR, NOT NULL)
├── description (TEXT, OPTIONAL)
├── completed (BOOLEAN, DEFAULT false)
├── created_at (TIMESTAMP, NOT NULL)
└── updated_at (TIMESTAMP, NOT NULL)
```

## Access Control Rules

### User Isolation
- Each user can only access their own tasks
- Backend must validate JWT and extract user_id
- All task operations must verify user_id matches JWT-derived user_id
- Cross-user access attempts must result in 401 Unauthorized

## Indexes
- user_id in tasks table (for efficient user-based queries)
- completed field in tasks table (for filtering completed/incomplete tasks)

## Constraints
- Foreign key constraint: tasks.user_id must reference existing users.id
- Not null constraints on required fields
- Unique constraint on user email