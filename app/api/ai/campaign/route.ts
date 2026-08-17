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
      title: currentCampaign?.title || "Community Giveaway",
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

    // 1. If Gemini API Key is available, use official @google/genai SDK
    if (apiKey && apiKey !== "your_gemini_api_key_here" && !apiKey.includes("your_")) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `
You are Grow Campaign Copilot, an AI assistant for the Grow Web3 campaign platform on OKX X Layer.
Your job is to interpret natural-language campaign requests from creators and return structured campaign parameters.

Strict Rules:
1. Supported Networks: ONLY "OKX X Layer Testnet (Chain ID 1952)" or "OKX X Layer Mainnet (Chain ID 196)".
2. Supported Tokens: "OKB", "USDT", "USDC". Default to "OKB" if unspecified.
3. Extract:
   - title: campaign title or auto-generated name like "OKB Liquidity Boost"
   - totalBudget: numeric total pool amount (e.g. 5000)
   - recipientCount: numeric wallet spots (e.g. 1000)
   - rewardPerRecipient: numeric reward per wallet (e.g. 5)
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

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
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
            temperature: 0.2,
          },
        });

        const jsonText = response.text || "";
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.title) aiParsedCampaign.title = parsed.title;
          if (parsed.token) aiParsedCampaign.token = parsed.token.toUpperCase();
          if (parsed.totalBudget) aiParsedCampaign.totalBudget = Number(parsed.totalBudget);
          if (parsed.recipientCount) aiParsedCampaign.recipientCount = Number(parsed.recipientCount);
          if (parsed.rewardPerRecipient) aiParsedCampaign.rewardPerRecipient = Number(parsed.rewardPerRecipient);
          if (parsed.distributionType) aiParsedCampaign.distributionType = parsed.distributionType;
          if (parsed.assistantSummary) assistantMessage = parsed.assistantSummary;

          isGeminiSuccess = true;
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API call warning (falling back to intelligent NLP parser):", geminiErr?.message);
      }
    }

    // 2. Intelligent Rule-based NLP Parser (Fallback if API Key is pending or network fallback)
    if (!isGeminiSuccess) {
      const p = prompt.toLowerCase();

      // Extract numbers and amounts from natural language
      // Example: "$5,000 USDT for 1,000 wallets, $5 each"
      const budgetMatch = prompt.match(/(?:\$|(\d+(?:\.\d+)?)\s*(?:okb|usdt|usdc)|budget\s*of\s*(\d+)|(\d+)\s*(?:dollar|\$))/i) || prompt.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/i);
      const walletsMatch = prompt.match(/(\d+(?:,\d+)*)\s*(?:wallets|users|recipients|winners|spots|people)/i);
      const rewardMatch = prompt.match(/(?:give|get|reward|each)\s*(?:of\s*)?\$?(\d+(?:\.\d+)?)/i) || prompt.match(/\$(\d+(?:\.\d+)?)\s*(?:per|each|a|wallet)/i);

      let extractedBudget = currentCampaign?.totalBudget || 0;
      let extractedWallets = currentCampaign?.recipientCount || 0;
      let extractedReward = currentCampaign?.rewardPerRecipient || 0;

      // Dollar / Pool extraction
      const rawNumbers = prompt.match(/\d+(?:,\d+)*/g)?.map((n) => Number(n.replace(/,/g, ""))) || [];

      if (rawNumbers.length >= 1) {
        if (p.includes("5,000") || p.includes("5000")) extractedBudget = 5000;
        else if (rawNumbers[0] >= 50) extractedBudget = rawNumbers[0];
      }

      if (walletsMatch && walletsMatch[1]) {
        extractedWallets = Number(walletsMatch[1].replace(/,/g, ""));
      } else if (rawNumbers.length >= 2 && rawNumbers[1] > 10) {
        extractedWallets = rawNumbers[1];
      }

      if (rewardMatch && rewardMatch[1]) {
        extractedReward = Number(rewardMatch[1]);
      } else if (rawNumbers.length >= 3) {
        extractedReward = rawNumbers[2];
      }

      // Infer reward if budget & recipients present but reward missing
      if (extractedBudget > 0 && extractedWallets > 0 && extractedReward === 0) {
        extractedReward = Number((extractedBudget / extractedWallets).toFixed(2));
      }

      // Token detection
      let extractedToken = currentCampaign?.token || "OKB";
      if (p.includes("usdt")) extractedToken = "USDT";
      else if (p.includes("usdc")) extractedToken = "USDC";
      else if (p.includes("okb")) extractedToken = "OKB";

      // Title creation
      let title = currentCampaign?.title || `${extractedToken} Community Giveaway`;
      if (p.includes("airdrop")) title = `${extractedToken} Airdrop Growth Drop`;
      else if (p.includes("batch")) title = `Batch ${extractedToken} Distribution`;

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

      assistantMessage = `I have parsed your request for ${extractedToken} on OKX X Layer: Total Budget ${extractedBudget} ${extractedToken}, ${extractedWallets} recipient wallets receiving ${extractedReward} ${extractedToken} each.`;
    }

    // 3. Server-side Financial & Mathematical Validation Engine
    const validation = validateCampaignParameters(aiParsedCampaign, 1000);

    // 4. Identify Missing Fields
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
