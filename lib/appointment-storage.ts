// Appointment storage utility functions

export interface Appointment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  department: string;
  reason: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

// Save appointment to local storage
export function saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment {
  // Get existing appointments
  const appointments = getAppointments();
  
  // Create new appointment with ID and timestamp
  const newAppointment: Appointment = {
    ...appointment,
    id: generateId(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  
  // Add to list and save
  appointments.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  return newAppointment;
}

// Get all appointments
export function getAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [];
  
  const appointmentsJson = localStorage.getItem('appointments');
  if (!appointmentsJson) return [];
  
  try {
    return JSON.parse(appointmentsJson);
  } catch (e) {
    console.error('Failed to parse appointments from localStorage', e);
    return [];
  }
}

// Update appointment status
export function updateAppointmentStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed'): boolean {
  const appointments = getAppointments();
  const index = appointments.findIndex(app => app.id === id);
  
  if (index === -1) return false;
  
  appointments[index].status = status;
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  return true;
}

// Delete appointment
export function deleteAppointment(id: string): boolean {
  const appointments = getAppointments();
  const filteredAppointments = appointments.filter(app => app.id !== id);
  
  if (filteredAppointments.length === appointments.length) return false;
  
  localStorage.setItem('appointments', JSON.stringify(filteredAppointments));
  return true;
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}