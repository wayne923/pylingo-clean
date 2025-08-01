from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import get_db, create_tables
from models import Track, Lesson, UserProgress, User, UserPreferences, UserGamification, Achievement, UserAchievement
from schemas import UserCreate, UserResponse, UserLogin, Token, UserProgressCreate, UserProgressResponse, LessonCreate, LessonResponse, UserPreferencesCreate, UserPreferencesUpdate, UserPreferencesResponse, UserGamificationResponse, AchievementResponse, UserAchievementResponse, StreakUpdateResponse
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash, get_user_by_username, get_user_by_email
from docker_executor import docker_executor
from datetime import timedelta, datetime
import json

app = FastAPI(title="PyLingo API", version="0.1.0")

import os

# Configure CORS for production
allowed_origins = ["http://localhost:3000"]
if os.getenv("ENVIRONMENT") == "production":
    # Allow Railway and Netlify domains
    allowed_origins = [
        "https://gleeful-concha-992e6b.netlify.app",
        "https://pylingo-clean-production.up.railway.app", 
        "http://localhost:3000"
    ]
else:
    # For development, be more permissive
    allowed_origins = [
        "http://localhost:3000",
        "https://gleeful-concha-992e6b.netlify.app"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
create_tables()

@app.get("/")
async def root():
    return {"message": "PyLingo API is running"}

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    if get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/tracks")
async def get_tracks(db: Session = Depends(get_db)):
    tracks = db.query(Track).all()
    return {"tracks": tracks}

@app.get("/api/tracks/{track_id}/lessons")
async def get_track_lessons(track_id: int, db: Session = Depends(get_db)):
    lessons = db.query(Lesson).filter(Lesson.track_id == track_id).order_by(Lesson.order_in_track).all()
    
    # Convert JSON strings back to objects
    formatted_lessons = []
    for lesson in lessons:
        formatted_lesson = {
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "initialCode": lesson.initial_code,
            "expectedOutput": lesson.expected_output,
            "hints": json.loads(lesson.hints) if lesson.hints else [],
            "validation": json.loads(lesson.validation_rules) if lesson.validation_rules else {},
            "concepts": json.loads(lesson.concepts) if lesson.concepts else [],
            "track": "beginner",
            "difficulty": "beginner"
        }
        formatted_lessons.append(formatted_lesson)
    
    return {"lessons": formatted_lessons}

@app.post("/api/tracks/{track_id}/seed")
async def seed_track_data(track_id: int, db: Session = Depends(get_db)):
    """Seed the database with initial lesson data"""
    
    # Check if track exists, create if not
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        track = Track(
            id=track_id,
            name="Beginner Python",
            description="Learn Python from the ground up",
            difficulty="beginner"
        )
        db.add(track)
        db.commit()
    
    # Check if lessons already exist
    existing_lessons = db.query(Lesson).filter(Lesson.track_id == track_id).count()
    if existing_lessons > 0:
        return {"message": "Track already has lessons"}
    
    # Seed lessons
    lessons_data = [
        {
            "title": "Your First Python Variable",
            "description": "Create a variable called 'name' and assign it your name as a string, then print it.",
            "initial_code": "# Write your code here\n",
            "expected_output": "Hello, World!",
            "hints": ["Use quotes around your name to make it a string", "Use the print() function to display the variable", "Variables are created with: variable_name = value"],
            "validation": {"requiredKeywords": ["print"], "mustContain": ["name", "="]},
            "concepts": ["variables", "strings", "print"],
            "order": 1
        },
        {
            "title": "Working with Numbers",
            "description": "Create two variables with numbers and print their sum.",
            "initial_code": "# Create two number variables and add them\n",
            "expected_output": "15",
            "hints": ["Numbers don't need quotes", "Use + to add numbers", "Example: result = a + b"],
            "validation": {"requiredKeywords": ["print"], "mustContain": ["=", "+"], "forbiddenKeywords": ["15"]},
            "concepts": ["variables", "numbers", "arithmetic"],
            "order": 2
        }
    ]
    
    for lesson_data in lessons_data:
        lesson = Lesson(
            title=lesson_data["title"],
            description=lesson_data["description"],
            initial_code=lesson_data["initial_code"],
            expected_output=lesson_data["expected_output"],
            hints=json.dumps(lesson_data["hints"]),
            validation_rules=json.dumps(lesson_data["validation"]),
            concepts=json.dumps(lesson_data["concepts"]),
            order_in_track=lesson_data["order"],
            track_id=track_id
        )
        db.add(lesson)
    
    db.commit()
    return {"message": "Track seeded successfully"}

# User progress endpoints
@app.post("/api/progress", response_model=UserProgressResponse)
async def save_progress(
    progress: UserProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if progress already exists
    existing_progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == progress.lesson_id
    ).first()
    
    if existing_progress:
        # Update existing progress
        existing_progress.completed = progress.completed
        existing_progress.last_code = progress.last_code
        existing_progress.attempts += 1
        if progress.completed and not existing_progress.completed_at:
            existing_progress.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_progress)
        return existing_progress
    else:
        # Create new progress
        db_progress = UserProgress(
            user_id=current_user.id,
            lesson_id=progress.lesson_id,
            completed=progress.completed,
            last_code=progress.last_code,
            attempts=1,
            completed_at=datetime.utcnow() if progress.completed else None
        )
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        return db_progress

