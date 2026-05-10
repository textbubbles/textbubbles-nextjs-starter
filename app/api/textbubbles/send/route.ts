import { NextResponse, type NextRequest } from "next/server";

const TEXTBUBBLES_API_URL = "https://api.textbubbles.com/v1/messages";

export async function POST(request: NextRequest) {
  const apiKey = process.env.TEXTBUBBLES_API_KEY;
  const fromNumber = process.env.TEXTBUBBLES_PHONE_NUMBER;

  if (!apiKey || !fromNumber) {
    return NextResponse.json(
      {
        error:
          "TextBubbles is not configured. Set TEXTBUBBLES_API_KEY and TEXTBUBBLES_PHONE_NUMBER.",
      },
      { status: 500 },
    );
  }

  let body: { recipient?: unknown; text?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const recipient = typeof body.recipient === "string" ? body.recipient.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!recipient) {
    return NextResponse.json(
      { error: "recipient is required" },
      { status: 400 },
    );
  }

  if (!text) {
    return NextResponse.json(
      { error: "text is required" },
      { status: 400 },
    );
  }

  const response = await fetch(TEXTBUBBLES_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: recipient,
      from: fromNumber,
      content: { text },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    const detail = data?.error?.message ?? data?.message ?? "Unknown error";
    return NextResponse.json(
      { error: "Failed to send message", detail, apiResponse: data },
      { status: response.status || 502 },
    );
  }

  return NextResponse.json({
    success: true,
    messageId: data?.data?.id,
    recipient,
    text,
  });
}
