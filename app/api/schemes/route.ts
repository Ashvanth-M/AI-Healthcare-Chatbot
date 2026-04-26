import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

type GovernmentScheme = {
  id: string
  name: string
  description: string
  eligibility: string
  benefits: string[]
  contact: string
  website?: string
  helpline?: string
  applicationProcess: string[]
  documents: string[]
  category: "healthcare" | "vaccination" | "maternal" | "childcare" | "emergency" | "general"
  state: string
  isActive: boolean
  lastUpdated: string
}

// Mock government health schemes database - in production, this would connect to real government APIs
const mockSchemesDatabase: GovernmentScheme[] = [
  {
    id: "1",
    name: "Ayushman Bharat PM-JAY",
    description: "Free healthcare coverage up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization",
    eligibility: "All families listed in SECC (Socio-Economic Caste Census) database",
    benefits: [
      "Free hospitalization up to ₹5 lakhs per family per year",
      "Pre and post hospitalization expenses",
      "Day care procedures",
      "Coverage for 1,400+ medical procedures",
      "Cashless treatment at empaneled hospitals"
    ],
    contact: "14555",
    website: "https://pmjay.gov.in",
    helpline: "1800-111-569",
    applicationProcess: [
      "Check eligibility on official website",
      "Visit nearest Common Service Centre (CSC)",
      "Provide required documents",
      "Receive Ayushman card"
    ],
    documents: [
      "Aadhaar card",
      "SECC certificate",
      "Income certificate",
      "Caste certificate (if applicable)"
    ],
    category: "healthcare",
    state: "All India",
    isActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "2",
    name: "National Health Mission (NHM)",
    description: "Comprehensive healthcare services focusing on rural areas, maternal health, and child care",
    eligibility: "All rural residents and urban poor",
    benefits: [
      "Free vaccinations for children",
      "Maternal and child healthcare",
      "Disease prevention programs",
      "Health worker training",
      "Community health awareness"
    ],
    contact: "1800-180-1104",
    website: "https://nhm.gov.in",
    helpline: "1800-180-1104",
    applicationProcess: [
      "Visit nearest government health center",
      "Register with ASHA worker",
      "Participate in health camps",
      "Access free services"
    ],
    documents: [
      "Aadhaar card",
      "Residence proof",
      "Income certificate (for some services)"
    ],
    category: "general",
    state: "All India",
    isActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "3",
    name: "Pradhan Mantri Swasthya Suraksha Yojana (PMSSY)",
    description: "Establishment of AIIMS-like institutions and upgrading of government medical colleges",
    eligibility: "All citizens seeking specialized medical care",
    benefits: [
      "Advanced medical care at AIIMS-like institutions",
      "Specialized treatment facilities",
      "Medical education and research",
      "Affordable healthcare for all"
    ],
    contact: "011-23061883",
    website: "https://pmssy-mohfw.nic.in",
    helpline: "011-23061883",
    applicationProcess: [
      "Visit PMSSY website",
      "Check available facilities",
      "Book appointment online",
      "Visit the institution"
    ],
    documents: [
      "Aadhaar card",
      "Medical reports",
      "Referral letter (if required)"
    ],
    category: "healthcare",
    state: "All India",
    isActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "4",
    name: "Jan Aushadhi Scheme",
    description: "Quality generic medicines at affordable prices through Jan Aushadhi Kendras",
    eligibility: "All citizens",
    benefits: [
      "Generic medicines at 50-90% lower prices",
      "Quality assured medicines",
      "Wide range of medicines available",
      "No prescription required for OTC medicines"
    ],
    contact: "1800-180-8080",
    website: "https://janaushadhi.gov.in",
    helpline: "1800-180-8080",
    applicationProcess: [
      "Visit nearest Jan Aushadhi Kendra",
      "Show prescription (if required)",
      "Purchase medicines at discounted rates"
    ],
    documents: [
      "Prescription (for prescription medicines)",
      "Aadhaar card (optional)"
    ],
    category: "healthcare",
    state: "All India",
    isActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "5",
    name: "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)",
    description: "Free antenatal care for pregnant women on 9th of every month",
    eligibility: "All pregnant women",
    benefits: [
      "Free antenatal checkup",
      "Specialist consultation",
      "Diagnostic services",
      "Nutritional counseling",
      "High-risk pregnancy identification"
    ],
    contact: "1800-180-1104",
    website: "https://nhm.gov.in",
    helpline: "1800-180-1104",
    applicationProcess: [
      "Visit government health center on 9th of month",
      "Register for antenatal care",
      "Receive free consultation and tests"
    ],
    documents: [
      "Aadhaar card",
      "Pregnancy confirmation certificate"
    ],
    category: "maternal",
    state: "All India",
    isActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "6",
    name: "Mission Indradhanush",
    description: "Intensive immunization drive to vaccinate all children under 2 years and pregnant women",
    eligibility: "Children under 2 years and pregnant women",
    benefits: [
      "Free vaccination against 12 vaccine-preventable diseases",
      "Intensive immunization drives",
      "Mobile vaccination teams",
      "Follow-up for missed vaccinations"
    ],
    contact: "1800-180-1104",
    website: "https://nhm.gov.in",
    helpline: "1800-180-1104",
    applicationProcess: [
      "Visit nearest vaccination center",
      "Register child for vaccination",
      "Receive vaccination schedule",
      "Attend vaccination sessions"
    ],
    documents: [
      "Birth certificate",
      "Vaccination card",
      "Aadhaar card (if available)"
    ],
    category: "vaccination",
    state: "All India",
    isActive: true,
    lastUpdated: new Date().toISOString()
  }
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lang = (searchParams.get("lang") || "en") as "en" | "ta" | "hi"
    const category = searchParams.get("category") as GovernmentScheme["category"] | undefined
    const state = searchParams.get("state")
    const active = searchParams.get("active")

    let filteredSchemes = mockSchemesDatabase

    // Filter by category if specified
    if (category) {
      filteredSchemes = filteredSchemes.filter(scheme => scheme.category === category)
    }

    // Filter by state if specified
    if (state) {
      filteredSchemes = filteredSchemes.filter(scheme => 
        scheme.state.toLowerCase().includes(state.toLowerCase())
      )
    }

    // Filter by active status if specified
    if (active !== null) {
      const isActive = active === "true"
      filteredSchemes = filteredSchemes.filter(scheme => scheme.isActive === isActive)
    }

    // Sort by last updated (newest first)
    filteredSchemes.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )

    if (lang === "en") {
      return NextResponse.json({ 
        schemes: filteredSchemes, 
        language: lang,
        total: filteredSchemes.length,
        lastUpdated: new Date().toISOString()
      })
    }

    // Translate to other languages using Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        schemes: filteredSchemes, 
        language: "en",
        total: filteredSchemes.length,
        lastUpdated: new Date().toISOString()
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const langName = { ta: "Tamil", hi: "Hindi" }[lang] || "English"
    
    // Translate scheme information
    const translatedSchemes = await Promise.all(
      filteredSchemes.map(async (scheme) => {
        try {
          const prompt = `Translate the following government health scheme information to ${langName}. 
          Translate only the text fields: description, eligibility, benefits array, applicationProcess array, and documents array.
          Keep the structure and format exactly the same, only translate the text content.
          Return a valid JSON object with the same keys.

          Scheme Data:
          ${JSON.stringify(scheme, null, 2)}`

          const result = await model.generateContent(prompt)
          const response = await result.response
          const translatedText = response.text()
          
          // Try to parse the translated response
          try {
            const translated = JSON.parse(translatedText)
            return {
              ...scheme,
              description: translated.description || scheme.description,
              eligibility: translated.eligibility || scheme.eligibility,
              benefits: translated.benefits || scheme.benefits,
              applicationProcess: translated.applicationProcess || scheme.applicationProcess,
              documents: translated.documents || scheme.documents
            }
          } catch {
            // Fallback to original if translation parsing fails
            return scheme
          }
        } catch (error) {
          console.error(`Translation error for scheme ${scheme.id}:`, error)
          return scheme
        }
      })
    )

    return NextResponse.json({ 
      schemes: translatedSchemes, 
      language: lang,
      total: translatedSchemes.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (err: any) {
    console.error("Schemes API error:", err)
    return NextResponse.json({ 
      error: err?.message || "Unknown error occurred while fetching government schemes" 
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, eligibility, benefits, contact, category, state } = body

    // Validate required fields
    if (!name || !description || !eligibility || !benefits || !contact || !category || !state) {
      return NextResponse.json({ 
        error: "Missing required fields: name, description, eligibility, benefits, contact, category, state" 
      }, { status: 400 })
    }

    if (!["healthcare", "vaccination", "maternal", "childcare", "emergency", "general"].includes(category)) {
      return NextResponse.json({ 
        error: "Invalid category. Must be one of: healthcare, vaccination, maternal, childcare, emergency, general" 
      }, { status: 400 })
    }

    // In production, this would save to a real government database
    const newScheme: GovernmentScheme = {
      id: crypto.randomUUID(),
      name,
      description,
      eligibility,
      benefits: Array.isArray(benefits) ? benefits : [benefits],
      contact,
      category,
      state,
      isActive: true,
      lastUpdated: new Date().toISOString(),
      applicationProcess: [],
      documents: []
    }

    // Add to mock database (in production, save to real DB)
    mockSchemesDatabase.push(newScheme)

    return NextResponse.json({ 
      message: "Government scheme created successfully",
      scheme: newScheme
    }, { status: 201 })

  } catch (err: any) {
    console.error("Create scheme error:", err)
    return NextResponse.json({ 
      error: err?.message || "Unknown error occurred while creating government scheme" 
    }, { status: 500 })
  }
}
