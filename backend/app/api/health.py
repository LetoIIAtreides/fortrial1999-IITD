from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timezone
from app.db.session import get_db

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    db_dialect = db.bind.dialect.name if db.bind else "unknown"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if "unhealthy" not in db_status else "degraded",
        "service": "AAROGYA LINK API",
        "database": db_status,
        "database_engine": db_dialect,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
