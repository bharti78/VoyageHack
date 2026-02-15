function CabCard({ cab, persona }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition duration-300 border border-gray-800">

      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">{cab.driver}</h3>

        {persona === "solo" && (
          <span className="bg-pink-600 text-xs px-3 py-1 rounded-full">
            Female Driver
          </span>
        )}
      </div>

      <p className="text-gray-400 mt-2">
        Vehicle: {cab.type}
      </p>

      <p className="text-yellow-400 mt-2">
        ⭐ {cab.rating}
      </p>

      <div className="mt-4 text-xs bg-blue-600 inline-block px-3 py-1 rounded-full">
        Verified Driver
      </div>

    </div>
  )
}

export default CabCard
