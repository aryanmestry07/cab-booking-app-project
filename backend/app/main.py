from fastapi import FastAPI
from app.routes import rides

app = FastAPI(title="Cab Booking API")

app.include_router(rides.router, prefix="/api/rides")

@app.get("/")
def root():
    return {"message": "Cab Booking API Running 🚖"}