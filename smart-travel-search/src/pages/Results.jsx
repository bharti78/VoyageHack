import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import HotelCard from "../components/HotelCard"
import CabCard from "../components/CabCard"
import MapView from "../components/MapView"
import Navbar from "../components/HomepageNavbar"

function Results() {
  const navigate = useNavigate()

  const persona = localStorage.getItem("persona") || ""
  const query = localStorage.getItem("searchQuery") || ""
  const searchType = localStorage.getItem("searchType") || ""
  const imagePreview = localStorage.getItem("uploadedImage") || ""

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }
  }, [navigate])

  // Temporary mock data (backend later)
 const hotels = [
  {
    name: "Mountain View Resort",
    price: 4500,
    rating: 4.5,
    safety: 4.7,
    lat: 31.1048,
    lng: 77.1734
  },
  {
    name: "Snow Peak Hotel",
    price: 3800,
    rating: 4.2,
    safety: 4.5,
    lat: 31.1100,
    lng: 77.1800
  }
]

  const cabs = persona === "solo"
    ? [{ driver: "Priya Sharma", type: "Sedan", rating: 4.8 }]
    : [{ driver: "Rahul Verma", type: "SUV", rating: 4.6 }]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20"></div>
      
      {/* Results Content */}
      <div className="relative min-h-screen">
        <Navbar user={JSON.parse(localStorage.getItem("user") || "{}")} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
                {" "}Travel Results
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover perfect hotels and transportation for your trip
            </p>
          </div>

          {/* Image Search Preview */}
{searchType === "image" && imagePreview && (
  <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Image-Based Search Results
    </h2>
    <img
      src={imagePreview}
      alt="Uploaded Preview"
      className="w-48 rounded-xl border border-gray-200 shadow-lg"
    />
  </div>
)}

          {/* Trip Summary */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Summary</h2>
            <p className="text-gray-600 text-lg">{query}</p>
            <p className="text-sm mt-3 text-gray-500">
              Persona: <span className="text-pink-600 font-semibold capitalize">{persona}</span>
            </p>
          </div>

          {/* Budget Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Estimated Budget Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center border border-pink-200">
                <div className="text-3xl mb-3">🏨</div>
                <div className="text-sm text-gray-600 mb-2">Hotels</div>
                <div className="text-2xl font-bold text-pink-600">₹18,000</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center border border-blue-200">
                <div className="text-3xl mb-3">🚖</div>
                <div className="text-sm text-gray-600 mb-2">Cabs</div>
                <div className="text-2xl font-bold text-blue-600">₹6,000</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center border border-green-200">
                <div className="text-3xl mb-3">✈️</div>
                <div className="text-sm text-gray-600 mb-2">Travel</div>
                <div className="text-2xl font-bold text-green-600">₹12,000</div>
              </div>
            </div>
          </div>

          {/* Hotels Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Hotels</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {hotels.map((hotel, index) => (
                <HotelCard key={index} hotel={hotel} />
              ))}
            </div>
          </div>

          {/* Cab Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Transportation Options</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {cabs.map((cab, index) => (
                <CabCard key={index} cab={cab} persona={persona} />
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Map View</h2>
            <MapView hotels={hotels} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results
