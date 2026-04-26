"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Activity, Heart, Weight, Thermometer, Droplets, Eye, TrendingUp, TrendingDown, Plus, Calendar, AlertCircle, X } from "lucide-react"

interface MultipleMetric {
  type: string
  value: string
  unit: string
}

interface HealthMetric {
  id: string
  type: string
  value: number
  unit: string
  timestamp: Date
  status: 'normal' | 'warning' | 'critical'
}

interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number; status: string }
  heartRate: { value: number; status: string }
  temperature: { value: number; status: string }
  weight: { value: number; status: string }
  bloodSugar: { value: number; status: string }
}

export default function HealthDataPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([])
  const [newMetric, setNewMetric] = useState({ type: '', value: '', unit: '' })
  const [multipleMetrics, setMultipleMetrics] = useState<MultipleMetric[]>([])
  const [isMultipleMode, setIsMultipleMode] = useState(false)

  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressure: { systolic: 120, diastolic: 80, status: 'normal' },
    heartRate: { value: 72, status: 'normal' },
    temperature: { value: 98.6, status: 'normal' },
    weight: { value: 70, status: 'normal' },
    bloodSugar: { value: 95, status: 'normal' }
  })

  // Metric type to unit mapping for auto-selection
  const metricUnits: { [key: string]: string } = {
    'blood-pressure': 'mmHg',
    'heart-rate': 'bpm',
    'weight': 'kg',
    'temperature': '°F',
    'blood-sugar': 'mg/dL',
    'sleep': 'hours',
    'exercise': 'minutes'
  }

  // Function to determine status based on metric type and value
  const determineStatus = (type: string, value: number): 'normal' | 'warning' | 'critical' => {
    switch (type) {
      case 'heart-rate':
        if (value >= 60 && value <= 100) return 'normal'
        if (value >= 50 && value < 60 || value > 100 && value <= 120) return 'warning'
        return 'critical'
      case 'temperature':
        if (value >= 97.0 && value <= 99.5) return 'normal'
        if (value >= 96.0 && value < 97.0 || value > 99.5 && value <= 101.0) return 'warning'
        return 'critical'
      case 'weight':
        return 'normal' // Weight status would need BMI calculation
      case 'blood-sugar':
        if (value >= 70 && value <= 140) return 'normal'
        if (value >= 60 && value < 70 || value > 140 && value <= 180) return 'warning'
        return 'critical'
      default:
        return 'normal'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <TrendingUp className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'critical': return <TrendingDown className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const addHealthMetric = () => {
    if (newMetric.type && newMetric.value) {
      const numericValue = parseFloat(newMetric.value)
      const status = determineStatus(newMetric.type, numericValue)
      
      const metric: HealthMetric = {
        id: Date.now().toString(),
        type: newMetric.type,
        value: numericValue,
        unit: newMetric.unit,
        timestamp: new Date(),
        status: status
      }
      
      setHealthMetrics(prev => [...prev, metric])
      
      // Update vital signs based on the new metric
      updateVitalSigns(newMetric.type, numericValue, status)
      
      setNewMetric({ type: '', value: '', unit: '' })
    }
  }

  // Function to update vital signs when new data is added
  const updateVitalSigns = (type: string, value: number, status: string) => {
    setVitalSigns(prev => {
      const updated = { ...prev }
      
      switch (type) {
        case 'heart-rate':
          updated.heartRate = { value, status }
          break
        case 'temperature':
          updated.temperature = { value, status }
          break
        case 'weight':
          updated.weight = { value, status }
          break
        case 'blood-sugar':
          updated.bloodSugar = { value, status }
          break
        case 'blood-pressure':
          // For blood pressure, we'll assume the value is systolic and keep diastolic as is
          updated.bloodPressure = { 
            systolic: value, 
            diastolic: prev.bloodPressure.diastolic, 
            status 
          }
          break
      }
      
      return updated
    })
  }

  // Available metric types
  const availableMetrics = [
    { value: 'blood-pressure', label: 'Blood Pressure', unit: 'mmHg' },
    { value: 'heart-rate', label: 'Heart Rate', unit: 'bpm' },
    { value: 'weight', label: 'Weight', unit: 'kg' },
    { value: 'temperature', label: 'Temperature', unit: '°F' },
    { value: 'blood-sugar', label: 'Blood Sugar', unit: 'mg/dL' },
    { value: 'sleep', label: 'Sleep Hours', unit: 'hours' },
    { value: 'exercise', label: 'Exercise Minutes', unit: 'minutes' }
  ]

  // Handle metric type selection and auto-fill unit
  const handleMetricTypeChange = (value: string) => {
    const unit = metricUnits[value] || ''
    setNewMetric(prev => ({ ...prev, type: value, unit }))
  }

  // Add metric to multiple selection
  const addToMultipleSelection = (metricType: string) => {
    const metric = availableMetrics.find(m => m.value === metricType)
    if (metric && !multipleMetrics.some(m => m.type === metricType)) {
      setMultipleMetrics(prev => [...prev, {
        type: metricType,
        value: '',
        unit: metric.unit
      }])
    }
  }

  // Remove metric from multiple selection
  const removeFromMultipleSelection = (metricType: string) => {
    setMultipleMetrics(prev => prev.filter(m => m.type !== metricType))
  }

  // Update value for a specific metric in multiple selection
  const updateMultipleMetricValue = (metricType: string, value: string) => {
    setMultipleMetrics(prev => prev.map(m => 
      m.type === metricType ? { ...m, value } : m
    ))
  }

  // Add all multiple metrics at once
  const addMultipleMetrics = () => {
    const validMetrics = multipleMetrics.filter(m => m.value.trim() !== '')
    
    validMetrics.forEach(metric => {
      const numericValue = parseFloat(metric.value)
      const status = determineStatus(metric.type, numericValue)
      
      const healthMetric: HealthMetric = {
        id: `${Date.now()}-${metric.type}`,
        type: metric.type,
        value: numericValue,
        unit: metric.unit,
        timestamp: new Date(),
        status: status
      }
      
      setHealthMetrics(prev => [...prev, healthMetric])
      updateVitalSigns(metric.type, numericValue, status)
    })
    
    // Clear the multiple metrics after adding
    setMultipleMetrics([])
    setIsMultipleMode(false)
  }

  const vitalSignsCards = [
    {
      title: "Blood Pressure",
      value: `${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`,
      unit: "mmHg",
      icon: Heart,
      status: vitalSigns.bloodPressure.status,
      description: "Systolic/Diastolic pressure"
    },
    {
      title: "Heart Rate",
      value: vitalSigns.heartRate.value.toString(),
      unit: "bpm",
      icon: Activity,
      status: vitalSigns.heartRate.status,
      description: "Beats per minute"
    },
    {
      title: "Body Temperature",
      value: vitalSigns.temperature.value.toString(),
      unit: "°F",
      icon: Thermometer,
      status: vitalSigns.temperature.status,
      description: "Core body temperature"
    },
    {
      title: "Weight",
      value: vitalSigns.weight.value.toString(),
      unit: "kg",
      icon: Weight,
      status: vitalSigns.weight.status,
      description: "Current body weight"
    },
    {
      title: "Blood Sugar",
      value: vitalSigns.bloodSugar.value.toString(),
      unit: "mg/dL",
      icon: Droplets,
      status: vitalSigns.bloodSugar.status,
      description: "Glucose level"
    }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Activity className="h-8 w-8 text-green-600" />
                  Health Data Tracking
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Monitor your vital signs and track your health metrics over time
                </p>
              </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Real-time Monitoring
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="tracking">Add Data</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Health Score
                </CardTitle>
                <CardDescription>
                  Overall health assessment based on your vital signs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={85} className="h-3" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">85/100</div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Excellent! Your vital signs are within normal ranges.
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vitalSignsCards.slice(0, 3).map((vital, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{vital.title}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {vital.value} <span className="text-sm text-gray-500">{vital.unit}</span>
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${getStatusColor(vital.status)}`}>
                        <vital.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(vital.status)}
                      <Badge variant="outline" className={getStatusColor(vital.status)}>
                        {vital.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Health Alerts</CardTitle>
                <CardDescription>
                  Important notifications about your health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">All vitals normal</p>
                      <p className="text-sm text-green-700">Your health metrics are within healthy ranges</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vitalSignsCards.map((vital, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <vital.icon className="h-5 w-5 text-blue-600" />
                      {vital.title}
                    </CardTitle>
                    <CardDescription>{vital.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-3xl font-bold text-gray-900">
                        {vital.value}
                        <span className="text-lg text-gray-500 ml-2">{vital.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(vital.status)}
                        <Badge className={getStatusColor(vital.status)}>
                          {vital.status.charAt(0).toUpperCase() + vital.status.slice(1)}
                        </Badge>
                      </div>
                      <Progress 
                        value={vital.status === 'normal' ? 85 : vital.status === 'warning' ? 60 : 30} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Add Health Data
                </CardTitle>
                <CardDescription>
                  Record new health measurements and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Toggle between single and multiple mode */}
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="multiple-mode" 
                    checked={isMultipleMode}
                    onCheckedChange={(checked) => setIsMultipleMode(checked === true)}
                  />
                  <Label htmlFor="multiple-mode">Select multiple metric types</Label>
                </div>

                {!isMultipleMode ? (
                  // Single metric mode
                  <>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="metric-type">Metric Type</Label>
                        <Select value={newMetric.type} onValueChange={handleMetricTypeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMetrics.map(metric => (
                              <SelectItem key={metric.value} value={metric.value}>
                                {metric.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="metric-value">Value</Label>
                        <Input
                          id="metric-value"
                          type="number"
                          value={newMetric.value}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="Enter value"
                        />
                      </div>
                      <div>
                        <Label htmlFor="metric-unit">Unit</Label>
                        <Input
                          id="metric-unit"
                          value={newMetric.unit}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="e.g., mmHg, bpm"
                        />
                      </div>
                    </div>
                    <Button onClick={addHealthMetric} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Measurement
                    </Button>
                  </>
                ) : (
                  // Multiple metrics mode
                  <>
                    <div className="space-y-4">
                      <Label>Select Metric Types</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableMetrics.map(metric => (
                          <div key={metric.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={metric.value}
                              checked={multipleMetrics.some(m => m.type === metric.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  addToMultipleSelection(metric.value)
                                } else {
                                  removeFromMultipleSelection(metric.value)
                                }
                              }}
                            />
                            <Label htmlFor={metric.value} className="text-sm">
                              {metric.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Input fields for selected metrics */}
                    {multipleMetrics.length > 0 && (
                      <div className="space-y-4">
                        <Label>Enter Values for Selected Metrics</Label>
                        <div className="space-y-3">
                          {multipleMetrics.map(metric => {
                            const metricInfo = availableMetrics.find(m => m.value === metric.type)
                            return (
                              <div key={metric.type} className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className="flex-1">
                                  <Label className="text-sm font-medium">
                                    {metricInfo?.label}
                                  </Label>
                                </div>
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    value={metric.value}
                                    onChange={(e) => updateMultipleMetricValue(metric.type, e.target.value)}
                                    placeholder="Enter value"
                                  />
                                </div>
                                <div className="w-20">
                                  <Input
                                    value={metric.unit}
                                    readOnly
                                    className="text-sm bg-gray-50"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromMultipleSelection(metric.type)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={addMultipleMetrics} 
                      className="w-full"
                      disabled={multipleMetrics.length === 0 || !multipleMetrics.some(m => m.value.trim() !== '')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add All Measurements ({multipleMetrics.filter(m => m.value.trim() !== '').length})
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Health History
                </CardTitle>
                <CardDescription>
                  View your recorded health measurements over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthMetrics.length > 0 ? (
                  <div className="space-y-3">
                    {healthMetrics.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{metric.type}</p>
                          <p className="text-sm text-gray-600">
                            {metric.timestamp.toLocaleDateString()} at {metric.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{metric.value} {metric.unit}</p>
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No health data recorded yet</p>
                    <p className="text-sm text-gray-500">Start tracking your health metrics to see your history here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ProtectedRoute>
  )
}