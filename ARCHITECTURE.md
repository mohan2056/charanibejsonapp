# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Browser)                       │
│              React / Vue / Angular / Any Framework              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                   HTTP/HTTPS Requests
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Express.js Server                            │
│                    (src/index.js)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Middleware Stack                        │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ CORS Middleware (cors)                             │  │   │
│  │  ├── Allow specific origins                           │  │   │
│  │  ├── Enable credentials                               │  │   │
│  │  └── Handle preflight requests                        │  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Body Parser Middleware (express.json)              │  │   │
│  │  ├── Parse JSON requests                              │  │   │
│  │  └── Parse URL-encoded data                           │  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ File Upload Middleware (express-fileupload)        │  │   │
│  │  ├── Handle multipart/form-data                       │  │   │
│  │  └── Store resume files                               │  │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   API Routes                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Candidate Routes (/api/candidate)                  │  │   │
│  │  │ ├── POST /register    → Handle registration        │  │   │
│  │  │ └── GET /all          → Return all candidates      │  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Exam Routes (/api)                                 │  │   │
│  │  │ ├── GET /questions/:section   → Get shuffled Q's   │  │   │
│  │  │ ├── POST /result/submit       → Calculate score    │  │   │
│  │  │ ├── GET /result/search        → Search results     │  │   │
│  │  │ └── GET /result/email/:email  → Get user result    │  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Health Routes                                      │  │   │
│  │  │ └── GET /health      → Server status check         │  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Root Route                                         │  │   │
│  │  │ └── GET /          → API documentation             │  │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
      ┌──────────────────┴──────────────────┐
      │                                     │
      ▼                                     ▼
┌──────────────────────┐          ┌──────────────────────┐
│   Data Models        │          │    Service Layer     │
│  (src/models/)       │          │  (src/services/)     │
├──────────────────────┤          ├──────────────────────┤
│ • Candidate.js       │          │ JsonDatabaseService  │
│ • Question.js        │          │                      │
│ • Result.js          │  ────►   │ • loadData()         │
│ • AnswerDTO.js       │          │ • saveData()         │
│                      │          │ • saveResume()       │
│ (Plain JS Classes)   │          │ • getResume()        │
└──────────────────────┘          └──────────────────────┘
                                          │
                         ┌────────────────┴────────────────┐
                         │                                 │
                         ▼                                 ▼
                  ┌──────────────────┐          ┌──────────────────┐
                  │  JSON Database   │          │  Resume Storage  │
                  │  (exam_data/)    │          │  (exam_data/     │
                  ├──────────────────┤          │   resumes/)      │
                  │• candidates.json │          ├──────────────────┤
                  │• questions.json  │          │ Timestamped      │
                  │• results.json    │          │ Resume Files     │
                  └──────────────────┘          └──────────────────┘
```

---

## Request/Response Flow

### Example: Candidate Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. FRONTEND sends POST request with form data:           │
│     ├── name, email, phone, college                        │
│     ├── branch, gender, backlogs                           │
│     └── resume file (optional)                             │
│                                                             │
│                         │                                  │
│                         ▼                                  │
│  2. EXPRESS receives request at /api/candidate/register    │
│     ├── CORS middleware validates origin                   │
│     ├── File upload middleware extracts file              │
│     └── Body parser extracts form fields                  │
│                                                             │
│                         │                                  │
│                         ▼                                  │
│  3. ROUTE HANDLER processes data:                          │
│     ├── Loads existing candidates from JSON                │
│     ├── Validates email (not empty, not duplicate)        │
│     ├── Creates new Candidate object                      │
│     ├── If resume: saves to exam_data/resumes/            │
│     └── Adds to candidate list                            │
│                                                             │
│                         │                                  │
│                         ▼                                  │
│  4. DATABASE SERVICE saves data:                           │
│     ├── Converts candidates array to JSON                 │
│     └── Writes to exam_data/candidates.json               │
│                                                             │
│                         │                                  │
│                         ▼                                  │
│  5. RESPONSE sent back to frontend:                        │
│     ├── HTTP 200 (Success) with candidate object          │
│     ├── HTTP 400 (Bad Request) if validation fails        │
│     └── HTTP 409 (Conflict) if email already exists       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Exam Submission

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND: User submits exam answers                       │
│  Sends: candidateEmail + answers array                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  EXPRESS: /api/result/submit endpoint                      │
├─────────────────────────────────────────────────────────────┤
│  Step 1: Load data                                          │
│  ├── Load all results (to check duplicates)                │
│  └── Load all questions (to get correct answers)           │
│                                                             │
│  Step 2: Validate submission                               │
│  ├── Check if email already submitted                      │
│  └── Validate answers array exists                         │
│                                                             │
│  Step 3: Calculate score                                   │
│  ├── For each user answer:                                 │
│  │   ├── Find question by ID                               │
│  │   ├── Compare with correct option                       │
│  │   └── Increment section counter (apt/rea/com)          │
│  │                                                          │
│  └── Calculate totals:                                     │
│      ├── totalCorrect = apt + rea + com                    │
│      └── percentage = (totalCorrect / 60) * 100            │
│                                                             │
│  Step 4: Save result                                       │
│  └── Append to results.json                                │
│                                                             │
│  Step 5: Send response                                     │
│  └── Return result object with scores                      │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE: exam_data/results.json updated                  │
│                                                             │
│  {                                                          │
│    "id": 1,                                                │
│    "candidateEmail": "john@example.com",                  │
│    "aptitudeCorrect": 15,                                 │
│    "reasoningCorrect": 12,                                │
│    "communicationCorrect": 18,                            │
│    "totalCorrect": 45,                                    │
│    "percentage": 75.00                                    │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Dependencies

```
src/index.js (Main Server)
│
├─► express                    (Framework)
├─► cors                       (Middleware)
├─► express-fileupload         (Middleware)
│
├─► src/routes/candidateRoutes.js
│   ├─► express (Router)
│   ├─► src/services/JsonDatabaseService.js
│   └─► src/models/Candidate.js
│
├─► src/routes/examRoutes.js
│   ├─► express (Router)
│   ├─► src/services/JsonDatabaseService.js
│   ├─► src/models/Question.js
│   ├─► src/models/Result.js
│   └─► src/models/AnswerDTO.js
│
└─► src/services/JsonDatabaseService.js
    ├─► fs (Node.js built-in)
    ├─► path (Node.js built-in)
    └─► url (Node.js built-in)
