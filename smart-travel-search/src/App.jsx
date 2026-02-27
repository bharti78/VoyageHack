import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import SearchSection from "./components/SearchSection"
import Login from "./pages/Login"
import Persona from "./pages/Persona"
import Search from "./pages/Search"
import Results from "./pages/Results"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Home from "./pages/Home"
import HotelsPage from "./pages/Hotelspage"
import FlightsPage from "./pages/FlightsPage"
import CabsPage from "./pages/CabsPage"
import CarRentalPage from "./pages/CarRentalPage"
import RegisterModal from "./components/RegisterModal"
import PersonaModal from "./components/PersonaModal"
import LoginModal from "./components/LoginModal"
import GlobalChatWidget from "./components/GlobalChatWidget"

function AppInner() {
  const { showRegister, showPersona, showLogin } = useAuth();
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* SearchSection is the default landing page */}
          <Route path="/" element={<SearchSection />} />
          <Route path="/searchsection" element={<SearchSection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/persona" element={<Persona />} />
          <Route path="/search" element={<Search />} />
          <Route path="/results" element={<Results />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/cabs" element={<CabsPage />} />
          <Route path="/carrental" element={<CarRentalPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
      <GlobalChatWidget />
      {/* Global modal overlays rendered outside the router */}
      {showLogin && <LoginModal />}
      {showRegister && <RegisterModal />}
      {showPersona && <PersonaModal />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App
