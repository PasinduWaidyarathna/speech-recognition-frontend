import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    if (
      !audioFile.type.includes("audio/wav") &&
      !audioFile.name.endsWith(".wav")
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a .wav file." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Please upload a file smaller than 10MB." },
        { status: 400 }
      );
    }

    const blob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type,
    });
    const externalFormData = new FormData();
    externalFormData.append("file", blob, audioFile.name);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/predict-audio`;

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      body: externalFormData,
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("API error response:", errorText);
      return NextResponse.json(
        { error: "Failed to process audio file via prediction API." },
        { status: apiResponse.status }
      );
    }

    const result = await apiResponse.json();

    return NextResponse.json(result);

  } catch (error) {
    console.error("Speech recognition error:", error);
    return NextResponse.json(
      { error: "Internal server error during speech recognition processing" },
      { status: 500 }
    );
  }
}
