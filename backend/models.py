from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    progress = relationship("UserProgress", back_populates="user")
    preferences = relationship("UserPreferences", back_populates="user", uselist=False)
    gamification = relationship("UserGamification", back_populates="user", uselist=False)

class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    difficulty = Column(String(20), nullable=False)  # beginner, intermediate, advanced
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lessons = relationship("Lesson", back_populates="track")

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    initial_code = Column(Text)
    expected_output = Column(Text, nullable=False)
    hints = Column(Text)  # JSON string
    validation_rules = Column(Text)  # JSON string
    concepts = Column(Text)  # JSON string
    order_in_track = Column(Integer, nullable=False)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    track = relationship("Track", back_populates="lessons")
    user_progress = relationship("UserProgress", back_populates="lesson")

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    attempts = Column(Integer, default=0)
    last_code = Column(Text)  # Save user's last attempt
    
    # Relationships
    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="user_progress")

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    skill_level = Column(String(20))  # beginner, intermediate, advanced
    experience = Column(String(50))  # never-coded, some-basics, etc.
    goals = Column(JSON)  # Array of goal IDs
    time_commitment = Column(String(20))  # 15min, 30min, 1hour
    preferred_style = Column(String(50))  # hands-on, theory-first, etc.
    current_track = Column(String(50))  # Current learning track
    current_lesson_id = Column(Integer)  # Current lesson ID
    completed_assessment = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="preferences")

class UserGamification(Base):
    __tablename__ = "user_gamification"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    last_activity_date = Column(DateTime)  # Last day user completed a lesson
    streak_freeze_count = Column(Integer, default=0)  # Available streak freezes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="gamification")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(10), nullable=False)  # Emoji icon
    category = Column(String(50), nullable=False)  # streak, lessons, skills
    requirement_type = Column(String(50), nullable=False)  # count, streak, etc.
    requirement_value = Column(Integer, nullable=False)
    xp_reward = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    achievement = relationship("Achievement")