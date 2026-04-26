'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'
import { toast } from 'sonner'

// Supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'unknown', name: 'Auto-detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' },
  { code: 'as', name: 'অসমীয়া (Assamese)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' }
]

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('unknown')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        setIsProcessing(false)
        stream.getTracks().forEach(track => track.stop()) // cleanup
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Recording started...')
    } catch (error) {
      console.error(error)
      toast.error('Microphone access denied or unavailable.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.info('Recording stopped. Processing...')
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log('Processing audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type,
        language: selectedLanguage
      })

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language', selectedLanguage) // ✅ send chosen language

      console.log('Sending request to AssemblyAI API...')
      const response = await fetch('/api/assemblyai-speech-to-text', {
        method: 'POST',
        body: formData,
      })

      console.log('AssemblyAI API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('AssemblyAI API error:', errorText)
        toast.error(`Transcription failed: ${errorText}`)
        return
      }

      const data = await response.json()
      console.log('AssemblyAI API response data:', data)

      if (data.transcript) {
        onTranscript(data.transcript)
        toast.success(`Transcription successful! (${data.detected_language || selectedLanguage})`)
      } else {
        console.warn('No transcript in response:', data)
        toast.error('No transcript received.')
      }
    } catch (error) {
      console.error('Voice recorder error:', error)
      toast.error(`Error processing audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <select
        className="border rounded px-2 py-1 text-sm"
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        disabled={isRecording || isProcessing}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>

      {/* Record Button */}
      <Button
        type="button"
        variant={isRecording ? 'destructive' : 'outline'}
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isProcessing}
        className="flex items-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            Processing...
          </>
        ) : isRecording ? (
          <>
            <Square className="h-4 w-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Voice Input
          </>
        )}
      </Button>
    </div>
  )
}
