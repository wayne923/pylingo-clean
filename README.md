# PyLingo - Python Learning Platform

Duolingo-style platform for learning Python from basics to AI mastery.

## Quick Start

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
API runs on http://localhost:8000

### Frontend (React)
```bash
cd frontend  
npm start
```
App runs on http://localhost:3000

## Architecture

- **Frontend**: React + TypeScript
- **Backend**: FastAPI + SQLite
- **Code Execution**: Pyodide (browser) for basics, Docker for advanced tracks

## Testing Strategy

Start with Pyodide for beginner lessons, add Docker when teaching web frameworks/AI.