# LearnSmart – AI-Powered Personalized Learning Platform

MVP hackathon prototype demonstrating **Bayesian Knowledge Tracing (BKT)**, **simplified 1PL Item Response Theory (IRT)**, adaptive assessment, and explainable recommendations for Data Structures & Algorithms.

## Architecture

```
┌─────────────┐     REST API      ┌─────────────┐     HTTP       ┌─────────────┐
│  Next.js 15 │ ◄──────────────► │   Express   │ ◄───────────► │   FastAPI   │
│  Frontend   │                   │   Backend   │               │  ML Service │
└─────────────┘                   └──────┬──────┘               └─────────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │   MongoDB   │
                                  └─────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/API.md](docs/API.md) for details.

## Features

- User registration & login (JWT)
- 15-question diagnostic assessment
- Per-skill BKT mastery estimation (9 DSA skills)
- Student analytics dashboard with Recharts
- Adaptive 10-question quiz (IRT difficulty selection)
- Explainable recommendations after quiz completion

## Tech Stack

| Layer      | Technology                          |
|-----------|--------------------------------------|
| Frontend  | Next.js 15, React, TailwindCSS, Recharts |
| Backend   | Node.js, Express, Mongoose           |
| ML        | Python, FastAPI (BKT + IRT)          |
| Database  | MongoDB                              |

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or MongoDB Atlas)

### 1. MongoDB

Start MongoDB locally, or set `MONGODB_URI` in `backend/.env` to your Atlas connection string.

### 2. ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 4. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000**

## Demo Flow (3–5 min)

1. **Register** → redirected to diagnostic
2. **Complete 15 MCQs** → BKT initializes mastery per skill
3. **Dashboard** → mastery cards, weakest skills, learning path, charts
4. **Practice Weak Areas** → 10 adaptive IRT-selected questions
5. **Results** → updated mastery + explainable recommendations

## Project Structure

```
├── frontend/          # Next.js 15 UI
├── backend/           # Express REST API
├── ml-service/        # FastAPI BKT + IRT engine
├── docs/              # Architecture & API docs
└── README.md
```

## Environment Variables

**Backend** (`backend/.env`):

| Variable        | Default                          |
|----------------|----------------------------------|
| PORT           | 5000                             |
| MONGODB_URI    | mongodb://127.0.0.1:27017/learnsmart |
| JWT_SECRET     | (change in production)           |
| ML_SERVICE_URL | http://127.0.0.1:8000            |
| FRONTEND_URL   | http://localhost:3000            |

**Frontend** (`frontend/.env.local`):

| Variable              | Default               |
|----------------------|-----------------------|
| NEXT_PUBLIC_API_URL  | http://localhost:5000 |

## Deployment

| Service    | Platform | Notes                                      |
|-----------|----------|--------------------------------------------|
| Frontend  | Vercel   | Set `NEXT_PUBLIC_API_URL` to backend URL   |
| Backend   | Render   | Set MongoDB Atlas URI + ML service URL     |
| ML Service| Render   | Deploy `ml-service/` with Dockerfile       |
| Database  | Atlas    | Free tier sufficient for demo              |

## BKT Parameters

| Parameter | Value | Meaning                    |
|-----------|-------|----------------------------|
| P(L0)     | 0.30  | Prior knowledge probability |
| P(T)      | 0.09  | Learning rate              |
| P(G)      | 0.20  | Guess probability          |
| P(S)      | 0.10  | Slip probability           |

## License

MIT – Hackathon prototype
