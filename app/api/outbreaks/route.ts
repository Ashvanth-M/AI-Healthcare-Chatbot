import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

type OutbreakAlert = {
  id: string
  disease: string
  severity: "low" | "medium" | "high"
  location: string
  description: string
  prevention: string[]
  timestamp: string
  source: string
  cases?: number
  deaths?: number
  recommendations: string[]
}

// Mock government health database - in production, this would connect to real APIs
const mockOutbreakDatabase: OutbreakAlert[] = [
  {
    id: "1",
    disease: "Dengue Fever",
    severity: "high",
    location: "Chennai District, Tamil Nadu",
    description: "Significant increase in dengue cases reported by government health authorities. 45 new cases in the last week, up from 12 the previous week.",
    prevention: [
      "Remove stagnant water from containers, tires, and flower pots",
      "Use mosquito nets while sleeping",
      "Wear long-sleeved clothing during peak mosquito hours",
      "Apply mosquito repellent containing DEET",
      "Install window and door screens"
    ],
    timestamp: new Date().toISOString(),
    source: "Tamil Nadu Health Department",
    cases: 45,
    deaths: 0,
    recommendations: [
      "Immediate medical attention for high fever with severe headache",
      "Community cleanup drives to remove breeding sites",
      "Fogging operations in affected areas",
      "Public awareness campaigns through ASHA workers"
    ]
  },
  {
    id: "2",
    disease: "Seasonal Influenza",
    severity: "medium",
    location: "Multiple districts across Tamil Nadu",
    description: "Flu season approaching with early cases detected. Government recommends vaccination for high-risk groups including elderly, children, and pregnant women.",
    prevention: [
      "Get annual flu vaccination",
      "Maintain good hand hygiene",
      "Cover mouth and nose when coughing or sneezing",
      "Stay home when sick",
      "Avoid close contact with sick individuals"
    ],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    source: "National Health Mission",
    cases: 127,
    deaths: 2,
    recommendations: [
      "Vaccination drives at government health centers",
      "Public awareness about flu symptoms",
      "Stockpiling of antiviral medications",
      "Monitoring of high-risk populations"
    ]
  },
  {
    id: "3",
    disease: "Water-borne Diseases",
    severity: "medium",
    location: "Coastal regions of Tamil Nadu",
    description: "Increased cases of water-borne diseases due to monsoon season. Contaminated water sources reported in several villages.",
    prevention: [
      "Boil water for at least 10 minutes before consumption",
      "Use water filters or purification tablets",
      "Avoid drinking from open water sources",
      "Maintain proper sanitation and hygiene",
      "Report contaminated water sources to authorities"
    ],
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    source: "Public Health Department",
    cases: 89,
    deaths: 1,
    recommendations: [
      "Emergency water purification measures",
      "Distribution of water purification tablets",
      "Sanitation awareness campaigns",
      "Medical camps in affected areas"
    ]
  }
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lang = (searchParams.get("lang") || "en") as "en" | "ta" | "hi"
    const severity = searchParams.get("severity") as "low" | "medium" | "high" | undefined
    const location = searchParams.get("location")

    let filteredOutbreaks = mockOutbreakDatabase

    // Filter by severity if specified
    if (severity) {
      filteredOutbreaks = filteredOutbreaks.filter(outbreak => outbreak.severity === severity)
    }

    // Filter by location if specified
    if (location) {
      filteredOutbreaks = filteredOutbreaks.filter(outbreak => 
        outbreak.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    // Sort by severity (high first) and timestamp (newest first)
    filteredOutbreaks.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity]
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    if (lang === "en") {
      return NextResponse.json({ 
        outbreaks: filteredOutbreaks, 
        language: lang,
        total: filteredOutbreaks.length,
        lastUpdated: new Date().toISOString()
      })
    }

    // Translate to other languages using Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        outbreaks: filteredOutbreaks, 
        language: "en",
        total: filteredOutbreaks.length,
        lastUpdated: new Date().toISOString()
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const langName = { ta: "Tamil", hi: "Hindi" }[lang] || "English"
    
    // Translate outbreak information
    const translatedOutbreaks = await Promise.all(
      filteredOutbreaks.map(async (outbreak) => {
        try {
          const prompt = `Translate the following outbreak alert information to ${langName}. 
          Translate only the text fields: description, prevention array, and recommendations array.
          Keep the structure and format exactly the same, only translate the text content.
          Return a valid JSON object with the same keys.

          Outbreak Data:
          ${JSON.stringify(outbreak, null, 2)}`

          const result = await model.generateContent(prompt)
          const response = await result.response
          const translatedText = response.text()
          
          // Try to parse the translated response
          try {
            const translated = JSON.parse(translatedText)
            return {
              ...outbreak,
              description: translated.description || outbreak.description,
              prevention: translated.prevention || outbreak.prevention,
              recommendations: translated.recommendations || outbreak.recommendations
            }
          } catch {
            // Fallback to original if translation parsing fails
            return outbreak
          }
        } catch (error) {
          console.error(`Translation error for outbreak ${outbreak.id}:`, error)
          return outbreak
        }
      })
    )

    return NextResponse.json({ 
      outbreaks: translatedOutbreaks, 
      language: lang,
      total: translatedOutbreaks.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (err: any) {
    console.error("Outbreaks API error:", err)
    return NextResponse.json({ 
      error: err?.message || "Unknown error occurred while fetching outbreak data" 
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { disease, severity, location, description, prevention, recommendations } = body

    // Validate required fields
    if (!disease || !severity || !location || !description) {
      return NextResponse.json({ 
        error: "Missing required fields: disease, severity, location, description" 
      }, { status: 400 })
    }

    if (!["low", "medium", "high"].includes(severity)) {
      return NextResponse.json({ 
        error: "Invalid severity. Must be 'low', 'medium', or 'high'" 
      }, { status: 400 })
    }

    // In production, this would save to a real database
    const newOutbreak: OutbreakAlert = {
      id: crypto.randomUUID(),
      disease,
      severity,
      location,
      description,
      prevention: prevention || [],
      recommendations: recommendations || [],
      timestamp: new Date().toISOString(),
      source: "User Report",
      cases: 0,
      deaths: 0
    }

    // Add to mock database (in production, save to real DB)
    mockOutbreakDatabase.push(newOutbreak)

    return NextResponse.json({ 
      message: "Outbreak alert created successfully",
      outbreak: newOutbreak
    }, { status: 201 })

  } catch (err: any) {
    console.error("Create outbreak error:", err)
    return NextResponse.json({ 
      error: err?.message || "Unknown error occurred while creating outbreak alert" 
    }, { status: 500 })
  }
}
