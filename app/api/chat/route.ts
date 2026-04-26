import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

type ChatBody = {
  message?: string
  language?: "en" | "ta" | "hi" | "ml" | "kn" | "te"
}

const langName: Record<string, string> = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
  ml: "Malayalam",
  kn: "Kannada",
  te: "Telugu",
}

// Mock responses for when API is unavailable
const mockResponses: Record<string, string> = {
  "fever": "Fever is often a sign your body is fighting an infection, so it's important to rest and stay hydrated. Please drink plenty of fluids like water, buttermilk, or ORS, and take paracetamol as per the recommended dosage to help bring down the fever. You can also sponge your body with lukewarm water. If your fever is very high, lasts more than 2-3 days, or if you develop other serious symptoms like difficulty breathing, severe body pain, or rash, please consult a doctor at your nearest Primary Health Centre (PHC) immediately. Would you like me to help you find the closest government health facility to your location?",
  
  "cough": "Cough can be caused by various factors including cold, allergies, or respiratory infections. For mild cough, try drinking warm water with honey, gargling with salt water, and avoiding cold foods. If the cough persists for more than a week, produces blood, or is accompanied by high fever, please visit a nearby doctor. Persistent cough in children should be evaluated by a healthcare professional. Would you like me to provide information about common cough remedies used in your region?",
  
  "headache": "Headaches can be caused by stress, dehydration, lack of sleep, or underlying health conditions. Try drinking plenty of water, getting adequate rest, and applying a cold compress to your forehead. Avoid excessive screen time and ensure proper ventilation in your room. If headaches are severe, frequent, or accompanied by vision problems, nausea, or neck stiffness, please consult a doctor immediately. Would you like me to share relaxation techniques that can help prevent headaches?",
  
  "stomach pain": "Stomach pain can have various causes including indigestion, food poisoning, or digestive issues. Try eating light, easily digestible foods like rice, yogurt, or bananas. Avoid spicy, oily, or heavy foods. Drink plenty of fluids and rest. If the pain is severe, persistent, or accompanied by vomiting, fever, or blood in stool, please seek medical attention immediately. Would you like me to provide information about maintaining good digestive health?",
  
  "vaccination": "Vaccination is crucial for preventing serious diseases. Children should receive vaccines according to the government immunization schedule - BCG at birth, DPT at 6, 10, 14 weeks, measles at 9 months, and booster doses as recommended. Adults should also get tetanus boosters every 10 years. All vaccines are available free at government health centers. Would you like me to provide the complete vaccination schedule for your child's age group?",
  
  "diabetes": "Diabetes management involves maintaining a healthy diet, regular exercise, and monitoring blood sugar levels. Eat more vegetables, whole grains, and lean proteins while limiting sweets and processed foods. Regular physical activity like walking or yoga helps control blood sugar. Take medications as prescribed by your doctor and monitor your blood sugar regularly. If you experience symptoms like excessive thirst, frequent urination, or unexplained weight loss, please consult a doctor. Would you like me to provide information about diabetes-friendly foods common in your region?",
  
  "hypertension": "High blood pressure can be managed through lifestyle changes and medication. Reduce salt intake, eat more fruits and vegetables, maintain a healthy weight, and exercise regularly. Avoid smoking and limit alcohol consumption. Take prescribed medications consistently and monitor your blood pressure regularly. If you experience severe headaches, chest pain, or shortness of breath, seek immediate medical attention. Would you like me to provide information about low-sodium foods suitable for your diet?",
  
  "pregnancy": "During pregnancy, it's important to eat nutritious foods, take prenatal vitamins, and attend regular check-ups. Avoid smoking, alcohol, and excessive caffeine. Get adequate rest and gentle exercise. If you experience severe nausea, bleeding, or abdominal pain, contact your healthcare provider immediately. Regular antenatal care at government health centers is free and essential for a healthy pregnancy. Would you like me to provide information about government schemes available for pregnant women?",
  
  "child health": "Children need balanced nutrition, regular vaccinations, and proper hygiene practices. Ensure they eat a variety of foods including fruits, vegetables, and proteins. Maintain good hygiene by washing hands regularly and keeping surroundings clean. Monitor their growth and development milestones. If your child shows signs of malnutrition, persistent illness, or developmental delays, please consult a pediatrician. Would you like me to provide information about child nutrition programs available in your area?",
  
  "mental health": "Mental health is as important as physical health. Practice stress management techniques like deep breathing, meditation, or talking to trusted friends and family. Maintain a regular sleep schedule and engage in activities you enjoy. If you're feeling persistently sad, anxious, or overwhelmed, don't hesitate to seek help from a counselor or doctor. Many government health centers now have mental health services. Would you like me to provide information about stress management techniques suitable for your lifestyle?"
}

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Check for specific keywords and return appropriate response
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return mockResponses.fever
  } else if (lowerMessage.includes('cough') || lowerMessage.includes('throat')) {
    return mockResponses.cough
  } else if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
    return mockResponses.headache
  } else if (lowerMessage.includes('stomach') || lowerMessage.includes('belly') || lowerMessage.includes('abdomen')) {
    return mockResponses['stomach pain']
  } else if (lowerMessage.includes('vaccine') || lowerMessage.includes('immunization') || lowerMessage.includes('polio')) {
    return mockResponses.vaccination
  } else if (lowerMessage.includes('diabetes') || lowerMessage.includes('sugar')) {
    return mockResponses.diabetes
  } else if (lowerMessage.includes('blood pressure') || lowerMessage.includes('hypertension')) {
    return mockResponses.hypertension
  } else if (lowerMessage.includes('pregnant') || lowerMessage.includes('pregnancy')) {
    return mockResponses.pregnancy
  } else if (lowerMessage.includes('child') || lowerMessage.includes('baby') || lowerMessage.includes('infant')) {
    return mockResponses['child health']
  } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('depression')) {
    return mockResponses['mental health']
  }
  
  // Default response for general health questions
  return "Thank you for your health question. While I can provide general health information, it's important to consult with a healthcare professional for personalized medical advice. For immediate concerns, please visit your nearest Primary Health Centre (PHC) or government hospital. Would you like me to help you find healthcare facilities near your location or provide information about government health schemes?"
}

