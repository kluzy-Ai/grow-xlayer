import { NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import { isAddress } from "viem";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dxxgdqhodrfotullhxxi.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_43oYSk3rsa2USJG7mk8tYg_a1UKu82t";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// In-memory session tracking for active campaign per chat ID
const userCampaignSessions = new Map<number, string>();

/**
 * Next.js App Router API Route Handler for Telegram Webhook
 * Endpoint: POST /api/telegram/webhook
 * Uses Telegraf framework to process updates and store wallet submissions in Supabase database.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // 1. If TELEGRAM_BOT_TOKEN is present, process via Telegraf instance
    if (botToken && botToken !== "your_telegram_bot_token_here") {
      const bot = new Telegraf(botToken);

      // Handle /start cmp_XXXX deep link
      bot.start(async (ctx) => {
        const payload = ctx.payload; // Extracts 'cmp_XXXX' from /start cmp_XXXX
        const chatId = ctx.chat.id;

        if (payload) {
          userCampaignSessions.set(chatId, payload);
          await ctx.reply(
            `🎁 Welcome to Grow Campaign!\n\nYou clicked the link for campaign [${payload}].\n\nPlease reply directly with your OKX X Layer EVM wallet address (0x...) to complete registration.`
          );
        } else {
          await ctx.reply(
            "Welcome to Grow Bot! Please click a campaign link from your creator's community to submit your wallet address."
          );
        }
      });

      // Handle Wallet Address text messages
      bot.on("text", async (ctx) => {
        const text = ctx.message.text.trim();
        const chatId = ctx.chat.id;
        const username = ctx.from?.username ? `@${ctx.from.username}` : `@user_${ctx.from.id}`;
        const activeCampaignId = userCampaignSessions.get(chatId) || "cmp_xlayer1";

        // Validate EVM Wallet Address
        if (isAddress(text)) {
          // Insert into Supabase submissions table
          const { data, error } = await supabase.from("submissions").insert([
            {
              campaign_id: activeCampaignId,
              telegram_handle: username,
              wallet_address: text,
              amount: 0.25,
              status: "pending",
            },
          ]);

          if (error) {
            console.error("Supabase Submission Insert Error:", error);
          }

          await ctx.reply(
            `✅ Wallet Address Registered!\n\n• Address: ${text.slice(0, 6)}...${text.slice(-4)}\n• Campaign: ${activeCampaignId}\n• Handle: ${username}\n\nYour address is synced with the creator's live X Layer dashboard.`
          );
        } else if (!text.startsWith("/start")) {
          await ctx.reply(
            "⚠️ Invalid Wallet Address. Please send a valid X Layer EVM wallet address starting with 0x..."
          );
        }
      });

      // Handle incoming update from Telegram Webhook payload
      await bot.handleUpdate(body);
      return NextResponse.json({ ok: true });
    }

    // 2. Direct HTTP Webhook Fallback if bot instance is testing via standard web payload
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true, status: "ignored" });
    }

    const chatText = message.text.trim();
    const username = message.from?.username ? `@${message.from.username}` : "@anonymous";

    if (isAddress(chatText)) {
      // Save directly to Supabase DB
      await supabase.from("submissions").insert([
        {
          campaign_id: "cmp_xlayer1",
          telegram_handle: username,
          wallet_address: chatText,
          amount: 0.25,
          status: "pending",
        },
      ]);

      return NextResponse.json({
        ok: true,
        reply: `✓ Wallet address ${chatText} received for ${username}! Recorded on X Layer database & dashboard.`,
        wallet: chatText,
        username,
      });
    }

    if (chatText.startsWith("/start")) {
      const campaignId = chatText.split(" ")[1] || "cmp_xlayer1";
      return NextResponse.json({
        ok: true,
        reply: `Welcome! Please reply with your X Layer EVM wallet address (0x...) to participate in campaign ${campaignId}.`,
      });
    }

    return NextResponse.json({
      ok: true,
      reply: "Please send a valid X Layer EVM wallet address starting with 0x...",
    });
  } catch (error: any) {
    console.error("Telegram Webhook Route Error:", error);
    return NextResponse.json({ error: "Invalid webhook payload", details: error?.message }, { status: 400 });
  }
}
