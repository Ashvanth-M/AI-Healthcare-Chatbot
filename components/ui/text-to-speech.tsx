"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface TextToSpeechProps {
  text: string
  language?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function TextToSpeech({ text, language = "en", className, size = "sm" }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window)
    
    // Load voices when they become available
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      if (voices.length > 0) {
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`))
      }
    }
    
    // Load voices immediately
    loadVoices()
    
    // Load voices when they become available (some browsers load them asynchronously)
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  useEffect(() => {
    // Clean up when component unmounts or text changes
    return () => {
      if (utteranceRef.current) {
        speechSynthesis.cancel()
      }
    }
  }, [text])

  const getVoiceForLanguage = (lang: string) => {
    const voices = speechSynthesis.getVoices()
    
    // Enhanced language mapping with more specific voice selection
    const languageMap: { [key: string]: string[] } = {
      en: ['en-US', 'en-GB', 'en-AU', 'en-IN', 'en'],
      ta: ['ta-IN', 'ta', 'en-IN'], // Tamil with English-Indian fallback
      hi: ['hi-IN', 'hi', 'en-IN'], // Hindi with English-Indian fallback
      ml: ['ml-IN', 'ml', 'en-IN'], // Malayalam with English-Indian fallback
      kn: ['kn-IN', 'kn', 'en-IN'], // Kannada with English-Indian fallback
      te: ['te-IN', 'te', 'en-IN']  // Telugu with English-Indian fallback
    }

    const targetLanguages = languageMap[lang] || ['en-US']
    
    // Try to find a voice for the specific language
    for (const targetLang of targetLanguages) {
      const voice = voices.find(v => v.lang.startsWith(targetLang))
      if (voice) {
        console.log(`Found voice for ${lang}: ${voice.name} (${voice.lang})`)
        return voice
      }
    }

    // Fallback to any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'))
    if (englishVoice) {
      console.log(`Using English fallback voice: ${englishVoice.name}`)
      return englishVoice
    }

    // Fallback to default voice
    const defaultVoice = voices[0]
    if (defaultVoice) {
      console.log(`Using default voice: ${defaultVoice.name}`)
      return defaultVoice
    }

    return null
  }

  const speak = () => {
    if (!isSupported || !text.trim()) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Configure voice
    const voice = getVoiceForLanguage(language)
    if (voice) {
      utterance.voice = voice
    }

    // Configure speech parameters based on language
    utterance.rate = 0.8 // Slower for better comprehension, especially for non-native languages
    utterance.pitch = language === 'en' ? 1.0 : 0.9 // Slightly lower pitch for Indian languages
    utterance.volume = 0.9 // Higher volume for clarity

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      utteranceRef.current = null
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
      utteranceRef.current = null
    }

    utterance.onpause = () => {
      setIsPaused(true)
    }

    utterance.onresume = () => {
      setIsPaused(false)
    }

    speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume()
    }
  }

  const stop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    utteranceRef.current = null
  }

  const handleClick = () => {
    if (isPlaying) {
      if (isPaused) {
        speechSynthesis.resume()
      } else {
        pause()
      }
    } else {
      speak()
    }
  }

  if (!isSupported) {
    return null
  }

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  }

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          "p-1 hover:bg-slate-100 transition-colors",
          sizeClasses[size],
          className
        )}
        title={isPlaying ? (isPaused ? "Resume" : "Pause") : `Read aloud in ${language.toUpperCase()}`}
      >
        {isPlaying ? (
          isPaused ? (
            <Play className={cn("text-blue-600", iconSize[size])} />
          ) : (
            <Pause className={cn("text-blue-600", iconSize[size])} />
          )
        ) : (
          <Volume2 className={cn("text-slate-500 hover:text-blue-600", iconSize[size])} />
        )}
      </Button>
      {!isPlaying && (
        <span className="text-xs text-slate-400 font-mono">
          {language.toUpperCase()}
        </span>
      )}
    </div>
  )
}
