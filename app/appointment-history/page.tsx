"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ArrowLeft, Calendar, Clock, MapPin, Check, X, MoreHorizontal } from "lucide-react"
import Link from 'next/link'
import { format, parseISO } from "date-fns"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAppointments, updateAppointmentStatus, deleteAppointment, Appointment } from "@/lib/appointment-storage"
import { toast } from "sonner"

export default function AppointmentHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load appointments from local storage
    const loadAppointments = () => {
      try {
        const savedAppointments = getAppointments()
        // Sort by date (newest first)
        savedAppointments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setAppointments(savedAppointments)
      } catch (error) {
        console.error("Failed to load appointments", error)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  const handleStatusChange = (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    const success = updateAppointmentStatus(id, status)
    if (success) {
      setAppointments(prev => 
        prev.map(app => app.id === id ? { ...app, status } : app)
      )
      toast.success(`Appointment ${status} successfully`)
    } else {
      toast.error("Failed to update appointment status")
    }
  }

  const handleDelete = (id: string) => {
    const success = deleteAppointment(id)
    if (success) {
      setAppointments(prev => prev.filter(app => app.id !== id))
      toast.success("Appointment deleted successfully")
    } else {
      toast.error("Failed to delete appointment")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'completed':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
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
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Appointment History</h1>
                <p className="text-slate-600">View and manage your hospital appointments</p>
              </div>
            </div>
          </div>

          {/* Appointment List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>Loading appointments...</p>
                </CardContent>
              </Card>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-slate-500 mb-4">You don't have any appointments yet</p>
                  <Link href="/appointment-booking">
                    <Button>Book an Appointment</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              appointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <div className={`h-2 ${
                    appointment.status === 'confirmed' ? 'bg-green-500' : 
                    appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(appointment.status)}
                          <h3 className="font-medium">{appointment.hospitalName}</h3>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3" />
                          {appointment.hospitalAddress}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(appointment.date), "MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.time}
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">{appointment.department}</p>
                          <p className="text-sm text-slate-500 mt-1">{appointment.reason}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end md:self-center">
                        {appointment.status === 'confirmed' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(appointment.id, 'completed')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark Completed
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDelete(appointment.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {/* Book New Appointment Button */}
          {appointments.length > 0 && (
            <div className="mt-6 text-center">
              <Link href="/appointment-booking">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book New Appointment
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}