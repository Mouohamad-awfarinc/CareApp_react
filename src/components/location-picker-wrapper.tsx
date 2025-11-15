import { LocationPicker } from './location-picker'

interface LocationPickerWrapperProps {
  latitude?: number
  longitude?: number
  onChange: (lat: number, lng: number) => void
  placeholder?: string
}

export function LocationPickerWrapper({
  latitude,
  longitude,
  onChange,
  placeholder
}: LocationPickerWrapperProps) {
  return (
    <LocationPicker
      latitude={latitude}
      longitude={longitude}
      onChange={onChange}
      placeholder={placeholder}
      className="md:col-span-2"
    />
  )
}