@app.get("/api/progress", response_model=List[UserProgressResponse])
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
    return progress

@app.get("/api/progress/stats")
async def get_progress_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_lessons = db.query(Lesson).count()
    completed_lessons = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.completed == True
    ).count()
    
    # Calculate streak (simplified - would need daily tracking)
    streak = 1  # Placeholder
    
    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "current_streak": streak,
        "completion_percentage": (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
    }

# Gamification endpoints
@app.get("/api/user/gamification", response_model=UserGamificationResponse)
async def get_user_gamification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's gamification data (streaks, XP, level)"""
    gamification = db.query(UserGamification).filter(
        UserGamification.user_id == current_user.id
    ).first()
    
    if not gamification:
        # Create initial gamification record for user
        gamification = UserGamification(
            user_id=current_user.id,
            current_streak=0,
            longest_streak=0,
            total_xp=0,
            current_level=1,
            streak_freeze_count=3  # Start with 3 streak freezes
        )
        db.add(gamification)
        db.commit()
        db.refresh(gamification)
    
    return gamification

@app.post("/api/user/update-streak", response_model=StreakUpdateResponse)
async def update_user_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user streak when they complete a lesson"""
    # Get or create gamification record
    gamification = db.query(UserGamification).filter(
        UserGamification.user_id == current_user.id
    ).first()
    
    if not gamification:
        gamification = UserGamification(
            user_id=current_user.id,
            current_streak=0,
            longest_streak=0,
            total_xp=0,
            current_level=1,
            streak_freeze_count=3
        )
        db.add(gamification)
    
    # Calculate streak logic
    today = datetime.utcnow().date()
    last_activity = gamification.last_activity_date.date() if gamification.last_activity_date else None
    
    xp_earned = 10  # Base XP for lesson completion
    level_up = False
    new_level = None
    
    if last_activity is None:
        # First activity
        gamification.current_streak = 1
        gamification.last_activity_date = datetime.utcnow()
    elif last_activity == today:
        # Already completed lesson today, no streak increase but still earn XP
        pass
    elif (today - last_activity).days == 1:
        # Consecutive day - increase streak
        gamification.current_streak += 1
        gamification.last_activity_date = datetime.utcnow()
        xp_earned += 5  # Bonus XP for maintaining streak
        
        # Check for streak milestone bonuses
        if gamification.current_streak % 7 == 0:  # Weekly milestone
            xp_earned += 20
        elif gamification.current_streak % 30 == 0:  # Monthly milestone
            xp_earned += 100
    else:
        # Streak broken - reset
        gamification.current_streak = 1
        gamification.last_activity_date = datetime.utcnow()
    
    # Update longest streak
    if gamification.current_streak > gamification.longest_streak:
        gamification.longest_streak = gamification.current_streak
    
    # Add XP and check for level up
    old_level = gamification.current_level
    gamification.total_xp += xp_earned
    
    # Level calculation (100 XP per level, increasing by 50 each level)
    xp_needed = 0
    level = 1
    while xp_needed <= gamification.total_xp:
        level += 1
        xp_needed += 50 + (level * 50)  # Progressive XP requirements
    
    gamification.current_level = level - 1
    
    if gamification.current_level > old_level:
        level_up = True
        new_level = gamification.current_level
        xp_earned += 25  # Level up bonus
        gamification.total_xp += 25
    
    db.commit()
    
    return StreakUpdateResponse(
        current_streak=gamification.current_streak,
        longest_streak=gamification.longest_streak,
        xp_earned=xp_earned,
        level_up=level_up,
        new_level=new_level
    )

# Lesson creation endpoints (admin only for now)
@app.post("/api/lessons", response_model=LessonResponse)
async def create_lesson(
    lesson: LessonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # For now, any authenticated user can create lessons
    # In production, you'd want admin role checking
    
    db_lesson = Lesson(
        title=lesson.title,
        description=lesson.description,
        initial_code=lesson.initial_code,
        expected_output=lesson.expected_output,
        hints=json.dumps(lesson.hints),
        validation_rules=json.dumps(lesson.validation_rules),
        concepts=json.dumps(lesson.concepts),
        order_in_track=lesson.order_in_track,
        track_id=lesson.track_id
    )
    
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    
    return db_lesson

@app.get("/api/lessons", response_model=List[LessonResponse])
async def get_all_lessons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    lessons = db.query(Lesson).offset(skip).limit(limit).all()
    return lessons

@app.delete("/api/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted successfully"}

# Docker execution endpoints
@app.post("/api/execute/docker")
async def execute_docker_code(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """Execute Python code in a Docker container for advanced lessons"""
    
    code = request.get("code", "")
    requirements = request.get("requirements", [])
    timeout = min(request.get("timeout", 30), 60)  # Max 60 seconds
    
    if not code.strip():
        return {"success": False, "output": "", "error": "No code provided"}
    
    # Check if Docker is available
    if not docker_executor.is_available():
        return {
            "success": False,
            "output": "",
            "error": "Docker execution is not available on this server. Please use browser execution for this lesson."
        }
    
    result = docker_executor.execute_python_code(code, timeout, requirements)
    return result

@app.post("/api/execute/webapp")
async def execute_web_app(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """Test web application code in Docker"""
    
    code = request.get("code", "")
    app_type = request.get("app_type", "flask")
    
    if not code.strip():
        return {"success": False, "output": "", "error": "No code provided"}
    
    if not docker_executor.is_available():
        return {
            "success": False,
            "output": "",
            "error": "Docker execution is not available. Web app lessons require Docker."
        }
    
    result = docker_executor.execute_web_app(code, app_type)
    return result

@app.get("/api/docker/status")
async def docker_status():
    """Check if Docker is available for advanced lessons"""
    return {
        "available": docker_executor.is_available(),
        "message": "Docker available for advanced Python lessons" if docker_executor.is_available() 
                  else "Docker not available - advanced lessons will be limited"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# User Preferences endpoints
@app.post("/api/preferences", response_model=UserPreferencesResponse)
async def save_user_preferences(
    preferences: UserPreferencesCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or update user preferences"""
    # Check if preferences already exist
    existing_prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    
    if existing_prefs:
        # Update existing preferences
        for field, value in preferences.dict(exclude_unset=True).items():
            setattr(existing_prefs, field, value)
        existing_prefs.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_prefs)
        return existing_prefs
    else:
        # Create new preferences
        db_preferences = UserPreferences(
            user_id=current_user.id,
            **preferences.dict()
        )
        db.add(db_preferences)
        db.commit()
        db.refresh(db_preferences)
        return db_preferences

