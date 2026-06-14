# CBT Platform API Design Doc (Mental Model First)

## 0) How To Read This Document

1. System map: Understand boundaries and major parts.
2. Ownership map: See where each responsibility lives in code.
3. Student journey: Follow one request path from login to result.
4. State and invariants: Learn rules that keep behavior correct.
5. Data lifecycle: Understand how question content reaches runtime.

## 1) One-Screen System Map

```mermaid
flowchart LR
    subgraph External
        Client[Student Client]
        Admin[Developer Ops]
    end

    subgraph API[Node/Express API]
        Server[server.js\nboot + DB retry]
        App[app.js\nmiddleware + routes + errors]
        AuthRoutes[auth.routes]
        ExamRoutes[exam.routes]
        UserRoutes[user.routes]
        Controllers[Controllers\nauth/exam/user]
        Services[exam.services]
        Models[Mongoose Models\nUser/Question/Attempt/Result]
    end

    subgraph DataPlane[Data Plane]
        Mongo[(MongoDB)]
        JWT[JWT Secret + tokens]
    end

    subgraph ContentPipeline[Question Content Pipeline]
        JsonData[Question JSON files in data folder]
        Validator[scripts/validator.js]
        Seeder[src/seeders/question.seeder.js]
        Indexer[scripts/create-indexes.js]
    end

    Client -->|HTTP /api/v1| App
    Admin --> Validator
    Validator --> Seeder
    Seeder --> Mongo
    Indexer --> Mongo

    Server --> App
    App --> AuthRoutes
    App --> ExamRoutes
    App --> UserRoutes
    AuthRoutes --> Controllers
    ExamRoutes --> Controllers
    UserRoutes --> Controllers
    Controllers --> Services
    Controllers --> Models
    Services --> Models
    Models --> Mongo
    Controllers <--> JWT
    JsonData --> Validator
```

## 2) Ownership Map (Where To Look In Code)

```mermaid
flowchart TB
    Request[Incoming HTTP Request]
    Route[Route Layer\nendpoint mapping only]
    Middleware[Middleware Layer\nauth JWT gate]
    Controller[Controller Layer\nvalidate, orchestrate, shape response]
    Service[Service Layer\nexam domain rules + grading]
    Model[Model Layer\nschema constraints + persistence]
    Error[Global Error Handler\nnormalize failures]

    Request --> Route --> Middleware --> Controller --> Service --> Model
    Controller --> Model
    Service --> Error
    Controller --> Error
```

Responsibility summary:

- Routes: map URL to controller.
- Middleware: enforce authentication and attach req.user.
- Controllers: Joi validation, parameter extraction, response envelope.
- Services: exam selection, attempt checks, scoring, result creation.
- Models: enforce shape and persist data in MongoDB.

## 3) End-To-End Student Journey (Happy Path)

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'textColor':'#111111', 'primaryTextColor':'#111111', 'actorTextColor':'#111111', 'signalTextColor':'#111111', 'noteTextColor':'#111111', 'lineColor':'#ffffff' }}}%%
sequenceDiagram
    participant S as Student
    participant A as API
    participant M as Auth Middleware
    participant C as Controllers
    participant X as Exam Service
    participant DB as MongoDB

    S->>A: POST /register
    A->>C: validate + create user + return token
    C->>DB: insert User
    C-->>S: 201 token

    S->>A: POST /login
    A->>C: validate + verify password + return token
    C->>DB: find User
    C-->>S: 200 token

    S->>A: POST /start-exam (Bearer token, courseCode, limit, weeks)
    A->>M: verify token
    M-->>A: req.user
    A->>C: startExam
    C->>X: getExamQuestions
    X->>DB: query Question + create Attempt
    X-->>C: questions + metadata
    C-->>S: 200 exam packet

    S->>A: POST /submit-exam (attemptId, answers)
    A->>M: verify token
    A->>C: submitExam
    C->>X: submitExam
    X->>DB: load Attempt + Questions
    X->>DB: create Result + update Attempt=submitted
    X-->>C: score + explanation
    C-->>S: 200 result

    S->>A: GET /results?page&limit
    A->>M: verify token
    A->>C: getStudentResult
    C->>DB: find + count in parallel
    C-->>S: 200 paginated history
