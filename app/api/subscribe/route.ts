import { NextResponse } from "next/server"

const MAILERLITE_API_URL = "https://connect.mailerlite.com/api/subscribers"

interface MailerLiteError {
  message?: string
  errors?: Record<string, string[]>
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    const apiKey = process.env.MAILERLITE_API_KEY
    const groupId = process.env.MAILERLITE_GROUP_ID

    if (!apiKey || !groupId) {
      console.error("MailerLite credentials not configured")
      return NextResponse.json(
        { error: "Subscription service is temporarily unavailable" },
        { status: 500 }
      )
    }

    const response = await fetch(MAILERLITE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        groups: [groupId],
      }),
    })

    if (!response.ok) {
      const errorData: MailerLiteError = await response.json().catch(() => ({}))

      // Handle MailerLite validation errors (422)
      if (response.status === 422) {
        const message = errorData.message || "Invalid email address"
        return NextResponse.json({ error: message }, { status: 422 })
      }

      // Log server errors for debugging
      console.error("MailerLite API error:", {
        status: response.status,
        error: errorData,
      })

      return NextResponse.json(
        { error: "Failed to subscribe. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Subscribe API error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
