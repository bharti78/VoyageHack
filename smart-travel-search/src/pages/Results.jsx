import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import HotelCard from "../components/HotelCard"
import CabCard from "../components/CabCard"
import MapView from "../components/MapView"
import Navbar from "../components/Navbar"

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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-8">
        {/* Image Search Preview */}
{searchType === "image" && imagePreview && (
  <div className="bg-gray-900 p-6 rounded-xl mb-8 shadow-lg">
    <h2 className="text-xl font-semibold mb-4">
      Image-Based Search Results
    </h2>
    <img
      src={imagePreview}
      alt="Uploaded Preview"
      className="w-48 rounded-lg border border-gray-700"
    />
  </div>
)}

      {/* Trip Summary */}
      <div className="bg-gray-900 p-6 rounded-xl mb-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Trip Summary</h2>
        <p className="text-gray-400">{query}</p>
        <p className="text-sm mt-2">
          Persona: <span className="text-blue-400 capitalize">{persona}</span>
        </p>
      </div>

      {/* Budget Section */}
      <div className="bg-gray-900 p-6 rounded-xl mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Estimated Budget Breakdown</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800 p-4 rounded-lg">
            🏨 Hotels
            <p className="text-blue-400 mt-2">₹18,000</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            🚖 Cabs
            <p className="text-blue-400 mt-2">₹6,000</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            ✈ Travel
            <p className="text-blue-400 mt-2">₹12,000</p>
          </div>
        </div>
      </div>

      {/* Hotels Section */}
      <div className="grid md:grid-cols-2 gap-6">
  {hotels.map((hotel, index) => (
    <HotelCard key={index} hotel={hotel} />
  ))}
</div>

      {/* Cab Section */}
      <div className="grid md:grid-cols-2 gap-6">
  {cabs.map((cab, index) => (
    <CabCard key={index} cab={cab} persona={persona} />
  ))}
</div>

      {/* Map Section Placeholder */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg mt-10">
  <h2 className="text-2xl font-bold mb-6">Map View</h2>
  <MapView hotels={hotels} />
</div>
      </div>
    </div>
  )
}

export default Results
