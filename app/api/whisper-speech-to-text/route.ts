import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log('Processing audio with Whisper:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    })

    // Convert the file to the format expected by OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
    })

    console.log('Whisper transcription result:', transcription.text)

    return NextResponse.json({
      transcript: transcription.text,
      success: true,
    })
  } catch (error) {
    console.error('Error in Whisper speech-to-text:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}