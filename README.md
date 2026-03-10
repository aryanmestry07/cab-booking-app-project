# 🚖 Cab Booking App

A full-stack Cab Booking application built with **FastAPI, React, and SQLite**.  
The system allows riders to request rides and drivers to accept and complete them in real time.

---

## 📌 Features

- User Authentication (JWT Login/Register)
- Role Based Access (Rider / Driver)
- Rider Dashboard to request rides
- Driver Dashboard to accept rides
- Ride lifecycle management:
  - Request Ride
  - Accept Ride
  - Ongoing Ride
  - Complete Ride
- Distance based fare calculation
- Driver earnings tracking
- Live driver location updates
- WebSocket based real-time ride status updates
- Interactive map with **Leaflet.js**

---

## 🛠 Tech Stack

**Backend**
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- WebSockets

**Frontend**
- React
- Axios
- React Router
- Leaflet (Maps)

---

## 📂 Project Structure


cab-booking-app
│
├── backend
│ ├── app
│ │ ├── models
│ │ ├── routes
│ │ ├── auth
│ │ ├── database
│ │ └── websocket_manager
│
├── frontend
│ ├── src
│ │ ├── components
│ │ ├── pages
│ │ ├── api
│ │ └── styles


---

## ⚙️ Installation

### 1️⃣ Clone the Repository

git clone https://github.com/yourusername/cab-booking-app.git
cd cab-booking-app
2️⃣ Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
🚀 Future Improvements

Google Maps integration

Real-time driver tracking

Payment gateway

Admin dashboard

Ride history & analytics

👨‍💻 Author

Aryan Mestry
BCA Final Year Project
