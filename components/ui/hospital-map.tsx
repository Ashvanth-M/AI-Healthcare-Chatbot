"use client"

import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Phone, Clock, AlertCircle, Calendar as CalendarIcon } from "lucide-react"

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom hospital icon
const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="32" height="32">
      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
      <rect x="10" y="6" width="4" height="8" fill="white"/>
      <rect x="8" y="8" width="8" height="4" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// User location icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#2563eb" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  lat: number
  lng: number
  distance?: number
  type: string
  emergency: boolean
}

interface UserLocation {
  lat: number
  lng: number
}

// Component to handle map centering
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  
  return null
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const d = R * c // Distance in kilometers
  return Math.round(d * 100) / 100 // Round to 2 decimal places
}

// Comprehensive hospital data across major Indian cities - In production, this would come from a real API
const sampleHospitals: Hospital[] = [
  // Mumbai Hospitals
  {
    id: "1",
    name: "Sir H.N. Reliance Foundation Hospital",
    address: "Raja Ram Mohan Roy Rd, Prarthana Samaj, Girgaon, Mumbai, Maharashtra 400004",
    phone: "+91-22-3982-1000",
    lat: 18.9587,
    lng: 72.8197,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "2",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    address: "Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai, Maharashtra 400053",
    phone: "+91-22-4269-6969",
    lat: 19.1136,
    lng: 72.8697,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "3",
    name: "Lilavati Hospital",
    address: "A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050",
    phone: "+91-22-2675-1000",
    lat: 19.0596,
    lng: 72.8295,
    type: "Multi-specialty",
    emergency: true
  },
  
  // Delhi Hospitals
  {
    id: "4",
    name: "All India Institute of Medical Sciences (AIIMS)",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
    phone: "+91-11-2658-8500",
    lat: 28.5672,
    lng: 77.2100,
    type: "Government",
    emergency: true
  },
  {
    id: "5",
    name: "Delhi Heart Hospital",
    address: "Jagriti Enclave, Anand Vihar, Delhi 110092",
    phone: "+91-11-4225-5555",
    lat: 28.6532,
    lng: 77.3086,
    type: "Cardiac Specialty",
    emergency: true
  },
  {
    id: "6",
    name: "Fortis Memorial Research Institute",
    address: "Sector 44, Gurugram, Haryana 122002",
    phone: "+91-124-496-2200",
    lat: 28.4568,
    lng: 77.0725,
    type: "Multi-specialty",
    emergency: true
  },
  
  // Bangalore Hospitals
  {
    id: "7",
    name: "Bangalore Hospital",
    address: "202, Hosur Rd, Bommanahalli, Bengaluru, Karnataka 560068",
    phone: "+91-80-2668-9090",
    lat: 13.0068,
    lng: 77.5617,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "8",
    name: "Sagar Hospital",
    address: "KumaraSwamy Layout, Banashankari, Bengaluru, Karnataka 560078",
    phone: "+91-80-2692-2222",
    lat: 12.9279,
    lng: 77.5619,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "9",
    name: "Narayana Health City",
    address: "258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru, Karnataka 560099",
    phone: "+91-80-7122-2200",
    lat: 12.8628,
    lng: 77.6744,
    type: "Multi-specialty",
    emergency: true
  },
  
  // Hyderabad Hospitals
  {
    id: "10",
    name: "Apollo Hospital Jubilee Hills",
    address: "Road No 72, Film Nagar, Jubilee Hills, Hyderabad, Telangana 500033",
    phone: "+91-40-2360-7777",
    lat: 17.4239,
    lng: 78.4738,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "11",
    name: "Androbest Andrology Center",
    address: "Sai Nagar, LB Nagar, Hyderabad, Telangana 500074",
    phone: "+91-40-2424-2424",
    lat: 17.3616,
    lng: 78.5506,
    type: "Specialty",
    emergency: false
  },
  
  // Pune Hospitals
  {
    id: "12",
    name: "MJM Hospital",
    address: "Shivajinagar, Pune, Maharashtra 411005",
    phone: "+91-20-2553-3333",
    lat: 18.5243,
    lng: 73.8439,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "13",
    name: "Ruby Hall Clinic",
    address: "40, Sassoon Rd, near Pune Railway Station, Pune, Maharashtra 411001",
    phone: "+91-20-2612-6666",
    lat: 18.5314,
    lng: 73.8446,
    type: "Multi-specialty",
    emergency: true
  },
  
  // Kolkata Hospitals
  {
    id: "14",
    name: "Apollo Gleneagles Hospital",
    address: "58, Canal Circular Rd, Kadapara, Phool Bagan, Kolkata, West Bengal 700054",
    phone: "+91-33-2320-3040",
    lat: 22.5726,
    lng: 88.3639,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "15",
    name: "AMRI Hospital Salt Lake",
    address: "JC - 16 & 17, Sector III, Salt Lake City, Kolkata, West Bengal 700098",
    phone: "+91-33-6606-3800",
    lat: 22.5958,
    lng: 88.4497,
    type: "Multi-specialty",
    emergency: true
  },
  
  // Chennai Hospitals (keeping some original ones)
  {
    id: "16",
    name: "Apollo Hospital Greams Road",
    address: "21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006",
    phone: "+91-44-2829-3333",
    lat: 13.0569,
    lng: 80.2508,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "17",
    name: "Fortis Malar Hospital",
    address: "52, 1st Main Rd, Gandhi Nagar, Adyar, Chennai, Tamil Nadu 600020",
    phone: "+91-44-4289-2222",
    lat: 13.0067,
    lng: 80.2206,
    type: "Multi-specialty",
    emergency: true
  },
  
  // Additional cities
  {
    id: "18",
    name: "Aakrithi Hospital",
    address: "Vijayawada, Andhra Pradesh 520010",
    phone: "+91-866-248-8888",
    lat: 16.5120,
    lng: 80.6332,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "19",
    name: "Apollo BSR Hospital",
    address: "Bhilai Nagar, Chhattisgarh 490006",
    phone: "+91-788-298-8888",
    lat: 21.2163,
    lng: 81.3236,
    type: "Multi-specialty",
    emergency: true
  },
  {
    id: "20",
    name: "Government Medical College Hospital",
    address: "Sector 32, Chandigarh 160030",
    phone: "+91-172-274-6018",
    lat: 30.7333,
    lng: 76.7794,
    type: "Government",
    emergency: true
  }
]

