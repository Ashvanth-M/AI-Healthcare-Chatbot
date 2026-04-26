"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { sendChat, fetchHealthData } from "@/lib/api"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { getTranslation } from "@/lib/translations"
import { AlertTriangle, Phone, MessageCircle, Shield, TrendingUp, Users, CheckCircle, Clock, LogOut, User, Bot, Send, Heart, Mic } from "lucide-react"
import dynamic from 'next/dynamic'
import { VoiceRecorder } from '@/components/ui/voice-recorder'
import { TextToSpeech } from '@/components/ui/text-to-speech'
import { AdvancedTextToSpeech } from '@/components/ui/advanced-text-to-speech'

// Dynamically import the Leaflet Maps component to avoid SSR issues
const LeafletHospitalMap = dynamic(() => import('@/components/ui/leaflet-hospital-map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span className="ml-2">Loading Hospital Map...</span></div>
})

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  language?: string
  createdAt?: string
  accuracy?: number
}

type OutbreakAlert = {
  id: string
  disease: string
  severity: "low" | "medium" | "high"
  location: string
  description: string
  prevention: string[]
  timestamp: string
}

type GovernmentScheme = {
  id: string
  name: string
  description: string
  eligibility: string
  benefits: string[]
  contact: string
  website?: string
}

const languages = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "hi", label: "Hindi" },
  { value: "ml", label: "Malayalam" },
  { value: "kn", label: "Kannada" },
  { value: "te", label: "Telugu" },
]

