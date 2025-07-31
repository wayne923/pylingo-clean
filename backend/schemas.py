from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Progress schemas
class UserProgressCreate(BaseModel):
    lesson_id: int
    completed: bool = False
    last_code: Optional[str] = None

class UserProgressResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    completed: bool
    completed_at: Optional[datetime]
    attempts: int
    last_code: Optional[str]
    
    class Config:
        from_attributes = True

# Lesson schemas
class LessonCreate(BaseModel):
    title: str
    description: str
    initial_code: Optional[str] = ""
    expected_output: str
    hints: List[str] = []
    validation_rules: dict = {}
    concepts: List[str] = []
    order_in_track: int
    track_id: int

class LessonResponse(BaseModel):
    id: int
    title: str
    description: str
    initial_code: Optional[str]
    expected_output: str
    hints: List[str]
    validation_rules: dict
    concepts: List[str]
    order_in_track: int
    track_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Track schemas
class TrackCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    difficulty: str

class TrackResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    difficulty: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# User Preferences schemas
class UserPreferencesCreate(BaseModel):
    skill_level: Optional[str] = None
    experience: Optional[str] = None
    goals: Optional[List[str]] = []
    time_commitment: Optional[str] = None
    preferred_style: Optional[str] = None
    current_track: Optional[str] = None
    current_lesson_id: Optional[int] = None
    completed_assessment: bool = False

class UserPreferencesUpdate(BaseModel):
    skill_level: Optional[str] = None
    experience: Optional[str] = None
    goals: Optional[List[str]] = None
    time_commitment: Optional[str] = None
    preferred_style: Optional[str] = None
    current_track: Optional[str] = None
    current_lesson_id: Optional[int] = None
    completed_assessment: Optional[bool] = None

class UserPreferencesResponse(BaseModel):
    id: int
    user_id: int
    skill_level: Optional[str]
    experience: Optional[str]
    goals: Optional[List[str]]
    time_commitment: Optional[str]
    preferred_style: Optional[str]
    current_track: Optional[str]
    current_lesson_id: Optional[int]
    completed_assessment: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True