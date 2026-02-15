import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Persona from "./pages/Persona"
import Search from "./pages/Search"
import Results from "./pages/Results"
import Register from "./pages/Register"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/persona" element={<Persona />} />
        <Route path="/search" element={<Search />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
