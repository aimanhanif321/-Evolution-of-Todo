# API Contracts: Taskora Task Management API

## Base URL
`/api/{user_id}/tasks`

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Common Response Structure
All responses follow the JSON format:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

For errors:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Endpoints

### GET /api/{user_id}/tasks
**Description**: Retrieve all tasks for the authenticated user

**Headers**:
- Authorization: Bearer <jwt_token>

**Path Parameters**:
- user_id: String representing the user ID (derived from JWT)

**Query Parameters**:
- completed: Optional boolean to filter by completion status

**Response**:
- 200 OK: Array of task objects
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user123",
      "title": "Sample task",
      "description": "Task description",
      "completed": false,
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T10:00:00Z"
    }
  ]
}
```
- 401 Unauthorized: Invalid or missing JWT
- 403 Forbidden: Attempt to access another user's tasks

### POST /api/{user_id}/tasks
**Description**: Create a new task for the authenticated user

**Headers**:
- Authorization: Bearer <jwt_token>

**Path Parameters**:
- user_id: String representing the user ID (derived from JWT)

**Request Body**:
```json
{
  "title": "New task title",
  "description": "Optional task description"
}
```

**Response**:
- 201 Created: Successfully created task
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user123",
    "title": "New task title",
    "description": "Optional task description",
    "completed": false,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T10:00:00Z"
  },
  "message": "Task created successfully"
}
```
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid or missing JWT
- 403 Forbidden: Attempt to create task for another user

### GET /api/{user_id}/tasks/{id}
**Description**: Retrieve details of a specific task

**Headers**:
- Authorization: Bearer <jwt_token>

**Path Parameters**:
- user_id: String representing the user ID (derived from JWT)
- id: Integer representing the task ID

**Response**:
- 200 OK: Task details
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user123",
    "title": "Sample task",
    "description": "Task description",
    "completed": false,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T10:00:00Z"
  }
}
```
- 401 Unauthorized: Invalid or missing JWT
- 403 Forbidden: Attempt to access another user's task
- 404 Not Found: Task does not exist

### PUT /api/{user_id}/tasks/{id}
**Description**: Update an existing task

**Headers**:
- Authorization: Bearer <jwt_token>

**Path Parameters**:
- user_id: String representing the user ID (derived from JWT)
- id: Integer representing the task ID

**Request Body**:
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "completed": true
}
```

**Response**:
- 200 OK: Successfully updated task
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user123",
    "title": "Updated task title",
    "description": "Updated task description",
    "completed": true,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T11:00:00Z"
  },
  "message": "Task updated successfully"
}
```
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid or missing JWT
- 403 Forbidden: Attempt to update another user's task
- 404 Not Found: Task does not exist

### DELETE /api/{user_id}/tasks/{id}
**Description**: Delete a task

**Headers**:
- Authorization: Bearer <jwt_token>

**Path Parameters**:
- user_id: String representing the user ID (derived from JWT)
- id: Integer representing the task ID

**Response**:
- 200 OK: Successfully deleted task
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```
- 401 Unauthorized: Invalid or missing JWT
- 403 Forbidden: Attempt to delete another user's task
- 404 Not Found: Task does not exist

### PATCH /api/{user_id}/tasks/{id}/complete
**Description**: Toggle the completion status of a task

**Headers**:
- Authorization: Bearer <jwt_token>

**Path Parameters**:
- user_id: String representing the user ID (derived from JWT)
- id: Integer representing the task ID

**Request Body**:
```json
{
  "completed": true
}
```

**Response**:
- 200 OK: Successfully toggled task completion
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user123",
    "title": "Sample task",
    "description": "Task description",
    "completed": true,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T11:00:00Z"
  },
  "message": "Task completion status updated"
}
```
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid or missing JWT
- 403 Forbidden: Attempt to toggle another user's task
- 404 Not Found: Task does not exist

## Authentication API Contracts

### POST /api/auth/register
**Description**: Register a new user

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "secure_password"
}
```

**Response**:
- 201 Created: User registered successfully
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "message": "User registered successfully"
}
```
- 400 Bad Request: Invalid registration data
- 409 Conflict: Email already exists

### POST /api/auth/login
**Description**: Authenticate user and return JWT

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response**:
- 200 OK: Authentication successful
```json
{
  "success": true,
  "data": {
    "access_token": "jwt_token_here",
    "token_type": "bearer"
  },
  "message": "Login successful"
}
```
- 401 Unauthorized: Invalid credentials

### POST /api/auth/logout
**Description**: Invalidate user session

**Headers**:
- Authorization: Bearer <jwt_token>

**Response**:
- 200 OK: Successfully logged out
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
- 401 Unauthorized: Invalid or missing JWT