<div align="center">

# CBT API

### CBT Platform Backend

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Version](https://img.shields.io/badge/Version-v1-success?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license)

[![GitHub Stars](https://img.shields.io/github/stars/HassanAmirii/cbt-platform-api?style=for-the-badge)](https://github.com/HassanAmirii/cbt-platform-api/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/HassanAmirii/cbt-platform-api?style=for-the-badge)](https://github.com/HassanAmirii/cbt-platform-api/commits/main)
[![Contributors](https://img.shields.io/github/contributors/HassanAmirii/cbt-platform-api?style=for-the-badge)](https://github.com/HassanAmirii/cbt-platform-api/graphs/contributors)
[![Open Issues](https://img.shields.io/github/issues/HassanAmirii/cbt-platform-api?style=for-the-badge)](https://github.com/HassanAmirii/cbt-platform-api/issues)

A computer-based testing API with JWT auth, level-based exam generation, timed attempts, scoring, and detailed answer explanations.

[Report a Bug](https://github.com/HassanAmirii/cbt-platform-api/issues/new?labels=bug) · [Request a Feature](https://github.com/HassanAmirii/cbt-platform-api/issues/new?labels=enhancement)

</div>

## Overview

This backend powers a CBT workflow where students:

1. Register and log in.
2. Start a timed exam attempt for a course.
3. Submit answers against that attempt.
4. Receive score + per-question explanations.

## Features

- JWT authentication for protected exam routes.
- Level-based question selection by `courseCode` + `level`.
- Attempt tracking with expiration (`ongoing`, `submitted`, `expired`).
- Immediate grading with detailed explanation per answer.
- Persistent result history per student.
- Swagger UI for API exploration.
- Centralized error handling for validation, duplicate keys, and JWT errors.

## Project Structure

```text
src/
  controllers/
    auth.controllers.js
    exam.controllers.js
  middleware/
    auth.middleware.js
  models/
    attempt.model.js
    question.model.js
    result.model.js
    user.model.js
  routes/v1/
    auth.routes.js
    exam.routes.js
  services/
    exam.services.js
  app.js
  server.js
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

`/api/v1` is reserved for application routes (auth/exam), not health checks.

Render health check path:

```text
/health
```

## API Reference

### `POST /api/v1/register`

Register a new user.

Validation rules:

- `username`: required, alphanumeric, 4-30 chars (trimmed)
- `email`: required, valid email format (trimmed)
- `password`: required, minimum 6 chars
- `level`: required, one of `100`, `200`, `300`, `400`

Request:

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123",
  "level": "100"
}
```

Response:

```json
{
  "message": "success",
  "user": {
    "_id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "level": "100",
    "isAdmin": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
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
  "message": "login successful",
  "token": "jwt-token"
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
  "limit": 35
}
```

Validation rules:

- `courseCode`: required, uppercase alphanumeric string
- `limit`: required, one of `35`, `60`, `100`

`limit` is used as exam mode:

- `35` questions -> `15` minutes
- `60` questions -> `25` minutes
- `100` questions -> `35` minutes

Response:

```json
{
  "questions": [
    {
      "questionId": "6600a...",
      "questionText": "what is the primary function of an operating system?",
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
  ],
  "attemptId": "6600b..."
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
- `answers`: required array with at least one item
- `answers[].questionId`: required, 24-char hex string
- `answers[].selected`: required string

Response:

```json
{
  "score": 50,
  "explanation": [
    {
      "questionId": "6600a...",
      "questionText": "what is the primary function of an operating system?",
      "correctOption": "A",
      "explanation": "An operating system acts as an intermediary between the user and the computer hardware.",
      "picked": "A",
      "isCorrect": true
    }
  ]
}
```

If the attempt is expired or already submitted, service throws:

- `410 Gone`: `Session expired or already submitted`

## Data Model Notes

- `User`: authentication data + academic `level` + `isAdmin`.
- `Question`: question text, topic, level, course code, 4 options (`A-D`), `correctOption`, explanation.
- `Attempt`: links student to selected question IDs with duration, expiry timestamp, and status.
- `Result`: stores final score and explanation breakdown for each submitted answer.

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

This project is documented as MIT in prior revisions. If you plan to publish or distribute broadly, add an explicit `LICENSE` file to the repository root.
