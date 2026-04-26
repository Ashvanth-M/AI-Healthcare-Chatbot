"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Phone, Clock, AlertCircle, Loader2, ExternalLink } from "lucide-react"

interface Hospital {
  id: string
  name: string
  address: string
  phone?: string
  lat: number
  lng: number
  distance?: number
  rating?: number
  isOpen?: boolean
}

interface UserLocation {
  lat: number
  lng: number
}

// Sample hospital data for fallback mode
const sampleHospitals: Hospital[] = [
  {
    id: "1",
    name: "City General Hospital",
    address: "123 Main Street, Downtown",
    phone: "+1-555-0123",
    lat: 28.6139,
    lng: 77.2090,
    distance: 2.5,
    rating: 4.2,
    isOpen: true
  },
  {
    id: "2", 
    name: "Metro Medical Center",
    address: "456 Health Avenue, Medical District",
    phone: "+1-555-0456",
    lat: 28.6200,
    lng: 77.2150,
    distance: 3.8,
    rating: 4.5,
    isOpen: true
  },
  {
    id: "3",
    name: "Emergency Care Hospital",
    address: "789 Emergency Lane, Central Area",
    phone: "+1-555-0789",
    lat: 28.6080,
    lng: 77.2030,
    distance: 1.2,
    rating: 4.0,
    isOpen: true
  },
  {
    id: "4",
    name: "Community Health Center",
    address: "321 Community Road, Suburb",
    phone: "+1-555-0321",
    lat: 28.6250,
    lng: 77.1950,
    distance: 5.1,
    rating: 3.8,
    isOpen: false
  },
  {
    id: "5",
    name: "Specialty Medical Institute",
    address: "654 Specialist Drive, Medical Park",
    phone: "+1-555-0654",
    lat: 28.6050,
    lng: 77.2200,
    distance: 4.3,
    rating: 4.7,
    isOpen: true
  }
]

const FallbackHospitalMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 100) / 100
  }

  // Get user location and show nearby hospitals
  const findNearbyHospitals = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        
        // Calculate distances and sort hospitals
        const hospitalsWithDistance = sampleHospitals.map(hospital => ({
          ...hospital,
          distance: calculateDistance(
            location.lat,
            location.lng,
            hospital.lat,
            hospital.lng
          )
        })).sort((a, b) => a.distance - b.distance)
        
        setHospitals(hospitalsWithDistance)
        setStatus(`Found ${hospitalsWithDistance.length} nearby hospitals`)
        setLoading(false)
      },
      (error) => {
        setLoading(false)
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setError("Location access denied. Please enable location services.")
            break
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.")
            break
          case error.TIMEOUT:
            setError("Location request timed out.")
            break
          default:
            setError("An unknown error occurred while retrieving location.")
            break
        }
        
        // Show sample data even without location
        setHospitals(sampleHospitals)
        setStatus("Showing sample hospitals (location unavailable)")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Open location in external map
  const openInMaps = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`
    window.open(url, '_blank')
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Hospital Locator - Fallback Mode
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            onClick={findNearbyHospitals} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Find Hospitals
          </Button>
          {status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-800 font-medium text-sm">Fallback Mode Active</span>
          </div>
          <p className="text-yellow-700 text-sm">
            Google Maps is not available. Showing sample hospital data. 
            Click "View on Map" to open locations in your default map application.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        {/* Placeholder map area */}
        <div className="w-full h-96 rounded-lg border bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Interactive map unavailable</p>
            <p className="text-xs">Use "View on Map" buttons below to open locations</p>
          </div>
        </div>
        
        {hospitals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Nearby Hospitals</h3>
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-base">{hospital.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>
                      {hospital.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{hospital.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {hospital.distance && (
                          <Badge variant="outline" className="text-xs">
                            {hospital.distance} km away
                          </Badge>
                        )}
                        {hospital.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {hospital.rating}/5
                          </Badge>
                        )}
                        {hospital.isOpen !== undefined && (
                          <Badge 
                            variant={hospital.isOpen ? "default" : "destructive"} 
                            className="text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {hospital.isOpen ? "Open" : "Closed"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInMaps(hospital)}
                      className="ml-4 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Map
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FallbackHospitalMap