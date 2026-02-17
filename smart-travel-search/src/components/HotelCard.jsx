function HotelCard({ hotel }) {
  const matchScore = Math.floor(Math.random() * 15) + 85 // demo score 85-100

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 hover:scale-105 hover:shadow-3xl transition-all duration-300">

      {/* Top Section */}
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>

        <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
          {matchScore}% Match
        </span>
      </div>

      <p className="text-gray-600 mt-2 font-medium">
        ₹{hotel.price} / night
      </p>

      <div className="flex justify-between mt-4 text-sm">
        <span className="text-gray-700">⭐ {hotel.rating}</span>
        <span className="text-green-600 font-medium">
          Safety: {hotel.safety}
        </span>
      </div>

      {/* Safety Badge */}
      {hotel.safety > 4.5 && (
        <div className="mt-4 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white inline-block px-3 py-1 rounded-full font-semibold">
          Verified Safe Area
        </div>
      )}

    </div>
  )
}

export default HotelCard
