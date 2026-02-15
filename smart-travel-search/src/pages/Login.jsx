import { useNavigate } from "react-router-dom"

function Login() {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate("/persona")
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Smart Travel Search
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="w-full p-3 mb-6 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 transition duration-300 p-3 rounded-lg font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default Login
