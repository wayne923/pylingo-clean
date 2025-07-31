from pydantic import BaseModel, EmailStr
from typing import List, Optional
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