import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Validate file type
    if (!audioFile.type.includes("audio/wav") && !audioFile.name.endsWith(".wav")) {
      return NextResponse.json({ error: "Invalid file type. Please upload a .wav file." }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({ error: "File too large. Please upload a file smaller than 10MB." }, { status: 400 })
    }

    // Simulate processing time
    const processingStartTime = Date.now()
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

    // Simulate AI speech recognition results
    const sampleTranscriptions = [
      "Hello, this is a test of the speech recognition system. The weather is beautiful today.",
      "Welcome to our AI-powered speech recognition platform. We hope you find it useful.",
      "The quick brown fox jumps over the lazy dog. This is a common phrase used for testing.",
      "Artificial intelligence has revolutionized the way we process and understand human speech.",
      "Thank you for using our speech recognition service. We appreciate your feedback.",
      "Machine learning algorithms can now transcribe speech with remarkable accuracy.",
      "This technology opens up new possibilities for accessibility and automation.",
      "Voice recognition systems are becoming increasingly sophisticated and reliable.",
    ]

    const randomTranscription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)]
    const confidence = 0.85 + Math.random() * 0.14 // Between 85% and 99%
    const duration = 3 + Math.random() * 12 // Between 3 and 15 seconds
    const processingTime = (Date.now() - processingStartTime) / 1000

    const result = {
      transcription: randomTranscription,
      confidence: confidence,
      duration: duration,
      processingTime: processingTime,
      fileName: audioFile.name,
      fileSize: audioFile.size,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Speech recognition error:", error)
    return NextResponse.json({ error: "Internal server error during speech recognition processing" }, { status: 500 })
  }
}
