function HotelCard({ hotel }) {
  const matchScore = Math.floor(Math.random() * 15) + 85 // demo score 85-100

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition duration-300 border border-gray-800">

      {/* Top Section */}
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold">{hotel.name}</h3>

        <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">
          {matchScore}% Match
        </span>
      </div>

      <p className="text-gray-400 mt-2">
        ₹{hotel.price} / night
      </p>

      <div className="flex justify-between mt-4 text-sm">
        <span>⭐ {hotel.rating}</span>
        <span className="text-green-400">
          Safety: {hotel.safety}
        </span>
      </div>

      {/* Safety Badge */}
      {hotel.safety > 4.5 && (
        <div className="mt-4 text-xs bg-green-600 inline-block px-3 py-1 rounded-full">
          Verified Safe Area
        </div>
      )}

    </div>
  )
}

export default HotelCard
