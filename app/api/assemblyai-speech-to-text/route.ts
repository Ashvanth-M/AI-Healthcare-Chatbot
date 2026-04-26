import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('AssemblyAI API route called')
    
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const language = (formData.get('language') as string) || 'en'

    console.log('Request data:', {
      audioFile: audioFile ? { name: audioFile.name, size: audioFile.size, type: audioFile.type } : null,
      language
    })

    if (!audioFile) {
      console.error('No audio file provided')
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY
    if (!apiKey) {
      console.error('Missing AssemblyAI API key')
      return NextResponse.json({ error: 'Missing AssemblyAI API key' }, { status: 500 })
    }

    console.log('AssemblyAI API key found, processing audio...')

    // Convert audio file to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)

    console.log('Audio buffer created, size:', audioBuffer.length)

    // Step 1: Upload audio to AssemblyAI
    console.log('Uploading audio to AssemblyAI...')
    const uploadResp = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        authorization: apiKey,
      },
      body: audioBuffer,
    })

    console.log('Upload response status:', uploadResp.status)

    if (!uploadResp.ok) {
      const errorText = await uploadResp.text()
      console.error('Upload failed:', errorText)
      return NextResponse.json({ error: `Upload failed: ${errorText}` }, { status: uploadResp.status })
    }

    const { upload_url } = await uploadResp.json()
    console.log('Audio uploaded successfully, URL:', upload_url)

    // Step 2: Request transcription
    const transcriptReq: any = {
      audio_url: upload_url,
      punctuate: true,
      format_text: true,
    }

    if (language === 'unknown') {
      transcriptReq.language_detection = true
    } else {
      transcriptReq.language_code = language
    }

    console.log('Requesting transcription with config:', transcriptReq)

    const transcriptResp = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(transcriptReq),
    })

    console.log('Transcript request response status:', transcriptResp.status)

    if (!transcriptResp.ok) {
      const errorText = await transcriptResp.text()
      console.error('Transcript request failed:', errorText)
      return NextResponse.json({ error: `Transcript request failed: ${errorText}` }, { status: transcriptResp.status })
    }

    const transcriptData = await transcriptResp.json()
    console.log('Transcript request submitted, ID:', transcriptData.id, 'Status:', transcriptData.status)

    // Step 3: Poll until completed
    let status = transcriptData.status
    let transcriptResult = transcriptData
    let pollCount = 0

    while (status !== 'completed' && status !== 'error') {
      pollCount++
      console.log(`Polling attempt ${pollCount}, status: ${status}`)
      
      await new Promise(r => setTimeout(r, 5000))
      const pollResp = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptData.id}`, {
        headers: { authorization: apiKey },
      })
      transcriptResult = await pollResp.json()
      status = transcriptResult.status
      
      // Prevent infinite polling
      if (pollCount > 24) { // 2 minutes max
        console.error('Transcription timeout after 2 minutes')
        return NextResponse.json({ error: 'Transcription timeout' }, { status: 408 })
      }
    }

    console.log('Final transcription status:', status)

    if (status === 'completed') {
      console.log('Transcription successful:', transcriptResult.text)
      return NextResponse.json({
        transcript: transcriptResult.text,
        confidence: transcriptResult.confidence,
        detected_language: transcriptResult.language_code,
        success: true,
      })
    } else {
      console.error('Transcription failed:', transcriptResult.error)
      return NextResponse.json({ error: transcriptResult.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('AssemblyAI route error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
