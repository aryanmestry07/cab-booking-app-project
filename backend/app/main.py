from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routes import rides, drivers, auth
import app.models


# ---------------- ✅ Lifespan (Modern Startup Handler) ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)

        # Test DB connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("✅ Database connected successfully!")

    except Exception as e:
        print("❌ Database connection failed:")
        print(e)

    yield


# ---------------- 🚀 App Initialization ----------------
app = FastAPI(
    title="Cab Booking API 🚖",
    version="1.0.0",
    description="Full Stack Cab Booking Application with JWT Authentication",
    lifespan=lifespan
)


# ---------------- ✅ CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- ✅ Routers ----------------
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(rides.router, prefix="/api/rides", tags=["Rides"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["Drivers"])


# ---------------- ❤️ Health Check ----------------
@app.get("/")
def root():
    return {
        "message": "Cab Booking API Running 🚀",
        "status": "healthy"
    }