```

---

## File Operations

### Reading Flow
```
API Request
    │
    ├─► loadData(Candidate)
    │       │
    │       ├─► Construct path: exam_data/candidates.json
    │       ├─► Check if file exists
    │       ├─► Read file with fs.readFileSync()
    │       ├─► Parse JSON with JSON.parse()
    │       └─► Return array
    │
    ▼
Parse and filter data
    │
    ▼
Send response
```

### Writing Flow
```
Model Data
    │
    ├─► saveData(data, Candidate)
    │       │
    │       ├─► Construct path: exam_data/candidates.json
    │       ├─► Serialize with JSON.stringify(data, null, 2)
    │       ├─► Write with fs.writeFileSync()
    │       └─► Handle errors
    │
    ▼
Data persisted to disk
```

---

## Question Shuffling Algorithm

```
Input: Question Array + Email (used as seed)

Step 1: Hash the email
   email.toLowerCase().trim() → hashCode() → numeric seed

Step 2: Initialize Random with seed
   Fisher-Yates shuffle with seeded randomness

Step 3: Shuffle array
   for i = length-1 down to 1
       j = random(seed) % (i+1)
       swap array[i] and array[j]

Step 4: Return top 20 questions
   return shuffled.slice(0, 20)

Result: Same email always gets same shuffled order!
```

---

## Error Handling Flow

```
Request Error
    │
    ├─► Validation Error
    │   ├─► Email missing → 400 Bad Request
    │   ├─► Email duplicate → 409 Conflict
    │   └─► Invalid data → 400 Bad Request
    │
    ├─► Not Found Error
    │   ├─► Result not found → 404 Not Found
    │   └─► Question not found → 200 OK (empty array)
    │
    ├─► Logic Error
    │   ├─► Already submitted → 409 Conflict
    │   └─► File write error → 500 Internal Server Error
    │
    └─► Catch-All Error
        └─► Unexpected error → 500 Internal Server Error
            with error message in response
```

---

## Performance Characteristics

### Time Complexity
- Register candidate: O(n) where n = existing candidates
- Get questions: O(m log m) where m = all questions
- Submit exam: O(k * q) where k = answers, q = questions
- Search results: O(r) where r = all results

### Space Complexity
- All endpoints: O(n) for loaded data in memory
- No pagination implemented → full datasets loaded

### Optimization Opportunities
- Add pagination for large datasets
- Implement caching for questions
- Use database instead of JSON
- Add indexing for faster searches

---

## Deployment Architecture

```
┌─────────────────┐
│  Git Repository │
│   (GitHub)      │
└────────┬────────┘
         │
         │ Push/Deploy
         │
         ▼
┌─────────────────────────┐
│ Deployment Platform     │
│ (Vercel, AWS, Heroku)   │
│                         │
│  1. npm install         │
│  2. npm start           │
│  3. PORT=8080           │
└──────────┬──────────────┘
           │
           ▼
┌────────────────────────────┐
│  Running Node.js Server    │
│  - Listen on :8080         │
│  - Load exam_data/         │
│  - Accept connections      │
└──────────┬─────────────────┘
           │
           │ Accepts requests from
           │
           ▼
┌────────────────────────────┐
│   Client Applications      │
│  (Frontend - Browser)      │
└────────────────────────────┘
```

---

**Architecture Diagram Created**: December 28, 2025
