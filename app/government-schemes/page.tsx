"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Building2, Search, Filter, MapPin, Calendar, Users, IndianRupee, CheckCircle, Clock, AlertCircle, ExternalLink, FileText, Phone } from "lucide-react"

interface GovernmentScheme {
  id: string
  name: string
  description: string
  category: 'insurance' | 'subsidy' | 'welfare' | 'emergency'
  eligibility: string[]
  benefits: string[]
  applicationProcess: string[]
  documents: string[]
  state: string
  maxAmount?: number
  status: 'active' | 'inactive' | 'upcoming'
  applicationDeadline?: Date
  website?: string
}

interface Application {
  id: string
  schemeId: string
  schemeName: string
  status: 'pending' | 'approved' | 'rejected' | 'under-review'
  appliedDate: Date
  lastUpdated: Date
}

export default function GovernmentSchemesPage() {
  const [activeTab, setActiveTab] = useState("browse")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterState, setFilterState] = useState("all")
  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      schemeId: '1',
      schemeName: 'Ayushman Bharat - PMJAY',
      status: 'approved',
      appliedDate: new Date('2024-01-10'),
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '2',
      schemeId: '3',
      schemeName: 'RSBY',
      status: 'under-review',
      appliedDate: new Date('2024-01-20'),
      lastUpdated: new Date('2024-01-22')
    }
  ])

  const handleApplicationSubmit = (schemeId: string, schemeName: string) => {
    const newApplication: Application = {
      id: Date.now().toString(),
      schemeId,
      schemeName,
      status: 'pending',
      appliedDate: new Date(),
      lastUpdated: new Date()
    }
    
    setApplications(prev => [...prev, newApplication])
    
    // Show success message
    alert(`Application submitted successfully for ${schemeName}! You can track its status in the "My Applications" tab.`)
    
    // Switch to applications tab to show the new application
    setActiveTab("applications")
  }

  const [schemes] = useState<GovernmentScheme[]>([
    {
      id: '1',
      name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
      description: 'World\'s largest health insurance scheme providing coverage up to ₹5 lakh per family per year',
      category: 'insurance',
      eligibility: [
        'Families identified in SECC-2011 database',
        'Rural families with specific deprivation criteria',
        'Urban occupational category families'
      ],
      benefits: [
        'Coverage up to ₹5 lakh per family per year',
        'Cashless treatment at empaneled hospitals',
        'Coverage for pre and post-hospitalization expenses',
        'No premium payment required'
      ],
      applicationProcess: [
        'Visit nearest Common Service Center (CSC)',
        'Provide Aadhaar and family details',
        'Verify eligibility through SECC database',
        'Receive Ayushman Bharat card'
      ],
      documents: ['Aadhaar Card', 'Ration Card', 'Family Income Certificate'],
      state: 'All India',
      maxAmount: 500000,
      status: 'active',
      website: 'https://pmjay.gov.in'
    },
    {
      id: '2',
      name: 'Janani Suraksha Yojana (JSY)',
      description: 'Safe motherhood intervention to reduce maternal and neonatal mortality',
      category: 'welfare',
      eligibility: [
        'Pregnant women belonging to BPL families',
        'All pregnant women in low performing states',
        'Age 19 years or above'
      ],
      benefits: [
        'Cash assistance for institutional delivery',
        'Free delivery and post-delivery care',
        'Transportation support',
        'ASHA worker assistance'
      ],
      applicationProcess: [
        'Register at nearest ANM/ASHA worker',
        'Complete ANC checkups',
        'Deliver at government facility',
        'Receive cash incentive post-delivery'
      ],
      documents: ['BPL Card', 'Aadhaar Card', 'Bank Account Details'],
      state: 'All India',
      maxAmount: 1400,
      status: 'active'
    },
    {
      id: '3',
      name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
      description: 'Health insurance scheme for Below Poverty Line families',
      category: 'insurance',
      eligibility: [
        'BPL families as per SECC-2011',
        'Unorganized workers',
        'Construction workers'
      ],
      benefits: [
        'Coverage up to ₹30,000 per family per year',
        'Cashless treatment',
        'Pre-existing disease coverage',
        'Transportation allowance'
      ],
      applicationProcess: [
        'Enroll at enrollment station',
        'Biometric verification',
        'Receive smart card',
        'Use at empaneled hospitals'
      ],
      documents: ['BPL Card', 'Aadhaar Card', 'Voter ID'],
      state: 'Multiple States',
      maxAmount: 30000,
      status: 'active'
    },
    {
      id: '4',
      name: 'Chief Minister\'s Comprehensive Health Insurance Scheme',
      description: 'State-specific health insurance with enhanced coverage',
      category: 'insurance',
      eligibility: [
        'Residents of the state',
        'Annual income below ₹5 lakh',
        'Not covered under other schemes'
      ],
      benefits: [
        'Coverage up to ₹4 lakh per family',
        'Includes critical illness coverage',
        'Outpatient consultation benefits',
        'Medicine coverage'
      ],
      applicationProcess: [
        'Apply online through state portal',
        'Submit required documents',
        'Verification by authorities',
        'Receive insurance card'
      ],
      documents: ['Income Certificate', 'Residence Proof', 'Aadhaar Card'],
      state: 'Tamil Nadu',
      maxAmount: 400000,
      status: 'active'
    }
  ])


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'insurance': return 'bg-blue-50 text-blue-700'
      case 'subsidy': return 'bg-green-50 text-green-700'
      case 'welfare': return 'bg-purple-50 text-purple-700'
      case 'emergency': return 'bg-red-50 text-red-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'under-review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
      case 'under-review': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || scheme.category === filterCategory
    const matchesState = filterState === 'all' || scheme.state.toLowerCase().includes(filterState.toLowerCase())
    return matchesSearch && matchesCategory && matchesState
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
                  <Building2 className="h-8 w-8 text-purple-600" />
                  Government Healthcare Schemes
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Discover and apply for healthcare schemes, insurance programs, and financial assistance
                </p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Government Verified
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Schemes</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="eligibility">Check Eligibility</TabsTrigger>
            <TabsTrigger value="help">Help & Support</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search schemes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="subsidy">Subsidy</SelectItem>
                      <SelectItem value="welfare">Welfare</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger>
                      <MapPin className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="all india">All India</SelectItem>
                      <SelectItem value="tamil nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="kerala">Kerala</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Schemes Grid */}
            <div className="grid gap-6">
              {filteredSchemes.map((scheme) => (
                <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{scheme.name}</h3>
                          <Badge className={getCategoryColor(scheme.category)}>
                            {scheme.category}
                          </Badge>
                          <Badge className={getStatusColor(scheme.status)}>
                            {scheme.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{scheme.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Key Benefits:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {scheme.benefits.slice(0, 3).map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Eligibility:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {scheme.eligibility.slice(0, 2).map((criteria, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  {criteria}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {scheme.state}
                          </span>
                          {scheme.maxAmount && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              Up to ₹{scheme.maxAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>View Details</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{scheme.name}</DialogTitle>
                            <DialogDescription>{scheme.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold mb-3">Benefits</h4>
                              <ul className="space-y-2">
                                {scheme.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                    <span className="text-sm">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3">Eligibility Criteria</h4>
                              <ul className="space-y-2">
                                {scheme.eligibility.map((criteria, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <span className="text-sm">{criteria}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3">Application Process</h4>
                              <ol className="space-y-2">
                                {scheme.applicationProcess.map((step, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3">Required Documents</h4>
                              <div className="flex flex-wrap gap-2">
                                {scheme.documents.map((doc, index) => (
                                  <Badge key={index} variant="outline">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            Apply Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Apply for {scheme.name}</DialogTitle>
                            <DialogDescription>
                              Complete the application form to apply for this government scheme
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="applicant-name">Full Name</Label>
                                <Input id="applicant-name" placeholder="Enter your full name" />
                              </div>
                              <div>
                                <Label htmlFor="applicant-phone">Phone Number</Label>
                                <Input id="applicant-phone" placeholder="Enter your phone number" />
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="applicant-email">Email Address</Label>
                                <Input id="applicant-email" type="email" placeholder="Enter your email" />
                              </div>
                              <div>
                                <Label htmlFor="applicant-aadhaar">Aadhaar Number</Label>
                                <Input id="applicant-aadhaar" placeholder="Enter your Aadhaar number" />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="applicant-address">Address</Label>
                              <Input id="applicant-address" placeholder="Enter your complete address" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="applicant-state">State</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your state" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                                    <SelectItem value="karnataka">Karnataka</SelectItem>
                                    <SelectItem value="kerala">Kerala</SelectItem>
                                    <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="applicant-district">District</Label>
                                <Input id="applicant-district" placeholder="Enter your district" />
                              </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-2">Required Documents</h4>
                              <ul className="text-sm text-blue-800 space-y-1">
                                {scheme.documents.map((doc, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex gap-3">
                              <Button 
                                className="flex-1"
                                onClick={() => handleApplicationSubmit(scheme.id, scheme.name)}
                              >
                                Submit Application
                              </Button>
                              <Button variant="outline">
                                Save as Draft
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {scheme.website && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(scheme.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Official Website
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>
                  Track the status of your scheme applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{application.schemeName}</h4>
                          <p className="text-sm text-gray-600">
                            Applied on {application.appliedDate.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last updated: {application.lastUpdated.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{application.status}</span>
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Application Details - {application.schemeName}</DialogTitle>
                                <DialogDescription>
                                  Track your application status and view submission details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Application Status</h4>
                                    <Badge className={getStatusColor(application.status)}>
                                      {getStatusIcon(application.status)}
                                      <span className="ml-1">{application.status}</span>
                                    </Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Application ID</h4>
                                    <p className="text-sm text-gray-600 font-mono">{application.id}</p>
                                  </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Applied Date</h4>
                                    <p className="text-sm text-gray-600">{application.appliedDate.toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                                    <p className="text-sm text-gray-600">{application.lastUpdated.toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                                  {application.status === 'pending' && (
                                    <p className="text-sm text-gray-600">
                                      Your application is being reviewed. You will receive an update within 15-30 days.
                                    </p>
                                  )}
                                  {application.status === 'under-review' && (
                                    <p className="text-sm text-gray-600">
                                      Your application is currently under review. Additional documents may be requested.
                                    </p>
                                  )}
                                  {application.status === 'approved' && (
                                    <p className="text-sm text-gray-600">
                                      Congratulations! Your application has been approved. You will receive your benefits card soon.
                                    </p>
                                  )}
                                  {application.status === 'rejected' && (
                                    <p className="text-sm text-gray-600">
                                      Your application was not approved. Please check the eligibility criteria and reapply if needed.
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-3">
                                  <Button variant="outline" className="flex-1">
                                    Download Application
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    Contact Support
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No applications yet</p>
                    <p className="text-sm text-gray-500">Start by browsing available schemes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Check Your Eligibility</CardTitle>
                <CardDescription>
                  Find schemes you're eligible for based on your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="annual-income">Annual Family Income</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="below-1">Below ₹1 Lakh</SelectItem>
                          <SelectItem value="1-3">₹1-3 Lakhs</SelectItem>
                          <SelectItem value="3-5">₹3-5 Lakhs</SelectItem>
                          <SelectItem value="5-10">₹5-10 Lakhs</SelectItem>
                          <SelectItem value="above-10">Above ₹10 Lakhs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                          <SelectItem value="kerala">Kerala</SelectItem>
                          <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="obc">OBC</SelectItem>
                          <SelectItem value="sc">SC</SelectItem>
                          <SelectItem value="st">ST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" placeholder="Enter your age" />
                    </div>
                    <div>
                      <Label htmlFor="family-size">Family Size</Label>
                      <Input id="family-size" type="number" placeholder="Number of family members" />
                    </div>
                    <div>
                      <Label htmlFor="employment">Employment Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="self-employed">Self Employed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  Check Eligible Schemes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How do I apply for a scheme?</h4>
                    <p className="text-sm text-gray-600">
                      Click on "View Details" for any scheme to see the complete application process and required documents.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How long does approval take?</h4>
                    <p className="text-sm text-gray-600">
                      Processing time varies by scheme, typically 15-30 days for most government healthcare schemes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Can I apply for multiple schemes?</h4>
                    <p className="text-sm text-gray-600">
                      Yes, you can apply for multiple schemes if you meet their eligibility criteria.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Helpline</p>
                      <p className="text-sm text-gray-600">1800-111-565</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Common Service Center</p>
                      <p className="text-sm text-gray-600">Visit your nearest CSC for assistance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Official Portal</p>
                      <p className="text-sm text-gray-600">pmjay.gov.in</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ProtectedRoute>
  )
}