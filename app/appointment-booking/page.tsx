"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Check, AlertCircle, Hospital, History } from "lucide-react"
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from "date-fns"
import { toast } from "sonner"
import { saveAppointment } from "@/lib/appointment-storage"

// Available time slots
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", 
  "04:00 PM", "04:30 PM", "05:00 PM"
]

// Available departments
const DEPARTMENTS = [
  "General Medicine", "Cardiology", "Orthopedics", 
  "Pediatrics", "Gynecology", "Neurology",
  "Dermatology", "ENT", "Ophthalmology", "Dental"
]

function AppointmentBookingContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Form state
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("")
  const [department, setDepartment] = useState<string>("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([])

  // Initialize form with user data and query params
  useEffect(() => {
    // Set user data if available
    if (user) {
      setName(user.firstName ? `${user.firstName} ${user.lastName}` : "")
      setEmail(user.email || "")
    }

    // Check if hospital ID was passed in URL
    const hospitalId = searchParams.get('hospitalId')
    const hospitalName = searchParams.get('hospitalName')
    
    if (hospitalId && hospitalName) {
      setSelectedHospital({
        id: hospitalId,
        name: hospitalName,
        address: searchParams.get('hospitalAddress') || "",
      })
    }

    // Fetch nearby hospitals (in a real app, this would be an API call)
    // For demo, we'll use sample data
    setNearbyHospitals([
      {
        id: "1",
        name: "Sholinganallur Health Center",
        address: "OMR, Sholinganallur, Chennai",
        distance: "16.94 km",
      },
      {
        id: "2", 
        name: "Gleneagles Global Health City",
        address: "439, Cheran Nagar, Perumbakkam, Chennai",
        distance: "18.2 km",
      },
      {
        id: "3",
        name: "Apollo Hospital Greams Road",
        address: "21, Greams Lane, Off Greams Road, Chennai",
        distance: "12.5 km", 
      },
      {
        id: "4",
        name: "Fortis Malar Hospital",
        address: "52, 1st Main Road, Gandhi Nagar, Chennai",
        distance: "15.8 km",
      }
    ])
  }, [user, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!selectedHospital || !name || !phone || !email || !date || !time || !department || !reason) {
      toast.error("Please fill in all required fields")
      return
    }
    
    setLoading(true)
    
    try {
      // Save appointment to local storage
      const appointmentData = {
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        hospitalAddress: selectedHospital.address,
        patientName: name,
        patientPhone: phone,
        patientEmail: email,
        date: format(date as Date, "yyyy-MM-dd"),
        time,
        department,
        reason
      }
      
      // Save to local storage
      saveAppointment(appointmentData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      toast.success("Appointment booked successfully!")
      
      // Reset form after success
      setTimeout(() => {
        setDate(undefined)
        setTime("")
        setDepartment("")
        setReason("")
        setSuccess(false)
      }, 3000)
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/hospital-maps">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Hospital Maps
                </Button>
              </Link>
              <Link href="/appointment-history">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  View Appointment History
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Hospital Appointment Booking</h1>
                <p className="text-slate-600">Schedule an appointment at your preferred hospital</p>
              </div>
            </div>
          </div>

          {success ? (
            <Card className="bg-white/95 backdrop-blur-sm border-green-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-700 mb-2">Appointment Confirmed!</h2>
                  <p className="text-green-600 mb-6 max-w-md">
                    Your appointment has been successfully booked at {selectedHospital?.name} for {date && format(date, "MMMM d, yyyy")} at {time}.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={() => setSuccess(false)}>Book Another Appointment</Button>
                    <Button variant="outline" onClick={() => router.push('/hospital-maps')}>
                      Return to Hospital Maps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Hospital Selection */}
                <div className="md:col-span-1">
                  <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg h-full">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Hospital className="h-5 w-5 text-blue-600" />
                        Select Hospital
                      </CardTitle>
                      <CardDescription>
                        Choose from nearby hospitals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {nearbyHospitals.map((hospital) => (
                          <div 
                            key={hospital.id}
                            onClick={() => setSelectedHospital(hospital)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedHospital?.id === hospital.id 
                                ? "border-blue-500 bg-blue-50" 
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{hospital.name}</h4>
                                <p className="text-xs text-gray-600 mt-1">{hospital.address}</p>
                              </div>
                              {selectedHospital?.id === hospital.id && (
                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {hospital.distance}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Appointment Form */}
                <div className="md:col-span-2">
                  <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        Appointment Details
                      </CardTitle>
                      <CardDescription>
                        Fill in your details to book an appointment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-sm text-slate-700">Personal Information</h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input 
                                id="name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Enter your full name"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input 
                                id="phone" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="Enter your phone number"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email"
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              placeholder="Enter your email address"
                              required
                            />
                          </div>
                        </div>
                        
                        {/* Appointment Information */}
                        <div className="space-y-4 pt-2">
                          <h3 className="font-medium text-sm text-slate-700">Appointment Information</h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="date">Appointment Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Select a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => 
                                      date < new Date() || 
                                      date > new Date(new Date().setMonth(new Date().getMonth() + 2))
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="time">Appointment Time</Label>
                              <Select value={time} onValueChange={setTime}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a time slot" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                      {slot}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="department">Department/Specialty</Label>
                            <Select value={department} onValueChange={setDepartment}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department or specialty" />
                              </SelectTrigger>
                              <SelectContent>
                                {DEPARTMENTS.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Visit</Label>
                            <Textarea 
                              id="reason" 
                              value={reason} 
                              onChange={(e) => setReason(e.target.value)} 
                              placeholder="Briefly describe your symptoms or reason for appointment"
                              rows={3}
                              required
                            />
                          </div>
                        </div>
                        
                        {/* Submit Button */}
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || !selectedHospital}
                          >
                            {loading ? "Booking Appointment..." : "Book Appointment"}
                          </Button>
                          
                          {!selectedHospital && (
                            <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              Please select a hospital to continue
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}

export default function AppointmentBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading appointment booking...</p>
        </div>
      </div>
    }>
      <AppointmentBookingContent />
    </Suspense>
  )
}