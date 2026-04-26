"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { FileText, Upload, Download, Calendar, User, Stethoscope, Pill, TestTube, Shield, Plus, Search, Filter, FileSpreadsheet } from "lucide-react"

interface MedicalRecord {
  id: string
  type: 'prescription' | 'lab-report' | 'diagnosis' | 'vaccination' | 'surgery'
  title: string
  date: Date
  doctor: string
  hospital: string
  description: string
  files?: string[]
  status: 'active' | 'completed' | 'pending'
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  prescribedBy: string
  date: Date
  status: 'active' | 'completed'
}

interface CSVMedicalRecord {
  'Patient ID': string
  'Patient Name': string
  'Date of Birth': string
  'Gender': string
  'Phone': string
  'Email': string
  'Blood Group': string
  'Allergies': string
  'Chronic Conditions': string
  'Last Visit Date': string
  'Doctor Name': string
  'Department': string
  'Diagnosis': string
  'Treatment': string
  'Medications Prescribed': string
  'Lab Results': string
  'Vital Signs': string
  'Next Appointment': string
  'Insurance Provider': string
  'Policy Number': string
}

export default function MedicalRecordsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [csvData, setCsvData] = useState<CSVMedicalRecord[]>([])
  const [showCSVData, setShowCSVData] = useState(false)
  const [extractedData, setExtractedData] = useState<{
    prescriptions: Prescription[]
    medicalRecords: MedicalRecord[]
  }>({
    prescriptions: [],
    medicalRecords: []
  })
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    recordType: "",
    title: "",
    doctorName: "",
    hospitalName: "",
    date: "",
    description: ""
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  // Download functions
  const downloadMedicalRecord = (record: MedicalRecord) => {
    const content = `
MEDICAL RECORD
==============

Title: ${record.title}
Type: ${record.type.charAt(0).toUpperCase() + record.type.slice(1)}
Date: ${record.date.toLocaleDateString()}
Doctor: ${record.doctor}
Hospital: ${record.hospital}
Status: ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}

Description:
${record.description}

Generated on: ${new Date().toLocaleDateString()}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${record.title.replace(/\s+/g, '_')}_${record.date.toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPrescription = (prescription: Prescription) => {
    const content = `
PRESCRIPTION
============

Medication: ${prescription.medication}
Dosage: ${prescription.dosage}
Frequency: ${prescription.frequency}
Duration: ${prescription.duration}
Prescribed by: ${prescription.prescribedBy}
Date: ${prescription.date.toLocaleDateString()}
Status: ${prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}

Generated on: ${new Date().toLocaleDateString()}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Prescription_${prescription.medication.replace(/\s+/g, '_')}_${prescription.date.toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // File upload and processing functions
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setIsProcessingFile(true)
    const file = files[0] // Handle first file for now
    setUploadedFiles([file])
    
    // Check if it's a PDF file for data extraction
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      await extractDataFromPDF(file)
    }
    
    // Auto-fill form based on file name and type
    const fileName = file.name
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    
    // Extract information from filename
    const autoFillData = extractInfoFromFileName(fileName)
    
    setUploadForm(prev => ({
      ...prev,
      title: autoFillData.title || fileName.replace(/\.[^/.]+$/, ""), // Remove extension
      recordType: autoFillData.recordType || getRecordTypeFromFile(fileExtension || ""),
      date: autoFillData.date || new Date().toISOString().split('T')[0],
      description: `Uploaded file: ${fileName}`
    }))
    
    setIsProcessingFile(false)
  }

  // PDF Data Extraction Function
  const extractDataFromPDF = async (file: File) => {
    try {
      // For demo purposes, we'll simulate PDF parsing with realistic medical data
      // In a real application, you would use a PDF parsing library like pdf-parse or pdf2pic
      
      const mockExtractedData = {
        prescriptions: [
          {
            id: 'pdf-1',
            medication: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '90 days',
            prescribedBy: 'Dr. Sarah Johnson',
            date: new Date('2024-01-15'),
            status: 'active' as const
          },
          {
            id: 'pdf-2',
            medication: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            prescribedBy: 'Dr. Michael Chen',
            date: new Date('2024-01-20'),
            status: 'active' as const
          },
          {
            id: 'pdf-3',
            medication: 'Atorvastatin',
            dosage: '20mg',
            frequency: 'Once daily',
            duration: '60 days',
            prescribedBy: 'Dr. Sarah Johnson',
            date: new Date('2024-01-18'),
            status: 'active' as const
          }
        ],
        medicalRecords: [
          {
            id: 'pdf-record-1',
            type: 'diagnosis' as const,
            title: 'Diabetes Management Consultation',
            date: new Date('2024-01-15'),
            doctor: 'Dr. Sarah Johnson',
            hospital: 'City General Hospital',
            description: 'Regular diabetes checkup and medication adjustment. HbA1c levels improved from 8.2% to 7.1%.',
            status: 'completed' as const
          },
          {
            id: 'pdf-record-2',
            type: 'lab-report' as const,
            title: 'Comprehensive Blood Panel',
            date: new Date('2024-01-10'),
            doctor: 'Dr. Michael Chen',
            hospital: 'HealthCare Lab',
            description: 'Complete blood count, lipid profile, and diabetes markers. All values within normal range.',
            status: 'completed' as const
          },
          {
            id: 'pdf-record-3',
            type: 'prescription' as const,
            title: 'Hypertension Medication Review',
            date: new Date('2024-01-20'),
            doctor: 'Dr. Michael Chen',
            hospital: 'City General Hospital',
            description: 'Blood pressure medication adjustment based on recent readings.',
            status: 'active' as const
          }
        ]
      }
      
      setExtractedData(mockExtractedData)
      
      // Show success message
      alert(`Successfully extracted data from PDF! Found ${mockExtractedData.prescriptions.length} prescriptions and ${mockExtractedData.medicalRecords.length} medical records.`)
      
    } catch (error) {
      console.error('Error extracting data from PDF:', error)
      alert('Error extracting data from PDF. Please try again.')
    }
  }
  
  const extractInfoFromFileName = (fileName: string) => {
    const lowerFileName = fileName.toLowerCase()
    let recordType = ""
    let title = fileName.replace(/\.[^/.]+$/, "") // Remove extension
    let date = ""
    
    // Detect record type from filename
    if (lowerFileName.includes('prescription') || lowerFileName.includes('rx')) {
      recordType = "prescription"
      title = title.replace(/prescription|rx/gi, "").trim()
    } else if (lowerFileName.includes('lab') || lowerFileName.includes('blood') || lowerFileName.includes('test')) {
      recordType = "lab-report"
    } else if (lowerFileName.includes('diagnosis') || lowerFileName.includes('report')) {
      recordType = "diagnosis"
    } else if (lowerFileName.includes('vaccination') || lowerFileName.includes('vaccine')) {
      recordType = "vaccination"
    } else if (lowerFileName.includes('surgery') || lowerFileName.includes('operation')) {
      recordType = "surgery"
    }
    
    // Try to extract date from filename (YYYY-MM-DD, DD-MM-YYYY, etc.)
    const dateRegex = /(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/
    const dateMatch = fileName.match(dateRegex)
    if (dateMatch) {
      const extractedDate = dateMatch[1]
      // Convert to YYYY-MM-DD format
      if (extractedDate.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
        const parts = extractedDate.split(/[-/]/)
        date = `${parts[2]}-${parts[1]}-${parts[0]}`
      } else {
        date = extractedDate.replace(/\//g, '-')
      }
    }
    
    return { recordType, title, date }
  }
  
  const getRecordTypeFromFile = (extension: string) => {
    // Default record type based on file extension
    switch (extension) {
      case 'pdf':
        return "lab-report" // PDFs are often lab reports
      case 'jpg':
      case 'jpeg':
      case 'png':
        return "prescription" // Images are often prescriptions
      default:
        return "diagnosis"
    }
  }
  
  const handleFormChange = (field: string, value: string) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files)
  }

  // CSV Import Functions
  const handleCSVImport = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    const records: CSVMedicalRecord[] = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ''
        })
        records.push(record as CSVMedicalRecord)
      }
    }
    
    setCsvData(records)
    setShowCSVData(true)
    alert(`Successfully imported ${records.length} medical records from CSV!`)
  }

  const downloadSampleCSV = () => {
    const sampleData = `Patient ID,Patient Name,Date of Birth,Gender,Phone,Email,Blood Group,Allergies,Chronic Conditions,Last Visit Date,Doctor Name,Department,Diagnosis,Treatment,Medications Prescribed,Lab Results,Vital Signs,Next Appointment,Insurance Provider,Policy Number
MR001,Arjun Kumar,1985-03-15,Male,9876543210,arjun.kumar@email.com,O+,Penicillin,Diabetes Type 2,2024-01-15,Dr. Priya Sharma,Endocrinology,Diabetes Management,Insulin therapy,Metformin 500mg, HbA1c: 7.2%,BP: 130/85 mmHg,2024-02-15,Apollo Health Insurance,AHI123456789
MR002,Kavitha Reddy,1990-07-22,Female,8765432109,kavitha.reddy@email.com,B+,None,Hypertension,2024-01-20,Dr. Rajesh Patel,Cardiology,Hypertension Control,ACE inhibitor therapy,Lisinopril 10mg, Cholesterol: 180 mg/dL,BP: 140/90 mmHg,2024-02-20,Star Health Insurance,SHI987654321`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-medical-records.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const downloadAllRecords = () => {
    const content = `
COMPLETE MEDICAL RECORDS
========================

Patient Medical History
Generated on: ${new Date().toLocaleDateString()}

MEDICAL RECORDS:
${allMedicalRecords.map(record => `
- ${record.title}
  Type: ${record.type}
  Date: ${record.date.toLocaleDateString()}
  Doctor: ${record.doctor}
  Hospital: ${record.hospital}
  Status: ${record.status}
  Description: ${record.description}
`).join('\n')}

PRESCRIPTIONS:
${allPrescriptions.map(prescription => `
- ${prescription.medication}
  Dosage: ${prescription.dosage}
  Frequency: ${prescription.frequency}
  Duration: ${prescription.duration}
  Prescribed by: ${prescription.prescribedBy}
  Date: ${prescription.date.toLocaleDateString()}
  Status: ${prescription.status}
`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Complete_Medical_Records_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const [medicalRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      type: 'diagnosis',
      title: 'Annual Health Checkup',
      date: new Date('2024-01-15'),
      doctor: 'Dr. Sarah Johnson',
      hospital: 'City General Hospital',
      description: 'Comprehensive health examination with all vitals normal',
      status: 'completed'
    },
    {
      id: '2',
      type: 'lab-report',
      title: 'Blood Test Results',
      date: new Date('2024-01-10'),
      doctor: 'Dr. Michael Chen',
      hospital: 'HealthCare Lab',
      description: 'Complete blood count and lipid profile',
      status: 'completed'
    },
    {
      id: '3',
      type: 'prescription',
      title: 'Hypertension Medication',
      date: new Date('2024-01-20'),
      doctor: 'Dr. Sarah Johnson',
      hospital: 'City General Hospital',
      description: 'Prescribed medication for blood pressure management',
      status: 'active'
    }
  ])

  const [prescriptions] = useState<Prescription[]>([
    {
      id: '1',
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      prescribedBy: 'Dr. Sarah Johnson',
      date: new Date('2024-01-20'),
      status: 'active'
    },
    {
      id: '2',
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '90 days',
      prescribedBy: 'Dr. Michael Chen',
      date: new Date('2024-01-15'),
      status: 'active'
    }
  ])

  // Combine mock data with extracted PDF data
  const allMedicalRecords = [...medicalRecords, ...extractedData.medicalRecords]
  const allPrescriptions = [...prescriptions, ...extractedData.prescriptions]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Pill className="h-4 w-4" />
      case 'lab-report': return <TestTube className="h-4 w-4" />
      case 'diagnosis': return <Stethoscope className="h-4 w-4" />
      case 'vaccination': return <Shield className="h-4 w-4" />
      case 'surgery': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'bg-blue-50 text-blue-700'
      case 'lab-report': return 'bg-green-50 text-green-700'
      case 'diagnosis': return 'bg-purple-50 text-purple-700'
      case 'vaccination': return 'bg-orange-50 text-orange-700'
      case 'surgery': return 'bg-red-50 text-red-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRecords = allMedicalRecords.filter(record => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' || 
                         record.title.toLowerCase().includes(searchTermLower) ||
                         record.description.toLowerCase().includes(searchTermLower) ||
                         record.doctor.toLowerCase().includes(searchTermLower) ||
                         record.hospital.toLowerCase().includes(searchTermLower)
    const matchesFilter = filterType === 'all' || record.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="h-8 w-8 text-red-600" />
                  Medical Records
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Secure storage and management of your medical history and documents
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={downloadAllRecords} className="bg-red-600 hover:bg-red-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Records
                </Button>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Secure & Private
                </Badge>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="records">All Records</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="csv-import">CSV Import</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Records</p>
                      <p className="text-3xl font-bold text-gray-900">{allMedicalRecords.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {allPrescriptions.filter(p => p.status === 'active').length}
                      </p>
                    </div>
                    <Pill className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Lab Reports</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {allMedicalRecords.filter(r => r.type === 'lab-report').length}
                      </p>
                    </div>
                    <TestTube className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Visit</p>
                      <p className="text-lg font-bold text-gray-900">Jan 20</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Records */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>
                  Your latest medical documents and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allMedicalRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(record.type)}`}>
                          {getTypeIcon(record.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{record.title}</h4>
                          <p className="text-sm text-gray-600">
                            {record.doctor} • {record.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => downloadMedicalRecord(record)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Prescriptions</CardTitle>
                <CardDescription>
                  Current medications and their schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allPrescriptions.filter(p => p.status === 'active').map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{prescription.medication}</h4>
                          <p className="text-sm text-gray-600">
                            {prescription.dosage} • {prescription.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{prescription.duration}</p>
                        <p className="text-xs text-gray-600">Duration</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search records, doctors, or hospitals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="prescription">Prescriptions</SelectItem>
                      <SelectItem value="lab-report">Lab Reports</SelectItem>
                      <SelectItem value="diagnosis">Diagnoses</SelectItem>
                      <SelectItem value="vaccination">Vaccinations</SelectItem>
                      <SelectItem value="surgery">Surgeries</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Records List */}
            <div className="grid gap-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getTypeColor(record.type)}`}>
                          {getTypeIcon(record.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{record.title}</h3>
                          <p className="text-gray-600 mb-2">{record.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {record.doctor}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {record.date.toLocaleDateString()}
                            </span>
                            <span>{record.hospital}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => downloadMedicalRecord(record)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <div className="grid gap-4">
              {allPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
                            <Pill className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{prescription.medication}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Dosage:</span> {prescription.dosage}
                              </div>
                              <div>
                                <span className="font-medium">Frequency:</span> {prescription.frequency}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {prescription.duration}
                              </div>
                              <div>
                                <span className="font-medium">Prescribed by:</span> {prescription.prescribedBy}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              Prescribed on {prescription.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(prescription.status)}>
                            {prescription.status}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => downloadPrescription(prescription)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="csv-import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  Import Medical Records from CSV
                </CardTitle>
                <CardDescription>
                  Upload CSV files containing medical records data for bulk import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Your CSV file should contain the following columns:
                  </p>
                  <div className="text-xs text-blue-700 font-mono bg-blue-100 p-2 rounded">
                    Patient ID, Patient Name, Date of Birth, Gender, Phone, Email, Blood Group, Allergies, Chronic Conditions, Last Visit Date, Doctor Name, Department, Diagnosis, Treatment, Medications Prescribed, Lab Results, Vital Signs, Next Appointment, Insurance Provider, Policy Number
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={downloadSampleCSV}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Sample CSV
                  </Button>
                  <Button 
                    onClick={() => window.open('/mock-medical-records.csv', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    View Full Mock Data
                  </Button>
                </div>

                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const files = e.dataTransfer.files
                    if (files.length > 0 && files[0].name.endsWith('.csv')) {
                      handleCSVImport(files[0])
                    }
                  }}
                >
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <input
                    type="file"
                    id="csv-upload"
                    className="hidden"
                    accept=".csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCSVImport(e.target.files[0])
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('csv-upload')?.click()}
                  >
                    Choose CSV File
                  </Button>
                </div>

                {showCSVData && csvData.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Imported Records ({csvData.length})</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowCSVData(false)}
                      >
                        Hide Data
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {csvData.slice(0, 10).map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{record['Patient ID']}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{record['Patient Name']}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{record['Doctor Name']}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{record['Department']}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{record['Diagnosis']}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{record['Last Visit Date']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvData.length > 10 && (
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          Showing first 10 records of {csvData.length} total records
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Medical Documents
                </CardTitle>
                <CardDescription>
                  Add new medical records, prescriptions, or lab reports to your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="record-type">Record Type</Label>
                      <Select value={uploadForm.recordType} onValueChange={(value) => handleFormChange('recordType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="lab-report">Lab Report</SelectItem>
                          <SelectItem value="diagnosis">Diagnosis</SelectItem>
                          <SelectItem value="vaccination">Vaccination</SelectItem>
                          <SelectItem value="surgery">Surgery Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="record-title">Title</Label>
                      <Input 
                        id="record-title" 
                        placeholder="Enter record title" 
                        value={uploadForm.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="doctor-name">Doctor Name</Label>
                      <Input 
                        id="doctor-name" 
                        placeholder="Enter doctor's name" 
                        value={uploadForm.doctorName}
                        onChange={(e) => handleFormChange('doctorName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hospital-name">Hospital/Clinic</Label>
                      <Input 
                        id="hospital-name" 
                        placeholder="Enter hospital or clinic name" 
                        value={uploadForm.hospitalName}
                        onChange={(e) => handleFormChange('hospitalName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="record-date">Date</Label>
                      <Input 
                        id="record-date" 
                        type="date" 
                        value={uploadForm.date}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Enter description or notes"
                        className="h-32"
                        value={uploadForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* File Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isProcessingFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${isProcessingFile ? 'text-blue-500' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isProcessingFile ? 'Processing File...' : 'Upload Files'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your medical documents here, or click to browse
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                    disabled={isProcessingFile}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isProcessingFile}
                  >
                    Choose Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: PDF, JPG, PNG (Max 10MB per file)
                  </p>
                </div>

                {/* Display Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Uploaded
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medical Record
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ProtectedRoute>
  )
}