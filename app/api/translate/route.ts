import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

type TranslateBody = {
  text?: string
  targetLanguage?: "en" | "ta" | "hi"
  sourceLanguage?: "en" | "ta" | "hi"
}

const langName: Record<string, string> = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
}

async function geminiGenerate(apiKey: string, prompt: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error: any) {
    console.error("Gemini API error:", error)
    throw new Error(`Gemini API error: ${error.message}`)
  }
}

export async function POST(req: Request) {
  try {
    const { text, targetLanguage = "en", sourceLanguage } = (await req.json()) as TranslateBody

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid request: 'text' is required." }, { status: 400 })
    }
    if (!["en", "ta", "hi"].includes(targetLanguage)) {
      return NextResponse.json({ error: "Invalid 'targetLanguage'. Use 'en' | 'ta' | 'hi'." }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in environment." }, { status: 500 })
    }

    const srcName = sourceLanguage ? langName[sourceLanguage] : "Auto-detect"
    const tgtName = langName[targetLanguage]

    const prompt = `Translate the following text from ${srcName} to ${tgtName}. 
- If the text is already in ${tgtName}, return it unchanged.
- Return only the translated text, nothing else.

Text:
${text}`

    const translated = await geminiGenerate(apiKey, prompt)
    return NextResponse.json({ translated, targetLanguage })
  } catch (err: any) {
    console.error("Translate API error:", err)
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}
