import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function RegisterModal() {
  const { setShowRegister, setShowPersona, loginWithData, setShowLogin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const googleButtonRef = useRef(null);

  const handleGoogleResponse = async (response) => {
    try {
      const idToken = response.credential;
      const res = await fetch(`${API_ORIGIN}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError((data && data.error) || "Google login failed"); return; }
      if (data && data.token && data.user) {
        loginWithData(data.user, data.token);
        setShowRegister(false);
        setShowPersona(true);
      }
    } catch {
      setError("Google login error. Please try again");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) { setError("Please fill in all fields"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_ORIGIN}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) { setError((data && data.error) || "Registration failed"); return; }
      if (data && data.token && data.user) {
        loginWithData(data.user, data.token);
        setShowRegister(false);
        setShowPersona(true);
      }
    } catch {
      setError("Network error. Please try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google && googleButtonRef.current && clientId) {
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleResponse });
      window.google.accounts.id.renderButton(googleButtonRef.current, { theme: "outline", size: "large", width: "100%" });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowRegister(false); }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-fadeIn"
        style={{ animation: "modalIn 0.3s cubic-bezier(0.34,1.3,0.64,1) both" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        <button onClick={() => setShowRegister(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm transition-colors">
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="text-2xl font-bold" style={{ color: "#0059b3" }}>tbo</span>
            <span className="text-2xl font-bold" style={{ color: "#ff6600" }}>.</span>
            <span className="text-2xl font-bold" style={{ color: "#0059b3" }}>com</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
          <p className="text-gray-500 text-sm mt-1">Sign up to book your perfect trip</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" placeholder="Enter your full name" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              style={{ "--tw-ring-color": "#ff6600" }} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" placeholder="Create a password (min. 6 chars)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" placeholder="Confirm your password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              required />
          </div>
          <div className="flex items-start">
            <input type="checkbox" className="w-4 h-4 mt-0.5 rounded" required />
            <label className="ml-2 text-xs text-gray-600">
              I agree to the <a href="#" className="text-orange-600 hover:underline">Terms of Service</a> and <a href="#" className="text-orange-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
          <button type="submit" disabled={loading}
            className="w-full text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            style={{ background: "linear-gradient(135deg,#ff6600,#ff3366)" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-gray-400">Or continue with</span></div>
        </div>

        <div className="mb-4"><div ref={googleButtonRef} className="flex justify-center"></div></div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => { setShowRegister(false); setShowLogin(true); }}
              className="font-medium hover:underline" style={{ color: "#ff6600" }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
