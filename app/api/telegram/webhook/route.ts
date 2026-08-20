import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dxxgdqhodrfotullhxxi.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_43oYSk3rsa2USJG7mk8tYg_a1UKu82t";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8743603964:AAEmqOUtEsMVRn3_ZEGSf428SVW5fCP3NP4";

// Helper to send message via Telegram Bot API
async function sendTelegramMessage(chatId: number | string, text: string) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
    return false;
  }
}

/**
 * Next.js App Router API Route Handler for Telegram Webhook
 * Endpoint: POST /api/telegram/webhook
 * Handles incoming Telegram bot updates and stores wallet submissions in Supabase.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true, status: "ignored" });
    }

    const chatId = message.chat.id;
    const chatText = message.text.trim();
    const username = message.from?.username ? `@${message.from.username}` : `@user_${message.from.id}`;

    // 1. Handle /start command & deep linking (/start cmp_XXXX)
    if (chatText.startsWith("/start")) {
      const parts = chatText.split(" ");
      const campaignId = parts[1] || "cmp_xlayer1";

      const replyText = `🎁 *Welcome to Grow Campaign!*\n\nYou joined campaign \`${campaignId}\`.\n\nPlease reply directly with your *OKX X Layer EVM wallet address* (starting with \`0x...\`) to register for token rewards.`;
      
      await sendTelegramMessage(chatId, replyText);
      return NextResponse.json({ ok: true, campaignId });
    }

    // 2. Handle EVM Wallet Address Submission
    if (isAddress(chatText)) {
      // Save directly to Supabase submissions table
      const { data, error } = await supabase.from("submissions").insert([
        {
          campaign_id: "cmp_xlayer1",
          telegram_handle: username,
          wallet_address: chatText,
          amount: 0.25,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Supabase Submission Insert Error:", error);
      }

      const replyText = `✅ *Wallet Address Registered!*\n\n• *Address:* \`${chatText.slice(0, 6)}...${chatText.slice(-4)}\`\n• *Campaign:* \`cmp_xlayer1\`\n• *Handle:* ${username}\n\nYour address has been saved and synced to the creator's live X Layer dashboard.`;

      await sendTelegramMessage(chatId, replyText);
      return NextResponse.json({ ok: true, registered: true, wallet: chatText });
    }

    // 3. Fallback for non-wallet message
    const fallbackText = `⚠️ *Invalid Wallet Address*\n\nPlease send a valid OKX X Layer EVM wallet address starting with \`0x...\` (42 characters).`;
    await sendTelegramMessage(chatId, fallbackText);

    return NextResponse.json({ ok: true, status: "invalid_address" });
  } catch (error: any) {
    console.error("Telegram Webhook Route Error:", error);
    return NextResponse.json({ error: "Invalid webhook payload", details: error?.message }, { status: 400 });
  }
}
