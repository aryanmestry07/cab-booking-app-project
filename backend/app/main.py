from fastapi import FastAPI
from app.routes import rides, drivers

app = FastAPI(title="Cab Booking API")
app.include_router(rides.router, prefix="/api/rides")
app.include_router(drivers.router, prefix="/api/drivers")

@app.get("/")
def root():
    return {"message": "Cab Booking API Running 🚖"}