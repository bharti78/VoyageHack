import { useNavigate } from "react-router-dom"

function Persona() {
  const navigate = useNavigate()

  const selectPersona = (type) => {
    localStorage.setItem("persona", type)
    navigate("/search")
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-10">
        What type of trip are you planning?
      </h2>

      <div className="flex gap-10">
        <div
          onClick={() => selectPersona("solo")}
          className="bg-gray-800 hover:bg-gray-700 p-10 rounded-2xl cursor-pointer transition duration-300 shadow-xl"
        >
          <h3 className="text-xl font-semibold">Solo Trip</h3>
          <p className="text-gray-400 mt-2 text-sm">
            Personalized & Safety Focused
          </p>
        </div>

        <div
          onClick={() => selectPersona("family")}
          className="bg-gray-800 hover:bg-gray-700 p-10 rounded-2xl cursor-pointer transition duration-300 shadow-xl"
        >
          <h3 className="text-xl font-semibold">Family Trip</h3>
          <p className="text-gray-400 mt-2 text-sm">
            Comfort & Spacious Options
          </p>
        </div>
      </div>
    </div>
  )
}

export default Persona
