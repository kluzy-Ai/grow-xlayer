import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://dxxgdqhodrfotullhxxi.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_43oYSk3rsa2USJG7mk8tYg_a1UKu82t";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8743603964:AAEmqOUtEsMVRn3_ZEGSf428SVW5fCP3NP4";

// In-memory fallback cache for serverless chat session speed & redundancy
interface ChatSession {
  campaignId: string;
  campaignTitle: string;
  amountPerClaim: number;
  tokenSymbol: string;
}
const chatSessionMap = new Map<string, ChatSession>();

// UUID regex validator to prevent Postgres casting errors on non-UUID slug strings
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// EVM Address regex extractor
const ETH_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/i;

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
 * Safely lookup a campaign from Supabase by slug, UUID, or title.
 */
async function fetchCampaignDetails(campaignIdentifier?: string) {
  try {
    if (campaignIdentifier) {
      const isUuid = UUID_REGEX.test(campaignIdentifier);

      let query = supabase.from("campaigns").select("*");

      if (isUuid) {
        query = query.eq("id", campaignIdentifier);
      } else {
        // Try slug first
        const { data: slugData } = await supabase
          .from("campaigns")
          .select("*")
          .eq("slug", campaignIdentifier)
          .maybeSingle();

        if (slugData) return slugData;

        // Fallback to title matching or ID if applicable
        query = query.eq("title", campaignIdentifier);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return data;
      }
    }

    // If identifier is not found or not provided, fetch the latest active campaign from the database
    const { data: latestActive } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestActive) {
      return latestActive;
    }
  } catch (err) {
    console.warn("Error fetching campaign details from Supabase:", err);
  }

  return {
    id: campaignIdentifier || "grow_campaign",
    title: campaignIdentifier ? `Campaign ${campaignIdentifier}` : "Grow Community Giveaway",
    amount_per_claim: 0.25,
    token_symbol: "OKB",
    status: "active",
    max_spots: 20,
  };
}

/**
 * Persist or update the user's active session in Supabase bot_sessions table
 */
async function saveBotSession(
  chatId: string,
  userId: string | null,
  handle: string,
  session: ChatSession
) {
  // Update in-memory fallback
  chatSessionMap.set(chatId, session);

  try {
    await supabase.from("bot_sessions").upsert(
      {
        chat_id: String(chatId),
        telegram_user_id: userId ? String(userId) : null,
        telegram_handle: handle,
        campaign_id: session.campaignId,
        campaign_title: session.campaignTitle,
        amount_per_claim: session.amountPerClaim,
        token_symbol: session.tokenSymbol,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "chat_id" }
    );
  } catch (err) {
    console.warn("Failed to persist bot_session to Supabase:", err);
  }
}

/**
 * Retrieve the user's active campaign session from Supabase or fallback cache
 */
async function getBotSession(chatId: string): Promise<ChatSession> {
  // 1. Try Supabase bot_sessions table
  try {
    const { data } = await supabase
      .from("bot_sessions")
      .select("*")
      .eq("chat_id", String(chatId))
      .maybeSingle();

    if (data && data.campaign_id) {
      const session: ChatSession = {
        campaignId: data.campaign_id,
        campaignTitle: data.campaign_title || `Campaign ${data.campaign_id}`,
        amountPerClaim: Number(data.amount_per_claim) || 0.25,
        tokenSymbol: data.token_symbol || "OKB",
      };
      chatSessionMap.set(chatId, session);
      return session;
    }
  } catch (err) {
    console.warn("Supabase bot_sessions lookup error:", err);
  }

  // 2. Try In-memory fallback cache
  if (chatSessionMap.has(chatId)) {
    return chatSessionMap.get(chatId)!;
  }

  // 3. Fallback: check latest submission from this chat/user
  try {
    const { data: subData } = await supabase
      .from("submissions")
      .select("campaign_id, amount")
      .eq("chat_id", String(chatId))
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subData && subData.campaign_id) {
      const camp = await fetchCampaignDetails(subData.campaign_id);
      const session: ChatSession = {
        campaignId: subData.campaign_id,
        campaignTitle: camp.title || `Campaign ${subData.campaign_id}`,
        amountPerClaim: Number(camp.amount_per_claim || subData.amount) || 0.25,
        tokenSymbol: camp.token_symbol || "OKB",
      };
      chatSessionMap.set(chatId, session);
      return session;
    }
  } catch (err) {
    console.warn("Fallback submission lookup error:", err);
  }

  // 4. Resolve latest active database campaign
  const latestCampaign = await fetchCampaignDetails();
  return {
    campaignId: latestCampaign.slug || latestCampaign.id,
    campaignTitle: latestCampaign.title || "Grow Community Giveaway",
    amountPerClaim: Number(latestCampaign.amount_per_claim) || 0.25,
    tokenSymbol: latestCampaign.token_symbol || "OKB",
  };
}

/**
 * Next.js App Router API Route Handler for Telegram Webhook
 * Endpoint: POST /api/telegram/webhook
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message || body.edited_message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true, status: "ignored_no_text" });
    }

    const chatId = String(message.chat.id);
    const userId = message.from?.id ? String(message.from.id) : null;
    const chatText = message.text.trim();
    const username = message.from?.username
      ? `@${message.from.username}`
      : message.from?.first_name
      ? `${message.from.first_name}`
      : `@user_${chatId}`;

    // -------------------------------------------------------------------------
    // 1. COMMAND: /start [campaign_id]
    // -------------------------------------------------------------------------
    if (chatText.startsWith("/start")) {
      const parts = chatText.split(" ");
      const rawParam = parts[1]?.trim();

      const campaignData = await fetchCampaignDetails(rawParam);
      const campaignId = rawParam || campaignData.slug || campaignData.id;
      const campaignTitle = campaignData.title || `Campaign ${campaignId}`;
      const amountPerClaim = Number(campaignData.amount_per_claim) || 0.25;
      const tokenSymbol = campaignData.token_symbol || "OKB";
      const isPausedOrEnded =
        campaignData.status && campaignData.status !== "active";

      // Persist active session for this chat
      const currentSession: ChatSession = {
        campaignId,
        campaignTitle,
        amountPerClaim,
        tokenSymbol,
      };
      await saveBotSession(chatId, userId, username, currentSession);

      // Check if user already submitted a wallet for this campaign
      let existingWallet: string | null = null;
      try {
        const { data: existingSub } = await supabase
          .from("submissions")
          .select("wallet_address, status, amount")
          .eq("campaign_id", campaignId)
          .or(`telegram_handle.eq.${username},chat_id.eq.${chatId}`)
          .maybeSingle();

        if (existingSub) {
          existingWallet = existingSub.wallet_address;
        }
      } catch (err) {
        console.warn("Check existing submission error:", err);
      }

      if (isPausedOrEnded) {
        const pausedText = `⚠️ *Campaign Status Update*\n\nThe campaign **${campaignTitle}** is currently inactive or completed.\n\nStay tuned for upcoming token drops on OKX X Layer!`;
        await sendTelegramMessage(chatId, pausedText);
        return NextResponse.json({ ok: true, status: "campaign_inactive" });
      }

      if (existingWallet) {
        const alreadyRegisteredText = `🎁 *Welcome Back!*\n\nYou are joined in **${campaignTitle}**.\n\n💰 *Reward:* **${amountPerClaim} ${tokenSymbol}**\n📌 *Registered Wallet:* \`${existingWallet.slice(0, 6)}...${existingWallet.slice(-4)}\`\n\nTo update your wallet address for this campaign, simply reply with your new OKX X Layer EVM wallet address (\`0x...\`).`;
        await sendTelegramMessage(chatId, alreadyRegisteredText);
        return NextResponse.json({
          ok: true,
          status: "already_registered",
          campaignId,
        });
      }

      const welcomeText = `🎁 *Welcome to Grow Campaign!*\n\nYou joined **${campaignTitle}**.\n\n💰 *Reward Allocation:* **${amountPerClaim} ${tokenSymbol}**\n⚡ *Network:* OKX X Layer (Chain ID 1952)\n\nPlease reply directly with your *EVM wallet address* (starting with \`0x...\`) to register your reward spot.`;

      await sendTelegramMessage(chatId, welcomeText);
      return NextResponse.json({
        ok: true,
        campaignId,
        campaignTitle,
        amountPerClaim,
        tokenSymbol,
      });
    }

    // -------------------------------------------------------------------------
    // 2. COMMAND: /status OR /mywallet
    // -------------------------------------------------------------------------
    if (chatText === "/status" || chatText === "/mywallet") {
      try {
        const { data: userSubs, error } = await supabase
          .from("submissions")
          .select("campaign_id, wallet_address, amount, status, created_at")
          .or(`telegram_handle.eq.${username},chat_id.eq.${chatId}`)
          .order("created_at", { ascending: false });

        if (error || !userSubs || userSubs.length === 0) {
          const noSubText = `📋 *No Registered Wallets Found*\n\nYou haven't registered for any active giveaways yet.\n\nClick a Grow campaign link or send \`/start <campaign_id>\` to get started.`;
          await sendTelegramMessage(chatId, noSubText);
          return NextResponse.json({ ok: true, status: "no_submissions" });
        }

        let summaryText = `📋 *Your Registered Campaigns (${userSubs.length}):*\n\n`;
        userSubs.forEach((sub, idx) => {
          const statusIcon =
            sub.status === "paid" ? "✅ Paid" : "⏳ Pending Distribution";
          summaryText += `${idx + 1}. **${sub.campaign_id}**\n   • Wallet: \`${sub.wallet_address.slice(0, 6)}...${sub.wallet_address.slice(-4)}\`\n   • Amount: **${sub.amount || 0.25} OKB**\n   • Status: ${statusIcon}\n\n`;
        });

        summaryText += `Reply with a new \`0x...\` address to update your active campaign spot.`;
        await sendTelegramMessage(chatId, summaryText);
        return NextResponse.json({ ok: true, submissionsCount: userSubs.length });
      } catch (err) {
        console.error("Status lookup error:", err);
      }
    }

    // -------------------------------------------------------------------------
    // 3. COMMAND: /help
    // -------------------------------------------------------------------------
    if (chatText === "/help") {
      const helpText = `💡 *Grow Telegram Bot Guide*\n\n1. **Join a Campaign:** Click a creator's claim link or send \`/start <campaign_id>\`.\n2. **Submit Wallet:** Send your \`0x...\` EVM address (OKX X Layer compatible).\n3. **Update Wallet:** Send a new \`0x...\` address anytime to update your registration.\n4. **Check Status:** Send \`/status\` to view all your registered giveaway spots.\n\nPowered by OKX X Layer & Grow Web3.`;
      await sendTelegramMessage(chatId, helpText);
      return NextResponse.json({ ok: true, status: "help_sent" });
    }

    // -------------------------------------------------------------------------
    // 4. EVM WALLET ADDRESS SUBMISSION & COLLECTION
    // -------------------------------------------------------------------------
    const addressMatch = chatText.match(ETH_ADDRESS_REGEX);
    const extractedAddress = addressMatch ? addressMatch[0] : null;

    if (extractedAddress && isAddress(extractedAddress)) {
      // 1. Retrieve the user's active campaign session
      const activeSession = await getBotSession(chatId);
      const { campaignId, campaignTitle, amountPerClaim, tokenSymbol } =
        activeSession;

      // 2. Check if user already submitted for this campaign
      let existingSubId: string | null = null;
      try {
        const { data: existingSub } = await supabase
          .from("submissions")
          .select("id, wallet_address")
          .eq("campaign_id", campaignId)
          .or(`telegram_handle.eq.${username},chat_id.eq.${chatId}`)
          .maybeSingle();

        if (existingSub) {
          existingSubId = existingSub.id;
        }
      } catch (err) {
        console.warn("Existing submission query error:", err);
      }

      // 3. If updating existing submission for this user on this campaign
      if (existingSubId) {
        const { error: updateError } = await supabase
          .from("submissions")
          .update({
            wallet_address: extractedAddress,
            amount: amountPerClaim,
            chat_id: chatId,
            telegram_handle: username,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubId);

        if (updateError) {
          console.error("Supabase update error:", updateError);
        }

        const replyText = `🔄 *Wallet Address Updated!*\n\n• *Campaign:* **${campaignTitle}** (\`${campaignId}\`)\n• *Reward:* **${amountPerClaim} ${tokenSymbol}**\n• *New Wallet:* \`${extractedAddress}\`\n• *Telegram Handle:* ${username}\n\nYour updated address is synced to the creator's live X Layer dashboard.`;
        await sendTelegramMessage(chatId, replyText);
        return NextResponse.json({
          ok: true,
          updated: true,
          wallet: extractedAddress,
          campaignId,
        });
      }

      // 4. Check if wallet is already registered by another user in this campaign
      try {
        const { data: duplicateWallet } = await supabase
          .from("submissions")
          .select("id, telegram_handle")
          .eq("campaign_id", campaignId)
          .eq("wallet_address", extractedAddress)
          .maybeSingle();

        if (duplicateWallet && duplicateWallet.telegram_handle !== username) {
          const dupText = `⚠️ *Wallet Already Registered*\n\nThis wallet address (\`${extractedAddress.slice(0, 6)}...${extractedAddress.slice(-4)}\`) has already been submitted for **${campaignTitle}** by another user.\n\nPlease submit your own unique OKX X Layer EVM wallet address.`;
          await sendTelegramMessage(chatId, dupText);
          return NextResponse.json({
            ok: true,
            status: "duplicate_wallet_prevented",
          });
        }
      } catch (err) {
        console.warn("Duplicate wallet check error:", err);
      }

      // 5. Insert new submission
      const { data, error } = await supabase.from("submissions").insert([
        {
          campaign_id: campaignId,
          telegram_handle: username,
          chat_id: chatId,
          wallet_address: extractedAddress,
          amount: amountPerClaim,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Supabase Submission Insert Error:", error);
      }

      const replyText = `✅ *Wallet Address Registered!*\n\n• *Campaign:* **${campaignTitle}** (\`${campaignId}\`)\n• *Reward:* **${amountPerClaim} ${tokenSymbol}**\n• *Wallet:* \`${extractedAddress}\`\n• *Telegram Handle:* ${username}\n\nYour spot has been secured and synced to the creator's live X Layer dashboard.`;

      await sendTelegramMessage(chatId, replyText);
      return NextResponse.json({
        ok: true,
        registered: true,
        wallet: extractedAddress,
        campaignId,
        campaignTitle,
        amount: amountPerClaim,
      });
    }

    // -------------------------------------------------------------------------
    // 5. FALLBACK FOR NON-WALLET MESSAGE
    // -------------------------------------------------------------------------
    const fallbackText = `⚠️ *Invalid Wallet Address*\n\nPlease send a valid OKX X Layer EVM wallet address starting with \`0x...\` (42 characters).\n\nType \`/help\` for bot commands or \`/status\` to check your registrations.`;
    await sendTelegramMessage(chatId, fallbackText);

    return NextResponse.json({ ok: true, status: "invalid_address" });
  } catch (error: any) {
    console.error("Telegram Webhook Route Error:", error);
    return NextResponse.json(
      { error: "Invalid webhook payload", details: error?.message },
      { status: 400 }
    );
  }
}
