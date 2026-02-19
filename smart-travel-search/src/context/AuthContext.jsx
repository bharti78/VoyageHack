import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [persona, setPersona] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPersona, setShowPersona] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedPersona = localStorage.getItem("persona");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    if (storedPersona) setPersona(storedPersona);
  }, []);

  const loginWithData = (userData, tokenData) => {
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const selectPersona = (type) => {
    localStorage.setItem("persona", type);
    setPersona(type);
    setShowPersona(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("persona");
    setToken(null);
    setUser(null);
    setPersona(null);
    setIsLoggedIn(false);
  };

  // Call this when an action requiring auth is triggered
  const requireAuth = () => {
    if (!isLoggedIn) {
      setShowRegister(true);
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user, token, persona, isLoggedIn,
      showLogin, setShowLogin,
      showRegister, setShowRegister,
      showPersona, setShowPersona,
      loginWithData, selectPersona, logout, requireAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
