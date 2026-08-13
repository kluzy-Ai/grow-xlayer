import { AIDistributionPlan, WalletSubmission } from "@/types";

/**
 * AI Tool Definition according to Day 7 specs:
 * Anthropic Claude structured tool calling format
 */
export const DISTRIBUTION_TOOL_SCHEMA = {
  name: "create_distribution_plan",
  description: "Parses human instructions into a structured giveaway distribution plan for X Layer execution.",
  parameters: {
    type: "object",
    properties: {
      recipientCount: { type: "number", description: "Number of random wallets to select" },
      tokenAmount: { type: "number", description: "Amount per recipient" },
      tokenSymbol: { type: "string", enum: ["OKB", "USDT"] },
    },
    required: ["recipientCount", "tokenAmount", "tokenSymbol"],
  },
};

export async function generateDistributionPlan(
  prompt: string,
  submissions: WalletSubmission[],
  amountPerWallet: number,
  tokenSymbol: "OKB" | "USDT"
): Promise<AIDistributionPlan> {
  // Simulate AI parsing delay
  await new Promise((res) => setTimeout(res, 800));

  // Extract recipient count from prompt or fallback to 3
  const match = prompt.match(/(\d+)\s+random/i);
  const count = match ? parseInt(match[1], 10) : 3;

  const selected = submissions.slice(0, count).map((sub) => ({
    ...sub,
    status: "Selected" as const,
  }));

  const totalAmount = selected.length * amountPerWallet;

  return {
    recipients: selected,
    amountPerWallet,
    totalAmount,
    token: tokenSymbol,
    sufficientBalance: true,
  };
}
