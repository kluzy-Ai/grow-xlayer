export interface CampaignIntent {
  title: string;
  description?: string;
  network: string;
  token: string;
  totalBudget: number;
  recipientCount: number;
  rewardPerRecipient: number;
  distributionType: "fixed" | "random";
  minAmount?: number;
  maxAmount?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ValidationIssue {
  type: "error" | "warning" | "info";
  code: "BUDGET_MISMATCH_EXCESS" | "BUDGET_MISMATCH_DEFICIT" | "UNSUPPORTED_NETWORK" | "UNSUPPORTED_TOKEN" | "INSUFFICIENT_BALANCE" | "MISSING_INFO";
  message: string;
  resolutionOptions?: Array<{
    id: string;
    label: string;
    actionPrompt: string;
  }>;
}

export interface AiCampaignResponse {
  status: "preview" | "missing_info" | "validation_error";
  assistantMessage: string;
  intent: "create_campaign" | "modify_campaign" | "clarify";
  campaign: CampaignIntent;
  validation: {
    valid: boolean;
    issues: ValidationIssue[];
    calculatedTotalRequired: number;
  };
  missingInformation: string[];
  requiresConfirmation: boolean;
}

export const SUPPORTED_NETWORKS = [
  { id: "xlayer_testnet", name: "OKX X Layer Testnet (Chain ID 1952)", chainId: 1952 },
  { id: "xlayer_mainnet", name: "OKX X Layer Mainnet (Chain ID 196)", chainId: 196 },
];

export const SUPPORTED_TOKENS = ["OKB", "USDT", "USDC"];

export function validateCampaignParameters(campaign: CampaignIntent, creatorBalance: number = 1000): {
  valid: boolean;
  issues: ValidationIssue[];
  calculatedTotalRequired: number;
} {
  const issues: ValidationIssue[] = [];
  const totalBudget = Number(campaign.totalBudget) || 0;
  const recipientCount = Number(campaign.recipientCount) || 0;
  const rewardPerRecipient = Number(campaign.rewardPerRecipient) || 0;

  // 1. Network Validation
  const matchedNetwork = SUPPORTED_NETWORKS.find(
    (n) => n.name.toLowerCase().includes(campaign.network?.toLowerCase() || "") || campaign.network?.toLowerCase().includes("x layer")
  );
  if (!matchedNetwork && campaign.network) {
    issues.push({
      type: "error",
      code: "UNSUPPORTED_NETWORK",
      message: `"${campaign.network}" is not supported. Grow runs exclusively on OKX X Layer (Testnet Chain ID 1952 & Mainnet Chain ID 196).`,
    });
  }

  // 2. Token Validation
  const tokenUpper = (campaign.token || "OKB").toUpperCase();
  if (!SUPPORTED_TOKENS.includes(tokenUpper)) {
    issues.push({
      type: "error",
      code: "UNSUPPORTED_TOKEN",
      message: `Token "${campaign.token}" is not supported. Supported tokens on X Layer: ${SUPPORTED_TOKENS.join(", ")}.`,
    });
  }

  // 3. Mathematical Budget Validation
  let calculatedTotalRequired = totalBudget;
  if (campaign.distributionType === "fixed" && recipientCount > 0 && rewardPerRecipient > 0) {
    calculatedTotalRequired = recipientCount * rewardPerRecipient;
    const diff = Math.abs(totalBudget - calculatedTotalRequired);

    if (diff > 0.01) {
      if (calculatedTotalRequired < totalBudget) {
        // Budget Mismatch: Declared budget exceeds calculated required payout
        issues.push({
          type: "error",
          code: "BUDGET_MISMATCH_EXCESS",
          message: `Budget Mismatch: Your total budget is ${totalBudget} ${tokenUpper}, but ${recipientCount} wallets receiving ${rewardPerRecipient} ${tokenUpper} requires only ${calculatedTotalRequired} ${tokenUpper}.`,
          resolutionOptions: [
            {
              id: "keep_reward",
              label: `Keep ${rewardPerRecipient} ${tokenUpper} reward → Set budget to ${calculatedTotalRequired} ${tokenUpper}`,
              actionPrompt: `Set the campaign budget to ${calculatedTotalRequired} ${tokenUpper}`,
            },
            {
              id: "keep_budget",
              label: `Keep ${totalBudget} ${tokenUpper} budget → Increase reward to ${(totalBudget / recipientCount).toFixed(2)} ${tokenUpper} per wallet`,
              actionPrompt: `Keep budget ${totalBudget} ${tokenUpper} and adjust reward per wallet to ${(totalBudget / recipientCount).toFixed(2)} ${tokenUpper}`,
            },
            {
              id: "increase_recipients",
              label: `Keep ${totalBudget} ${tokenUpper} budget & ${rewardPerRecipient} ${tokenUpper} reward → Increase recipients to ${Math.floor(totalBudget / rewardPerRecipient)} wallets`,
              actionPrompt: `Increase number of recipients to ${Math.floor(totalBudget / rewardPerRecipient)} wallets`,
            },
          ],
        });
      } else {
        // Budget Mismatch: Declared budget is insufficient for requested reward
        issues.push({
          type: "error",
          code: "BUDGET_MISMATCH_DEFICIT",
          message: `Budget Deficit: Your requested reward (${rewardPerRecipient} ${tokenUpper} × ${recipientCount} wallets) requires ${calculatedTotalRequired} ${tokenUpper}, but your declared campaign budget is only ${totalBudget} ${tokenUpper}.`,
          resolutionOptions: [
            {
              id: "increase_budget",
              label: `Increase budget to ${calculatedTotalRequired} ${tokenUpper}`,
              actionPrompt: `Set the campaign budget to ${calculatedTotalRequired} ${tokenUpper}`,
            },
            {
              id: "decrease_reward",
              label: `Keep ${totalBudget} ${tokenUpper} budget → Adjust reward to ${(totalBudget / recipientCount).toFixed(2)} ${tokenUpper} per wallet`,
              actionPrompt: `Set the reward per wallet to ${(totalBudget / recipientCount).toFixed(2)} ${tokenUpper}`,
            },
          ],
        });
      }
    }
  }

  // 4. Wallet Balance Verification
  if (totalBudget > creatorBalance) {
    issues.push({
      type: "warning",
      code: "INSUFFICIENT_BALANCE",
      message: `Your campaign requires ${totalBudget} ${tokenUpper}, but your current wallet balance is ${creatorBalance} ${tokenUpper}. Please fund your X Layer treasury before final payout.`,
    });
  }

  const hasBlockingError = issues.some((i) => i.type === "error");

  return {
    valid: !hasBlockingError,
    issues,
    calculatedTotalRequired,
  };
}
