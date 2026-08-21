import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  CampaignIntent,
  AiCampaignResponse,
  validateCampaignParameters,
  SUPPORTED_TOKENS,
  SUPPORTED_NETWORKS,
} from "@/lib/ai-agent";

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

    let aiParsedCampaign: CampaignIntent = {
      title: currentCampaign?.title || "New OKX X Layer Campaign",
      description: currentCampaign?.description || "OKX X Layer community reward distribution",
      network: "OKX X Layer Testnet (Chain ID 1952)",
      token: currentCampaign?.token || "OKB",
      totalBudget: currentCampaign?.totalBudget || 0,
      recipientCount: currentCampaign?.recipientCount || 0,
      rewardPerRecipient: currentCampaign?.rewardPerRecipient || 0,
      distributionType: currentCampaign?.distributionType || "fixed",
    };

    let assistantMessage = "";
    let isGeminiSuccess = false;

    // 1. If Gemini API Key is available, use Google GenAI SDK
    if (apiKey && apiKey !== "your_gemini_api_key_here" && !apiKey.includes("your_")) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `
You are Grow Campaign Copilot, an AI assistant for the Grow Web3 campaign platform on OKX X Layer.
Your job is to interpret natural-language campaign requests from creators and return structured campaign parameters.

Strict Rules:
1. Supported Networks: "OKX X Layer Testnet (Chain ID 1952)" or "OKX X Layer Mainnet (Chain ID 196)".
2. Supported Tokens: "OKB", "USDT", "USDC". Default to "OKB" if unspecified.
3. Extract:
   - title: descriptive campaign title (e.g., "OKB Community Giveaway", "USDT Airdrop Growth Drop")
   - totalBudget: numeric total pool amount (e.g., 500)
   - recipientCount: numeric wallet spots (e.g., 100)
   - rewardPerRecipient: numeric reward per wallet (e.g., 5)
   - token: "OKB", "USDT", or "USDC"
   - network: "OKX X Layer Testnet (Chain ID 1952)"
   - distributionType: "fixed" or "random"
4. Output strictly valid JSON matching this schema:
{
  "title": "string",
  "token": "OKB" | "USDT" | "USDC",
  "totalBudget": number,
  "recipientCount": number,
  "rewardPerRecipient": number,
  "distributionType": "fixed",
  "assistantSummary": "short conversational response explaining what was configured or updated"
}
`;

        const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        for (const modelName of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Current Campaign Context: ${JSON.stringify(
                        currentCampaign || {}
                      )}\n\nCreator Request: "${prompt}"`,
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
              if (parsed.title) aiParsedCampaign.title = parsed.title;
              if (parsed.token) aiParsedCampaign.token = parsed.token.toUpperCase();
              if (typeof parsed.totalBudget === "number" && !isNaN(parsed.totalBudget)) {
                aiParsedCampaign.totalBudget = Number(parsed.totalBudget);
              }
              if (typeof parsed.recipientCount === "number" && !isNaN(parsed.recipientCount)) {
                aiParsedCampaign.recipientCount = Number(parsed.recipientCount);
              }
              if (typeof parsed.rewardPerRecipient === "number" && !isNaN(parsed.rewardPerRecipient)) {
                aiParsedCampaign.rewardPerRecipient = Number(parsed.rewardPerRecipient);
              }
              if (parsed.distributionType) aiParsedCampaign.distributionType = parsed.distributionType;
              if (parsed.assistantSummary) assistantMessage = parsed.assistantSummary;

              isGeminiSuccess = true;
              break;
            }
          } catch (modelErr) {
            continue;
          }
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API call warning (falling back to dynamic NLP parser):", geminiErr?.message);
      }
    }

    // 2. Intelligent Dynamic Rule-Based NLP Parser (Fallback)
    if (!isGeminiSuccess) {
      const p = prompt.toLowerCase();

      // Detect Token
      let extractedToken = currentCampaign?.token || "OKB";
      if (p.includes("usdt")) extractedToken = "USDT";
      else if (p.includes("usdc")) extractedToken = "USDC";
      else if (p.includes("okb")) extractedToken = "OKB";

      // Extract explicit numbers with semantic context
      let extractedBudget = currentCampaign?.totalBudget || 0;
      let extractedWallets = currentCampaign?.recipientCount || 0;
      let extractedReward = currentCampaign?.rewardPerRecipient || 0;

      // Match patterns like "$5,000" or "500 OKB" or "budget of 1000" or "1000 token budget"
      const budgetMatch =
        prompt.match(/(?:budget\s*(?:of|is|to)?\s*[:=]?\s*|\$|total\s*pool\s*(?:of|is|to)?\s*[:=]?\s*)(\d+(?:,\d+)*(?:\.\d+)?)/i) ||
        prompt.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:okb|usdt|usdc)\s*(?:giveaway|airdrop|campaign|budget|pool)/i);

      // Match patterns like "1,000 wallets" or "100 users" or "50 spots" or "200 recipients"
      const walletsMatch =
        prompt.match(/(\d+(?:,\d+)*)\s*(?:wallets|users|recipients|winners|spots|people|claims|members)/i) ||
        prompt.match(/(?:for|to)\s*(\d+(?:,\d+)*)\s*(?:wallets|users|spots|people)/i);

      // Match patterns like "$5 each" or "5 OKB per wallet" or "reward of 10" or "change reward to $10"
      const rewardMatch =
        prompt.match(/(?:reward\s*(?:to|is|of)?\s*[:=]?\s*|\$|give\s*|get\s*|each\s*receives?\s*)(\d+(?:\.\d+)?)\s*(?:okb|usdt|usdc|\$|\/wallet|each|per\s*wallet)?/i) ||
        prompt.match(/(\d+(?:\.\d+)?)\s*(?:okb|usdt|usdc|\$)\s*(?:each|per\s*wallet|per\s*user)/i);

      if (budgetMatch && budgetMatch[1]) {
        extractedBudget = Number(budgetMatch[1].replace(/,/g, ""));
      }

      if (walletsMatch && walletsMatch[1]) {
        extractedWallets = Number(walletsMatch[1].replace(/,/g, ""));
      }

      if (rewardMatch && rewardMatch[1]) {
        extractedReward = Number(rewardMatch[1].replace(/,/g, ""));
      }

      // If generic numbers provided without explicit labels:
      const allNumbers = prompt.match(/\d+(?:,\d+)*(?:\.\d+)?/g)?.map((n) => Number(n.replace(/,/g, ""))) || [];
      if (extractedBudget === 0 && allNumbers.length >= 1) {
        if (allNumbers[0] >= 10) extractedBudget = allNumbers[0];
      }
      if (extractedWallets === 0 && allNumbers.length >= 2) {
        extractedWallets = allNumbers[1];
      }
      if (extractedReward === 0 && allNumbers.length >= 3) {
        extractedReward = allNumbers[2];
      }

      // Calculate reward if budget and spots are known but reward is zero
      if (extractedBudget > 0 && extractedWallets > 0 && extractedReward === 0) {
        extractedReward = Number((extractedBudget / extractedWallets).toFixed(2));
      } else if (extractedWallets > 0 && extractedReward > 0 && extractedBudget === 0) {
        extractedBudget = Number((extractedWallets * extractedReward).toFixed(2));
      }

      // Dynamic Title
      let title = currentCampaign?.title || `${extractedToken} Community Giveaway`;
      if (p.includes("airdrop")) title = `${extractedToken} Airdrop Growth Drop`;
      else if (p.includes("boost") || p.includes("liquidity")) title = `${extractedToken} Liquidity Boost`;
      else if (p.includes("reward") || p.includes("giveaway")) title = `${extractedToken} Community Giveaway`;

      aiParsedCampaign = {
        title,
        description: `Natural language campaign configured for OKX X Layer`,
        network: "OKX X Layer Testnet (Chain ID 1952)",
        token: extractedToken,
        totalBudget: extractedBudget,
        recipientCount: extractedWallets,
        rewardPerRecipient: extractedReward,
        distributionType: "fixed",
      };

      if (extractedBudget > 0 && extractedWallets > 0) {
        assistantMessage = `I configured your ${extractedToken} campaign on OKX X Layer: Total Pool ${extractedBudget} ${extractedToken}, allocated across ${extractedWallets} recipient wallets (${extractedReward} ${extractedToken} per wallet).`;
      } else {
        assistantMessage = `I've updated your campaign intent. Specify total budget and recipient spots to complete the allocation.`;
      }
    }

    // 3. Mathematical Validation Engine
    const validation = validateCampaignParameters(aiParsedCampaign, 10000);

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
      assistantMessage:
        assistantMessage ||
        (validation.valid
          ? `Campaign preview generated! Verified math: ${aiParsedCampaign.recipientCount} wallets × ${aiParsedCampaign.rewardPerRecipient} ${aiParsedCampaign.token} = ${aiParsedCampaign.totalBudget} ${aiParsedCampaign.token}.`
          : `Validation check complete. Please review the highlighted mismatch below.`),
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
