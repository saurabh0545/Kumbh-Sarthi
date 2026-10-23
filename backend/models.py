from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
try:
    from .database import Base
except (ImportError, ValueError):
    from database import Base


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