export function HospitalMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]) // Default to Chennai

  const findNearbyHospitals = (userLat: number, userLng: number) => {
    // Calculate distances and sort by proximity
    const hospitalsWithDistance = sampleHospitals.map(hospital => ({
      ...hospital,
      distance: calculateDistance(userLat, userLng, hospital.lat, hospital.lng)
    })).sort((a, b) => a.distance! - b.distance!)

    // First try to find hospitals within 10km radius
    const nearbyHospitals = hospitalsWithDistance.filter(hospital => hospital.distance! <= 10)
    
    // If no hospitals found within 10km, expand to 50km radius
    if (nearbyHospitals.length === 0) {
      return hospitalsWithDistance.filter(hospital => hospital.distance! <= 50).slice(0, 10) // Limit to 10 hospitals
    }
    
    // Return hospitals within 10km, limited to 10 results
    return nearbyHospitals.slice(0, 10)
  }

  const handleNearMe = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newUserLocation = { lat: latitude, lng: longitude }
        
        setUserLocation(newUserLocation)
        setMapCenter([latitude, longitude])
        
        // Find nearby hospitals
        const nearbyHospitals = findNearbyHospitals(latitude, longitude)
        setHospitals(nearbyHospitals)
        setLoading(false)
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location."
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }
        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            Hospital Locator - GIS Feature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button 
              onClick={handleNearMe}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {loading ? "Finding Location..." : "Near Me"}
            </Button>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            {userLocation && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location detected • {hospitals.length} hospitals found {hospitals.length > 0 && hospitals[0].distance! <= 10 ? 'within 10km' : 'nearby'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <MapController center={mapCenter} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User location marker */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Hospital markers */}
              {hospitals.map((hospital) => (
                <Marker
                  key={hospital.id}
                  position={[hospital.lat, hospital.lng]}
                  icon={hospitalIcon}
                  eventHandlers={{
                    click: () => handleHospitalClick(hospital)
                  }}
                >
                  <Popup>
                    <div className="min-w-64">
                      <h3 className="font-semibold text-lg mb-2">{hospital.name}</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">{hospital.address}</p>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <a href={`tel:${hospital.phone}`} className="text-blue-600 hover:underline">
                            {hospital.phone}
                          </a>
                        </div>
                        {hospital.distance && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {hospital.distance} km away
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Badge variant="outline">{hospital.type}</Badge>
                          {hospital.emergency && (
                            <Badge variant="destructive">24/7 Emergency</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hospital Details Panel */}
      {selectedHospital && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              {selectedHospital.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Address</h4>
                  <p className="text-sm text-gray-600">{selectedHospital.address}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Contact</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <a 
                      href={`tel:${selectedHospital.phone}`} 
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {selectedHospital.phone}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedHospital.distance && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Distance</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium text-sm">
                        {selectedHospital.distance} km from your location
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Services</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{selectedHospital.type}</Badge>
                    {selectedHospital.emergency && (
                      <Badge variant="destructive">24/7 Emergency</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => window.open(`tel:${selectedHospital.phone}`, '_self')}
                className="w-full sm:w-auto"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Hospital
              </Button>
              <Button 
                onClick={() => window.location.href = `/appointment-booking?hospitalId=${selectedHospital.id}&hospitalName=${encodeURIComponent(selectedHospital.name)}&hospitalAddress=${encodeURIComponent(selectedHospital.address)}`}
                className="w-full sm:w-auto"
                variant="secondary"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to use:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Click "Near Me" to detect your location and find nearby hospitals</li>
                <li>• Click on hospital markers on the map to view details</li>
                <li>• View contact information and distance from your location</li>
                <li>• Call hospitals directly from the interface</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}