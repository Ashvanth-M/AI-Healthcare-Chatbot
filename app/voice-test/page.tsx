'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

export default function VoiceTestPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const recognitionRef = useRef<any>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testWebSpeechAPI = () => {
    setError('')
    setTranscript('')
    addLog('Testing Web Speech API...')

    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('Web Speech API not supported in this browser')
      addLog('ERROR: Web Speech API not supported')
      return
    }

    addLog('Web Speech API is supported')

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true  // Changed back to true for better detection
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 3  // Increased alternatives

    recognition.onstart = () => {
      addLog('Speech recognition started - SPEAK NOW!')
      setIsRecording(true)
    }

    recognition.onspeechstart = () => {
      addLog('Speech detected!')
    }

    recognition.onspeechend = () => {
      addLog('Speech ended')
    }

    recognition.onsoundstart = () => {
      addLog('Sound detected')
    }

    recognition.onsoundend = () => {
      addLog('Sound ended')
    }

    recognition.onaudiostart = () => {
      addLog('Audio capture started')
    }

    recognition.onaudioend = () => {
      addLog('Audio capture ended')
    }

    recognition.onresult = (event: any) => {
      addLog(`Got ${event.results.length} results`)
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        addLog(`Result ${i}: "${transcript}" (final: ${event.results[i].isFinal})`)
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript)
        addLog(`Final transcript: "${finalTranscript}"`)
      } else if (interimTranscript) {
        setTranscript(interimTranscript + ' (interim)')
        addLog(`Interim transcript: "${interimTranscript}"`)
      }
    }

    recognition.onerror = (event: any) => {
      addLog(`ERROR: ${event.error}`)
      
      if (event.error === 'no-speech') {
        addLog('SOLUTION: Try speaking louder, closer to microphone, or check microphone sensitivity')
        setError(`No speech detected. Please speak louder and closer to your microphone. Error: ${event.error}`)
      } else if (event.error === 'audio-capture') {
        addLog('SOLUTION: Check if another app is using your microphone')
        setError(`Microphone capture failed. Close other apps using microphone. Error: ${event.error}`)
      } else if (event.error === 'not-allowed') {
        addLog('SOLUTION: Allow microphone permissions in browser settings')
        setError(`Microphone permission denied. Please allow microphone access. Error: ${event.error}`)
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
      
      setIsRecording(false)
    }

    recognition.onend = () => {
      addLog('Speech recognition ended')
      setIsRecording(false)
    }

    try {
      recognition.start()
      addLog('Starting recognition...')
    } catch (err) {
      addLog(`ERROR starting recognition: ${err}`)
      setError(`Failed to start recognition: ${err}`)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      addLog('Manually stopped recognition')
    }
  }

  const testMicrophone = async () => {
    addLog('Testing microphone access...')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      addLog('Microphone access granted!')
      
      // Test if we can get audio data
      const mediaRecorder = new MediaRecorder(stream)
      let hasAudio = false
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          hasAudio = true
          addLog(`Got audio data: ${event.data.size} bytes`)
        }
      }
      
      mediaRecorder.start()
      setTimeout(() => {
        mediaRecorder.stop()
        stream.getTracks().forEach(track => track.stop())
        if (!hasAudio) {
          addLog('WARNING: No audio data received from microphone')
        }
      }, 2000)
      
    } catch (err) {
      addLog(`ERROR: Microphone access denied - ${err}`)
      setError(`Microphone error: ${err}`)
    }
  }

  const testSarvamAPI = async () => {
    setError('')
    setTranscript('')
    addLog('Testing Sarvam API...')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      addLog('Microphone access granted for Sarvam test')
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
          addLog(`Got audio chunk: ${event.data.size} bytes`)
        }
      }

      mediaRecorder.onstop = async () => {
        addLog('Recording stopped, processing with Sarvam...')
        
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          addLog(`Total audio size: ${audioBlob.size} bytes`)
          
          try {
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.webm')
            formData.append('language', 'en')

            addLog('Sending audio to Sarvam API...')
            const response = await fetch('/api/speech-to-text', {
              method: 'POST',
              body: formData,
            })

            addLog(`Sarvam API response status: ${response.status}`)

            if (!response.ok) {
              const errorText = await response.text()
              addLog(`Sarvam API error: ${errorText}`)
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const data = await response.json()
            addLog(`Sarvam API response: ${JSON.stringify(data)}`)

            if (data && data.transcript) {
              setTranscript(data.transcript)
              addLog(`SUCCESS: Sarvam transcript: "${data.transcript}"`)
            } else {
              addLog('No transcript in Sarvam response')
              setError('No speech detected by Sarvam API')
            }
          } catch (error) {
            addLog(`Sarvam API error: ${error}`)
            setError(`Sarvam API failed: ${error}`)
          }
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
      addLog('Recording started - SPEAK NOW for 5 seconds!')
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
          addLog('Auto-stopped recording after 5 seconds')
        }
      }, 5000)
      
    } catch (error) {
      addLog(`Error starting Sarvam test: ${error}`)
      setError(`Failed to start Sarvam test: ${error}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setError('')
    setTranscript('')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Voice Recognition Debug Test</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={testMicrophone}>Test Microphone</Button>
          <Button 
            onClick={isRecording ? stopRecording : testWebSpeechAPI}
            variant={isRecording ? "destructive" : "default"}
          >
            {isRecording ? 'Stop Recording' : 'Test Web Speech API'}
          </Button>
          <Button 
            onClick={testSarvamAPI}
            disabled={isRecording}
            variant="secondary"
          >
            {isRecording ? 'Recording...' : 'Test Sarvam API'}
          </Button>
          <Button onClick={clearLogs} variant="outline">Clear Logs</Button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {transcript && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>Transcript:</strong> {transcript}
          </div>
        )}

        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Debug Logs:</h3>
          <div className="bg-gray-100 p-3 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click a test button to start.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <h4 className="font-semibold">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>First click "Test Microphone" to check if your microphone works</li>
            <li>Then click "Test Web Speech API" and speak clearly</li>
            <li>Watch the debug logs to see what happens</li>
            <li>Check browser console (F12) for additional errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}