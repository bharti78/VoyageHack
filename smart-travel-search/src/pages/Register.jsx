import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const googleButtonRef = useRef(null)
  const navigate = useNavigate()

  const handleGoogleResponse = async (response) => {
    try {
      const idToken = response.credential

      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ idToken })
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError((data && data.error) || "Google login failed")
        return
      }

      if (data && data.token) {
        localStorage.setItem("token", data.token)
      }
      if (data && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      navigate("/persona")
    } catch {
      setError("Google login error. Please try again")
    }
  }

  useEffect(() => {
    const clientId =
      "172902286128-3magsni5lgvf95nf0iisv83hl35ha2im.apps.googleusercontent.com"

    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse
      })

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: "100%"
      })
    }
  }, [])

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError((data && data.error) || "Registration failed")
        return
      }

      if (data && data.token) {
        localStorage.setItem("token", data.token)
      }
      if (data && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      navigate("/persona")
    } catch (err) {
      setError("Network error. Please try again")
    } finally {
      setLoading(false)
    }
  }

  const goToLogin = () => {
    navigate("/")
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter Name"
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="w-full p-3 mb-6 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition duration-300 p-3 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <div className="mt-4">
          <div
            ref={googleButtonRef}
            className="flex justify-center"
          ></div>
        </div>

        <button
          onClick={goToLogin}
          className="w-full mt-4 text-sm text-gray-300 hover:text-white"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  )
}

export default Register
