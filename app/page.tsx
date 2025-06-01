"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, FileAudio, Mic, Brain, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProcessingResult {
  transcription: string
  confidence: number
  duration: number
  processingTime: number
}

export default function SpeechRecognitionApp() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadedFile(file)
    setError(null)
    setResult(null)
    setUploadProgress(0)

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          processAudio(file)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [])

  const processAudio = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("audio", file)

      const response = await fetch("/api/speech-recognition", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process audio file")
      }

      const result = await response.json()
      setResult(result)
      setShowResultDialog(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during processing")
    } finally {
      setIsProcessing(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/wav": [".wav"],
      "audio/wave": [".wav"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  })

  const resetApp = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setResult(null)
    setError(null)
    setIsProcessing(false)
    setShowResultDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Speech Recognition</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Convert audio to text with AI-powered accuracy
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Audio File</span>
              </CardTitle>
              <CardDescription>Upload a .wav audio file to get started with speech recognition</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <FileAudio className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  {isDragActive ? (
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Drop the audio file here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Drag and drop your .wav file here, or{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-medium">click to browse</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Supports .wav files up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span className="text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Uploaded File Info */}
              {uploadedFile && uploadProgress === 100 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      File uploaded successfully: {uploadedFile.name}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Status */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-lg font-medium">Processing audio with AI model...</span>
                </div>
                <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                  This may take a few moments depending on the file size
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Dialog */}
          <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-5 w-5" />
                  <span>Speech Recognition Results</span>
                </DialogTitle>
                <DialogDescription>Your audio file has been successfully processed by our AI model.</DialogDescription>
              </DialogHeader>

              {result && (
                <div className="space-y-6">
                  {/* Transcription */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Transcription</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-lg leading-relaxed">{result.transcription}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {(result.confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {result.duration.toFixed(1)}s
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Audio Duration</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {result.processingTime.toFixed(1)}s
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Processing Time</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={resetApp} variant="outline" size="lg">
                      Process Another File
                    </Button>
                    <Button onClick={() => setShowResultDialog(false)} size="lg">
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-1.5 rounded">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">AI Speech Recognition Platform</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 AI Speech Recognition. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Powered by advanced AI technology</p>
            </div>
          </div>

          {/* Additional Footer Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <a
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Support
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                API Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
