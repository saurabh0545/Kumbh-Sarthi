import os

content = '''from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from backend.crowd_state import crowd_data
from backend.database import Base, engine, SessionLocal
from backend import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kumbh Sarthi API",
    version="1.0"
)

password_hash = PasswordHash.recommended()


class CrowdUpdate(BaseModel):
    zone: str
    people: int
    density: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str


@app.get("/")
def home():
    return {
        "message": "Kumbh Sarthi API is running"
    }


@app.get("/api/database-test")
def database_test():
    return {
        "database": "MySQL",
        "status": "connected"
    }


@app.post("/api/auth/register", response_model=UserResponse)
def register_user(data: RegisterRequest):
    db: Session = SessionLocal()

    try:
        existing_user = (
            db.query(models.User)
            .filter(models.User.email == data.email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email is already registered"
            )

        hashed_password = password_hash.hash(data.password)

        new_user = models.User(
            name=data.name,
            email=data.email,
            password_hash=hashed_password,
            role="PILGRIM"
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    finally:
        db.close()


@app.post("/api/auth/login", response_model=UserResponse)
def login_user(data: LoginRequest):
    db: Session = SessionLocal()

    try:
        user = (
            db.query(models.User)
            .filter(models.User.email == data.email)
            .first()
        )

        if not user or not password_hash.verify(data.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        return user

    finally:
        db.close()


@app.get("/api/crowd/{zone}")
def get_crowd(zone: str):
    if zone not in crowd_data:
        return {
            "error": "Zone not found"
        }

    return {
        "zone": zone,
        "people": crowd_data[zone]["people"],
        "density": crowd_data[zone]["density"]
    }


@app.post("/api/crowd/update")
def update_crowd(data: CrowdUpdate):
    if data.zone not in crowd_data:
        crowd_data[data.zone] = {
            "people": 0,
            "density": "LOW"
        }

    crowd_data[data.zone]["people"] = data.people
    crowd_data[data.zone]["density"] = data.density

    print(
        f"Crowd update -> "
        f"{data.zone}: {data.people} people, {data.density}"
    )

    return {
        "message": "Crowd data updated",
        "zone": data.zone,
        "people": data.people,
        "density": data.density
    }
'''

target_file = r"C:\Users\VICTUS\OneDrive\Desktop\ANC\backend\main.py"
with open(target_file, "w", encoding="utf-8") as f:
    f.write(content.strip() + "\n")
print(f"Updated {target_file} successfully.")
