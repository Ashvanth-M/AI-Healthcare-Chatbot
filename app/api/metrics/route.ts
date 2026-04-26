import { NextResponse } from "next/server"

type AccuracyMetric = {
  id: string
  query: string
  response: string
  userRating: number // 1-5 scale
  aiConfidence: number // 0-1 scale
  language: string
  category: "symptoms" | "prevention" | "vaccination" | "government" | "general"
  timestamp: string
  isAccurate: boolean
}

type AwarenessMetric = {
  id: string
  userId: string
  queryType: "preventive" | "symptom" | "vaccination" | "government" | "other"
  language: string
  timestamp: string
  followUpActions: string[]
  location?: string
}

type CommunityMetrics = {
  totalUsers: number
  totalQueries: number
  accuracyScore: number
  awarenessScore: number
  preventiveQueryPercentage: number
  vaccinationQueryPercentage: number
  governmentQueryPercentage: number
  languageDistribution: Record<string, number>
  categoryDistribution: Record<string, number>
  dailyActiveUsers: number
  weeklyGrowth: number
}

// Mock database for metrics - in production, this would be a real database
const mockAccuracyMetrics: AccuracyMetric[] = []
const mockAwarenessMetrics: AwarenessMetric[] = []

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") // "accuracy", "awareness", "community", or "all"
    const lang = searchParams.get("lang")
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let filteredAccuracyMetrics = [...mockAccuracyMetrics]
    let filteredAwarenessMetrics = [...mockAwarenessMetrics]

    // Filter by language if specified
    if (lang) {
      filteredAccuracyMetrics = filteredAccuracyMetrics.filter(m => m.language === lang)
      filteredAwarenessMetrics = filteredAwarenessMetrics.filter(m => m.language === lang)
    }

    // Filter by category if specified
    if (category) {
      filteredAccuracyMetrics = filteredAccuracyMetrics.filter(m => m.category === category)
      filteredAwarenessMetrics = filteredAwarenessMetrics.filter(m => m.queryType === category)
    }

    // Filter by date range if specified
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filteredAccuracyMetrics = filteredAccuracyMetrics.filter(m => {
        const timestamp = new Date(m.timestamp)
        return timestamp >= start && timestamp <= end
      })
      filteredAwarenessMetrics = filteredAwarenessMetrics.filter(m => {
        const timestamp = new Date(m.timestamp)
        return timestamp >= start && timestamp <= end
      })
    }

    // Calculate community metrics
    const communityMetrics: CommunityMetrics = calculateCommunityMetrics(
      filteredAccuracyMetrics,
      filteredAwarenessMetrics
    )

    if (type === "accuracy") {
      return NextResponse.json({
        metrics: filteredAccuracyMetrics,
        summary: {
          total: filteredAccuracyMetrics.length,
          averageRating: filteredAccuracyMetrics.length > 0 
            ? filteredAccuracyMetrics.reduce((sum, m) => sum + m.userRating, 0) / filteredAccuracyMetrics.length 
            : 0,
          averageConfidence: filteredAccuracyMetrics.length > 0
            ? filteredAccuracyMetrics.reduce((sum, m) => sum + m.aiConfidence, 0) / filteredAccuracyMetrics.length
            : 0,
          accuracyRate: filteredAccuracyMetrics.length > 0
            ? (filteredAccuracyMetrics.filter(m => m.isAccurate).length / filteredAccuracyMetrics.length) * 100
            : 0
        }
      })
    }

    if (type === "awareness") {
      return NextResponse.json({
        metrics: filteredAwarenessMetrics,
        summary: {
          total: filteredAwarenessMetrics.length,
          preventivePercentage: filteredAwarenessMetrics.length > 0
            ? (filteredAwarenessMetrics.filter(m => m.queryType === "preventive").length / filteredAwarenessMetrics.length) * 100
            : 0,
          vaccinationPercentage: filteredAwarenessMetrics.length > 0
            ? (filteredAwarenessMetrics.filter(m => m.queryType === "vaccination").length / filteredAwarenessMetrics.length) * 100
            : 0,
          governmentPercentage: filteredAwarenessMetrics.length > 0
            ? (filteredAwarenessMetrics.filter(m => m.queryType === "government").length / filteredAwarenessMetrics.length) * 100
            : 0
        }
      })
    }

    if (type === "community") {
      return NextResponse.json(communityMetrics)
    }

    // Return all metrics by default
    return NextResponse.json({
      accuracy: {
        metrics: filteredAccuracyMetrics,
        summary: {
          total: filteredAccuracyMetrics.length,
          averageRating: filteredAccuracyMetrics.length > 0 
            ? filteredAccuracyMetrics.reduce((sum, m) => sum + m.userRating, 0) / filteredAccuracyMetrics.length 
            : 0,
          averageConfidence: filteredAccuracyMetrics.length > 0
            ? filteredAccuracyMetrics.reduce((sum, m) => sum + m.aiConfidence, 0) / filteredAccuracyMetrics.length
            : 0,
          accuracyRate: filteredAccuracyMetrics.length > 0
            ? (filteredAccuracyMetrics.filter(m => m.isAccurate).length / filteredAccuracyMetrics.length) * 100
            : 0
        }
      },
      awareness: {
        metrics: filteredAwarenessMetrics,
        summary: {
          total: filteredAwarenessMetrics.length,
          preventivePercentage: filteredAwarenessMetrics.length > 0
            ? (filteredAwarenessMetrics.filter(m => m.queryType === "preventive").length / filteredAwarenessMetrics.length) * 100
            : 0,
          vaccinationPercentage: filteredAwarenessMetrics.length > 0
            ? (filteredAwarenessMetrics.filter(m => m.queryType === "vaccination").length / filteredAwarenessMetrics.length) * 100
            : 0,
          governmentPercentage: filteredAwarenessMetrics.length > 0
            ? (filteredAwarenessMetrics.filter(m => m.queryType === "government").length / filteredAwarenessMetrics.length) * 100
            : 0
        }
      },
      community: communityMetrics
    })

  } catch (err: any) {
    console.error("Metrics API error:", err)
    return NextResponse.json({ 
      error: err?.message || "Unknown error occurred while fetching metrics" 
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type === "accuracy") {
      const { query, response, userRating, aiConfidence, language, category } = data

      if (!query || !response || !userRating || !language || !category) {
        return NextResponse.json({ 
          error: "Missing required fields for accuracy metric" 
        }, { status: 400 })
      }

      if (userRating < 1 || userRating > 5) {
        return NextResponse.json({ 
          error: "User rating must be between 1 and 5" 
        }, { status: 400 })
      }

      if (aiConfidence < 0 || aiConfidence > 1) {
        return NextResponse.json({ 
          error: "AI confidence must be between 0 and 1" 
        }, { status: 400 })
      }

      const newMetric: AccuracyMetric = {
        id: crypto.randomUUID(),
        query,
        response,
        userRating,
        aiConfidence: aiConfidence || 0.8,
        language,
        category,
        timestamp: new Date().toISOString(),
        isAccurate: userRating >= 4
      }

      mockAccuracyMetrics.push(newMetric)

      return NextResponse.json({ 
        message: "Accuracy metric recorded successfully",
        metric: newMetric
      }, { status: 201 })
    }

    if (type === "awareness") {
      const { userId, queryType, language, followUpActions, location } = data

      if (!userId || !queryType || !language) {
        return NextResponse.json({ 
          error: "Missing required fields for awareness metric" 
        }, { status: 400 })
      }

      if (!["preventive", "symptom", "vaccination", "government", "other"].includes(queryType)) {
        return NextResponse.json({ 
          error: "Invalid query type" 
        }, { status: 400 })
      }

      const newMetric: AwarenessMetric = {
        id: crypto.randomUUID(),
        userId,
        queryType,
        language,
        timestamp: new Date().toISOString(),
        followUpActions: followUpActions || [],
        location
      }

      mockAwarenessMetrics.push(newMetric)

      return NextResponse.json({ 
        message: "Awareness metric recorded successfully",
        metric: newMetric
      }, { status: 201 })
    }

    return NextResponse.json({ 
      error: "Invalid metric type. Use 'accuracy' or 'awareness'" 
    }, { status: 400 })

  } catch (err: any) {
    console.error("Create metric error:", err)
    return NextResponse.json({ 
      error: err?.message || "Unknown error occurred while creating metric" 
    }, { status: 500 })
  }
}

