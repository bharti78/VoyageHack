import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

function MapView({ hotels }) {

  const center = [31.1048, 77.1734] // Default center (Manali)

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="w-full h-[400px] rounded-2xl"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hotels.map((hotel, index) => (
        <Marker key={index} position={[hotel.lat, hotel.lng]}>
          <Popup>
            <div>
              <h3 className="font-semibold">{hotel.name}</h3>
              <p>₹{hotel.price} per night</p>
              <p>⭐ {hotel.rating}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapView
