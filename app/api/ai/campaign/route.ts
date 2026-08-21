import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  CampaignIntent,
  AiCampaignResponse,
  validateCampaignParameters,
  SUPPORTED_TOKENS,
  SUPPORTED_NETWORKS,
} from "@/lib/ai-agent";

export function parseNaturalLanguageCampaign(
  prompt: string,
  currentCampaign?: Partial<CampaignIntent> | null
): {
  campaign: CampaignIntent;
  assistantMessage: string;
} {
  const p = prompt.trim();
  const lower = p.toLowerCase();
  const isFreshCreation =
    lower.startsWith("create") ||
    lower.startsWith("launch") ||
    lower.startsWith("start") ||
    lower.startsWith("new") ||
    lower.startsWith("make a") ||
    !currentCampaign ||
    !currentCampaign.totalBudget;

  // 1. Detect Token
  let token = "OKB";
  if (lower.includes("usdt")) token = "USDT";
  else if (lower.includes("usdc")) token = "USDC";
  else if (lower.includes("okb")) token = "OKB";
  else if (!isFreshCreation && currentCampaign?.token) {
    token = currentCampaign.token;
  }

  // 2. Extract Explicit Campaign Name / Title
  let title = "";
  const nameNamedMatch = p.match(/(?:named|called|title[:\s]+|titled|name[:\s]+)\s*["']?([^"',.;\n]+?)["']?(?=\s+(?:\d|\$|for|with|of|on|in|token|$))/i);
  if (nameNamedMatch && nameNamedMatch[1]) {
    title = nameNamedMatch[1].trim();
  }

  if (!title) {
    if (!isFreshCreation && currentCampaign?.title && !isFreshCreation) {
      title = currentCampaign.title;
    } else if (lower.includes("airdrop")) {
      title = `${token} Airdrop Growth Drop`;
    } else if (lower.includes("giveaway")) {
      title = `${token} Community Giveaway`;
    } else if (lower.includes("boost") || lower.includes("liquidity")) {
      title = `${token} Liquidity Boost`;
    } else {
      title = `${token} Community Campaign`;
    }
  }

  // 3. Extract Wallet Spots / Recipient Count
  let recipientCount = isFreshCreation ? 0 : currentCampaign?.recipientCount || 0;
  const walletsMatch =
    p.match(/(\d+(?:,\d+)*)\s*(?:wallets|users|recipients|winners|spots|people|claims|members|participants)/i) ||
    p.match(/(?:for|to)\s*(\d+(?:,\d+)*)\s*(?:wallets|users|spots|people|claims)/i);

  if (walletsMatch && walletsMatch[1]) {
    recipientCount = Number(walletsMatch[1].replace(/,/g, ""));
  }

  // 4. Extract Per-Wallet Reward if explicitly specified
  let rewardPerRecipient = isFreshCreation ? 0 : currentCampaign?.rewardPerRecipient || 0;
  const explicitRewardMatch =
    p.match(/(?:reward\s*(?:of|is|to)?\s*[:=]?\s*|\$|each\s*receives?\s*|get\s*|give\s*)(\d+(?:\.\d+)?)\s*(?:okb|usdt|usdc|\$|\/wallet|each|per\s*wallet|a\s*wallet)/i) ||
    p.match(/(\d+(?:\.\d+)?)\s*(?:okb|usdt|usdc|\$)\s*(?:each|per\s*wallet|per\s*user|a\s*wallet)/i);

  if (explicitRewardMatch && explicitRewardMatch[1]) {
    rewardPerRecipient = Number(explicitRewardMatch[1]);
  }

  // 5. Extract Total Budget / Pool Amount
  let totalBudget = isFreshCreation ? 0 : currentCampaign?.totalBudget || 0;
  
  // Match patterns like "0.01 OKB" or "$5,000" or "budget of 500"
  const tokenAmountMatch = p.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:okb|usdt|usdc)/i);
  const dollarBudgetMatch = p.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/i);
  const budgetPrefixMatch = p.match(/(?:budget\s*(?:of|is|to)?\s*[:=]?\s*|total\s*pool\s*(?:of|is|to)?\s*[:=]?\s*)(\d+(?:,\d+)*(?:\.\d+)?)/i);

  if (budgetPrefixMatch && budgetPrefixMatch[1]) {
    totalBudget = Number(budgetPrefixMatch[1].replace(/,/g, ""));
  } else if (dollarBudgetMatch && dollarBudgetMatch[1]) {
    totalBudget = Number(dollarBudgetMatch[1].replace(/,/g, ""));
  } else if (tokenAmountMatch && tokenAmountMatch[1]) {
    // If this amount was not already captured as the per-wallet reward
    const parsedTokenAmount = Number(tokenAmountMatch[1].replace(/,/g, ""));
    if (!explicitRewardMatch || Math.abs(parsedTokenAmount - rewardPerRecipient) > 0.000001) {
      totalBudget = parsedTokenAmount;
    }
  }

  // 6. Handle Modifications (e.g., "Change reward to $10", "Make it 2,000 wallets instead")
  if (lower.includes("change reward") || lower.includes("set reward") || lower.includes("reward to")) {
    const numMatch = p.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      rewardPerRecipient = Number(numMatch[1]);
      if (recipientCount > 0) {
        totalBudget = Number((recipientCount * rewardPerRecipient).toFixed(6));
      }
    }
  } else if (lower.includes("wallets instead") || lower.includes("make it") || lower.includes("set wallets")) {
    const numMatch = p.match(/(\d+(?:,\d+)*)/);
    if (numMatch) {
      recipientCount = Number(numMatch[1].replace(/,/g, ""));
      if (rewardPerRecipient > 0) {
        totalBudget = Number((recipientCount * rewardPerRecipient).toFixed(6));
      }
    }
  }

  // 7. Calculate missing variable if two of the three (totalBudget, recipientCount, rewardPerRecipient) are present
  if (totalBudget > 0 && recipientCount > 0 && rewardPerRecipient === 0) {
    rewardPerRecipient = Number((totalBudget / recipientCount).toFixed(6));
  } else if (recipientCount > 0 && rewardPerRecipient > 0 && totalBudget === 0) {
    totalBudget = Number((recipientCount * rewardPerRecipient).toFixed(6));
  } else if (totalBudget > 0 && rewardPerRecipient > 0 && recipientCount === 0) {
    recipientCount = Math.floor(totalBudget / rewardPerRecipient);
  }

  const campaign: CampaignIntent = {
    title,
    description: `Natural language campaign configured for OKX X Layer`,
    network: "OKX X Layer Testnet (Chain ID 1952)",
    token,
    totalBudget,
    recipientCount,
    rewardPerRecipient,
    distributionType: "fixed",
  };

  let assistantMessage = "";
  if (totalBudget > 0 && recipientCount > 0) {
    assistantMessage = `Configured "${title}" on OKX X Layer: Total Pool ${totalBudget} ${token}, allocated for ${recipientCount} wallets (${rewardPerRecipient} ${token} per wallet).`;
  } else if (totalBudget > 0) {
    assistantMessage = `Set total budget to ${totalBudget} ${token}. How many recipient wallets should share this pool?`;
  } else if (recipientCount > 0) {
    assistantMessage = `Targeted ${recipientCount} wallets. What is the total ${token} budget or reward per wallet?`;
  } else {
    assistantMessage = `Updated campaign parameters. Please specify your target budget and wallet spots.`;
  }

  return { campaign, assistantMessage };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, currentCampaign, conversationHistory = [] } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a valid text string." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let aiParsedCampaign: CampaignIntent | null = null;
    let assistantMessage = "";
    let isGeminiSuccess = false;

    // 1. Try Gemini Generative AI if key format is standard
    if (apiKey && apiKey.startsWith("AIzaSy") && !apiKey.includes("your_")) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `
You are Grow Campaign Copilot for OKX X Layer.
Extract structured parameters from the user's natural language request.
Rules:
1. Supported Tokens: "OKB", "USDT", "USDC". Default to "OKB".
2. Extract exact campaign title if user says "named <title>" or "called <title>".
3. Extract totalBudget (number, supports decimals like 0.01), recipientCount (integer), rewardPerRecipient (number).
4. Output valid JSON:
{
  "title": "string",
  "token": "OKB" | "USDT" | "USDC",
  "totalBudget": number,
  "recipientCount": number,
  "rewardPerRecipient": number,
  "distributionType": "fixed",
  "assistantSummary": "short explanation"
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Context: ${JSON.stringify(currentCampaign || {})}\nPrompt: "${prompt}"`,
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const jsonText = response.text || "";
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          aiParsedCampaign = {
            title: parsed.title || "OKX X Layer Campaign",
            description: "Natural language campaign configured for OKX X Layer",
            network: "OKX X Layer Testnet (Chain ID 1952)",
            token: (parsed.token || "OKB").toUpperCase(),
            totalBudget: Number(parsed.totalBudget) || 0,
            recipientCount: Number(parsed.recipientCount) || 0,
            rewardPerRecipient: Number(parsed.rewardPerRecipient) || 0,
            distributionType: "fixed",
          };
          assistantMessage = parsed.assistantSummary || "";
          isGeminiSuccess = true;
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API call skipped/failed:", geminiErr?.message);
      }
    }

    // 2. Exact Semantic NLP Engine
    if (!isGeminiSuccess || !aiParsedCampaign) {
      const parsed = parseNaturalLanguageCampaign(prompt, currentCampaign);
      aiParsedCampaign = parsed.campaign;
      assistantMessage = parsed.assistantMessage;
    }

    // 3. Mathematical Validation Engine
    const validation = validateCampaignParameters(aiParsedCampaign, 100000);

    const missingInformation: string[] = [];
    if (!aiParsedCampaign.totalBudget) missingInformation.push("totalBudget");
    if (!aiParsedCampaign.recipientCount) missingInformation.push("recipientCount");
    if (!aiParsedCampaign.rewardPerRecipient) missingInformation.push("rewardPerRecipient");

    const status = !validation.valid
      ? "validation_error"
      : missingInformation.length > 0
      ? "missing_info"
      : "preview";

    const responseData: AiCampaignResponse = {
      status,
      assistantMessage,
      intent: currentCampaign ? "modify_campaign" : "create_campaign",
      campaign: aiParsedCampaign,
      validation,
      missingInformation,
      requiresConfirmation: true,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("AI Campaign Agent Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process campaign request.",
        details: error?.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
