# 🎓 LearnSmart – AI-Powered Personalized Learning Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-blue?logo=nextdotjs&style=flat-square)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Backend-Express-lightgrey?logo=express&style=flat-square)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/ML%20Service-FastAPI-green?logo=fastapi&style=flat-square)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-emerald?logo=mongodb&style=flat-square)](https://www.mongodb.com/)

LearnSmart is an intelligent, three-tier adaptive learning platform designed for mastering **Data Structures & Algorithms (DSA)**. The platform combines cognitive student modeling with psychometrics to deliver a customized learning experience, diagnosing weakest skills and serving questions dynamically matched to student capabilities.

---

## 🚀 Key Features

* **15-Question Diagnostic Assessment**: Calibrates the platform's understanding of the student's initial skill level across 9 core DSA domains.
* **Bayesian Knowledge Tracing (BKT)**: Tracks and updates mastery probability dynamically based on sequential correct/incorrect answers.
* **Item Response Theory (IRT)**: Leverages a 1-Parameter Logistic (1PL) model to adaptively adjust question difficulty to the student's current proficiency level.
* **Explainable Recommendations**: Provides concrete, threshold-based learning justifications, identifies common errors, and highlights immediate next actions.
* **Interactive Analytics Dashboard**: Displays progress over time, average mastery breakdown, weakest areas, and personalized learning paths using Recharts.

---

## 📐 System Architecture

LearnSmart is composed of three decoupled service layers communicating over REST APIs:

```
                      ┌──────────────────────────────────────┐
                      │             User Browser             │
                      └──────────────────┬───────────────────┘
                                         │ HTTPS / JSON
                      ┌──────────────────▼───────────────────┐
                      │          Next.js 15 Frontend         │
                      │  Landing · Auth · Quiz · Dashboard   │
                      └──────────────────┬───────────────────┘
                                         │ REST API / JWT
                      ┌──────────────────▼───────────────────┐
                      │          Express.js Backend          │
                      │  Auth · Quiz Orchestrator · Metrics  │
                      └──────────┬───────────────────┬───────┘
                                 │                   │
                  ┌──────────────▼───┐   ┌───────────▼───────┐
                  │  MongoDB Database│   │ FastAPI ML Engine │
                  │  Users · Mastery │   │ BKT · IRT Modules │
                  │  Questions · etc.│   │  Recommendations  │
                  └──────────────────┘   └───────────────────┘
```

---

## 🧠 Algorithmic Core

### 1. Bayesian Knowledge Tracing (BKT)
BKT tracks a student's knowledge state as a set of binary latent variables (knowing or not knowing a skill). After each question response, the student's mastery probability $P(L)$ is updated using the following parameters:

| Parameter | Standard Value | Description |
|---|---|---|
| $P(L_0)$ | `0.30` | **Prior**: Probability that the student already knows the skill beforehand. |
| $P(T)$ | `0.09` | **Transition**: Probability that the student learns the skill after a practice attempt. |
| $P(G)$ | `0.20` | **Guess**: Probability that a student answers correctly without knowing the skill. |
| $P(S)$ | `0.10` | **Slip**: Probability that a student makes a mistake despite knowing the skill. |

#### Mathematical Updates:
* **If the response is correct ($Correct = True$):**
  $$P(L_t | \text{Correct}) = \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$

* **If the response is incorrect ($Correct = False$):**
  $$P(L_t | \text{Incorrect}) = \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}$$

* **Knowledge Transition Step:**
  $$P(L_t) = P(L_t | \text{Observation}) + (1 - P(L_t | \text{Observation})) \cdot P(T)$$

---

### 2. Item Response Theory (1PL IRT)
To dynamically adapt question difficulty, the platform maps the BKT mastery probability to a psychometric ability scale $\theta \in [-1.0, 1.0]$:
$$\theta = P(L) \cdot 2 - 1$$

The probability of answering a question of difficulty $b$ correctly is calculated using the logistic sigmoid function:
$$P(\text{correct} | \theta, b) = \frac{1}{1 + e^{-(\theta - b)}}$$

