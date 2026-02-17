import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import HotelCard from "../components/HotelCard"
import CabCard from "../components/CabCard"
import MapView from "../components/MapView"
import Navbar from "../components/HomepageNavbar"

function Results() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("hotels")

  const persona = localStorage.getItem("persona") || ""
  const query = localStorage.getItem("searchQuery") || ""
  const searchType = localStorage.getItem("searchType") || ""
  const imagePreview = localStorage.getItem("uploadedImage") || ""
  
  // Get search data from homepage search
  const homepageSearch = localStorage.getItem("homepageSearch")
  let searchData = {}
  if (homepageSearch) {
    searchData = JSON.parse(homepageSearch)
  }

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

  // Get display text for search criteria
  const getDestinationDisplay = () => {
    if (searchData.destination && searchData.destination !== 'Anywhere') {
      return searchData.destination
    }
    return query || 'Anywhere'
  }

  const getDatesDisplay = () => {
    if (searchData.startDate && searchData.endDate) {
      const start = new Date(searchData.startDate)
      const end = new Date(searchData.endDate)
      return `${start.toLocaleString('default', { month: 'short', day: 'numeric' })}–${end.toLocaleString('default', { month: 'short', day: 'numeric' })}`
    }
    return 'Any dates'
  }

  const getGuestsDisplay = () => {
    const total = (searchData.adults || 1) + (searchData.children || 0)
    return `${total} Guest${total > 1 ? 's' : ''}`
  }

  const tabs = [
    { id: 'hotels', label: 'Hotels', icon: '🏨' },
    { id: 'homestays', label: 'Homestays', icon: '🏠' },
    { id: 'packages', label: 'Packages', icon: '📦' },
    { id: 'activities', label: 'Activities', icon: '🎯' },
    { id: 'flights', label: 'Flights', icon: '✈️' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20"></div>
      
      {/* Results Content */}
      <div className="relative min-h-screen">
        <Navbar user={JSON.parse(localStorage.getItem("user") || "{}")} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Criteria Bar */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <span className="font-medium text-gray-900">{getDestinationDisplay()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span className="font-medium text-gray-900">{getDatesDisplay()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="font-medium text-gray-900">{getGuestsDisplay()}</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 mb-8">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Hotels Tab (Default Active) */}
            {activeTab === 'hotels' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Hotels</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((hotel, index) => (
                    <HotelCard key={index} hotel={hotel} />
                  ))}
                </div>
              </div>
            )}

            {/* Homestays Tab */}
            {activeTab === 'homestays' && (
              <div className="text-center py-16">
                <div className="text-gray-500 text-lg">Homestays coming soon...</div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div className="text-center py-16">
                <div className="text-gray-500 text-lg">Travel packages coming soon...</div>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="text-center py-16">
                <div className="text-gray-500 text-lg">Activities coming soon...</div>
              </div>
            )}

            {/* Flights Tab */}
            {activeTab === 'flights' && (
              <div className="text-center py-16">
                <div className="text-gray-500 text-lg">Flights coming soon...</div>
              </div>
            )}
          </div>

          {/* Transportation Section (Always Visible) */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Transportation Options</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cabs.map((cab, index) => (
                <CabCard key={index} cab={cab} persona={persona} />
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Map View</h2>
            <MapView hotels={hotels} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results