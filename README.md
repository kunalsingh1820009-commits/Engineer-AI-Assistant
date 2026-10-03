# 🚀 ENGINEER AI ASSISTANT

> **"Learn. Code. Debug. Prepare. Become an Engineer."**

Engineer AI Assistant is a complete, production-grade, AI-powered engineering and career acceleration platform for engineering students and beginner developers.

---

## 🌟 What We Built

Engineer AI Assistant bridges the gap between learning theory and becoming a high-performing software engineer through an interconnected pipeline:

**Learn → Practice → Code → Debug → Improve → Interview → Get Placement Ready**

### Key Modules & Capabilities

1. 🔐 **Authentication & Security:**
   - Registration, login, JWT session persistence, bcrypt password hashing, and user-isolated data.
2. 🏠 **Main Dashboard:**
   - Real-time **Coding Score (78%)**, **DSA Progress**, **Interview Readiness**, **Learning Streak (🔥 7 Days)**, and XP progression.
   - **AI Placement Diagnostic Advisor** that identifies the student's weakest subject (e.g. Operating Systems deadlocks) with tailored weekly study tips.
3. 🤖 **Multi-Mode AI Assistant:**
   - **Beginner 🧑🏫:** Simple analogies & gentle conceptual walkthroughs.
   - **Coder 💻:** Deep memory models, call stack visualizations, and idiomatic code.
   - **Interview 🎯:** STAR method framing, Big-O trade-offs, and follow-ups.
   - **Exam 📝:** High-scoring structured point-by-point exam responses.
4. 💻 **Code Lab Workspace:**
   - Multi-language code editor (C++, Python, Java, JavaScript) with real-time emulation, **Debug**, **Explain**, **Improve**, **Complexity Analysis**, and **Test Case Generation**.
5. 🐞 **AI Debugger & Error Explainer:**
   - Pinpoints off-by-one errors, infinite loops, memory leaks, and segmentation faults with exact line location, cause, fix, and corrected code diffs.
6. ⚡ **Big-O Complexity Analyzer:**
   - Computes Time and Space complexity with asymptotic reasoning and automated optimization paths (e.g. $O(n^2) \to O(n)$ via Hash Maps).
7. 🧠 **DSA Practice & Algorithmic Pattern Detector:**
   - Curated problem sets across 12 categories with difficulty filters.
   - Non-spoiler progressive hints, step-by-step approach guides, and multi-language solutions.
   - Pattern detector that classifies problems into Sliding Window, Two Pointers, Dynamic Programming, Binary Search, and Monotonic Stack with boilerplate templates.
8. 🔤 **Keyword Explorer:**
   - Interactive encyclopedia of core programming terminology (`vector`, `pointer`, `recursion`, `lambda`, `polymorphism`, `map`) with syntax, memory layout, traps, and interview questions.
9. 📚 **Learning Roadmaps & Verified Free Resources:**
   - Step-by-step topic milestones with interactive progress meters (Not Started, In Progress, Completed).
   - Filtered database of verified free courses, YouTube playlists, and documentation.
10. 📅 **AI Study Planner:**
    - Custom timeline scheduler (e.g. "Placements in 3 Months") generating monthly themes, weekly goals, and daily checkable tasks.
11. 📄 **Resume Builder & ATS Scanner:**
    - Interactive builder with live PDF/print preview and an AI **Enhance to ATS Description** engine.
    - ATS score scanner (0-100) detailing strengths, weaknesses, and missing keywords.
12. 🎯 **Interview Prep & Interactive AI Mock Interview:**
    - Curated core CS question banks (OS, DBMS, CN, OOP, C++, HR) with answers and follow-ups.
    - Multi-stage AI Mock Interview (Introduction $\to$ Technical $\to$ DSA $\to$ Project $\to$ HR) concluding in a comprehensive evaluation report.
13. 🔎 **Job Description Matcher:**
    - Compares job descriptions against candidate skills to calculate match % and generate gap-bridging study steps.
