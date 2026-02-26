from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine, Base 
from app.routes import rides, drivers
import app.models

app = FastAPI()

Base.metadata.create_all(bind=engine)

# ✅ CORS (allow frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(rides.router, prefix="/api/rides")
app.include_router(drivers.router, prefix="/api/drivers")


# ✅ Database connection test
@app.on_event("startup")
def startup():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("✅ Database connected successfully!")
    except Exception as e:
        print("❌ Database connection failed:")
        print(e)