# Smart Travel (VoyageHack)

Full-stack travel search platform with:
- `smart-travel-search` (React + Vite frontend)
- `smart-travel-backend` (Node.js + Express + MongoDB backend)

## Live Links
- Frontend: https://tbo-project.vercel.app
- Backend: https://tbo-project.onrender.com

## Tech Stack
- Frontend: React, Vite, Tailwind, React Router, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), JWT Auth

## Prerequisites
- Node.js `18+` (recommended `20+`)
- npm `9+`
- MongoDB connection string (Atlas/local)

## Project Structure
```text
VoyageHack/
  smart-travel-search/    # frontend
  smart-travel-backend/   # backend
```

## 1. Backend Setup (`smart-travel-backend`)

```powershell
cd smart-travel-backend
npm install
```

Create `.env` in `smart-travel-backend`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id

TBO_BASE=http://api.tbotechnology.in/TBOHolidays_HotelAPI
TBO_USER=your_tbo_user
TBO_PASS=your_tbo_password

TBO_FLIGHT_BASE=https://Sharedapi.tektravels.com/SharedData.svc/rest
TBO_FLIGHT_API_BASE=https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest
TBO_FLIGHT_USER=your_flight_user
TBO_FLIGHT_PASS=your_flight_password
TBO_FLIGHT_CLIENT_ID=your_flight_client_id
TBO_FLIGHT_END_USER_IP=122.160.30.1

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
AMADEUS_BASE_URL=https://test.api.amadeus.com

ENABLE_MOCK_BOOKING_MODE=true
ENABLE_MOCK_FLIGHT_BOOKING_MODE=true
```

Run backend:

```powershell
npm run dev
```

Backend default URL:
- `http://localhost:5000`
- health check: `http://localhost:5000/ping`

## 2. Frontend Setup (`smart-travel-search`)

Open a new terminal:

```powershell
cd smart-travel-search
npm install
```

Create `.env` in `smart-travel-search`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MOCK_HOTEL_BOOKING=true
VITE_MOCK_FLIGHT_BOOKING=true
```

Run frontend:

```powershell
npm run dev
```

Frontend default URL:
- `http://localhost:5173`

## Available Commands

### Backend (`smart-travel-backend`)
- `npm run dev` - start backend with nodemon
- `npm test` - placeholder test script

### Frontend (`smart-travel-search`)
- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Production Build (Frontend)

```powershell
cd smart-travel-search
npm run build
npm run preview
```

## Screenshots

### Onboarding
![Onboarding](<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/cd77e4a9-e573-49c9-9df9-1b259402f4b2" />)

### AI Assistance
![AI Assistance](<img width="949" height="666" alt="image" src="https://github.com/user-attachments/assets/ed7f0631-99d8-4acc-886d-40686104669a" />)

### Flights Booking
![Flights Booking](<img width="1919" height="901" alt="image" src="https://github.com/user-attachments/assets/001679a3-fb5c-43cb-b494-f451ac119c86" />)

### Hotels Booking
![Hotels Booking](<img width="1907" height="919" alt="image" src="https://github.com/user-attachments/assets/f775384e-67a5-419c-b504-34184cb7c3b2" />)

### Cab Booking
![Cab Booking](<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/d5dbc221-4626-47aa-adda-b84d1e2f67f7" />)

## Notes
- Keep backend running before using frontend APIs locally.
- Do not commit real `.env` secrets to git.
