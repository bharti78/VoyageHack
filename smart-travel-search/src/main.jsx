import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "leaflet/dist/leaflet.css"
import "./utils/fixLeafletIcon"
import "./utils/fixApiBase"

createRoot(document.getElementById('root')).render(
  <App />,
)

