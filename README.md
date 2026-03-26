# CBT API

## Overview

This project gives you a robust backend for a Computer Based Test (CBT) application, handling everything from user authentication to exam management. It lets users register, log in, take exams based on their academic level and specific courses, and get instant results with detailed explanations. The main goal here is to provide a solid, scalable foundation for any online assessment system.

## Features

- **User Authentication**: Users can securely register and log in using JWT for session management.
- **Role-Based Access**: Distinguishes between regular users and administrators (though admin-specific endpoints aren't exposed in this version, the user model supports it).
- **Dynamic Exam Generation**: Serves up randomized exam questions tailored to a user's academic level and a chosen course.
- **Exam Submission & Grading**: Processes submitted answers, calculates scores, and provides immediate feedback with comprehensive explanations for each question.
- **Result Persistence**: Stores detailed exam results for users to review their performance history.
- **Comprehensive Error Handling**: Implements a global error handling middleware to gracefully manage various types of errors, including Mongoose validation, duplicate keys, and JWT issues.
- **API Documentation**: Includes integrated Swagger UI for easy exploration and testing of API endpoints.

## Getting Started

### Environment Variables

You'll need to set up a `.env` file in the root of your project with the following variables. These are crucial for the application to run correctly.

```ini
APP_ENV=development
PORT=3000
MONGO_URI=mongodb://get your uri from mongodb atlas
JWT_SECRET=thisisasecretkeyforjwtauthentications
FRONTEND_URL=https://yourfrontendurl.com
```

- `APP_ENV`: Set to `development` for local testing or `production` for deployment.
- `PORT`: The port your server will listen on (e.g., `3000`).
- `MONGO_URI`: Your MongoDB connection string. You can get this from MongoDB Atlas.
- `JWT_SECRET`: A strong, random string used for signing and verifying JSON Web Tokens.
- `FRONTEND_URL`: The URL of your frontend application. Important for CORS in production.

## Usage

To get the server running, make sure you've installed all the dependencies and set up your environment variables.

1.  **Install dependencies**:

    ```bash
    npm install
    ```

    or

    ```bash
    yarn install
    ```

2.  **Start the server**:

    ```bash
    npm start
    ```

    or

    ```bash
    node server.js
    ```

    You should see messages in your console indicating successful database connection and server startup.
    The API will then be accessible at `http://localhost:[PORT]/api/v1` (replace `[PORT]` with the value from your `.env` file, default is `3000`).

3.  **Access API Documentation**:
    Once the server is running, you can explore all the API endpoints and their functionalities using Swagger UI at:
    `http://localhost:[PORT]/api-docs`

## API Documentation

### Base URL

`http://localhost:3000/api/v1` (adjust port if different in your `.env`)

### Endpoints

#### `POST /auth/register`

Registers a new user in the system.

**Request**:

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123",
  "level": "100"
}
```

**Response**:

```json
{
  "message": "success",
  "user": {
    "_id": "65b7d0c3f0b3e7c8d9a0b1c2",
    "username": "testuser",
    "email": "test@example.com",
    "level": "100",
    "isAdmin": false,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z",
    "__v": 0
  }
}
```

**Errors**:

- 400: Bad request (e.g., missing fields, invalid email format, password too short).
- 409: Field already exists (e.g., username or email is already taken).

#### `POST /auth/login`

Authenticates a user and returns a JWT token.

**Request**:

```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Response**:

```json
{
  "message": "login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YjdkMGMzZjBiM2U3YzhkOWEwYjFjMiIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJhZG1pbiI6ZmFsc2UsImxldmVsIjoiMTAwIiwiaWF0IjoxNzAyMzY4MDAwLCJleHAiOjE3MDIzNzE2MDB9.someLongHashString"
}
```

**Errors**:

- 400: Bad request (e.g., missing email or password).
- 401: Unauthorized (invalid credentials).

#### `POST /start-exam`

Retrieves a set of exam questions for a given course and the user's level. Requires authentication.

**Request**:
Requires an `Authorization: Bearer <token>` header.

```json
{
  "courseCode": "CBT101",
  "limit": 5
}
```

**Response**:

```json
{
  "questions": [
    {
      "questionId": 1,
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
    // ... more questions
  ]
}
```

**Errors**:

- 400: Bad request (e.g., `courseCode` or `level` missing).
- 401: Unauthorized (invalid or expired token).
- 404: No questions found for the given criteria.

#### `POST /submit-exam`

Submits user answers for an exam and returns the score and detailed explanations. Requires authentication.

**Request**:
Requires an `Authorization: Bearer <token>` header.

```json
{
  "courseCode": "CBT101",
  "answers": [
    { "questionId": 1, "selected": "A" },
    { "questionId": 2, "selected": "C" }
  ]
}
```

**Response**:

```json
{
  "score": 50,
  "explanation": [
    {
      "courseCode": "CBT101",
      "questionText": "what is the primary function of an operating system?",
      "correctOption": "A",
      "explanation": "An operating system acts as an intermediary between the user and the computer hardware, coordinating CPU time, memory allocation, and storage.",
      "picked": "A",
      "isCorrect": true
    },
    {
      "courseCode": "CBT101",
      "questionText": "which of the following is not a programming language?",
      "correctOption": "D",
      "explanation": "HTML is a markup language used for structuring web content, whereas Python, Java, and C++ are programming languages.",
      "picked": "C",
      "isCorrect": false
    }
    // ... more explanations
  ]
}
```

**Errors**:

- 400: Bad request (e.g., `answers` or `courseCode` missing, or improperly formatted).
- 401: Unauthorized (invalid or expired token).
- 404: Not found (e.g., a `questionId` in the answers doesn't exist).

## Technologies Used

| Technology                                                             | Description                                                 |
| :--------------------------------------------------------------------- | :---------------------------------------------------------- |
| [Express.js](https://expressjs.com/)                                   | Fast, unopinionated, minimalist web framework for Node.js.  |
| [Node.js](https://nodejs.org/en)                                       | JavaScript runtime for server-side execution.               |
| [MongoDB](https://www.mongodb.com/)                                    | NoSQL database for flexible data storage.                   |
| [Mongoose](https://mongoosejs.com/)                                    | MongoDB object data modeling (ODM) for Node.js.             |
| [bcrypt](https://www.npmjs.com/package/bcrypt)                         | Library for hashing passwords securely.                     |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)             | For implementing JSON Web Token (JWT) based authentication. |
| [cors](https://www.npmjs.com/package/cors)                             | Middleware to enable Cross-Origin Resource Sharing.         |
| [dotenv](https://www.npmjs.com/package/dotenv)                         | Loads environment variables from a `.env` file.             |
| [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express) | Middleware for serving Swagger UI from an Express app.      |
| [YAML.js](https://www.npmjs.com/package/yamljs)                        | A YAML parser and stringifier for JavaScript.               |

## Contributing

We welcome contributions! If you have suggestions for improvements, feature requests, or bug fixes, please open an issue or submit a pull request.
Here's a quick guide:

1.  **Fork the repository**.
2.  **Create a new branch** for your feature or fix.
3.  **Make your changes**, ensuring they follow the existing code style.
4.  **Write clear, concise commit messages**.
5.  **Submit a pull request** with a detailed description of your changes.

## License

This project is open-sourced under the MIT License.

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
