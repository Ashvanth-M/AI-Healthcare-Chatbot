"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Phone, Clock, AlertCircle, Loader2, ExternalLink, Siren } from "lucide-react"

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
  type: string
  services?: string[]
}

interface AmbulanceService {
  id: string
  name: string
  address: string
  phone: string
  lat: number
  lng: number
  distance?: number
  type: string
  responseTime?: string
  availability: string
}

interface UserLocation {
  lat: number
  lng: number
}

// Ambulance Services Database for major Indian cities
const ambulanceDatabase: AmbulanceService[] = [
  // Delhi Ambulance Services
  {
    id: "amb1",
    name: "Delhi Emergency Services (108)",
    address: "Central Delhi Emergency Hub",
    phone: "108",
    lat: 28.6139,
    lng: 77.2090,
    type: "Government",
    responseTime: "8-12 mins",
    availability: "24/7"
  },
  {
    id: "amb2",
    name: "CATS Ambulance Delhi",
    address: "Connaught Place, New Delhi",
    phone: "+91-11-4142-4142",
    lat: 28.6315,
    lng: 77.2167,
    type: "Private",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  {
    id: "amb3",
    name: "Ziqitza Healthcare (ZHL)",
    address: "Karol Bagh, New Delhi",
    phone: "+91-11-4040-4040",
    lat: 28.6507,
    lng: 77.1909,
    type: "Private",
    responseTime: "12-18 mins",
    availability: "24/7"
  },
  {
    id: "amb4",
    name: "Red Cross Ambulance Delhi",
    address: "Red Cross Bhawan, New Delhi",
    phone: "+91-11-2371-6441",
    lat: 28.6289,
    lng: 77.2065,
    type: "NGO",
    responseTime: "15-20 mins",
    availability: "24/7"
  },
  {
    id: "amb5",
    name: "Fortis Ambulance Service",
    address: "Shalimar Bagh, New Delhi",
    phone: "+91-11-4277-6222",
    lat: 28.7196,
    lng: 77.1636,
    type: "Private",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  // Mumbai Ambulance Services
  {
    id: "amb6",
    name: "Mumbai Emergency Services (108)",
    address: "Central Mumbai Emergency Hub",
    phone: "108",
    lat: 19.0760,
    lng: 72.8777,
    type: "Government",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  {
    id: "amb7",
    name: "Dial4242 Ambulance",
    address: "Bandra West, Mumbai",
    phone: "+91-22-4242-4242",
    lat: 19.0596,
    lng: 72.8295,
    type: "Private",
    responseTime: "12-18 mins",
    availability: "24/7"
  },
  {
    id: "amb8",
    name: "Kokilaben Hospital Ambulance",
    address: "Andheri West, Mumbai",
    phone: "+91-22-4269-6969",
    lat: 19.1136,
    lng: 72.8697,
    type: "Private",
    responseTime: "8-12 mins",
    availability: "24/7"
  },
  {
    id: "amb9",
    name: "Lilavati Hospital Ambulance",
    address: "Bandra West, Mumbai",
    phone: "+91-22-2675-1000",
    lat: 19.0596,
    lng: 72.8295,
    type: "Private",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  // Bangalore Ambulance Services
  {
    id: "amb10",
    name: "Karnataka Emergency Services (108)",
    address: "Central Bangalore Emergency Hub",
    phone: "108",
    lat: 12.9716,
    lng: 77.5946,
    type: "Government",
    responseTime: "8-12 mins",
    availability: "24/7"
  },
  {
    id: "amb11",
    name: "Manipal Hospital Ambulance",
    address: "Airport Road, Bangalore",
    phone: "+91-80-2502-4444",
    lat: 12.9716,
    lng: 77.5946,
    type: "Private",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  {
    id: "amb12",
    name: "Apollo Hospital Ambulance",
    address: "Bannerghatta Road, Bangalore",
    phone: "+91-80-2630-0300",
    lat: 12.9010,
    lng: 77.5963,
    type: "Private",
    responseTime: "12-18 mins",
    availability: "24/7"
  },
  {
    id: "amb13",
    name: "MedCabs Ambulance Bangalore",
    address: "Koramangala, Bangalore",
    phone: "+91-80-6767-6767",
    lat: 12.9279,
    lng: 77.6271,
    type: "Private",
    responseTime: "8-12 mins",
    availability: "24/7"
  },
  // Chennai Ambulance Services
  {
    id: "amb14",
    name: "Tamil Nadu Emergency Services (108)",
    address: "Central Chennai Emergency Hub",
    phone: "108",
    lat: 13.0827,
    lng: 80.2707,
    type: "Government",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  {
    id: "amb15",
    name: "Apollo Hospital Ambulance Chennai",
    address: "Greams Lane, Chennai",
    phone: "+91-44-2829-3333",
    lat: 13.0827,
    lng: 80.2707,
    type: "Private",
    responseTime: "8-12 mins",
    availability: "24/7"
  },
  {
    id: "amb16",
    name: "Fortis Malar Ambulance",
    address: "Adyar, Chennai",
    phone: "+91-44-4289-2222",
    lat: 13.0067,
    lng: 80.2206,
    type: "Private",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  {
    id: "amb17",
    name: "MIOT Ambulance Service",
    address: "Manapakkam, Chennai",
    phone: "+91-44-2249-7777",
    lat: 13.0358,
    lng: 80.1766,
    type: "Private",
    responseTime: "12-18 mins",
    availability: "24/7"
  },
  // Hyderabad Ambulance Services
  {
    id: "amb18",
    name: "Telangana Emergency Services (108)",
    address: "Central Hyderabad Emergency Hub",
    phone: "108",
    lat: 17.4065,
    lng: 78.4772,
    type: "Government",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  {
    id: "amb19",
    name: "Apollo Hospital Ambulance Hyderabad",
    address: "Jubilee Hills, Hyderabad",
    phone: "+91-40-2360-7777",
    lat: 17.4065,
    lng: 78.4772,
    type: "Private",
    responseTime: "8-12 mins",
    availability: "24/7"
  },
  {
    id: "amb20",
    name: "CARE Hospital Ambulance",
    address: "Banjara Hills, Hyderabad",
    phone: "+91-40-6165-6565",
    lat: 17.4126,
    lng: 78.4071,
    type: "Private",
    responseTime: "10-15 mins",
    availability: "24/7"
  },
  // Kolkata Ambulance Services
  {
    id: "amb21",
    name: "West Bengal Emergency Services (108)",
    address: "Central Kolkata Emergency Hub",
    phone: "108",
    lat: 22.5726,
    lng: 88.3639,
    type: "Government",
    responseTime: "12-18 mins",
    availability: "24/7"
  },
  {
    id: "amb22",
    name: "Apollo Gleneagles Ambulance",
    address: "Canal Circular Road, Kolkata",
    phone: "+91-33-2320-3040",
    lat: 22.5726,
    lng: 88.3639,
    type: "Private",
    responseTime: "10-15 mins",
    availability: "24/7"
  }
]

// Comprehensive medical facilities database including hospitals, clinics, and health centers
const hospitalDatabase: Hospital[] = [
  // Delhi - Major Hospitals
  {
    id: "1",
    name: "All India Institute of Medical Sciences (AIIMS)",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
    phone: "+91-11-2658-8500",
    lat: 28.5672,
    lng: 77.2100,
    rating: 4.8,
    isOpen: true,
    type: "Government",
    services: ["Emergency", "Cardiology", "Neurology", "Oncology", "Surgery"]
  },
  {
    id: "2",
    name: "Fortis Hospital Shalimar Bagh",
    address: "A Block, Shalimar Bagh, New Delhi",
    phone: "+91-11-4277-6222",
    lat: 28.7196,
    lng: 77.1636,
    rating: 4.5,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Orthopedics", "Gastroenterology"]
  },
  {
    id: "3",
    name: "Max Super Speciality Hospital",
    address: "1 Press Enclave Road, Saket, New Delhi",
    phone: "+91-11-2651-5050",
    lat: 28.5244,
    lng: 77.2066,
    rating: 4.6,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Oncology", "Pediatrics"]
  },
  {
    id: "4",
    name: "Apollo Hospital",
    address: "Mathura Road, Sarita Vihar, New Delhi",
    phone: "+91-11-2692-5858",
    lat: 28.5355,
    lng: 77.2951,
    rating: 4.4,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Transplant", "Cancer Care"]
  },
  {
    id: "5",
    name: "Sir Ganga Ram Hospital",
    address: "Rajinder Nagar, New Delhi",
    phone: "+91-11-2575-0000",
    lat: 28.6358,
    lng: 77.1910,
    rating: 4.3,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Nephrology", "Gastroenterology", "Cardiology"]
  },
  {
    id: "6",
    name: "Safdarjung Hospital",
    address: "Ansari Nagar West, New Delhi",
    phone: "+91-11-2673-0000",
    lat: 28.5678,
    lng: 77.2089,
    rating: 4.0,
    isOpen: true,
    type: "Government",
    services: ["Emergency", "General Medicine", "Surgery", "Pediatrics"]
  },
  {
    id: "7",
    name: "BLK Super Speciality Hospital",
    address: "Pusa Road, Rajinder Nagar, New Delhi",
    phone: "+91-11-3040-3040",
    lat: 28.6441,
    lng: 77.1910,
    rating: 4.2,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Oncology", "Cardiology", "Neurology"]
  },
  {
    id: "8",
    name: "Indraprastha Apollo Hospital",
    address: "Mathura Road, Sarita Vihar, New Delhi",
    phone: "+91-11-7179-1090",
    lat: 28.5355,
    lng: 77.2951,
    rating: 4.5,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Heart Surgery", "Transplant", "Cancer Care"]
  },
  // Delhi - Local Clinics and Health Centers
  {
    id: "101",
    name: "Lajpat Nagar Polyclinic",
    address: "Central Market, Lajpat Nagar II, New Delhi",
    phone: "+91-11-2984-5678",
    lat: 28.5677,
    lng: 77.2436,
    rating: 4.1,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Pediatrics", "Gynecology", "Dermatology"]
  },
  {
    id: "102",
    name: "Karol Bagh Medical Center",
    address: "Ajmal Khan Road, Karol Bagh, New Delhi",
    phone: "+91-11-2575-1234",
    lat: 28.6519,
    lng: 77.1909,
    rating: 4.0,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Orthopedics", "ENT", "Eye Care"]
  },
  {
    id: "103",
    name: "Connaught Place Health Clinic",
    address: "Block A, Connaught Place, New Delhi",
    phone: "+91-11-2341-5678",
    lat: 28.6315,
    lng: 77.2167,
    rating: 3.9,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Emergency Care", "Vaccination", "Health Checkup"]
  },
  {
    id: "104",
    name: "Rohini Sector 7 Clinic",
    address: "Sector 7, Rohini, New Delhi",
    phone: "+91-11-2757-8901",
    lat: 28.7041,
    lng: 77.1025,
    rating: 4.2,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Pediatrics", "Physiotherapy", "Lab Services"]
  },
  {
    id: "105",
    name: "Dwarka Primary Health Center",
    address: "Sector 12, Dwarka, New Delhi",
    phone: "+91-11-2808-9012",
    lat: 28.5921,
    lng: 77.0460,
    rating: 3.8,
    isOpen: true,
    type: "Government",
    services: ["Primary Care", "Maternal Health", "Child Care", "Immunization"]
  },
  {
    id: "106",
    name: "Janakpuri Family Clinic",
    address: "Block C, Janakpuri, New Delhi",
    phone: "+91-11-2559-3456",
    lat: 28.6219,
    lng: 77.0855,
    rating: 4.0,
    isOpen: true,
    type: "Clinic",
    services: ["Family Medicine", "Diabetes Care", "Hypertension", "General Surgery"]
  },
  {
    id: "107",
    name: "Vasant Kunj Medical Center",
    address: "Pocket A, Vasant Kunj, New Delhi",
    phone: "+91-11-2613-7890",
    lat: 28.5244,
    lng: 77.1594,
    rating: 4.1,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Cardiology", "Pulmonology", "Gastroenterology"]
  },
  {
    id: "108",
    name: "Mayur Vihar Community Health Center",
    address: "Phase 1, Mayur Vihar, New Delhi",
    phone: "+91-11-2279-4567",
    lat: 28.6127,
    lng: 77.2773,
    rating: 3.7,
    isOpen: true,
    type: "Government",
    services: ["Primary Care", "Emergency", "Dental Care", "Eye Care"]
  },
  // Mumbai Hospitals
  {
    id: "9",
    name: "Tata Memorial Hospital",
    address: "Dr E Borges Road, Parel, Mumbai",
    phone: "+91-22-2417-7000",
    lat: 19.0176,
    lng: 72.8562,
    rating: 4.7,
    isOpen: true,
    type: "Government",
    services: ["Emergency", "Oncology", "Cancer Research", "Surgery"]
  },
  {
    id: "10",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    address: "Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai",
    phone: "+91-22-4269-6969",
    lat: 19.1136,
    lng: 72.8697,
    rating: 4.6,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Oncology", "Transplant"]
  },
  {
    id: "11",
    name: "Lilavati Hospital",
    address: "A-791, Bandra Reclamation, Bandra West, Mumbai",
    phone: "+91-22-2675-1000",
    lat: 19.0596,
    lng: 72.8295,
    rating: 4.4,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Orthopedics", "Neurology"]
  },
  {
    id: "12",
    name: "Hinduja Hospital",
    address: "Veer Savarkar Marg, Mahim, Mumbai",
    phone: "+91-22-2445-2222",
    lat: 19.0330,
    lng: 72.8397,
    rating: 4.3,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Gastroenterology", "Nephrology"]
  },
  // Mumbai - Local Clinics and Health Centers
  {
    id: "201",
    name: "Bandra Family Clinic",
    address: "Hill Road, Bandra West, Mumbai",
    phone: "+91-22-2640-1234",
    lat: 19.0544,
    lng: 72.8294,
    rating: 4.0,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Pediatrics", "Gynecology", "Vaccination"]
  },
  {
    id: "202",
    name: "Andheri Medical Center",
    address: "S.V. Road, Andheri West, Mumbai",
    phone: "+91-22-2673-5678",
    lat: 19.1197,
    lng: 72.8464,
    rating: 3.9,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Dermatology", "ENT", "Physiotherapy"]
  },
  {
    id: "203",
    name: "Dadar Polyclinic",
    address: "Gokhale Road, Dadar West, Mumbai",
    phone: "+91-22-2430-9012",
    lat: 19.0178,
    lng: 72.8478,
    rating: 4.1,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Cardiology", "Diabetes Care", "Lab Services"]
  },
  {
    id: "204",
    name: "Powai Community Health Center",
    address: "Hiranandani Gardens, Powai, Mumbai",
    phone: "+91-22-2570-3456",
    lat: 19.1197,
    lng: 72.9089,
    rating: 3.8,
    isOpen: true,
    type: "Government",
    services: ["Primary Care", "Maternal Health", "Child Care", "Emergency"]
  },
  {
    id: "205",
    name: "Malad West Clinic",
    address: "Link Road, Malad West, Mumbai",
    phone: "+91-22-2880-7890",
    lat: 19.1864,
    lng: 72.8493,
    rating: 4.0,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Orthopedics", "Eye Care", "Dental Care"]
  },
  {
    id: "206",
    name: "Thane Medical Center",
    address: "Godbunder Road, Thane West, Mumbai",
    phone: "+91-22-2534-1234",
    lat: 19.2183,
    lng: 72.9781,
    rating: 4.2,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Neurology", "Gastroenterology", "Surgery"]
  },
  // Bangalore Hospitals
  {
    id: "13",
    name: "Manipal Hospital",
    address: "98, Rustum Bagh, Airport Road, Bangalore",
    phone: "+91-80-2502-4444",
    lat: 12.9716,
    lng: 77.5946,
    rating: 4.5,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Oncology"]
  },
  {
    id: "14",
    name: "Apollo Hospital Bangalore",
    address: "154/11, Bannerghatta Road, Opposite IIM-B, Bangalore",
    phone: "+91-80-2630-0300",
    lat: 12.9010,
    lng: 77.5963,
    rating: 4.4,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Heart Surgery", "Transplant", "Cancer Care"]
  },
  {
    id: "15",
    name: "Fortis Hospital Bangalore",
    address: "14, Cunningham Road, Bangalore",
    phone: "+91-80-6621-4444",
    lat: 12.9716,
    lng: 77.5946,
    rating: 4.3,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Orthopedics", "Neurology"]
  },
  // Bangalore - Local Clinics and Health Centers
  {
    id: "301",
    name: "Koramangala Family Clinic",
    address: "80 Feet Road, Koramangala, Bangalore",
    phone: "+91-80-2553-1234",
    lat: 12.9279,
    lng: 77.6271,
    rating: 4.1,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Pediatrics", "Dermatology", "Lab Services"]
  },
  {
    id: "302",
    name: "Indiranagar Medical Center",
    address: "100 Feet Road, Indiranagar, Bangalore",
    phone: "+91-80-2520-5678",
    lat: 12.9719,
    lng: 77.6412,
    rating: 4.0,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Gynecology", "ENT", "Physiotherapy"]
  },
  {
    id: "303",
    name: "Jayanagar Polyclinic",
    address: "9th Block, Jayanagar, Bangalore",
    phone: "+91-80-2665-9012",
    lat: 12.9254,
    lng: 77.5831,
    rating: 3.9,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Cardiology", "Diabetes Care", "Eye Care"]
  },
  {
    id: "304",
    name: "Whitefield Community Health Center",
    address: "ITPL Main Road, Whitefield, Bangalore",
    phone: "+91-80-2845-3456",
    lat: 12.9698,
    lng: 77.7500,
    rating: 3.8,
    isOpen: true,
    type: "Government",
    services: ["Primary Care", "Maternal Health", "Child Care", "Emergency"]
  },
  {
    id: "305",
    name: "BTM Layout Clinic",
    address: "16th Main, BTM Layout, Bangalore",
    phone: "+91-80-2678-7890",
    lat: 12.9165,
    lng: 77.6101,
    rating: 4.2,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Orthopedics", "Neurology", "Dental Care"]
  },
  {
    id: "306",
    name: "Electronic City Medical Center",
    address: "Hosur Road, Electronic City, Bangalore",
    phone: "+91-80-2783-1234",
    lat: 12.8456,
    lng: 77.6603,
    rating: 4.0,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Emergency", "Lab Services", "Vaccination"]
  },
  // Chennai Hospitals
  {
    id: "16",
    name: "Apollo Hospital Chennai",
    address: "21, Greams Lane, Off Greams Road, Chennai",
    phone: "+91-44-2829-3333",
    lat: 13.0827,
    lng: 80.2707,
    rating: 4.6,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Transplant", "Cancer Care"]
  },
  {
    id: "17",
    name: "Fortis Malar Hospital",
    address: "52, 1st Main Road, Gandhi Nagar, Adyar, Chennai",
    phone: "+91-44-4289-2222",
    lat: 13.0067,
    lng: 80.2206,
    rating: 4.4,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Orthopedics"]
  },
  {
    id: "21",
    name: "MIOT International",
    address: "4/112, Mount Poonamallee Road, Manapakkam, Chennai",
    phone: "+91-44-2249-7777",
    lat: 13.0358,
    lng: 80.1766,
    rating: 4.5,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Orthopedics", "Cardiology", "Neurology", "Transplant"]
  },
  {
    id: "22",
    name: "Sri Ramachandra Medical Centre",
    address: "No.1, Ramachandra Nagar, Porur, Chennai",
    phone: "+91-44-4592-8592",
    lat: 13.0358,
    lng: 80.1766,
    rating: 4.3,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Gastroenterology"]
  },
  {
    id: "23",
    name: "Gleneagles Global Health City",
    address: "439, Cheran Nagar, Perumbakkam, Chennai",
    phone: "+91-44-4444-1234",
    lat: 12.9041,
    lng: 80.2316,
    rating: 4.4,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Multi-organ Transplant", "Cardiology", "Oncology"]
  },
  {
    id: "24",
    name: "Vijaya Hospital",
    address: "180, NSK Salai, Vadapalani, Chennai",
    phone: "+91-44-2361-2323",
    lat: 13.0501,
    lng: 80.2060,
    rating: 4.2,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Orthopedics"]
  },
  {
    id: "25",
    name: "Stanley Medical College Hospital",
    address: "Old Jail Road, Royapuram, Chennai",
    phone: "+91-44-2530-5000",
    lat: 13.1067,
    lng: 80.2906,
    rating: 4.0,
    isOpen: true,
    type: "Government",
    services: ["Emergency", "General Medicine", "Surgery", "Pediatrics"]
  },
  {
    id: "26",
    name: "Madras Medical College Hospital",
    address: "Park Town, Chennai",
    phone: "+91-44-2530-8000",
    lat: 13.0878,
    lng: 80.2785,
    rating: 3.9,
    isOpen: true,
    type: "Government",
    services: ["Emergency", "General Medicine", "Surgery", "Trauma Care"]
  },
  {
    id: "27",
    name: "Kauvery Hospital",
    address: "199, Luz Church Road, Mylapore, Chennai",
    phone: "+91-44-4000-6000",
    lat: 13.0339,
    lng: 80.2619,
    rating: 4.3,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Critical Care"]
  },
  {
    id: "28",
    name: "Dr. Kamakshi Memorial Hospital",
    address: "1, Radial Road, Pallikaranai, Chennai",
    phone: "+91-44-2747-4747",
    lat: 12.9249,
    lng: 80.2065,
    rating: 4.1,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Orthopedics", "Gastroenterology"]
  },
  // Chennai - Local Clinics and Health Centers
  {
    id: "401",
    name: "T. Nagar Family Clinic",
    address: "Usman Road, T. Nagar, Chennai",
    phone: "+91-44-2434-1234",
    lat: 13.0418,
    lng: 80.2341,
    rating: 4.0,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Pediatrics", "Gynecology", "Lab Services"]
  },
  {
    id: "402",
    name: "Adyar Medical Center",
    address: "Lattice Bridge Road, Adyar, Chennai",
    phone: "+91-44-2441-5678",
    lat: 13.0067,
    lng: 80.2206,
    rating: 4.1,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Cardiology", "Dermatology", "Physiotherapy"]
  },
  {
    id: "403",
    name: "Velachery Polyclinic",
    address: "Velachery Main Road, Chennai",
    phone: "+91-44-2266-9012",
    lat: 12.9815,
    lng: 80.2209,
    rating: 3.9,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "ENT", "Eye Care", "Dental Care"]
  },
  {
    id: "404",
    name: "Anna Nagar Community Health Center",
    address: "2nd Avenue, Anna Nagar, Chennai",
    phone: "+91-44-2615-3456",
    lat: 13.0850,
    lng: 80.2101,
    rating: 3.8,
    isOpen: true,
    type: "Government",
    services: ["Primary Care", "Maternal Health", "Child Care", "Emergency"]
  },
  {
    id: "405",
    name: "Tambaram Medical Center",
    address: "GST Road, Tambaram, Chennai",
    phone: "+91-44-2271-7890",
    lat: 12.9249,
    lng: 80.1000,
    rating: 4.0,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Orthopedics", "Neurology", "Emergency"]
  },
  {
    id: "406",
    name: "Porur Family Clinic",
    address: "Trunk Road, Porur, Chennai",
    phone: "+91-44-2476-1234",
    lat: 13.0358,
    lng: 80.1566,
    rating: 4.2,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Pediatrics", "Vaccination", "Lab Services"]
  },
  {
    id: "407",
    name: "Chrompet Medical Center",
    address: "GST Road, Chrompet, Chennai",
    phone: "+91-44-2226-5678",
    lat: 12.9516,
    lng: 80.1462,
    rating: 3.9,
    isOpen: true,
    type: "Clinic",
    services: ["General Medicine", "Gynecology", "ENT", "Physiotherapy"]
  },
  {
    id: "408",
    name: "Sholinganallur Health Center",
    address: "OMR, Sholinganallur, Chennai",
    phone: "+91-44-2450-9012",
    lat: 12.9010,
    lng: 80.2279,
    rating: 4.1,
    isOpen: true,
    type: "Government",
    services: ["Primary Care", "Emergency", "Maternal Health", "Child Care"]
  },
  // Hyderabad Hospitals
  {
    id: "18",
    name: "Apollo Hospital Hyderabad",
    address: "Road No. 72, Opp. Bharatiya Vidya Bhavan, Film Nagar, Jubilee Hills, Hyderabad",
    phone: "+91-40-2360-7777",
    lat: 17.4065,
    lng: 78.4772,
    rating: 4.5,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Transplant", "Oncology"]
  },
  {
    id: "19",
    name: "CARE Hospital Hyderabad",
    address: "Road No. 1, Banjara Hills, Hyderabad",
    phone: "+91-40-6165-6565",
    lat: 17.4126,
    lng: 78.4071,
    rating: 4.3,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Gastroenterology"]
  },
  // Kolkata Hospitals
  {
    id: "20",
    name: "Apollo Gleneagles Hospital",
    address: "58, Canal Circular Road, Kadapara, Phool Bagan, Kolkata",
    phone: "+91-33-2320-3040",
    lat: 22.5726,
    lng: 88.3639,
    rating: 4.4,
    isOpen: true,
    type: "Private",
    services: ["Emergency", "Cardiology", "Neurology", "Oncology"]
  }
]

declare global {
  interface Window {
    L: any
  }
}

const LeafletHospitalMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [ambulances, setAmbulances] = useState<AmbulanceService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [status, setStatus] = useState<string>("")
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      if (window.L) {
        setMapLoaded(true)
        return
      }

      try {
        // Load CSS
        const cssLink = document.createElement('link')
        cssLink.rel = 'stylesheet'
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        cssLink.crossOrigin = ''
        document.head.appendChild(cssLink)

        // Load JS
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = ''
        
        script.onload = () => {
          setMapLoaded(true)
        }
        
        script.onerror = () => {
          setError('Failed to load Leaflet map library')
        }
        
        document.head.appendChild(script)
      } catch (err) {
        setError('Error loading map resources')
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map when loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [mapLoaded])

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return

    const defaultLocation: [number, number] = [28.6139, 77.2090] // Delhi default
    
    mapInstanceRef.current = window.L.map(mapRef.current).setView(defaultLocation, 11)

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)
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
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker)
      }
    })
    markersRef.current = []
  }

  // Add marker to map
  const addMarker = (position: [number, number], title: string, isUser = false, hospital?: Hospital) => {
    if (!mapInstanceRef.current || !window.L) return

    const icon = isUser 
      ? window.L.divIcon({
          html: '<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          className: 'custom-div-icon',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      : window.L.divIcon({
          html: '<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">H</div>',
          className: 'custom-div-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })

    const marker = window.L.marker(position, { icon }).addTo(mapInstanceRef.current)

    if (hospital) {
      const popupContent = `
        <div style="min-width: 250px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">${hospital.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${hospital.address}</p>
          ${hospital.phone ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;"><strong>Phone:</strong> ${hospital.phone}</p>` : ''}
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #2563eb; font-weight: 500;">${hospital.distance} km away</p>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
            <span style="background: #e5e7eb; padding: 2px 6px; border-radius: 12px; font-size: 12px;">${hospital.type}</span>
            ${hospital.rating ? `<span style="background: #fef3c7; padding: 2px 6px; border-radius: 12px; font-size: 12px;">⭐ ${hospital.rating}/5</span>` : ''}
            <span style="background: ${hospital.isOpen ? '#d1fae5' : '#fee2e2'}; padding: 2px 6px; border-radius: 12px; font-size: 12px; color: ${hospital.isOpen ? '#065f46' : '#991b1b'};">${hospital.isOpen ? 'Open' : 'Closed'}</span>
          </div>
          ${hospital.services ? `<p style="margin: 0; font-size: 12px; color: #6b7280;"><strong>Services:</strong> ${hospital.services.slice(0, 3).join(', ')}${hospital.services.length > 3 ? '...' : ''}</p>` : ''}
        </div>
      `
      marker.bindPopup(popupContent)
    } else {
      marker.bindPopup(`<div style="padding: 8px;"><strong>${title}</strong></div>`)
    }

    markersRef.current.push(marker)
    return marker
  }

  // Find nearby hospitals and ambulances
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
        
        // Clear existing markers
        clearMarkers()
        
        // Add user location marker
        addMarker([location.lat, location.lng], 'Your Location', true)
        
        // Calculate distances and sort all hospitals by distance (closest first)
        const hospitalsWithDistance = hospitalDatabase.map(hospital => ({
          ...hospital,
          distance: calculateDistance(
            location.lat,
            location.lng,
            hospital.lat,
            hospital.lng
          )
        })).sort((a, b) => a.distance - b.distance)

        // Calculate distances for ambulances and sort by distance
        const ambulancesWithDistance = ambulanceDatabase.map(ambulance => ({
          ...ambulance,
          distance: calculateDistance(
            location.lat,
            location.lng,
            ambulance.lat,
            ambulance.lng
          )
        })).sort((a, b) => a.distance - b.distance)

        // Prioritize closest facilities - show the 10 closest hospitals/clinics
        // This ensures users always see the nearest medical facilities regardless of distance
        let nearbyHospitals = hospitalsWithDistance.slice(0, 10)
        
        // If there are very close facilities (within 5km), prioritize them more
        const veryCloseHospitals = hospitalsWithDistance.filter(hospital => hospital.distance <= 5)
        if (veryCloseHospitals.length >= 5) {
          // If we have 5+ facilities within 5km, show top 8 closest + 2 more from wider area
          nearbyHospitals = [
            ...veryCloseHospitals.slice(0, 8),
            ...hospitalsWithDistance.filter(h => h.distance > 5).slice(0, 2)
          ]
        }

        // Get ambulance services within 20km radius (emergency services need to be nearby)
        // If no services within 20km, expand to 50km as backup
        let nearbyAmbulances = ambulancesWithDistance.filter(ambulance => ambulance.distance <= 20)
        
        if (nearbyAmbulances.length === 0) {
          // If no ambulances within 20km, try city-based filtering first
          const cityBasedAmbulances = getCityBasedAmbulances(location.lat, location.lng, ambulancesWithDistance)
          if (cityBasedAmbulances.length > 0) {
            nearbyAmbulances = cityBasedAmbulances.slice(0, 3)
          } else {
            // If no city-based services, show closest 3 within 50km
            nearbyAmbulances = ambulancesWithDistance.filter(ambulance => ambulance.distance <= 50).slice(0, 3)
          }
        } else {
          // If we have ambulances within 20km, show up to 5 closest ones
          nearbyAmbulances = nearbyAmbulances.slice(0, 5)
        }

        // Add hospital markers
        nearbyHospitals.forEach(hospital => {
          addMarker([hospital.lat, hospital.lng], hospital.name, false, hospital)
        })

        setHospitals(nearbyHospitals)
        setAmbulances(nearbyAmbulances)
        setStatus(`Found ${nearbyHospitals.length} hospitals and ${nearbyAmbulances.length} ambulance services nearby`)
        setLoading(false)

        // Fit map to show all markers with better zoom for closer facilities
        if (nearbyHospitals.length > 0 && mapInstanceRef.current) {
          try {
            // Validate coordinates before creating markers
            const validHospitals = nearbyHospitals.filter(h => 
              h.lat && h.lng && 
              !isNaN(h.lat) && !isNaN(h.lng) && 
              isFinite(h.lat) && isFinite(h.lng) &&
              h.lat >= -90 && h.lat <= 90 &&
              h.lng >= -180 && h.lng <= 180
            )
            
            // Validate user location coordinates
            const validUserLocation = location.lat && location.lng && 
              !isNaN(location.lat) && !isNaN(location.lng) && 
              isFinite(location.lat) && isFinite(location.lng) &&
              location.lat >= -90 && location.lat <= 90 &&
              location.lng >= -180 && location.lng <= 180
            
            if (validHospitals.length > 0 && validUserLocation) {
              // Create markers array with validation
              const markers = []
              
              // Add user location marker
              markers.push(window.L.marker([location.lat, location.lng]))
              
              // Add hospital markers
              validHospitals.forEach(h => {
                markers.push(window.L.marker([h.lat, h.lng]))
              })
              
              // Create feature group only if we have valid markers
              if (markers.length > 0) {
                const group = new window.L.featureGroup(markers)
                const bounds = group.getBounds()
                
                // Validate bounds before fitting
                if (bounds && bounds.isValid && bounds.isValid()) {
                  // If most hospitals are very close (within 10km), use tighter bounds
                  const avgDistance = validHospitals.reduce((sum, h) => sum + h.distance, 0) / validHospitals.length
                  const padding = avgDistance <= 10 ? 0.05 : 0.1
                  
                  mapInstanceRef.current.fitBounds(bounds.pad(padding))
                } else {
                  // Fallback to user location if bounds are invalid
                  mapInstanceRef.current.setView([location.lat, location.lng], 13)
                }
              } else {
                // Fallback to user location if no valid markers
                mapInstanceRef.current.setView([location.lat, location.lng], 13)
              }
            } else {
              // Fallback to user location if no valid hospitals or user location
              mapInstanceRef.current.setView([location.lat, location.lng], 13)
            }
          } catch (error) {
            console.warn('Error fitting bounds, falling back to user location:', error)
            // Fallback to user location on any error
            mapInstanceRef.current.setView([location.lat, location.lng], 13)
          }
        } else if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([location.lat, location.lng], 13)
        }
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

  // Open location in external map
  const openInMaps = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`
    window.open(url, '_blank')
  }

  // Call ambulance service
  const callAmbulance = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  // Get city-based ambulances when distance filtering fails
  const getCityBasedAmbulances = (userLat: number, userLng: number, ambulancesWithDistance: (AmbulanceService & { distance: number })[]) => {
    // Define city boundaries (approximate)
    const cities = {
      delhi: { minLat: 28.4, maxLat: 28.9, minLng: 76.8, maxLng: 77.5 },
      mumbai: { minLat: 18.9, maxLat: 19.3, minLng: 72.7, maxLng: 73.1 },
      bangalore: { minLat: 12.8, maxLat: 13.2, minLng: 77.4, maxLng: 77.8 },
      chennai: { minLat: 12.8, maxLat: 13.3, minLng: 80.0, maxLng: 80.4 },
      hyderabad: { minLat: 17.2, maxLat: 17.6, minLng: 78.2, maxLng: 78.7 }
    }

    // Determine user's city
    let userCity = null
    for (const [cityName, bounds] of Object.entries(cities)) {
      if (userLat >= bounds.minLat && userLat <= bounds.maxLat && 
          userLng >= bounds.minLng && userLng <= bounds.maxLng) {
        userCity = cityName
        break
      }
    }

    if (!userCity) return []

    // Filter ambulances by city and return closest ones
    const cityAmbulances = ambulancesWithDistance.filter(ambulance => {
      const cityBounds = cities[userCity as keyof typeof cities]
      return ambulance.lat >= cityBounds.minLat && ambulance.lat <= cityBounds.maxLat &&
             ambulance.lng >= cityBounds.minLng && ambulance.lng <= cityBounds.maxLng
    })

    return cityAmbulances.sort((a, b) => a.distance - b.distance)
  }

  if (!mapLoaded) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Hospital Locator - Leaflet Maps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading map...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Hospital Locator - Leaflet Maps
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
            <h3 className="font-semibold text-lg">Nearby Hospitals ({hospitals.length} found)</h3>
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
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {hospital.distance} km away
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {hospital.type}
                        </Badge>
                        {hospital.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {hospital.rating}/5
                          </Badge>
                        )}
                        <Badge 
                          variant={hospital.isOpen ? "default" : "destructive"} 
                          className="text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {hospital.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      {hospital.services && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Services:</strong> {hospital.services.slice(0, 4).join(', ')}
                          {hospital.services.length > 4 && '...'}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInMaps(hospital)}
                      className="ml-4 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Directions
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

export default LeafletHospitalMap