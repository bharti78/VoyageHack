# VoyageHack Feature Implementation Guide

## 1. Responsive Design (Mobile/Tablet/Desktop)
- Use a 12-column responsive grid with breakpoints: `sm (>=640)`, `md (>=768)`, `lg (>=1024)`, `xl (>=1280)`.
- Keep search/results as stacked cards on mobile, 2-column on tablet, and 3-column desktop dashboards.
- Keep key actions sticky on mobile: `Search`, `Book`, `Enable Price Alert`.
- UX structure recommendation:
  1. Search intent input (text/voice/image)
  2. Trip summary (destination, budget, duration)
  3. Budget allocation cards (flight/hotel/cab/contingency)
  4. Results tabs/sections (Flights, Hotels, Cabs)
  5. Safety banner and fallback explanation

## 2. Women Safety Cab Logic
- Implemented logic:
  - If `userGender = female` and `tripType/persona = solo` => female drivers only.
  - If night time (20:00-05:00) and no female driver => show only trusted drivers:
    - Rating between `4.0` and `5.0`
    - Experience `>= 5 years`
- API now returns:
  - `safetyMode`
  - `safetyThresholds`

## 3. Suggested Driver Safety Validation DB Structure
Suggested fields (partly implemented in `Driver` model):
- `verified` (boolean)
- `rating` (number)
- `experienceYears` (number)
- `totalTrips` (number)
- `safety.backgroundCheckStatus` (`pending|verified|rejected`)
- `safety.lastPoliceVerificationAt` (date)
- `safety.womenSafetyTrainingCompleted` (boolean)
- `safety.panicButtonEnabled` (boolean)
- `safety.sosEnabled` (boolean)
- `availability.isOnline` (boolean)
- `availability.preferredShift` (`day|night|both`)

## 4. Hotel Search Requirements
- Existing hotel page supports:
  - real image proxy via hotel API-backed image URLs
  - description
  - map view (Leaflet)
  - amenities extraction (senior-friendly + dining highlights)
- Recommended real APIs:
  - TBO Holidays Hotel API (already integrated)
  - Expedia Rapid API
  - Amadeus Hotel Search API
  - Booking.com Demand API

## 5. Calendar Fare Flight Feature
- Implemented:
  - Lowest fare per date
  - Cheapest day tagging
  - color levels `low/mid/high`
  - `±3/±7` flexible date support
  - cheapest month view (`cheapestMonthView`)
  - round-trip combo fare support (when return date is provided)
  - hover detail payload (airline/stops/duration)
  - local price alert toggle (UI persisted in localStorage)
- Recommended live flight APIs:
  - Amadeus Flight Offers Search + Flight Dates
  - Skyscanner Flights Live Prices API
  - Travelport Air APIs
  - TBO Air API (already used)

## 6. Smart Search Bar
- Implemented:
  - Voice-based search (Web Speech API)
  - Image-upload search trigger
  - NLP intent parsing in backend (`destination`, `budget`, `nights`)
  - Example handled: `"Plan a trip to Manali at 5000 budget"`
  - Combined results view with:
    - flights (live endpoint hook + budget allocation)
    - hotels
    - cab list with safety mode
  - AI budget distribution:
    - Flights: 40%
    - Hotels: 40%
    - Cabs: 15%
    - Contingency: remaining

