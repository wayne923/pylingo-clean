import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pylingo.db")

# Handle SQLite vs PostgreSQL
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create tables if they don't exist - safe for existing databases"""
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created/verified successfully")
    except Exception as e:
        print(f"Database table creation warning: {e}")
        # Don't fail the app if tables already exist

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()