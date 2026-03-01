from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base
from app.routes import rides, drivers, auth   # ✅ Added auth
import app.models  # Ensure models are loaded

app = FastAPI()

# ---------------- ✅ CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ✅ Routers ----------------
app.include_router(rides.router, prefix="/api/rides")
app.include_router(drivers.router, prefix="/api/drivers")
app.include_router(auth.router, prefix="/api/auth")  # ✅ NEW

# ---------------- ✅ Startup Event ----------------
@app.on_event("startup")
def startup():
    try:
        # Create tables (users table included now)
        Base.metadata.create_all(bind=engine)

        # Test DB connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("✅ Database connected successfully!")

    except Exception as e:
        print("❌ Database connection failed:")
        print(e)