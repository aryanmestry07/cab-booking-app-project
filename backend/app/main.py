from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routes import rides, drivers, auth, ratings, payments   # ⭐ added payments
from app.websocket_manager import manager
import app.models


# ----------------  Lifespan (Startup Handler) ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):

    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)

        # Test DB connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("✅ Database connected successfully!")

    except Exception as e:

        print("❌ Database connection failed:")
        print(e)

    yield


# ----------------  App Initialization ----------------
app = FastAPI(
    title="Cab Booking API 🚖",
    version="1.2.0",
    description="Cab Booking Application with JWT Auth, Ratings, Payments & WebSockets",
    lifespan=lifespan
)


# ----------------  CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- WebSocket Endpoint ----------------
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):

    await manager.connect(websocket, user_id)

    try:

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(user_id)


# ---------------- API Routers ----------------
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

app.include_router(rides.router, prefix="/api/rides", tags=["Rides"])

app.include_router(drivers.router, prefix="/api/drivers", tags=["Drivers"])

app.include_router(ratings.router, prefix="/api/ratings", tags=["Ratings"])

app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])  # ⭐ new


# ----------------  Health Check ----------------
@app.get("/")
def root():
    return {
        "message": "Cab Booking API Running 🚀",
        "status": "healthy",
        "features": [
            "JWT Authentication",
            "Ride Booking",
            "Driver Tracking",
            "Ratings System",
            "Payments",
            "WebSockets"
        ]
    }