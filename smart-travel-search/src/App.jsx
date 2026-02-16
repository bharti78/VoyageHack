import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Persona from "./pages/Persona"
import Search from "./pages/Search"
import Results from "./pages/Results"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Home from "./pages/Home"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/persona" element={<Persona />} />
        <Route path="/search" element={<Search />} />
        <Route path="/results" element={<Results />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
