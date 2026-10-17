import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine, Base
from app.db.seed import seed_database
from app.api import health, auth, reports, sync, facilities

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AAROGYA LINK — Online Emergency Healthcare Reporting & Community Response Backend",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root-level endpoints matching prompt specifications directly
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(sync.router)
app.include_router(facilities.router)

# Also expose under /api/v1 for standard API versioning
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(sync.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
