import { NextResponse } from "next/server";
import { isAddress } from "viem";

/**
 * Next.js App Router API Route Handler
 * Endpoint: POST /api/telegram/webhook
 * Handles Telegram bot /start cmp_XXXX commands and wallet submissions
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true, status: "ignored" });
    }

    const chatText = message.text.trim();
    const username = message.from?.username ? `@${message.from.username}` : "@anonymous";

    // Validate EVM Wallet Address
    if (isAddress(chatText)) {
      return NextResponse.json({
        ok: true,
        reply: `✓ Wallet address ${chatText} received for ${username}! Recorded on X Layer dashboard.`,
        wallet: chatText,
        username,
      });
    }

    // Handle /start cmp_XXXX
    if (chatText.startsWith("/start")) {
      const campaignId = chatText.split(" ")[1] || "default";
      return NextResponse.json({
        ok: true,
        reply: `Welcome! Please reply with your X Layer EVM wallet address (0x...) to participate in campaign ${campaignId}.`,
      });
    }

    return NextResponse.json({
      ok: true,
      reply: "Please send a valid X Layer EVM wallet address starting with 0x...",
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
