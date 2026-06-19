# CBT API

## Overview

This backend powers a CBT workflow where students:

1. Register and log in.
2. Start a timed exam attempt for a course.
3. Submit answers against that attempt.
4. Receive score + per-question explanations.
5. View their paginated result history.

## Features

- JWT authentication for protected exam and user routes.
- Level- and semester-based question selection by `department` + `courseCode` + `level` + `semester` + `weeks`.
- Attempt tracking with expiration (`ongoing`, `submitted`, `expired`).
- Immediate grading with detailed explanation per answer.
- Start-exam metadata that returns the attempt context and expiry window.
- Persistent, paginated result history per student.
- Swagger UI for API exploration.
- Centralized error handling for validation, duplicate keys, and JWT errors.

## Project Structure

```text
src/
├── config/
│   └── departments.js
├── controllers/
│   ├── auth.controllers.js
│   ├── exam.controllers.js
│   └── user.controllers.js
├── middleware/
│   └── auth.middleware.js
├── models/
│   ├── attempt.model.js
│   ├── question.model.js
│   ├── result.model.js
│   └── user.model.js
├── routes/v1/
│   ├── auth.routes.js
│   ├── exam.routes.js
│   └── user.routes.js
├── services/
│   └── exam.services.js
├── app.js
└── server.js

```

## Environment Variables

Create a `.env` file in the project root:

```ini
APP_ENV=development
PORT=3000
MONGO_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://yourfrontendurl.com
```

## Running Locally

Install dependencies:

```bash
npm install
```

Start the API:

```bash
npm start
```

Import seeded questions (optional):

```bash
npm run seeder:import
```

Swagger docs:

```text
http://localhost:3000/api-docs
```

Health check endpoints:

```text
GET http://localhost:3000/
GET http://localhost:3000/health
```

Base API URL:

```text
http://localhost:3000/api/v1
```

`/api/v1` is reserved for application routes (auth/exam/user), not health checks.

Render health check path:

```text
/health
```

## API Reference

### `POST /api/v1/register`

Register a new user.

Validation rules:

- `username`: required, alphanumeric, 4-30 chars (trimmed)
- `department`: required, one of many; eg, `computer science`, `mechanical engineering`...
- `email`: required, valid email format (trimmed)
- `password`: required, minimum 6 chars
- `semester`: required, one of `1`, `2`
- `level`: required, one of `100`, `200`, `300`, `400`, `500`

Request:

```json
{
  "username": "testuser",
  "department": "computer science",
  "email": "test@example.com",
  "password": "securepassword123",
  "semester": 1,
  "level": "100"
}
```

Response:

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "<jwt>"
}
```

### `POST /api/v1/login`

Authenticate a user and return a JWT.

Validation rules:

- `email`: required, valid email format (trimmed)
- `password`: required, minimum 6 chars

Request:

```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

Response:

```json
{
  "success": true,
  "message": "login successful",
  "token": "<jwt>"
}
```

### `POST /api/v1/start-exam` (Auth Required)

Start a timed attempt and get randomized questions.

Request headers:

```text
Authorization: Bearer <token>
```

Request body:

```json
{
  "courseCode": "CBT101",
  "limit": 35,
  "weeks": [1, 2]
}
```

Validation rules:

- `courseCode`: required, uppercase alphanumeric string
- `limit`: required, one of `35`, `60`, `100`
- `weeks`: required array of week numbers to pull questions from

`limit` is used as exam mode:

- `35` questions -> `15` minutes
- `60` questions -> `25` minutes
- `100` questions -> `35` minutes

Response:

```json
{
  "metadata": {
    "attemptId": "6600b...",
    "totalQuestions": 35,
    "duration": 15,
    "expiresAt": "2026-06-15T12:00:00.000Z",
    "courseCode": "CBT101",
    "level": "100",
    "department": "computer science",
    "semester": 1,
    "weeks": [1, 2],
    "topics": ["computer basics"]
  },
  "questions": [
    {
      "questionId": "6600a...",
      "department": "computer science",
      "level": "100",
      "semester": 1,
      "questionText": "what is the primary function of an operating system?",
      "topic": "computer basics",
      "week": 1,
      "options": [
        {
          "optionsText": "To manage hardware and software resources",
          "optionsLabel": "A"
        },
        { "optionsText": "To provide internet access", "optionsLabel": "B" },
        { "optionsText": "To store user files", "optionsLabel": "C" },
        { "optionsText": "To run applications only", "optionsLabel": "D" }
      ]
    }
  ]
}
```

