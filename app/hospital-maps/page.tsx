"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { ArrowLeft, Phone, AlertTriangle, MapPin, Navigation, Clock, Shield, Heart, Ambulance, Calendar, History } from "lucide-react"
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamically import the Leaflet Maps component to avoid SSR issues
const LeafletHospitalMap = dynamic(() => import('@/components/ui/leaflet-hospital-map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span className="ml-2">Loading Hospital Map...</span></div>
})

// Emergency contacts data
const emergencyContacts = [
  {
    id: "1",
    name: "National Emergency",
    number: "112",
    description: "All emergency services",
    icon: AlertTriangle,
    color: "bg-red-500 hover:bg-red-600"
  },
  {
    id: "2", 
    name: "Ambulance",
    number: "108",
    description: "Medical emergency",
    icon: Ambulance,
    color: "bg-blue-500 hover:bg-blue-600"
  },
  {
    id: "3",
    name: "Fire Service",
    number: "101",
    description: "Fire emergency",
    icon: AlertTriangle,
    color: "bg-orange-500 hover:bg-orange-600"
  },
  {
    id: "4",
    name: "Police",
    number: "100",
    description: "Police emergency",
    icon: Shield,
    color: "bg-indigo-500 hover:bg-indigo-600"
  }
]

// Sample nearby hospitals data
const nearbyHospitals = [
  {
    id: "1",
    name: "Sholinganallur Health Center",
    address: "OMR, Sholinganallur, Chennai",
    distance: "16.94 km",
    rating: 4.1,
    specialties: ["Primary Care", "Emergency", "Maternal Health", "Child Care"],
    phone: "+91-44-2450-9012",
    isOpen: true
  },
  {
    id: "2", 
    name: "Gleneagles Global Health City",
    address: "439, Cheran Nagar, Perumbakkam, Chennai",
    distance: "18.2 km",
    rating: 4.4,
    specialties: ["Multi-specialty", "Cardiology", "Oncology", "Emergency"],
    phone: "+91-44-4444-1234",
    isOpen: true
  },
  {
    id: "3",
    name: "Apollo Hospital Greams Road",
    address: "21, Greams Lane, Off Greams Road, Chennai",
    distance: "12.5 km", 
    rating: 4.5,
    specialties: ["Multi-specialty", "Cardiology", "Neurology", "Emergency"],
    phone: "+91-44-2829-3333",
    isOpen: true
  },
  {
    id: "4",
    name: "Fortis Malar Hospital",
    address: "52, 1st Main Road, Gandhi Nagar, Chennai",
    distance: "15.8 km",
    rating: 4.3,
    specialties: ["Orthopedics", "Oncology", "Emergency"],
    phone: "+91-44-4289-2222",
    isOpen: true
  }
]

export default function HospitalMapsPage() {
  const { user } = useAuth()
  const [selectedHospital, setSelectedHospital] = useState<any>(null)

  const handleEmergencyCall = (number: string) => {
    window.open(`tel:${number}`, '_self')
  }

  const handleHospitalCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const openInMaps = (hospital: any) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`
    window.open(url, '_blank')
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/chatbot">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Chatbot
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Hospital Locator & Emergency Services</h1>
                <p className="text-slate-600">Find nearby hospitals and access emergency services</p>
              </div>
              <div className="ml-auto">
                <Link href="/appointment-booking">
                <Button className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </Button>
              </Link>
              <Link href="/appointment-history">
                <Button variant="outline" size="sm" className="flex items-center gap-2 ml-2">
                  <Clock className="w-4 h-4" />
                  Appointment History
                </Button>
              </Link>
              </div>
            </div>
          </div>

          {/* Hospital Map Section */}
          <div className="mb-8">
            <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-slate-700">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                  Interactive Hospital Map
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Locate hospitals within 50km of your current location using OpenStreetMap
                </p>
              </CardHeader>
              <CardContent>
                <LeafletHospitalMap />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section: SOS Emergency (Left) and Nearby Hospitals (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SOS Emergency Section - Left Side */}
            <div>
              <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2 text-slate-700">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    SOS Emergency
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Quick access to emergency services - Tap to call immediately
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {emergencyContacts.map((contact) => {
                      const IconComponent = contact.icon
                      return (
                        <Button
                          key={contact.id}
                          onClick={() => handleEmergencyCall(contact.number)}
                          className={`${contact.color} text-white h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform`}
                        >
                          <IconComponent className="w-8 h-8" />
                          <div className="text-center">
                            <div className="font-bold text-lg">{contact.number}</div>
                            <div className="text-sm font-medium">{contact.name}</div>
                            <div className="text-xs opacity-90">{contact.description}</div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                  
                  {/* Emergency Tips */}
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Emergency Tips
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Stay calm and speak clearly</li>
                      <li>• Provide your exact location</li>
                      <li>• Describe the emergency briefly</li>
                      <li>• Follow the operator's instructions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nearby Hospitals Section - Right Side */}
            <div>
              <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2 text-slate-700">
                    <Heart className="w-6 h-6 text-blue-600" />
                    Nearby Hospitals
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Closest medical facilities in your area
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {nearbyHospitals.map((hospital) => (
                      <div key={hospital.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{hospital.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{hospital.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {hospital.distance}
                            </Badge>
                            {hospital.isOpen && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                Open
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-medium">{hospital.rating}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {hospital.specialties.slice(0, 2).map((specialty, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {hospital.specialties.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{hospital.specialties.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleHospitalCall(hospital.phone)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openInMaps(hospital)}
                            className="flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            Directions
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Refresh Location
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        24/7 Hospitals
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-xs text-slate-500">
            <p className="mb-2">Emergency services are available 24/7. For non-emergency medical advice, consult with healthcare professionals.</p>
            <p>Hospital data is updated regularly. Always verify hospital availability before visiting.</p>
          </footer>
        </div>
      </main>
    </ProtectedRoute>
  )
}