async function geminiGenerate(apiKey: string, prompt: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error: any) {
    console.error("Gemini API error:", error)
    throw new Error(`Gemini API error: ${error.message}`)
  }
}

async function translateText(apiKey: string, text: string, target: "en" | "ta" | "hi" | "ml" | "kn" | "te") {
  if (target === "en") return text
  const targetName = langName[target] || "English"
  const prompt = `Translate the following healthcare information to ${targetName}. Return only the translated text, nothing else.

Text:
${text}`
  return geminiGenerate(apiKey, prompt)
}

export async function POST(req: Request) {
  try {
    const { message, language = "en" } = (await req.json()) as ChatBody

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid request: 'message' is required." }, { status: 400 })
    }
    if (!["en", "ta", "hi", "ml", "kn", "te"].includes(language)) {
      return NextResponse.json({ error: "Invalid 'language'. Use 'en' | 'ta' | 'hi' | 'ml' | 'kn' | 'te'." }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.log("No API key found, using fallback responses")
      
      // Use fallback mock response when no API key
      const mockAnswer = getMockResponse(message)
      
      return NextResponse.json({ 
        reply: mockAnswer, 
        language: "en", // Always return English when no API key
        fallback: true,
        message: "Using offline responses. For full functionality, please add GEMINI_API_KEY to your environment variables."
      })
    }

    const comprehensiveHealthcarePrompt = `You are a comprehensive CareConnect Healthcare Educator AI assistant, specifically designed to serve rural and semi-urban populations in India. Your role is to provide accurate, accessible, and culturally appropriate healthcare information in multiple Indian languages including English, Tamil, Hindi, Malayalam, Kannada, and Telugu.

CORE RESPONSIBILITIES:
1. **Preventive Healthcare Education**: Teach about hygiene, nutrition, exercise, and lifestyle practices suitable for rural settings
2. **Disease Symptom Recognition**: Help identify common symptoms and when to seek medical help
3. **Vaccination Schedules**: Provide information about government vaccination programs, timing, and importance
4. **Outbreak Awareness**: Share information about seasonal diseases, prevention methods, and community health alerts
5. **Government Health Programs**: Inform about available government healthcare services, schemes, and facilities

MULTILINGUAL SUPPORT:
- You can communicate effectively in English, Tamil, Hindi, Malayalam, Kannada, and Telugu
- Understand cultural nuances and regional health practices across different Indian states
- Provide region-specific health advice considering local climate, diet, and lifestyle patterns
- Reference state-specific government health schemes and local healthcare facilities

RESPONSE STYLE - FOLLOW THIS EXACT FORMAT:
- Start with a clear, informative answer to their question (2-3 sentences)
- Provide actionable steps or recommendations
- Always mention when to consult a healthcare professional
- Include a follow-up question or offer additional help
- Suggest government/local resources when relevant
- Use simple, non-medical language that rural populations can understand
- Keep total response between 80-120 words

EXAMPLE RESPONSE PATTERN:
"Based on your symptoms, this could be [condition]. [Provide 2-3 informative sentences with actionable advice]. If [specific condition], consult a nearby doctor immediately. [Include follow-up question or resource offer]."

SPECIFIC EXAMPLES TO FOLLOW:

Example 1 - Fever & Cough:
"Based on your symptoms, this could be a common viral infection, but persistent fever in children should never be ignored. Please ensure your child gets enough rest, fluids, and paracetamol for fever (only in recommended dosage). If the fever continues beyond 3 days, or if you notice breathing difficulties, consult a nearby doctor immediately. Would you like me to share the list of government health centers closest to you?"

Example 2 - Vaccination:
"The polio vaccine is usually given to children under 5 years of age. The first dose is given at birth, followed by booster doses at 6, 10, and 14 weeks. India also runs National Immunization Days where oral polio drops are given free at government centers. Do you want me to send a reminder for the next vaccination drive in your district?"

Example 3 - Disease Awareness:
"Dengue often begins with high fever, severe headache, pain behind the eyes, muscle and joint pain, nausea, and skin rashes. If you or your family notice these symptoms, it is important to stay hydrated and seek medical attention. Severe dengue can be life-threatening if untreated. Would you like me to also explain how you can prevent mosquito breeding around your home?"

Example 4 - Prevention:
"Malaria prevention focuses on controlling mosquito bites. This includes using mosquito nets while sleeping, applying repellents, and ensuring no stagnant water is left in containers, drains, or fields. The government also sprays insecticides in high-risk areas. Early detection and treatment can save lives. I can also connect you with local ASHA workers who conduct awareness campaigns in your area. Do you want me to provide their contact details?"

IMPORTANT GUIDELINES:
- You are NOT a doctor and cannot provide medical diagnosis
- Always recommend consulting healthcare professionals for serious symptoms
- Mention government health centers, ASHA workers, or local resources when relevant
- Include specific follow-up questions like "Would you like me to..." or "Do you want me to..."
- Be culturally sensitive and consider rural living conditions
- Use bullet points for steps when helpful
- Adapt your advice to regional contexts (e.g., monsoon-related diseases in Kerala, heat-related issues in Andhra Pradesh/Telangana, etc.)

User Question: ${message}

Provide a helpful, educational response that follows the exact style and format described above. Make it informative, actionable, and include a relevant follow-up question or resource offer. Use the examples above as your template for response structure.`

    try {
      const englishAnswer = await geminiGenerate(apiKey, comprehensiveHealthcarePrompt)
      const finalAnswer = language === "en" ? englishAnswer : await translateText(apiKey, englishAnswer, language)
      return NextResponse.json({ reply: finalAnswer, language })
    } catch (apiError: any) {
      console.log("API failed, using fallback response:", apiError.message)
      
      // Use fallback mock response
      const mockAnswer = getMockResponse(message)
      
      // For non-English languages, try to translate the mock response
      let finalAnswer = mockAnswer
      if (language !== "en") {
        try {
          finalAnswer = await translateText(apiKey, mockAnswer, language)
        } catch (translateError) {
          console.log("Translation also failed, using English fallback")
          // Keep English response if translation fails
        }
      }
      
      return NextResponse.json({ 
        reply: finalAnswer, 
        language,
        fallback: true // Indicate this is a fallback response
      })
    }
  } catch (err: any) {
    console.error("Chat API error:", err)
    return NextResponse.json({ 
      error: err?.message || "Unknown error occurred while processing your request" 
    }, { status: 500 })
  }
}
