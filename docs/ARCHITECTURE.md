# LearnSmart Architecture

## System Overview

LearnSmart is a three-tier adaptive learning system:

1. **Presentation Layer** – Next.js 15 SPA with server/client components
2. **Application Layer** – Express REST API handling auth, quiz orchestration, persistence
3. **Intelligence Layer** – FastAPI microservice implementing BKT and IRT

```
                    ┌──────────────────────────────────────┐
                    │           User Browser               │
                    └─────────────────┬────────────────────┘
                                      │ HTTPS
                    ┌─────────────────▼────────────────────┐
                    │         Next.js Frontend             │
                    │  Landing · Auth · Quiz · Dashboard   │
                    └─────────────────┬────────────────────┘
                                      │ REST / JSON
                    ┌─────────────────▼────────────────────┐
                    │         Express Backend              │
                    │  Auth · Quiz · Dashboard Routes      │
                    └─────────┬───────────────┬────────────┘
                              │               │
              ┌───────────────▼───┐   ┌───────▼────────────┐
              │     MongoDB       │   │  FastAPI ML Svc    │
              │  Users · Mastery  │   │  BKT · IRT · Recs  │
              │  Questions · etc. │   └────────────────────┘
              └───────────────────┘
```

## Data Flow

### Diagnostic Assessment

```
User answers → Express stores Attempt → Express calls ML /bkt/update
→ Updated mastery saved to Mastery collection → Dashboard reads mastery
```

### Adaptive Quiz

```
Express reads Mastery (sorted weakest first)
→ For each skill: ML /irt/select-difficulty
→ Query Questions by skill + difficulty
→ Return 10 questions to frontend
```

### Post-Quiz Recommendations

```
Submit answers → BKT updates per response
→ ML /analytics + /recommendations/batch
→ Store Recommendations in MongoDB
→ Results page displays explainable output
```

## Machine Learning Modules

### Bayesian Knowledge Tracing (BKT)

Located in `ml-service/app/bkt.py`.

After each response, mastery P(L) is updated:

- **Correct answer**: posterior using slip/guess model, then learning transition P(T)
- **Incorrect answer**: posterior for not knowing, then learning transition

Default parameters align with PRD: P(L0)=0.3, P(T)=0.09, P(G)=0.2, P(S)=0.1

### Simplified 1PL IRT

Located in `ml-service/app/irt.py`.

- Difficulty parameters: easy=-1, medium=0, hard=1
- P(correct) = sigmoid(θ - b) where θ is mapped from mastery [0,1] → [-1,1]
- Adaptive rule: mastery <40% → easy, 40–70% → medium, >70% → hard

### Recommendation Engine

Located in `ml-service/app/recommendations.py`.

Generates structured recommendations with:

- Skill name
- Mastery score & percentage
- Threshold-based explanation
- Skill-specific common error hint
- Suggested practice action

## Database Schema

| Collection       | Key Fields                                      |
|-----------------|-------------------------------------------------|
| users           | name, email, passwordHash, diagnosticCompleted  |
| skills          | name, description                               |
| questions       | skill, difficulty, text, options, answer        |
| attempts        | userId, questionId, skill, correctness, quizType|
| mastery         | userId, skill, masteryScore, updatedAt          |
| recommendations | userId, skill, explanation, suggestedAction     |

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens (7-day expiry) for authenticated routes
- CORS restricted via `FRONTEND_URL` in production

## Performance Targets

| Metric           | Target   |
|-----------------|----------|
| Dashboard load  | < 2s     |
| Quiz API        | < 500ms  |
| ML service call | < 100ms  |

## Deployment Topology

```
Vercel (Frontend) ──► Render (Express) ──► MongoDB Atlas
                              │
                              └──► Render (FastAPI ML)
```

## Out of Scope (MVP)

- Deep Knowledge Tracing (DKT)
- Chatbot / gamification
- Multi-user classrooms
- LMS integration
