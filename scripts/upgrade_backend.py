import os
import sys

MODELS_CONTENT = '''from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, default="PILGRIM")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FamilyGroup(Base):
    __tablename__ = "family_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    nickname = Column(String(100), nullable=True)
    role = Column(String(20), default="MEMBER")  # OWNER or MEMBER
    is_location_shared = Column(Boolean, default=False)
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    last_location_name = Column(String(150), nullable=True)
    status = Column(String(20), default="SAFE")  # SAFE, LAST_SEEN, SOS
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class FamilySos(Base):
    __tablename__ = "family_sos"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(150), nullable=True)
    status = Column(String(20), default="ACTIVE")  # ACTIVE or RESOLVED
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(30), nullable=False)  # CROWD, SAFETY, EMERGENCY, FAMILY, INFO
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO")  # INFO, WARNING, CRITICAL
    location = Column(String(150), nullable=True)
    zone = Column(String(50), nullable=True)
    is_system = Column(Boolean, default=True)
    family_id = Column(Integer, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserAlertRead(Base):
    __tablename__ = "user_alert_reads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    alert_id = Column(Integer, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), server_default=func.now())
'''

MAIN_CONTENT = '''import random
import time
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Header, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pwdlib import PasswordHash

from backend.crowd_state import crowd_data
from backend.database import Base, engine, SessionLocal
from backend import models

# Ensure all database tables exist in MySQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kumbh Sarthi API",
    version="2.0",
    description="Pilgrim safety, YOLO crowd intelligence, family connect & real-time alerts"
)

password_hash = PasswordHash.recommended()

# Cooldown memory for crowd alerts deduplication
last_crowd_alert_times = {}

# ─── Auth Schemas ─────────────────────────────────────────────────────────────

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

# ─── Crowd Schemas ────────────────────────────────────────────────────────────

class CrowdUpdate(BaseModel):
    zone: str
    people: int
    density: str

# ─── Family Schemas ───────────────────────────────────────────────────────────

class FamilyCreateRequest(BaseModel):
    name: str
    user_id: int

class FamilyJoinRequest(BaseModel):
    code: str
    user_id: int

class FamilySosRequest(BaseModel):
    user_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = "Ramkund Sector"

class LocationSharingToggle(BaseModel):
    user_id: int
    enabled: bool

class LocationUpdateRequest(BaseModel):
    user_id: int
    latitude: float
    longitude: float
    location_name: Optional[str] = None

# ─── Alert Schemas ────────────────────────────────────────────────────────────

class AlertItemResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    severity: str
    location: Optional[str] = None
    zone: Optional[str] = None
    is_system: bool
    is_read: bool = False
    created_at: str

# ─── Seed Baseline System Alerts ──────────────────────────────────────────────

def seed_baseline_alerts():
    db: Session = SessionLocal()
    try:
        count = db.query(models.Alert).filter(models.Alert.is_system == True).count()
        if count == 0:
            initial_alerts = [
                models.Alert(
                    type="CROWD",
                    title="Gate 4 Crowd Advisory",
                    message="Gate 4 south approach experiencing regulated entry. Clearance pace steady.",
                    severity="WARNING",
                    location="Gate 4 South Approach",
                    zone="Gate-B",
                    is_system=True
                ),
                models.Alert(
                    type="SAFETY",
                    title="Gate 1 Conditions Normal",
                    message="Gate 1 Ramkund walkway operating smoothly under active camera supervision.",
                    severity="INFO",
                    location="Gate 1 Live Area",
                    zone="Gate-A",
                    is_system=True
                ),
                models.Alert(
                    type="INFO",
                    title="Drinking Water & Rest Kiosks Active",
                    message="Free drinking water, ORS stations and senior citizen shelters open every 200m.",
                    severity="INFO",
                    location="All Kumbh Sectors",
                    is_system=True
                ),
            ]
            db.add_all(initial_alerts)
            db.commit()
    except Exception as e:
        print("Note: Baseline alert seeding notice:", e)
    finally:
        db.close()

seed_baseline_alerts()

# ─── System / Health Routes ───────────────────────────────────────────────────

@app.get("/")
def home():
    return {
        "message": "Kumbh Sarthi API v2.0 is running",
        "service": "Pilgrim Safety & Crowd Intelligence"
    }

@app.get("/api/database-test")
def database_test():
    return {
        "database": "MySQL",
        "status": "connected"
    }

# ─── Authentication Routes (Preserved & Enhanced) ─────────────────────────────

@app.post("/api/auth/register", response_model=UserResponse)
def register_user(data: RegisterRequest):
    db: Session = SessionLocal()
    try:
        existing_user = db.query(models.User).filter(models.User.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=409, detail="Email is already registered")

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
        user = db.query(models.User).filter(models.User.email == data.email).first()
        if not user or not password_hash.verify(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return user
    finally:
        db.close()

# ─── Crowd Management & Automatic Alerts (PART 2 & 7) ─────────────────────────

@app.get("/api/crowd/{zone}")
def get_crowd(zone: str):
    if zone not in crowd_data:
        return {"error": "Zone not found"}
    return {
        "zone": zone,
        "people": crowd_data[zone]["people"],
        "density": crowd_data[zone]["density"]
    }

@app.post("/api/crowd/update")
def update_crowd(data: CrowdUpdate):
    if data.zone not in crowd_data:
        crowd_data[data.zone] = {"people": 0, "density": "LOW"}

    prev_density = crowd_data[data.zone].get("density", "LOW")
    crowd_data[data.zone]["people"] = data.people
    crowd_data[data.zone]["density"] = data.density

    # PART 7: Automatic Crowd Alerts with Deduplication / Cooldown (15 min cooldown)
    now = time.time()
    last_alert = last_crowd_alert_times.get(data.zone, 0)

    if data.density.upper() == "HIGH" and (now - last_alert > 900 or prev_density.upper() != "HIGH"):
        last_crowd_alert_times[data.zone] = now
        db: Session = SessionLocal()
        try:
            alert = models.Alert(
                type="CROWD",
                title=f"High Crowd Density Alert — {data.zone}",
                message=f"{data.zone} is currently highly congested ({data.people} people detected). Consider taking an alternative safe corridor.",
                severity="CRITICAL",
                location=f"{data.zone} Approach Corridor",
                zone=data.zone,
                is_system=True
            )
            db.add(alert)
            db.commit()
        except Exception as e:
            print("Alert generation notice:", e)
        finally:
            db.close()
    elif prev_density.upper() == "HIGH" and data.density.upper() == "LOW":
        db: Session = SessionLocal()
        try:
            alert = models.Alert(
                type="CROWD",
                title=f"Crowd Conditions Normalized — {data.zone}",
                message=f"Crowd flow at {data.zone} has normalized to low density. Safe for pilgrim entry.",
                severity="INFO",
                location=f"{data.zone} Approach Corridor",
                zone=data.zone,
                is_system=True
            )
            db.add(alert)
            db.commit()
        except Exception as e:
            print("Alert recovery notice:", e)
        finally:
            db.close()

    return {
        "message": "Crowd data updated",
        "zone": data.zone,
        "people": data.people,
        "density": data.density
    }

# ─── Family Connectivity APIs (PART 4 & 5) ────────────────────────────────────

@app.post("/api/family/create")
def create_family(payload: FamilyCreateRequest):
    db: Session = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == payload.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate unique code
        code = f"KSA-{random.randint(1000, 9999)}"
        while db.query(models.FamilyGroup).filter(models.FamilyGroup.code == code).first():
            code = f"KSA-{random.randint(1000, 9999)}"

        group = models.FamilyGroup(
            name=payload.name.strip(),
            code=code,
            owner_id=user.id
        )
        db.add(group)
        db.commit()
        db.refresh(group)

        # Add creator as owner member
        member = models.FamilyMember(
            family_id=group.id,
            user_id=user.id,
            nickname=user.name,
            role="OWNER",
            status="SAFE",
            is_location_shared=False,
            last_location_name="Gate 1 (Ramkund)"
        )
        db.add(member)
        db.commit()

        return {
            "message": "Family group created successfully",
            "group": {
                "id": group.id,
                "name": group.name,
                "code": group.code,
                "owner_id": group.owner_id
            }
        }
    finally:
        db.close()

@app.post("/api/family/join")
def join_family(payload: FamilyJoinRequest):
    db: Session = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == payload.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        clean_code = payload.code.strip().upper()
        group = db.query(models.FamilyGroup).filter(models.FamilyGroup.code == clean_code).first()
        if not group:
            raise HTTPException(status_code=404, detail="Invalid Family Group Code")

        existing_member = (
            db.query(models.FamilyMember)
            .filter(models.FamilyMember.family_id == group.id, models.FamilyMember.user_id == user.id)
            .first()
        )
        if not existing_member:
            member = models.FamilyMember(
                family_id=group.id,
                user_id=user.id,
                nickname=user.name,
                role="MEMBER",
                status="SAFE",
                is_location_shared=False,
                last_location_name="Ramkund Approach"
            )
            db.add(member)
            db.commit()

        return {
            "message": "Successfully joined family group",
            "group": {
                "id": group.id,
                "name": group.name,
                "code": group.code,
                "owner_id": group.owner_id
            }
        }
    finally:
        db.close()

@app.get("/api/family/me")
def get_my_family(user_id: int = Query(...)):
    db: Session = SessionLocal()
    try:
        # Find membership
        membership = (
            db.query(models.FamilyMember)
            .filter(models.FamilyMember.user_id == user_id)
            .order_by(desc(models.FamilyMember.id))
            .first()
        )
        if not membership:
            return {"family": None, "members": [], "active_sos": []}

        group = db.query(models.FamilyGroup).filter(models.FamilyGroup.id == membership.family_id).first()
        if not group:
            return {"family": None, "members": [], "active_sos": []}

        # Fetch all members of this group
        raw_members = db.query(models.FamilyMember, models.User).join(
            models.User, models.FamilyMember.user_id == models.User.id
        ).filter(models.FamilyMember.family_id == group.id).all()

        members_list = []
        for mem, usr in raw_members:
            # Privacy rule: Only reveal coordinates if is_location_shared is True
            has_location = bool(mem.is_location_shared and mem.last_latitude and mem.last_longitude)
            members_list.append({
                "id": mem.id,
                "user_id": usr.id,
                "name": mem.nickname or usr.name,
                "relation": "Family Member" if mem.role == "MEMBER" else "Family Admin",
                "role": mem.role,
                "status": mem.status,
                "is_location_shared": mem.is_location_shared,
                "last_seen_location": mem.last_location_name if has_location else (
                    mem.last_location_name if mem.last_location_name else "Precise location unavailable"
                ),
                "latitude": mem.last_latitude if has_location else None,
                "longitude": mem.last_longitude if has_location else None,
                "last_updated": mem.last_updated_at.strftime("%I:%M %p") if mem.last_updated_at else "Active now"
            })

        # Fetch active SOS alerts
        active_sos = (
            db.query(models.FamilySos)
            .filter(models.FamilySos.family_id == group.id, models.FamilySos.status == "ACTIVE")
            .order_by(desc(models.FamilySos.id))
            .all()
        )

        return {
            "family": {
                "id": group.id,
                "name": group.name,
                "code": group.code,
                "owner_id": group.owner_id
            },
            "members": members_list,
            "active_sos": [
                {
                    "id": s.id,
                    "user_id": s.user_id,
                    "user_name": s.user_name,
                    "location_name": s.location_name,
                    "created_at": s.created_at.strftime("%I:%M %p") if s.created_at else "Just now"
                }
                for s in active_sos
            ]
        }
    finally:
        db.close()

@app.post("/api/family/sos")
def trigger_family_sos(payload: FamilySosRequest):
    db: Session = SessionLocal()
    try:
        membership = (
            db.query(models.FamilyMember)
            .filter(models.FamilyMember.user_id == payload.user_id)
            .first()
        )
        if not membership:
            raise HTTPException(status_code=400, detail="You are not part of any family group")

        user = db.query(models.User).filter(models.User.id == payload.user_id).first()
        user_name = user.name if user else "Family Member"

        # Update member status to SOS
        membership.status = "SOS"
        if payload.latitude and payload.longitude and membership.is_location_shared:
            membership.last_latitude = payload.latitude
            membership.last_longitude = payload.longitude
            membership.last_location_name = payload.location_name

        sos_entry = models.FamilySos(
            family_id=membership.family_id,
            user_id=payload.user_id,
            user_name=user_name,
            latitude=payload.latitude if membership.is_location_shared else None,
            longitude=payload.longitude if membership.is_location_shared else None,
            location_name=payload.location_name or "Near Kumbh Sacred Ghats",
            status="ACTIVE"
        )
        db.add(sos_entry)

        # PART 10: Create a Family Alert for this group
        alert = models.Alert(
            type="EMERGENCY",
            title=f"🚨 Family SOS Alert — {user_name}",
            message=f"{user_name} has requested emergency assistance within your family group.",
            severity="CRITICAL",
            location=payload.location_name or "Kumbh Sector",
            is_system=False,
            family_id=membership.family_id
        )
        db.add(alert)
        db.commit()

        return {
            "message": "Family SOS alert broadcast successfully",
            "sos_id": sos_entry.id,
            "time": datetime.now().strftime("%I:%M %p")
        }
    finally:
        db.close()

@app.post("/api/family/location-sharing")
def toggle_location_sharing(payload: LocationSharingToggle):
    db: Session = SessionLocal()
    try:
        membership = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == payload.user_id).first()
        if not membership:
            raise HTTPException(status_code=404, detail="Family membership not found")

        membership.is_location_shared = payload.enabled
        db.commit()
        return {
            "message": "Location sharing updated",
            "is_location_shared": membership.is_location_shared
        }
    finally:
        db.close()

@app.post("/api/family/location")
def update_member_location(payload: LocationUpdateRequest):
    db: Session = SessionLocal()
    try:
        membership = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == payload.user_id).first()
        if not membership:
            raise HTTPException(status_code=404, detail="Family membership not found")

        # Only update coordinates if user explicitly consented
        if membership.is_location_shared:
            membership.last_latitude = payload.latitude
            membership.last_longitude = payload.longitude
            if payload.location_name:
                membership.last_location_name = payload.location_name
            db.commit()
            return {"message": "Location updated successfully"}
        else:
            return {"message": "Location update ignored (location sharing is disabled)"}
    finally:
        db.close()

# ─── Alerts APIs (PART 6 & 8) ─────────────────────────────────────────────────

@app.get("/api/alerts")
def get_alerts(user_id: Optional[int] = Query(None)):
    db: Session = SessionLocal()
    try:
        family_id = None
        if user_id:
            membership = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == user_id).first()
            if membership:
                family_id = membership.family_id

        # Query all system alerts + alerts for this user's family
        if family_id:
            alerts_query = db.query(models.Alert).filter(
                (models.Alert.is_system == True) | (models.Alert.family_id == family_id)
            )
        else:
            alerts_query = db.query(models.Alert).filter(models.Alert.is_system == True)

        raw_alerts = alerts_query.order_by(desc(models.Alert.id)).limit(40).all()

        # Query read alerts for this user
        read_alert_ids = set()
        if user_id:
            reads = db.query(models.UserAlertRead.alert_id).filter(models.UserAlertRead.user_id == user_id).all()
            read_alert_ids = {r[0] for r in reads}

        result = []
        for a in raw_alerts:
            result.append({
                "id": a.id,
                "type": a.type,
                "title": a.title,
                "message": a.message,
                "severity": a.severity,
                "location": a.location,
                "zone": a.zone,
                "is_system": a.is_system,
                "is_read": a.id in read_alert_ids,
                "created_at": a.created_at.strftime("%I:%M %p") if a.created_at else "Recent"
            })

        return {"alerts": result, "count": len(result)}
    finally:
        db.close()

@app.post("/api/alerts/{alert_id}/read")
def mark_alert_read(alert_id: int, user_id: int = Query(...)):
    db: Session = SessionLocal()
    try:
        existing = db.query(models.UserAlertRead).filter(
            models.UserAlertRead.user_id == user_id,
            models.UserAlertRead.alert_id == alert_id
        ).first()

        if not existing:
            read_entry = models.UserAlertRead(user_id=user_id, alert_id=alert_id)
            db.add(read_entry)
            db.commit()

        return {"message": "Alert marked as read", "alert_id": alert_id}
    finally:
        db.close()

@app.post("/api/alerts/read-all")
def mark_all_alerts_read(user_id: int = Query(...)):
    db: Session = SessionLocal()
    try:
        # Fetch all accessible alerts
        membership = db.query(models.FamilyMember).filter(models.FamilyMember.user_id == user_id).first()
        family_id = membership.family_id if membership else None

        if family_id:
            alerts = db.query(models.Alert.id).filter(
                (models.Alert.is_system == True) | (models.Alert.family_id == family_id)
            ).all()
        else:
            alerts = db.query(models.Alert.id).filter(models.Alert.is_system == True).all()

        existing_reads = {
            r[0] for r in db.query(models.UserAlertRead.alert_id).filter(models.UserAlertRead.user_id == user_id).all()
        }

        new_entries = []
        for (a_id,) in alerts:
            if a_id not in existing_reads:
                new_entries.append(models.UserAlertRead(user_id=user_id, alert_id=a_id))

        if new_entries:
            db.add_all(new_entries)
            db.commit()

        return {"message": "All alerts marked as read", "marked_count": len(new_entries)}
    finally:
        db.close()
'''

def apply_upgrades():
    base_dir = r"C:\Users\VICTUS\OneDrive\Desktop\ANC\backend"
    models_file = os.path.join(base_dir, "models.py")
    main_file = os.path.join(base_dir, "main.py")

    print(f"Writing updated models to: {models_file}")
    with open(models_file, "w", encoding="utf-8") as f:
        f.write(MODELS_CONTENT.strip() + "\n")

    print(f"Writing updated main API to: {main_file}")
    with open(main_file, "w", encoding="utf-8") as f:
        f.write(MAIN_CONTENT.strip() + "\n")

    print("Backend models and main.py updated successfully!")

if __name__ == "__main__":
    apply_upgrades()
