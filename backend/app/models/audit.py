import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from app.db.session import Base

class VerificationAuditLog(Base):
    __tablename__ = "verification_audit_logs"

    log_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    report_id = Column(String(64), ForeignKey("reports.report_id", ondelete="CASCADE"), nullable=False, index=True)
    responder_id = Column(String(64), ForeignKey("users.user_id"), nullable=False)
    responder_username = Column(String(64), nullable=False)
    previous_status = Column(String(32), nullable=False)
    new_status = Column(String(32), nullable=False)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
