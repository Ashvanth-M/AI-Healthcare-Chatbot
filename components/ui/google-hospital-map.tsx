"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, AlertCircle, Phone, Loader2, Calendar } from "lucide-react"

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
  placeId: string
}

interface UserLocation {
  lat: number
  lng: number
}

declare global {
  interface Window {
    google: any
    initGoogleMap: () => void
  }
}

const GoogleHospitalMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [status, setStatus] = useState<string>("")
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const serviceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Load Google Maps API with fallback
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setMapLoaded(true)
        return
      }

      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        setError('Google Maps API key not configured. Using fallback mode.')
        setMapLoaded(false)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMap`
      script.async = true
      script.defer = true
      
      window.initGoogleMap = () => {
        setMapLoaded(true)
      }
      
      script.onerror = () => {
        setError('Failed to load Google Maps. Billing may not be enabled or API key is invalid.')
        setMapLoaded(false)
      }
      
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize map when loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [mapLoaded])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    const defaultLocation = { lat: 28.6139, lng: 77.2090 } // Delhi default
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    serviceRef.current = new window.google.maps.places.PlacesService(mapInstanceRef.current)
  }

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

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
  }

  // Add marker to map
  const addMarker = (position: { lat: number, lng: number }, title: string, isUser = false) => {
    if (!mapInstanceRef.current || !window.google) return

    const marker = new window.google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title,
      icon: isUser ? {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      } : {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="32" height="32">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            <rect x="10" y="6" width="4" height="8" fill="white"/>
            <rect x="8" y="8" width="8" height="4" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32),
      }
    })

    markersRef.current.push(marker)
    return marker
  }

  // Search for nearby hospitals using Google Places API
  const searchNearbyHospitals = useCallback((location: UserLocation) => {
    if (!serviceRef.current || !window.google) {
      setError('Google Maps service not available')
      return
    }

    setLoading(true)
    setError(null)
    clearMarkers()

    // Add user location marker
    addMarker(location, 'Your Location', true)

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 10000, // 10km radius
      keyword: 'hospital',
      type: ['hospital']
    }

    serviceRef.current.nearbySearch(request, (results: any[], status: any) => {
      setLoading(false)
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const hospitalData: Hospital[] = results.slice(0, 10).map((place: any, index: number) => {
          const hospital: Hospital = {
            id: place.place_id || `hospital-${index}`,
            name: place.name || 'Unknown Hospital',
            address: place.vicinity || place.formatted_address || 'Address not available',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating,
            isOpen: place.opening_hours?.open_now,
            placeId: place.place_id,
            distance: calculateDistance(
              location.lat, 
              location.lng, 
              place.geometry.location.lat(), 
              place.geometry.location.lng()
            )
          }

          // Add hospital marker
          const marker = addMarker(
            { lat: hospital.lat, lng: hospital.lng }, 
            hospital.name
          )

          // Add info window
          if (marker) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 250px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${hospital.name}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${hospital.address}</p>
                  <p style="margin: 0; font-size: 14px; color: #2563eb; font-weight: 500;">${hospital.distance} km away</p>
                  ${hospital.rating ? `<p style="margin: 4px 0 0 0; font-size: 14px;">⭐ ${hospital.rating}/5</p>` : ''}
                </div>
              `
            })

            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker)
            })
          }

          return hospital
        })

        // Sort by distance
        hospitalData.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        setHospitals(hospitalData)

        // Update status
        const closestDistance = hospitalData[0]?.distance || 0
        if (closestDistance <= 10) {
          setStatus(`Found ${hospitalData.length} hospitals within 10km`)
        } else {
          setStatus(`Found ${hospitalData.length} nearby hospitals`)
        }

        // Center map to show all markers
        if (hospitalData.length > 0) {
          const bounds = new window.google.maps.LatLngBounds()
          bounds.extend(new window.google.maps.LatLng(location.lat, location.lng))
          hospitalData.forEach(hospital => {
            bounds.extend(new window.google.maps.LatLng(hospital.lat, hospital.lng))
          })
          mapInstanceRef.current.fitBounds(bounds)
        }
      } else {
        setError('No hospitals found in your area. Please try again.')
        setStatus('No hospitals found nearby')
      }
    })
  }, [])

  // Get user location and search hospitals
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
        
        // Center map on user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location)
          mapInstanceRef.current.setZoom(13)
        }
        
        searchNearbyHospitals(location)
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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  if (!mapLoaded) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Hospital Locator - Google Maps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold text-blue-800 mb-2">To fix Google Maps API issues:</h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                  <li>Enable billing for your project</li>
                  <li>Enable Maps JavaScript API and Places API</li>
                  <li>Create an API key with proper restrictions</li>
                  <li>Update your .env.local file with the API key</li>
                </ol>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Retry Loading Google Maps
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading Google Maps...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Hospital Locator - Google Maps
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
            Near Me
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
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border"
          style={{ minHeight: '400px' }}
        />
        
        {hospitals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Nearby Hospitals</h3>
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{hospital.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{hospital.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                            {hospital.distance} km away
                          </Badge>
                          {hospital.rating && (
                            <Badge variant="secondary" className="text-xs">
                              ⭐ {hospital.rating}/5
                            </Badge>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="ml-auto"
                            onClick={() => window.location.href = `/appointment-booking?hospitalId=${hospital.id}&hospitalName=${encodeURIComponent(hospital.name)}&hospitalAddress=${encodeURIComponent(hospital.address)}`}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Book
                          </Button>
                          {hospital.isOpen !== undefined && (
                          <Badge 
                            variant={hospital.isOpen ? "default" : "destructive"} 
                            className="text-xs"
                          >
                            {hospital.isOpen ? "Open" : "Closed"}
                          </Badge>
                        )}
                      </div>
                    </div>
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

export default GoogleHospitalMap