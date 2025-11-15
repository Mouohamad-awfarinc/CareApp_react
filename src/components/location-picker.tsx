import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl // eslint-disable-line @typescript-eslint/no-explicit-any
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationPickerProps {
  latitude?: number
  longitude?: number
  onChange: (lat: number, lng: number) => void
  placeholder?: string
  className?: string
}

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface SearchControlProps {
  onLocationFound: (lat: number, lng: number) => void
}

function SearchControl({ onLocationFound }: SearchControlProps) {
  const map = useMapEvents({})

  useEffect(() => {
    const provider = new OpenStreetMapProvider()

    const searchControl = new (GeoSearchControl as any)({ // eslint-disable-line @typescript-eslint/no-explicit-any
      provider: provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for a location...',
    })

    map.addControl(searchControl)

    // Listen for search results
    map.on('geosearch/showlocation', (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const { location } = e
      onLocationFound(location.y, location.x)
    })

    return () => {
      map.removeControl(searchControl)
    }
  }, [map, onLocationFound])

  return null
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  placeholder = "Click on the map or search for a location",
  className = ""
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]) // Default to London

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      setPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onChange(lat, lng)
  }

  const handleLocationFound = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onChange(lat, lng)
  }

  const handleMarkerDrag = (e: L.DragEndEvent) => {
    const marker = e.target
    const newPos = marker.getLatLng()
    setPosition([newPos.lat, newPos.lng])
    onChange(newPos.lat, newPos.lng)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm text-muted-foreground">{placeholder}</div>
      <div className="h-64 w-full border rounded-md overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          <SearchControl onLocationFound={handleLocationFound} />
          <Marker
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
          />
        </MapContainer>
      </div>
      <div className="text-xs text-muted-foreground">
        Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
      </div>
    </div>
  )
}