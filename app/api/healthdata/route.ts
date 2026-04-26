import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const langName: Record<string, string> = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
}

// Pre-translated advisories to avoid API quota issues
const translatedAdvisories: Record<string, any[]> = {
  en: [
    {
      title: "Dengue Prevention",
      description: "Remove stagnant water, use mosquito nets, and wear long sleeves during monsoon season.",
    },
    {
      title: "Child Vaccination",
      description: "Ensure children complete government vaccination schedule: BCG, DPT, Polio, Measles, and Hepatitis B.",
    },
    {
      title: "Water Safety",
      description: "Boil water for 10 minutes, use water filters, and avoid drinking from open sources.",
    },
    {
      title: "Malnutrition Awareness",
      description: "Look for signs: weight loss, fatigue, swollen belly, and delayed growth in children.",
    },
    {
      title: "Rural Hygiene",
      description: "Use toilets, wash hands with soap, maintain clean surroundings, and proper waste disposal.",
    },
    {
      title: "Government Health Schemes",
      description: "Ayushman Bharat, PM-JAY, and National Health Mission provide free healthcare services.",
    },
  ],
  ta: [
    {
      title: "டெங்கு தடுப்பு",
      description: "தேங்கி நிற்கும் நீரை அகற்றவும், கொசுவலைகளைப் பயன்படுத்தவும், மழைக்காலத்தில் நீண்ட கைகளுடைய ஆடைகளை அணியவும்.",
    },
    {
      title: "குழந்தை தடுப்பூசி",
      description: "குழந்தைகள் அரசு தடுப்பூசி அட்டவணையை முடிக்க வேண்டும்: BCG, DPT, போலியோ, தட்டம்மை மற்றும் ஹெபடைடிஸ் B.",
    },
    {
      title: "நீர் பாதுகாப்பு",
      description: "நீரை 10 நிமிடங்கள் கொதிக்க வைக்கவும், நீர் வடிகட்டிகளைப் பயன்படுத்தவும், திறந்த நீர் ஆதாரங்களில் இருந்து குடிப்பதைத் தவிர்க்கவும்.",
    },
    {
      title: "ஊட்டச்சத்து குறைபாடு விழிப்புணர்வு",
      description: "அறிகுறிகளைக் கவனிக்கவும்: எடை இழப்பு, சோர்வு, வீங்கிய வயிறு மற்றும் குழந்தைகளில் தாமதமான வளர்ச்சி.",
    },
    {
      title: "கிராமப்புற சுகாதாரம்",
      description: "கழிப்பறைகளைப் பயன்படுத்தவும், சோப்பால் கைகளைக் கழுவவும், சுத்தமான சுற்றுப்புறத்தைப் பராமரிக்கவும், சரியான கழிவு அகற்றலைச் செய்யவும்.",
    },
    {
      title: "அரசு சுகாதார திட்டங்கள்",
      description: "ஆயுஷ்மான் பாரத், PM-JAY மற்றும் தேசிய சுகாதார மிஷன் இலவச சுகாதார சேவைகளை வழங்குகின்றன.",
    },
  ],
  hi: [
    {
      title: "डेंगू रोकथाम",
      description: "रुके हुए पानी को हटाएं, मच्छरदानी का उपयोग करें, और मानसून के मौसम में लंबी आस्तीन के कपड़े पहनें।",
    },
    {
      title: "बाल टीकाकरण",
      description: "सुनिश्चित करें कि बच्चे सरकारी टीकाकरण कार्यक्रम पूरा करें: BCG, DPT, पोलियो, खसरा और हेपेटाइटिस B।",
    },
    {
      title: "पानी की सुरक्षा",
      description: "पानी को 10 मिनट तक उबालें, पानी के फिल्टर का उपयोग करें, और खुले पानी के स्रोतों से पीने से बचें।",
    },
    {
      title: "कुपोषण जागरूकता",
      description: "संकेतों को देखें: वजन घटना, थकान, सूजा हुआ पेट, और बच्चों में देरी से विकास।",
    },
    {
      title: "ग्रामीण स्वच्छता",
      description: "शौचालय का उपयोग करें, साबुन से हाथ धोएं, साफ परिवेश बनाए रखें, और उचित कचरा निपटान करें।",
    },
    {
      title: "सरकारी स्वास्थ्य योजनाएं",
      description: "आयुष्मान भारत, PM-JAY और राष्ट्रीय स्वास्थ्य मिशन मुफ्त स्वास्थ्य सेवाएं प्रदान करते हैं।",
    },
  ],
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

function tryParseJSONArray(s: string) {
  // attempt to parse JSON array possibly wrapped in code fences or extra text
  try {
    return JSON.parse(s)
  } catch {
    // extract first [...] block
    const match = s.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang") || "en"

  // Use pre-translated advisories to avoid API quota issues
  const advisories = translatedAdvisories[lang] || translatedAdvisories.en
  const targetLanguage = langName[lang] || "English"

  return NextResponse.json({
    advisories,
    language: targetLanguage,
  })
}