14. 🏆 **Gamification & Activity History:**
    - XP levels, daily quests with claimable rewards, 8 achievement badges, and audit history.

---

## 🛠️ Architecture & Tech Stack

```text
engineer-ai/
│
├── frontend/                     # React + TypeScript + Vite Single-Page Application
│   ├── src/
│   │   ├── components/           # Sidebar, Header, Layout, Navigation
│   │   ├── context/              # AuthContext (JWT persistence), ToastContext
│   │   ├── pages/                # 22 interactive module views
│   │   ├── services/             # Unified typed API client
│   │   ├── styles/               # CSS Design System (#2563EB primary, #F8FAFC bg)
│   │   ├── types/                # TypeScript interface definitions
│   │   └── App.tsx               # Route and tab controller
│   └── package.json
│
├── backend/                      # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── controllers/          # Auth, Chat, Code, DSA, Resume, Interview, etc.
│   │   ├── database/             # SQLite (WebAssembly sql.js + disk sync), Schema, Seeds
│   │   ├── middleware/           # JWT Auth guard, error handlers
│   │   ├── routes/               # REST API endpoints (/api/*)
│   │   ├── services/             # AI Service (Gemini / OpenAI / Built-in Heuristic Engine)
│   │   └── server.ts             # Express server entry point
│   └── package.json
│
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory (or copy from `.env.example`):

```env
PORT=5000
JWT_SECRET=engineer_ai_super_secret_jwt_key_2026_production_grade

# Optional: Add external AI API key to enable live Google Gemini or OpenAI LLMs.
# If omitted, the application seamlessly uses the built-in High-Quality Engineering Heuristic Engine.
GEMINI_API_KEY=
OPENAI_API_KEY=
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 2. Installation

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Running Locally

#### Terminal 1 — Start Backend API Server (Port 5000):
```bash
cd backend
npm run dev
```

#### Terminal 2 — Start Frontend Dev Server (Port 5173):
```bash
cd frontend
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:5173`**

*(Click the **"Fast Demo Student Login"** button on the login screen for instant 1-click access)*.

---

## 📡 REST API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create student account | No |
| `POST` | `/api/auth/login` | Authenticate & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated student profile | Yes |
| `POST` | `/api/chat` | AI Chat in 4 learning modes | Yes |
| `POST` | `/api/code/debug` | Deep bug inspection & correction | Yes |
| `POST` | `/api/code/complexity` | Big-O time & space complexity analysis | Yes |
| `POST` | `/api/code/improve` | Refactor code for readability & performance | Yes |
| `POST` | `/api/code/testcases` | Generate edge & boundary test cases | Yes |
| `GET` | `/api/dsa/problems` | List curated DSA problems by category | No |
| `POST` | `/api/dsa/pattern-detect` | Classify problem into algorithmic pattern | Yes |
| `GET` | `/api/keywords` | Searchable programming glossary | No |
| `GET` | `/api/roadmaps` | Learning roadmaps & curriculum | No |
| `POST` | `/api/study-plan/generate`| Generate custom placement study plan | Yes |
| `POST` | `/api/resume/enhance` | AI transform bullet points to ATS impact | Yes |
| `POST` | `/api/resume/analyze` | ATS score scan & missing keywords | Yes |
| `GET` | `/api/interview/questions`| CS core interview question bank | No |
| `POST` | `/api/interview/start` | Launch interactive AI Mock Interview | Yes |
| `POST` | `/api/interview/answer` | Submit mock interview answer & get evaluation| Yes |
| `POST` | `/api/jobs/match` | Job Description skill gap matcher | Yes |
| `POST` | `/api/projects/mentor` | Generate complete project blueprint | No |
| `POST` | `/api/projects/readme` | Generate GitHub README.md markdown | No |
| `GET` | `/api/progress/dashboard`| Fetch coding score, streak & placement gauge| Yes |
| `GET` | `/api/history` | Unified user activity history | Yes |

---

## 📄 License

Distributed under the MIT License. Built with ❤️ by Antigravity for Engineering Students.
