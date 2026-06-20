# LearnSmart API Documentation

Base URL: `http://localhost:5000` (development)

All authenticated routes require header: `Authorization: Bearer <token>`

---

## Health

### GET /health

```json
{ "status": "ok", "service": "learnsmart-api" }
```

---

## Authentication

### POST /api/auth/register

**Body:**

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response (201):**

```json
{
  "token": "jwt...",
  "user": {
    "id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "diagnosticCompleted": false
  }
}
```

### POST /api/auth/login

**Body:**

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response (200):** Same shape as register.

---

## Quiz

### GET /api/quiz/diagnostic

Returns 15 diagnostic MCQs (one per skill sequence).

**Response:**

```json
{
  "questions": [
    {
      "id": "...",
      "skill": "Arrays",
      "difficulty": "medium",
      "text": "...",
      "options": ["A", "B", "C", "D"]
    }
  ]
}
```

### POST /api/quiz/diagnostic/submit

**Body:**

```json
{
  "answers": [
    { "questionId": "...", "selectedOption": 0 }
  ]
}
```

**Response:**

```json
{
  "results": [
    {
      "questionId": "...",
      "skill": "Arrays",
      "correct": true,
      "updatedMastery": 0.4521
    }
  ],
  "masteryMap": {
    "Arrays": 0.4521,
    "Strings": 0.3892
  },
  "message": "Diagnostic assessment completed"
}
```

### GET /api/quiz/adaptive

Generates 10 adaptive questions prioritizing weakest skills with IRT difficulty.

**Response:**

```json
{
  "questions": [...],
  "count": 10
}
```

### POST /api/quiz/adaptive/submit

**Body:** Same as diagnostic submit.

**Response:**

```json
{
  "results": [...],
  "summary": { "total": 10, "correct": 7, "scorePercent": 70 },
  "masteryMap": { ... },
  "analytics": { ... },
  "recommendations": [
    {
      "skill": "Binary Search",
      "masteryScore": 0.38,
      "masteryPercent": 38,
      "explanation": "Your mastery score is 38%, below the recommended threshold of 70%.",
      "commonError": "Incorrect boundary updates in the search interval.",
      "suggestedAction": "Attempt Beginner Binary Search Set."
    }
  ]
}
```

### POST /api/quiz/answer

Single-answer endpoint for real-time BKT updates.

**Body:**

```json
{
  "questionId": "...",
  "selectedOption": 2,
  "quizType": "adaptive"
}
```

---

## Dashboard & Analytics

### GET /api/dashboard

**Response:**

```json
{
  "skills": [
    {
      "skill": "Arrays",
      "masteryScore": 0.82,
      "masteryPercent": 82,
      "level": "strong"
    }
  ],
  "masteryMap": { ... },
  "weakestSkills": [
    { "skill": "Dynamic Programming", "masteryScore": 0.23, "masteryPercent": 23 }
  ],
  "learningPath": ["Dynamic Programming", "Graphs", "Binary Search", ...],
  "nextTopic": {
    "skill": "Binary Search",
    "masteryScore": 0.41,
    "masteryPercent": 41,
    "reason": "Your mastery score is 41%, below the recommended threshold of 70%."
  },
  "analytics": {
    "averageMastery": 0.55,
    "averageMasteryPercent": 55,
    "weakestSkill": { "skill": "Dynamic Programming", "masteryScore": 0.23 },
    "strongestSkill": { "skill": "Arrays", "masteryScore": 0.82 }
  },
  "recommendations": [...]
}
```

### GET /api/mastery

Returns all mastery records for the authenticated user.

### GET /api/history

Returns recent attempts and improvement-over-time data for charts.

### GET /api/recommendations

Returns stored or computed recommendations.

---

## ML Service (FastAPI)

Base URL: `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

| Endpoint                    | Method | Description                |
|----------------------------|--------|----------------------------|
| /health                    | GET    | Service health             |
| /bkt/update                | POST   | Single BKT mastery update  |
| /bkt/batch-update          | POST   | Batch BKT updates          |
| /irt/select-difficulty     | POST   | IRT difficulty selection   |
| /irt/information           | POST   | Fisher information values  |
| /analytics                 | POST   | Dashboard analytics        |
| /recommendations           | POST   | Single recommendation      |
| /recommendations/batch     | POST   | Top 3 recommendations      |

### POST /bkt/update

```json
{
  "skill": "Arrays",
  "correct": true,
  "currentMastery": 0.3
}
```

**Response:**

```json
{
  "skill": "Arrays",
  "previousMastery": 0.3,
  "updatedMastery": 0.4521,
  "correct": true
}
```

---

## Error Responses

```json
{ "error": "Human-readable message" }
```

| Status | Meaning              |
|--------|----------------------|
| 400    | Validation error     |
| 401    | Unauthorized         |
| 404    | Resource not found   |
| 409    | Conflict (duplicate) |
| 500    | Server error         |
