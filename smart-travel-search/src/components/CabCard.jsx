function CabCard({ cab, persona }) {
  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 hover:scale-105 hover:shadow-3xl transition-all duration-300">

      <div className="flex justify-between">
        <h3 className="text-lg font-bold text-gray-900">{cab.driver}</h3>

        {persona === "solo" && (
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            Female Driver
          </span>
        )}
      </div>

      <p className="text-gray-600 mt-2 font-medium">
        Vehicle: {cab.type}
      </p>

      <p className="text-yellow-600 mt-2 font-medium">
        ⭐ {cab.rating}
      </p>

      <div className="mt-4 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white inline-block px-3 py-1 rounded-full font-semibold">
        Verified Driver
      </div>

    </div>
  )
}

export default CabCard
