import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/HomepageNavbar"

function Persona() {
  const navigate = useNavigate()
  const [showSoloChoice, setShowSoloChoice] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
    }
  }, [navigate])

  const selectPersona = (type, gender = "") => {
    localStorage.setItem("persona", type)
    if (type === "solo" && (gender === "female" || gender === "male")) {
      localStorage.setItem("soloTravelerGender", gender)
    } else {
      localStorage.removeItem("soloTravelerGender")
    }
    navigate("/home")
  }

  const handlePersonaClick = (type) => {
    if (type === "solo") {
      setShowSoloChoice(true)
      return
    }
    selectPersona(type)
  }

  const personaOptions = [
    {
      type: "solo",
      title: "Solo Trip",
      description: "Personalized & Safety Focused",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      type: "family",
      title: "Family Trip",
      description: "Comfort & Spacious Options",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20"></div>
      
      {/* Persona Content */}
      <div className="relative min-h-screen">
        <Navbar user={JSON.parse(localStorage.getItem("user") || "{}")} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              What type of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
                {" "}trip
              </span>
              {" "}are you planning?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your travel style to get personalized recommendations and experiences
            </p>
          </div>

          {/* Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {personaOptions.map((option, index) => (
              <div
                key={option.type}
                onClick={() => handlePersonaClick(option.type)}
                className="group cursor-pointer"
              >
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                  {/* Icon */}
                  <div className={`w-20 h-20 bg-gradient-to-r ${option.gradient} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    {option.icon}
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
                </div>
              </div>
            ))}
          </div>

          {showSoloChoice && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ background: "rgba(3,7,18,0.58)", backdropFilter: "blur(4px)" }}>
              <div className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-white via-white to-blue-50 p-7 shadow-2xl border border-blue-100">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a4 4 0 100 8 4 4 0 000-8zM6 22a6 6 0 1112 0H6z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mt-4">Select Solo Type</h3>
                <p className="text-sm text-gray-600 text-center mt-2">Choose your profile to personalize safer cab recommendations.</p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => selectPersona("solo", "female")}
                    className="group rounded-2xl bg-white border border-pink-200 px-4 py-4 text-left hover:border-pink-400 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-bold text-pink-700">Female Solo</div>
                    <div className="text-xs text-gray-500 mt-1">Extra safety-first matching</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectPersona("solo", "male")}
                    className="group rounded-2xl bg-white border border-blue-200 px-4 py-4 text-left hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-bold text-blue-700">Male Solo</div>
                    <div className="text-xs text-gray-500 mt-1">Standard solo recommendations</div>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSoloChoice(false)}
                  className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Why choose your travel type?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Personalized Recommendations</h4>
                    <p className="text-sm text-gray-600 mt-1">Get suggestions tailored to your travel style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Better Matching</h4>
                    <p className="text-sm text-gray-600 mt-1">Find accommodations and activities that suit your needs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Enhanced Experience</h4>
                    <p className="text-sm text-gray-600 mt-1">Enjoy a journey designed specifically for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Persona;
