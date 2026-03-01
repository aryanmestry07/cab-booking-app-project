from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.database import SessionLocal
from app.models import User
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter()


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Schemas ----------------
class RegisterSchema(BaseModel):
    username: str
    password: str
    role: str  # rider or driver


class LoginSchema(BaseModel):
    username: str
    password: str


# ---------------- Register ----------------
@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):

    if data.role not in ["rider", "driver"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be 'rider' or 'driver'"
        )

    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    new_user = User(
        id=str(uuid.uuid4()),
        username=data.username,
        password=hash_password(data.password),
        role=data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# ---------------- Login (JSON Version) ----------------
@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        {"sub": user.username, "role": user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }