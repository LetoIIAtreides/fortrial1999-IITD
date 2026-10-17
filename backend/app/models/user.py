import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(128), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="responder") # "responder", "admin", "public"
    full_name = Column(String(128), nullable=False)
    badge_number = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