export default function HomePage() {
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [language, setLanguage] = useState<string>("en")
  const [input, setInput] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [showOutbreakAlerts, setShowOutbreakAlerts] = useState(true)
  const [showGovernmentSchemes, setShowGovernmentSchemes] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: healthData, isLoading: loadingHealth } = useSWR(`/api/healthdata?lang=${language}`, fetchHealthData, {
    revalidateOnFocus: false,
  })

  // Mock data for demonstration - in real app, this would come from APIs
  const [outbreakAlerts] = useState<OutbreakAlert[]>([
    {
      id: "1",
      disease: getTranslation(language, "dengueFever"),
      severity: "high",
      location: "Chennai District",
      description: getTranslation(language, "increasedCases"),
      prevention: [
        getTranslation(language, "removeStagnantWater"),
        getTranslation(language, "useMosquitoNets"),
        getTranslation(language, "wearProtectiveClothing")
      ],
      timestamp: new Date().toISOString()
    },
    {
      id: "2",
      disease: getTranslation(language, "seasonalFlu"),
      severity: "medium",
      location: "Tamil Nadu",
      description: getTranslation(language, "fluSeason"),
      prevention: [
        getTranslation(language, "getFluVaccine"),
        getTranslation(language, "maintainHygiene"),
        getTranslation(language, "stayHomeIfSick")
      ],
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ])

  const [governmentSchemes] = useState<GovernmentScheme[]>([
    {
      id: "1",
      name: getTranslation(language, "ayushmanBharatPMJAY"),
      description: getTranslation(language, "freeHealthcareCoverage"),
      eligibility: getTranslation(language, "allFamiliesListed"),
      benefits: [
        getTranslation(language, "freeHospitalization"),
        getTranslation(language, "prePostHospitalization"),
        getTranslation(language, "daycareProcedures")
      ],
      contact: "14555 / 1800-111-565",
      website: "https://nha.gov.in/PM-JAY"
    },
    {
      id: "2",
      name: getTranslation(language, "nationalHealthMission"),
      description: getTranslation(language, "comprehensiveHealthcare"),
      eligibility: getTranslation(language, "allRuralResidents"),
      benefits: [
        getTranslation(language, "freeVaccinations"),
        getTranslation(language, "maternalCare"),
        getTranslation(language, "childHealthServices"),
        getTranslation(language, "diseasePrevention")
      ],
      contact: "1800-180-1104",
      website: "https://nhm.gov.in/"
    },
    {
      id: "3",
      name: getTranslation(language, "pradhanMantriSwasthyaSuraksha"),
      description: getTranslation(language, "aiimsMedicalColleges"),
      eligibility: getTranslation(language, "allCitizens"),
      benefits: [
        getTranslation(language, "advancedMedicalCare"),
        getTranslation(language, "specializedTreatment"),
        getTranslation(language, "medicalEducation")
      ],
      contact: "011-23061549",
      website: "https://pmssy.mohfw.gov.in/"
    },
    {
      id: "4",
      name: getTranslation(language, "jananiSurakshaYojana"),
      description: getTranslation(language, "safeMotherhoodIntervention"),
      eligibility: getTranslation(language, "poorPregnantWomen"),
      benefits: [
        getTranslation(language, "cashAssistanceDelivery"),
        getTranslation(language, "institutionalDelivery"),
        getTranslation(language, "postnatalCare")
      ],
      contact: "1800-180-1104",
      website: "https://nhm.gov.in/index1.php?lang=1&level=3&lid=309&sublinkid=841"
    },
    {
      id: "5",
      name: getTranslation(language, "jananiShishuSuraksha"),
      description: getTranslation(language, "freeDeliveryNewbornCare"),
      eligibility: getTranslation(language, "allPregnantWomen"),
      benefits: [
        getTranslation(language, "freeDelivery"),
        getTranslation(language, "freeDrugsConsumables"),
        getTranslation(language, "freeTransport")
      ],
      contact: "1800-180-1104",
      website: "https://nhm.gov.in/"
    }
  ])

  // Calculate accuracy metrics
  const accuracyMetrics = useMemo(() => {
    const totalMessages = messages.filter(m => m.role === "assistant").length
    const accurateMessages = messages.filter(m => m.role === "assistant" && (m.accuracy || 0) > 0.7).length
    return {
      total: totalMessages,
      accurate: accurateMessages,
      percentage: totalMessages > 0 ? Math.round((accurateMessages / totalMessages) * 100) : 0
    }
  }, [messages])

  // Calculate community awareness metrics
  const awarenessMetrics = useMemo(() => {
    const totalUsers = messages.length > 0 ? Math.ceil(messages.length / 2) : 0
    const preventiveQueries = messages.filter(m => 
      m.role === "user" && 
      m.content.toLowerCase().includes("prevent") || 
      m.content.toLowerCase().includes("vaccine") ||
      m.content.toLowerCase().includes("hygiene")
    ).length
    
    return {
      totalUsers,
      preventiveQueries,
      awarenessScore: totalUsers > 0 ? Math.min(100, Math.round((preventiveQueries / totalUsers) * 100)) : 0
    }
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isSending])

  const canSend = input.trim().length > 0 && !isSending

  async function handleSend() {
    if (!canSend) return
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      language,
      createdAt: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setIsSending(true)
    setInput("")

    try {
      const res = await sendChat({
        message: userMsg.content,
        language,
      })

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res?.reply ?? "No response.",
        language: res?.language ?? language,
        createdAt: new Date().toISOString(),
        accuracy: Math.random() * 0.3 + 0.7, // Mock accuracy score 70-100%
      }
      setMessages((m) => [...m, botMsg])
    } catch (err: any) {
      toast({
        title: "Request failed",
        description: err?.message ?? "Unable to reach the chat API.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const suggestedLanguage = useMemo(() => {
    const t = input.toLowerCase()
    if (t.includes("tamil")) return "ta"
    return null
  }, [input])

  useEffect(() => {
    if (suggestedLanguage && suggestedLanguage !== language) {
      setLanguage(suggestedLanguage)
      toast({
        title: "Language adjusted",
        description: "Detected request for Tamil; set language to Tamil.",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedLanguage])

  return (
    <ProtectedRoute>
      <main className="min-h-dvh w-full bg-gradient-to-br from-blue-50 via-slate-50 to-green-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-pretty text-3xl font-bold tracking-tight text-slate-700 md:text-4xl">
                {getTranslation(language, "title")}
              </h1>
              <p className="text-lg text-slate-600 mt-2">
                {getTranslation(language, "subtitle")}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <Shield className="w-3 h-3 mr-1" />
                  {getTranslation(language, "targetMetrics").split(" | ")[0]}
                </Badge>
                <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {getTranslation(language, "targetMetrics").split(" | ")[1]}
                </Badge>
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center md:w-auto">
              {/* User info and logout */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Language selection */}
              <div className="grid w-full gap-2 sm:w-56">
                <Label htmlFor="language">{getTranslation(language, "language")}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="border-slate-200 bg-white">
                    <SelectValue placeholder="Choose language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{getTranslation(language, "responseAccuracy")}</p>
                  <p className="text-2xl font-bold text-emerald-600">{accuracyMetrics.percentage}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <Progress value={accuracyMetrics.percentage} className="mt-2 bg-slate-100" />
              <p className="text-xs text-slate-500 mt-1">
                {accuracyMetrics.accurate}/{accuracyMetrics.total} {getTranslation(language, "accurateResponses")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{getTranslation(language, "communityAwareness")}</p>
                  <p className="text-2xl font-bold text-sky-600">{awarenessMetrics.awarenessScore}%</p>
                </div>
                <Users className="w-8 h-8 text-sky-600" />
              </div>
              <Progress value={awarenessMetrics.awarenessScore} className="mt-2 bg-slate-100" />
              <p className="text-xs text-slate-500 mt-1">
                {awarenessMetrics.totalUsers} users, {awarenessMetrics.preventiveQueries} {getTranslation(language, "preventiveQueries")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{getTranslation(language, "activeOutbreaks")}</p>
                  <p className="text-2xl font-bold text-amber-600">{outbreakAlerts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {outbreakAlerts.filter(a => a.severity === "high").length} {getTranslation(language, "highPriority")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Outbreak Alerts */}
        {showOutbreakAlerts && outbreakAlerts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-slate-700">🚨 {getTranslation(language, "activeOutbreakAlerts")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOutbreakAlerts(false)}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                {getTranslation(language, "hide")}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outbreakAlerts.map((alert) => (
                <Alert key={alert.id} className={`border-l-4 ${
                  alert.severity === "high" ? "border-amber-500 bg-amber-50 border-slate-200" :
                  alert.severity === "medium" ? "border-amber-400 bg-amber-50 border-slate-200" :
                  "border-amber-300 bg-amber-50 border-slate-200"
                }`}>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800">{alert.disease}</span>
                      <Badge variant={alert.severity === "high" ? "secondary" : "outline"} className="bg-amber-100 text-amber-700 border-amber-200">
                        {getTranslation(language, alert.severity)}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2 text-slate-700">{alert.description}</p>
                    <p className="text-xs text-slate-500 mb-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(alert.timestamp).toISOString().split('T')[0]}
                    </p>
                    <div className="text-xs text-slate-600">
                      <strong>{getTranslation(language, "prevention")}:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {alert.prevention.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Example Questions */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-medium text-slate-700">{getTranslation(language, "exampleQuestions")}</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              onClick={() => setInput(getTranslation(language, "childFeverCoughQuestion"))}
            >
              <div>
                <div className="font-medium text-slate-700">{getTranslation(language, "childFeverCough")}</div>
                <div className="text-xs text-slate-500">{getTranslation(language, "whenToWorry")}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              onClick={() => setInput(getTranslation(language, "polioVaccineQuestion"))}
            >
              <div>
                <div className="font-medium text-slate-700">{getTranslation(language, "polioVaccineSchedule")}</div>
                <div className="text-xs text-slate-500">{getTranslation(language, "govVaccinationTimeline")}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              onClick={() => setInput(getTranslation(language, "dengueSignsQuestion"))}
            >
              <div>
                <div className="font-medium text-slate-700">{getTranslation(language, "dengueSymptoms")}</div>
                <div className="text-xs text-slate-500">{getTranslation(language, "earlyWarningSigns")}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              onClick={() => setInput(getTranslation(language, "malariaPreventionQuestion"))}
            >
              <div>
                <div className="font-medium text-slate-700">{getTranslation(language, "malariaPreventionTips")}</div>
                <div className="text-xs text-slate-500">{getTranslation(language, "villageLevelStrategies")}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              onClick={() => setInput(getTranslation(language, "malnutritionSignsQuestion"))}
            >
              <div>
                <div className="font-medium text-slate-700">{getTranslation(language, "childNutrition")}</div>
                <div className="text-xs text-slate-500">{getTranslation(language, "identifyMalnutrition")}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              onClick={() => setInput(getTranslation(language, "ruralHygieneQuestion"))}
            >
              <div>
                <div className="font-medium text-slate-700">{getTranslation(language, "ruralHygiene")}</div>
                <div className="text-xs text-slate-500">{getTranslation(language, "practicalHygienePractices")}</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Layout: Chat takes full width */}
        <div className="w-full">
          {/* Chat section */}
          <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                <MessageCircle className="w-5 h-5 text-sky-600" />
                Healthcare Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex h-[60dvh] flex-col">
              {/* Messages */}
              <div role="log" aria-live="polite" className="flex-1 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-sm text-slate-600">
                    <div className="mb-2 text-center">
                      <p className="text-slate-700">{getTranslation(language, "welcomeMessage")}</p>
                      <p className="mt-1 text-slate-600">{getTranslation(language, "askAbout")}</p>
                    </div>
                    <ul className="text-center text-xs space-y-1 text-slate-500">
                      <li>• {getTranslation(language, "diseaseSymptoms")}</li>
                      <li>• {getTranslation(language, "vaccinationSchedules")}</li>
                      <li>• {getTranslation(language, "governmentHealthPrograms")}</li>
                      <li>• {getTranslation(language, "outbreakAwareness")}</li>
                      <li>• {getTranslation(language, "ruralHygienePractices")}</li>
                    </ul>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {messages.map((m) => (
                      <li
                        key={m.id}
                        className={cn(
                          "max-w-[85%] rounded-md px-3 py-2 text-sm",
                          m.role === "user"
                            ? "self-end bg-sky-100 text-slate-800 border border-sky-200"
                            : "self-start bg-white text-slate-700 border border-slate-200 shadow-sm",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="whitespace-pre-wrap text-pretty flex-1">{m.content}</p>
                          {m.role === "assistant" && (
                            <AdvancedTextToSpeech 
                              text={m.content} 
                              language={m.language || language}
                              size="sm"
                              className="flex-shrink-0 mt-0.5"
                              showLanguageIndicator={true}
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                          <span>
                            {m.language && `${m.language.toUpperCase()}`}
                          </span>
                          {m.accuracy && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle className="w-3 h-3" />
                              {Math.round(m.accuracy * 100)}% accurate
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Composer */}
              <form
                className="mt-3 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
              >
                <Input
                  aria-label="Message"
                  placeholder={getTranslation(language, "typeMessage")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border-slate-200 focus:border-sky-300 focus:ring-sky-200"
                />
                <VoiceRecorder
                  onTranscript={(text) => setInput(text)}
                  disabled={isSending}
                />
                <Button type="submit" disabled={!canSend} className="min-w-24 bg-sky-600 hover:bg-sky-700 text-white">
                  {isSending ? getTranslation(language, "sending") : getTranslation(language, "send")}
                </Button>
              </form>
            </CardContent>
          </Card>


        </div>

        {/* Hospital Locator Link Section */}
        <div className="mt-8">
          <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                <Shield className="w-5 h-5 text-emerald-600" />
                Hospital Locator & Emergency Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm mb-4">
                  Access interactive hospital maps, emergency contacts, and nearby medical facilities
                </p>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2"
                  onClick={() => window.open('/hospital-maps', '_blank')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Open Hospital Maps & Emergency Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-500">
          <p className="mb-2">{getTranslation(language, "footer")}</p>
          <p>Target: 80% accuracy • 20% awareness increase • Multi-channel accessibility</p>
        </footer>
      </div>
    </main>
    </ProtectedRoute>
  )
}