@app.get("/api/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user preferences"""
    preferences = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    
    if not preferences:
        # Return default preferences if none exist
        raise HTTPException(status_code=404, detail="User preferences not found")
    
    return preferences

@app.put("/api/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    db_preferences = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    
    if not db_preferences:
        raise HTTPException(status_code=404, detail="User preferences not found")
    
    # Update only provided fields
    for field, value in preferences.dict(exclude_unset=True).items():
        if value is not None:
            setattr(db_preferences, field, value)
    
    db_preferences.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_preferences)
    return db_preferences

@app.get("/api/admin/database-info")
async def get_database_info(db: Session = Depends(get_db)):
    """Simple admin endpoint to view database contents"""
    try:
        # Count users
        user_count = db.query(User).count()
        users = db.query(User).limit(10).all()
        
        # Count lessons and tracks
        lesson_count = db.query(Lesson).count()
        track_count = db.query(Track).count()
        
        # Count progress entries
        progress_count = db.query(UserProgress).count()
        
        # Count preferences
        preferences_count = db.query(UserPreferences).count()
        
        return {
            "database_type": "SQLite" if "sqlite" in str(db.bind.url) else "PostgreSQL",
            "stats": {
                "users": user_count,
                "lessons": lesson_count,
                "tracks": track_count,
                "user_progress": progress_count,
                "user_preferences": preferences_count
            },
            "recent_users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "created_at": user.created_at,
                    "is_active": user.is_active
                } for user in users
            ]
        }
    except Exception as e:
        return {"error": str(e), "database_type": "Unknown"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)