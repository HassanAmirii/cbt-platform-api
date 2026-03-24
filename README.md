# **CBT Exam Platform API**

## Overview

This project provides a robust Express.js backend for an online examination system. It facilitates secure user authentication, dynamic retrieval of exam questions based on course and level, and comprehensive exam submission with instant scoring and detailed explanations, all powered by MongoDB.

## Features

- **User Authentication**: Secure user registration and login endpoints utilizing JSON Web Tokens (JWT) for session management.
- **Secure Password Management**: Passwords are securely hashed using bcrypt before storage.
- **Dynamic Exam Generation**: Fetches randomized exam questions tailored to specific course codes and user academic levels.
- **Comprehensive Exam Submission**: Processes submitted answers, calculates scores, and generates detailed explanations for each question, indicating correctness.
- **Modular Architecture**: Organized codebase with dedicated routes, controllers, services, and Mongoose models for maintainability and scalability.
- **Data Persistence**: Leverages MongoDB through Mongoose for efficient storage and retrieval of users, questions, and exam results.

## Technologies Used

| Technology       | Description                                     | Version/Link                                                                                                                |
| :--------------- | :---------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**      | JavaScript runtime environment                  | [![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js&logoColor=white)](https://nodejs.org/en/)          |
| **Express.js**   | Web application framework for Node.js           | [![Express.js](https://img.shields.io/badge/Express.js-v5.x-blue?logo=express&logoColor=white)](https://expressjs.com/)     |
| **MongoDB**      | NoSQL database                                  | [![MongoDB](https://img.shields.io/badge/MongoDB-Cloud-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)      |
| **Mongoose**     | MongoDB object data modeling (ODM) for Node.js  | [![Mongoose](https://img.shields.io/badge/Mongoose-v8.x-red?logo=mongoose&logoColor=white)](https://mongoosejs.com/)        |
| **bcrypt**       | Password hashing library                        | [![Bcrypt](https://img.shields.io/badge/bcrypt-v5.x-orange)](https://www.npmjs.com/package/bcrypt)                          |
| **jsonwebtoken** | JSON Web Token (JWT) implementation for Node.js | [![jsonwebtoken](https://img.shields.io/badge/jsonwebtoken-v9.x-informational)](https://www.npmjs.com/package/jsonwebtoken) |
| **dotenv**       | Loads environment variables from a `.env` file  | [![dotenv](https://img.shields.io/badge/dotenv-v17.x-yellow)](https://www.npmjs.com/package/dotenv)                         |

## Getting Started

### Environment Variables

To run this project, you will need to set up the following environment variables in a `.env` file in the root directory:

| Variable     | Description                                  | Example Value                      |
| :----------- | :------------------------------------------- | :--------------------------------- |
| `PORT`       | The port number for the server to listen on. | `3000`                             |
| `MONGO_URI`  | Connection string for your MongoDB database. | `mongodb://localhost:27017/examdb` |
| `JWT_SECRET` | A secret key for signing and verifying JWTs. | `your_super_secret_jwt_key_here`   |

**Example `.env` file:**

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/examdb
JWT_SECRET=thisisasecretkeyforjwtauthentication
```

## Usage

Interact with the API endpoints to manage users, start exams, and submit results.

### User Authentication

#### Register a New User

Registers a new user account with a unique username and email.

- **Endpoint**: `POST /api/v1/register`
- **Request Body**:

  ```json
  {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "StrongPassword123",
    "level": "100"
  }
  ```

  - `username` (string, required): Unique username.
  - `email` (string, required): Unique and valid email address.
  - `password` (string, required): Password (min 6 characters).
  - `level` (string, required): User's academic level (e.g., "100", "200", "300", "400").

- **Success Response**: `HTTP 201 Created`
  ```json
  {
    "message": "success",
    "user": {
      "_id": "65b21e8d9b1c7f0a8d6e7f8e",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "level": "100",
      "isAdmin": false,
      "createdAt": "2024-01-25T12:00:00.000Z",
      "updatedAt": "2024-01-25T12:00:00.000Z"
    }
  }
  ```
- **Errors**:
  - `HTTP 409 Conflict`: If username or email already exists.
  - `HTTP 400 Bad Request`: If required fields are missing or invalid.

#### Log In a User

Authenticates a user and provides a JSON Web Token (JWT) for subsequent authorized requests.

- **Endpoint**: `POST /api/v1/login`
- **Request Body**:

  ```json
  {
    "email": "john.doe@example.com",
    "password": "StrongPassword123"
  }
  ```

  - `email` (string, required): Registered email address.
  - `password` (string, required): User's password.

- **Success Response**: `HTTP 200 OK`
  ```json
  {
    "message": "login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YjI1MWM3YmMwNTc3YjA5YzQwYzkwMSIsInVzZXJuYW1lIjoiam9obmRvZSIsImFkbWluIjpmYWxzZSwibGV2ZWwiOiIxMDAiLCJpYXQiOjE3MDYxOTA0MjksImV4cCI6MTcwNjE5NDAyOX0.example_jwt_token"
  }
  ```
- **Errors**:
  - `HTTP 401 Unauthorized`: For invalid credentials (email or password).

### Exam Management

#### Start an Exam

Retrieves a set of randomized questions for a specified course and level. Requires authentication.

- **Endpoint**: `POST /api/v1/start-exam`
- **Headers**: `Authorization: Bearer <your_jwt_token>`
- **Request Body**:

  ```json
  {
    "courseCode": "CSC101",
    "level": "100",
    "limit": 5
  }
  ```

  - `courseCode` (string, required): The code for the course (e.g., "CSC101").
  - `level` (string, optional): The academic level for questions (e.g., "100"). If not provided, it defaults to the authenticated user's level.
  - `limit` (number, optional): The maximum number of questions to return (defaults to 5).

- **Success Response**: `HTTP 200 OK`
  ```json
  {
    "questions": [
      {
        "questionId": 1,
        "questionText": "what is the primary function of an operating system?",
        "options": [
          {
            "optionsText": "to manage hardware resources",
            "optionsLabel": "A"
          },
          { "optionsText": "to run applications", "optionsLabel": "B" },
          { "optionsText": "to store data", "optionsLabel": "C" },
          { "optionsText": "to browse the internet", "optionsLabel": "D" }
        ]
      },
      {
        "questionId": 3,
        "questionText": "which of the following is not a programming language?",
        "options": [
          { "optionsText": "python", "optionsLabel": "A" },
          { "optionsText": "html", "optionsLabel": "B" },
          { "optionsText": "java", "optionsLabel": "C" },
          { "optionsText": "c++", "optionsLabel": "D" }
        ]
      }
    ]
  }
  ```
- **Errors**:
  - `HTTP 401 Unauthorized`: If no valid token is provided.
  - `HTTP 400 Bad Request`: If `courseCode` or `level` (and user's level is missing) are not provided.
  - `HTTP 404 Not Found`: If no questions are found for the given criteria.

#### Submit an Exam

Submits a user's answers to an exam, calculates the score, and provides detailed explanations. Requires authentication.

- **Endpoint**: `POST /api/v1/submit-exam`
- **Headers**: `Authorization: Bearer <your_jwt_token>`
- **Request Body**:

  ```json
  {
    "courseCode": "CSC101",
    "answers": [
      { "questionId": 1, "selected": "A" },
      { "questionId": 3, "selected": "B" }
    ]
  }
  ```

  - `courseCode` (string, required): The code of the course the exam was for.
  - `answers` (array of objects, required): An array where each object contains:
    - `questionId` (number, required): The ID of the question.
    - `selected` (string, required): The label of the option selected by the user (e.g., "A", "B", "C", "D").

- **Success Response**: `HTTP 200 OK`
  ```json
  {
    "score": 100,
    "explanation": [
      {
        "courseCode": "CSC101",
        "questionText": "what is the primary function of an operating system?",
        "correctOption": "A",
        "explanation": "An operating system acts as an intermediary between the user and the computer hardware, coordinating CPU time, memory allocation, and storage.",
        "picked": "A",
        "isCorrect": true
      },
      {
        "courseCode": "CSC101",
        "questionText": "which of the following is not a programming language?",
        "correctOption": "B",
        "explanation": "HTML is a markup language used for structuring web content, not a programming language. Python, Java, and C++ are programming languages.",
        "picked": "B",
        "isCorrect": true
      }
    ]
  }
  ```
- **Errors**:
  - `HTTP 401 Unauthorized`: If no valid token is provided.
  - `HTTP 400 Bad Request`: If `answers` payload is missing or invalid.

---

### Project Status

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/HassanAmirii/cbt-platform-api/graphs/commit-activity)
[![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/yourrepo)](https://github.com/HassanAmirii/cbt-platform-api/commits/main)