function calculateCommunityMetrics(
  accuracyMetrics: AccuracyMetric[],
  awarenessMetrics: AwarenessMetric[]
): CommunityMetrics {
  const totalUsers = new Set(awarenessMetrics.map(m => m.userId)).size
  const totalQueries = accuracyMetrics.length + awarenessMetrics.length

  // Calculate accuracy score
  const accuracyScore = accuracyMetrics.length > 0
    ? (accuracyMetrics.filter(m => m.isAccurate).length / accuracyMetrics.length) * 100
    : 0

  // Calculate awareness score based on preventive queries
  const preventiveQueries = awarenessMetrics.filter(m => m.queryType === "preventive").length
  const awarenessScore = awarenessMetrics.length > 0
    ? Math.min(100, (preventiveQueries / awarenessMetrics.length) * 100)
    : 0

  // Calculate category percentages
  const preventiveQueryPercentage = awarenessMetrics.length > 0
    ? (awarenessMetrics.filter(m => m.queryType === "preventive").length / awarenessMetrics.length) * 100
    : 0

  const vaccinationQueryPercentage = awarenessMetrics.length > 0
    ? (awarenessMetrics.filter(m => m.queryType === "vaccination").length / awarenessMetrics.length) * 100
    : 0

  const governmentQueryPercentage = awarenessMetrics.length > 0
    ? (awarenessMetrics.filter(m => m.queryType === "government").length / awarenessMetrics.length) * 100
    : 0

  // Calculate language distribution
  const languageDistribution: Record<string, number> = {}
  awarenessMetrics.forEach(m => {
    languageDistribution[m.language] = (languageDistribution[m.language] || 0) + 1
  })

  // Calculate category distribution
  const categoryDistribution: Record<string, number> = {}
  awarenessMetrics.forEach(m => {
    categoryDistribution[m.queryType] = (categoryDistribution[m.queryType] || 0) + 1
  })

  // Calculate daily active users (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const dailyActiveUsers = new Set(
    awarenessMetrics
      .filter(m => new Date(m.timestamp) >= oneDayAgo)
      .map(m => m.userId)
  ).size

  // Calculate weekly growth (comparing this week to last week)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  
  const thisWeekUsers = new Set(
    awarenessMetrics
      .filter(m => new Date(m.timestamp) >= oneWeekAgo)
      .map(m => m.userId)
  ).size
  
  const lastWeekUsers = new Set(
    awarenessMetrics
      .filter(m => new Date(m.timestamp) >= twoWeeksAgo && new Date(m.timestamp) < oneWeekAgo)
      .map(m => m.userId)
  ).size

  const weeklyGrowth = lastWeekUsers > 0
    ? ((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100
    : 0

  return {
    totalUsers,
    totalQueries,
    accuracyScore: Math.round(accuracyScore * 100) / 100,
    awarenessScore: Math.round(awarenessScore * 100) / 100,
    preventiveQueryPercentage: Math.round(preventiveQueryPercentage * 100) / 100,
    vaccinationQueryPercentage: Math.round(vaccinationQueryPercentage * 100) / 100,
    governmentQueryPercentage: Math.round(governmentQueryPercentage * 100) / 100,
    languageDistribution,
    categoryDistribution,
    dailyActiveUsers,
    weeklyGrowth: Math.round(weeklyGrowth * 100) / 100
  }
}
