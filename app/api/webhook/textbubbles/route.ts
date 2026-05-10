import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { addInboundMessage } from "@/lib/message-store";

const REPLAY_WINDOW_SECONDS = 300;

function verifySignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.TEXTBUBBLES_WEBHOOK_SECRET;
  if (!secret) return false;

  const signature = request.headers.get("x-signature");
  const timestamp = request.headers.get("x-timestamp");
  if (!signature || !timestamp) return false;

  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > REPLAY_WINDOW_SECONDS) return false;

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifySignature(request, rawBody)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let event: { type?: string; timestamp?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  // Only inbound user messages are surfaced; delivery/reaction/audio events
  // are acknowledged but not stored. Return 200 either way so TextBubbles
  // doesn't retry.
  if (event.type === "message.inbound") {
    const data = event.data ?? {};
    const text = typeof data.text === "string" ? data.text : "";
    const from = typeof data.from === "string" ? data.from : "";
    const to = typeof data.to === "string" ? data.to : "";
    const id =
      (typeof data.messageId === "string" && data.messageId) ||
      (typeof data.externalMessageId === "string" && data.externalMessageId) ||
      crypto.randomUUID();
    const receivedAt =
      typeof event.timestamp === "string" ? event.timestamp : new Date().toISOString();

    addInboundMessage({ id, from, to, text, receivedAt });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "active",
    info: "TextBubbles webhook is active and ready to receive events.",
  });
}