#### Difficulty Selection Thresholds:
* **Proficiency $\le 40\%$**: Recommends **Easy** questions ($b = -1.0$)
* **Proficiency $40\% - 70\%$**: Recommends **Medium** questions ($b = 0.0$)
* **Proficiency $\ge 70\%$**: Recommends **Hard** questions ($b = 1.0$)

---

## 📂 Repository Structure

```
├── backend/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── index.js             # API Entry Point & Express Config
│   │   ├── seed.js              # Database Seeder (Seeds DSA Questions & Skills)
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT Verification Middleware
│   │   ├── models/              # Mongoose/MongoDB Schemas
│   │   └── routes/              # Express API Routes (Auth, Quiz, Dashboard)
│   └── package.json
│
├── ml-service/                  # Python FastAPI Machine Learning Service
│   ├── app/
│   │   ├── main.py              # FastAPI Server Endpoints
│   │   ├── bkt.py               # Bayesian Knowledge Tracing Calculations
│   │   ├── irt.py               # Item Response Theory Logic
│   │   └── recommendations.py   # Explainable Text Recommendation Rules
│   ├── Dockerfile               # ML Service Container config
│   └── requirements.txt         # Python Dependencies
│
├── frontend/                    # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/                 # Next.js Page Router (App Directory)
│   │   │   ├── dashboard/       # Dashboard & Analytics Page
│   │   │   ├── quiz/            # Assessment Flow pages (Diagnostic & Adaptive)
│   │   │   └── globals.css      # Tailwinds & Global Style Sheets
│   │   ├── components/          # Reusable UI Blocks (Navbar, QuizUI, SkillCard)
│   │   └── lib/
│   │       └── api.ts           # Axios/Fetch API client wrapper & Typings
│   └── package.json
│
└── docker-compose.yml           # Local MongoDB container configuration
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TailwindCSS, Recharts, TypeScript |
| **Backend** | Node.js, Express, Mongoose, JSON Web Tokens (JWT), BcryptJS |
| **Machine Learning** | Python 3.11, FastAPI, Pydantic, Uvicorn |
| **Database** | MongoDB (Local or MongoDB Atlas) |

---

## ⚙️ Environment Variables Config

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/learnsmart?retryWrites=true&w=majority
JWT_SECRET=your_jwt_signing_secret_here
ML_SERVICE_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🏁 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (v3.11+)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)

### Step 1: Clone the Repository & Install Workspace Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/LearnSmart.git
cd LearnSmart

# Install backend and frontend dependencies
npm run install:all
```

### Step 2: Set Up and Run the Database
If running a local database via Docker:
```bash
docker-compose up -d
```
Once connected, seed the initial database of questions and skills:
```bash
npm run seed
```

### Step 3: Run the ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Interactive Swagger docs will be available at: http://localhost:8000/docs*

### Step 4: Start the Backend Server
```bash
cd ../backend
npm run dev
```
*Server runs on: http://localhost:5000*

### Step 5: Start the Frontend Next.js Client
```bash
cd ../frontend
npm run dev
```
*Web Client opens on: http://localhost:3000*

---

## 🔄 Core Demo Flow

1. **Register/Login**: Start at `http://localhost:3000/register`. Creating an account initializes 9 skills in your profile with a baseline mastery score of `0.30`.
2. **Diagnostic Assessment**: Take the 15-question diagnostic quiz. This updates your BKT scores per skill and sets `diagnosticCompleted` to true.
3. **Analytics Dashboard**: Review your dashboard. Look at the Recharts visualization of your masteries, identify your weakest domains, and check your generated learning path.
4. **Adaptive Practice**: Click **"Practice Weak Areas"** to trigger a 10-question adaptive quiz. The ML engine decides the difficulty (Easy/Medium/Hard) of each question based on your BKT performance.
5. **Receive AI Feedback**: Review your updated scores and read explainable recommendations pointing out common pitfalls (e.g. boundary checks in Binary Search) and proposed actions.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