```

## 4) Core Domain State And Invariants

### 4.1 Attempt State Machine

```mermaid
stateDiagram-v2
    [*] --> ongoing: start-exam creates attempt
    ongoing --> submitted: submit-exam before expiry
    ongoing --> expired: now >= expiresAt
    submitted --> [*]
    expired --> [*]
```

### 4.2 Invariants That Define Correct Behavior

```mermaid
mindmap
  root((System Invariants))
    Auth
      Protected routes require Bearer JWT
      req.user must contain id, level, department, semester
    Start Exam
      limit in 35, 60, 100
      duration derived from limit
      question filter uses department+level+semester+courseCode+weeks
      attempt created immediately with expiresAt
    Submit Exam
      answers length must be 35 or 60 or 100
      attempt must exist
      attempt must belong to current student
      attempt not already submitted
      attempt not expired
    Scoring
      score equals ceil(correct/total times 100)
      explanation item produced per submitted answer
    Results
      each submission writes one Result document
      result history sorted newest first
```

## 5) Request Decision Tree (Fast Debugging Lens)

```mermaid
flowchart TD
    R[Incoming /api/v1 request] --> A{Auth required route?}
    A -->|No: register/login| B[Validate Joi payload]
    A -->|Yes| C[Verify Bearer JWT]
    C -->|fail| X1[401]
    C -->|pass| D[Validate Joi payload]

    B -->|invalid| X2[400]
    B -->|valid| E[Controller business call]
    D -->|invalid| X3[400]
    D -->|valid| E

    E --> F{Domain checks pass?}
    F -->|no ownership| X4[403]
    F -->|not found| X5[404]
    F -->|already submitted/expired| X6[410]
    F -->|pass| G[Write/read DB]
    G --> H[2xx response]
```

## 6) Data Model And Runtime Relationships

```mermaid
erDiagram
    USER ||--o{ ATTEMPT : starts
    USER ||--o{ RESULT : receives
    ATTEMPT }o--o{ QUESTION : includes
    RESULT }o--o{ QUESTION : explains

    USER {
        ObjectId _id
        string username UNIQUE
        string email UNIQUE
        string department
        string level
        number semester
        bool isAdmin
    }

    QUESTION {
        ObjectId _id
        string courseCode
        string department
        string level
        number semester
        number week
        string topic
        array options[4]
        string correctOption
    }

    ATTEMPT {
        ObjectId _id
        ObjectId student
        ObjectId[] questions
        number duration
        date expiresAt
        string status
        string courseCode
        number[] weeks
        string[] topics
    }

    RESULT {
        ObjectId _id
        ObjectId student
        string courseCode
        number score
        array explanation
        date createdAt
    }
```

## 7) Content Pipeline Mental Model (Validate -> Flatten -> Seed -> Query)

```mermaid
flowchart LR
    Raw[Course JSON grouped by weeks] --> Validate[Joi structure checks]
    Validate -->|pass| Flatten[Flatten week blocks into Question rows]
    Validate -->|fail| Reject[Fix source JSON]
    Flatten --> Seed[insertMany Question]
    Seed --> Index[createIndexes]
    Index --> Runtime[Exam queries use indexed filters]
```

Operational note:

- Current seeder clears Question collection before inserting new data set.
- Result index supports student result history sorting and lookup.

## 8) Mental Shortcut: 5 Questions To Diagnose Any Issue

1. Is this request blocked before controller (JWT or Joi)?
2. If controller is reached, which domain guard failed (ownership, existence, expiry, status)?
3. Which collection should have changed (User, Attempt, Result, Question)?
4. Is this a runtime flow issue or content pipeline issue?
5. Does the error come from domain logic or global error normalization?