### `POST /api/v1/submit-exam` (Auth Required)

Submit answers for an active attempt.

Request headers:

```text
Authorization: Bearer <token>
```

Request body:

```json
{
  "attemptId": "6600b...",
  "answers": [
    { "questionId": "6600a...", "selected": "A" },
    { "questionId": "6600c...", "selected": "C" }
  ]
}
```

Validation rules:

- `attemptId`: required, 24-char hex string (Mongo ObjectId format)
- `answers`: required array with exactly `35`, `60`, or `100` items
- `answers[].questionId`: required, 24-char hex string
- `answers[].selected`: required field. Use `A`, `B`, `C`, or `D` for answered items; use empty string (`""`) or `null` for unanswered items.

Response:

```json
{
  "score": 50,
  "explanation": [
    {
      "questionId": "6600a...",
      "questionText": "what is the primary function of an operating system?",
      "correctOption": "A",
      "correctOptionText": "To manage hardware and software resources",
      "selectedOptionText": "To manage hardware and software resources",
      "explanation": "An operating system acts as an intermediary between the user and the computer hardware.",
      "picked": "A",
      "isCorrect": true
    }
  ]
}
```

Error cases:

- `403 Forbidden`: `attemptId does not belong to current user`
- `410 Gone`: `Attempt already submitted`
- `410 Gone`: `Session expired`

### `GET /api/v1/results` (Auth Required)

Fetch the authenticated student's paginated result history.

Request headers:

```text
Authorization: Bearer <token>
```

Query params (optional):

- `page`: page number (default `1`)
- `limit`: items per page (default `10`)

Example request:

```text
GET /api/v1/results?page=1&limit=10
```

Response:

```json
{
  "success": true,
  "results": [
    {
      "_id": "...",
      "student": "...",
      "score": 50,
      "createdAt": "..."
    }
  ],
  "pagination": {
    "totalResults": 12,
    "totalPages": 2,
    "limit": 10,
    "currentPage": 1
  }
}
```

### `GET /api/v1/leaderboard` (Auth Required)

Fetch the top 10 leaderboard entries ranked by average score. Results are grouped by student and course code.

Request headers:

```text
Authorization: Bearer <token>
```

Query params (optional):

- `courseCode`: filter leaderboard entries to a specific course, for example `CSC201`
- `department`: filter leaderboard entries to students in a specific department, for example `COMP_SCI`

If neither query param is provided, the endpoint returns the overall top 10 student/course entries across all courses.

Example requests:

```text
GET /api/v1/leaderboard
GET /api/v1/leaderboard?courseCode=CSC201
GET /api/v1/leaderboard?department=COMP_SCI
GET /api/v1/leaderboard?courseCode=CSC201&department=COMP_SCI
```

Response:

```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "studentName": "Hassan",
      "department": "COMP_SCI",
      "courseCode": "CSC201",
      "averageScore": 88,
      "totalSessions": 12
    }
  ]
}
```

## Data Model Notes

- `User`: authentication data + academic `level` + `semester` + `isAdmin`.
- `Question`: question text, topic, level, semester, week, course code, exactly 4 options (`A-D`), `correctOption`, explanation.
- `Attempt`: links student to selected question IDs with duration, expiry timestamp, status, semester, and week filters.
- `Result`: stores final score and explanation breakdown per submitted answer, including `correctOptionText`, `selectedOptionText`, `semester`, `courseCode`, `topics`, and `weeks`.

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT + bcrypt
- Swagger UI (`swagger-ui-express` + `yamljs`)

## Contributing

1. Fork the repository.
2. Create a feature/fix branch.
3. Make your changes.
4. Open a pull request.

## License

- MIT
