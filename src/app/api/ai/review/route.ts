import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvText, jobDescription } = body;

    if (!cvText) {
      return NextResponse.json(
        { error: "CV text is required" },
        { status: 400 }
      );
    }

    // TODO: Implement actual AI review via OpenAI/Anthropic
    // Placeholder response
    const review = {
      score: 7.5,
      strengths: [
        "Clear professional summary",
        "Well-structured experience section",
        "Good use of action verbs",
      ],
      improvements: [
        "Add quantifiable achievements with metrics",
        "Include more relevant technical skills",
        "Shorten the summary to 2-3 sentences",
      ],
      suggestions:
        "Consider adding a projects section to showcase your work. Use bullet points with measurable outcomes for each role.",
    };

    return NextResponse.json(review);
  } catch (error) {
    console.error("AI review error:", error);
    return NextResponse.json(
      { error: "Failed to process CV review" },
      { status: 500 }
    );
  }
}
