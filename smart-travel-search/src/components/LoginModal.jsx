import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function LoginModal() {
  const { setShowLogin, setShowRegister, setShowPersona, loginWithData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setShowLogin(false);
        // If user has no persona yet, show persona modal
        if (!localStorage.getItem("persona")) {
          setShowPersona(true);
        }
      }
    } catch {
      setError("Google login error. Please try again");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password"); return; }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_ORIGIN}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) { setError((data && data.error) || "Login failed"); return; }
      if (data?.token && data?.user) {
        loginWithData(data.user, data.token);
        setShowLogin(false);
        if (!localStorage.getItem("persona")) {
          setShowPersona(true);
        }
      }
    } catch {
      setError("Network error. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google && googleButtonRef.current && clientId) {
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleResponse });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}
    >
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);     }
        }
      `}</style>

      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
        style={{ animation: "modalIn 0.3s cubic-bezier(0.34,1.3,0.64,1) both" }}
      >
        {/* Close button */}
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-1 mb-3">
            <span className="text-2xl font-bold" style={{ color: "#0059b3", fontFamily: "'Playfair Display', serif" }}>tbo</span>
            <span className="text-2xl font-bold" style={{ color: "#ff6600" }}>.</span>
            <span className="text-2xl font-bold" style={{ color: "#0059b3", fontFamily: "'Playfair Display', serif" }}>com</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue your journey</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ "--tw-ring-color": "#ff6600" }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              Remember me
            </label>
            <a href="#" className="text-sm font-medium hover:underline" style={{ color: "#ff6600" }}>
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            style={{ background: "linear-gradient(135deg, #ff6600, #ff3366)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* Google */}
        <div className="mb-5">
          <div ref={googleButtonRef} className="flex justify-center" />
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              onClick={goToRegister}
              className="font-medium hover:underline"
              style={{ color: "#ff6600" }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
