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
  code:
    | "BUDGET_MISMATCH_EXCESS"
    | "BUDGET_MISMATCH_DEFICIT"
    | "UNSUPPORTED_NETWORK"
    | "UNSUPPORTED_TOKEN"
    | "INSUFFICIENT_BALANCE"
    | "MISSING_INFO";
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

function formatCryptoAmount(num: number): string {
  if (Number.isInteger(num)) return num.toString();
  return Number(num.toFixed(6)).toString();
}

export function validateCampaignParameters(
  campaign: CampaignIntent,
  creatorBalance: number = 100000
): {
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
    (n) =>
      n.name.toLowerCase().includes(campaign.network?.toLowerCase() || "") ||
      campaign.network?.toLowerCase().includes("x layer")
  );
  if (!matchedNetwork && campaign.network) {
    issues.push({
      type: "error",
      code: "UNSUPPORTED_NETWORK",
      message: `"${campaign.network}" is not supported. Grow runs on OKX X Layer (Testnet Chain ID 1952 & Mainnet Chain ID 196).`,
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
    calculatedTotalRequired = Number((recipientCount * rewardPerRecipient).toFixed(6));
    const diff = Math.abs(totalBudget - calculatedTotalRequired);

    if (diff > 0.00001) {
      const formattedTotal = formatCryptoAmount(totalBudget);
      const formattedCalc = formatCryptoAmount(calculatedTotalRequired);
      const formattedReward = formatCryptoAmount(rewardPerRecipient);
      const adjustedReward = formatCryptoAmount(totalBudget / recipientCount);

      if (calculatedTotalRequired < totalBudget) {
        issues.push({
          type: "error",
          code: "BUDGET_MISMATCH_EXCESS",
          message: `Budget Mismatch: Total budget is ${formattedTotal} ${tokenUpper}, but ${recipientCount} wallets × ${formattedReward} ${tokenUpper} requires ${formattedCalc} ${tokenUpper}.`,
          resolutionOptions: [
            {
              id: "keep_reward",
              label: `Keep ${formattedReward} ${tokenUpper} reward → Set budget to ${formattedCalc} ${tokenUpper}`,
              actionPrompt: `Set the campaign budget to ${formattedCalc} ${tokenUpper}`,
            },
            {
              id: "keep_budget",
              label: `Keep ${formattedTotal} ${tokenUpper} budget → Adjust reward to ${adjustedReward} ${tokenUpper} per wallet`,
              actionPrompt: `Keep budget ${formattedTotal} ${tokenUpper} and adjust reward per wallet to ${adjustedReward} ${tokenUpper}`,
            },
            {
              id: "increase_recipients",
              label: `Keep ${formattedTotal} ${tokenUpper} budget & ${formattedReward} ${tokenUpper} reward → Set recipients to ${Math.floor(totalBudget / rewardPerRecipient)} wallets`,
              actionPrompt: `Increase number of recipients to ${Math.floor(totalBudget / rewardPerRecipient)} wallets`,
            },
          ],
        });
      } else {
        issues.push({
          type: "error",
          code: "BUDGET_MISMATCH_DEFICIT",
          message: `Budget Deficit: Requested reward (${formattedReward} ${tokenUpper} × ${recipientCount} wallets) requires ${formattedCalc} ${tokenUpper}, but total budget is ${formattedTotal} ${tokenUpper}.`,
          resolutionOptions: [
            {
              id: "increase_budget",
              label: `Increase budget to ${formattedCalc} ${tokenUpper}`,
              actionPrompt: `Set the campaign budget to ${formattedCalc} ${tokenUpper}`,
            },
            {
              id: "decrease_reward",
              label: `Keep ${formattedTotal} ${tokenUpper} budget → Adjust reward to ${adjustedReward} ${tokenUpper} per wallet`,
              actionPrompt: `Set the reward per wallet to ${adjustedReward} ${tokenUpper}`,
            },
          ],
        });
      }
    }
  }

  // 4. Balance Warning (only if balance is known and explicitly exceeded)
  if (totalBudget > creatorBalance && creatorBalance > 0) {
    issues.push({
      type: "warning",
      code: "INSUFFICIENT_BALANCE",
      message: `Your campaign requires ${formatCryptoAmount(totalBudget)} ${tokenUpper}, but your current wallet balance is ${formatCryptoAmount(creatorBalance)} ${tokenUpper}. Fund your X Layer treasury before payout.`,
    });
  }

  const hasBlockingError = issues.some((i) => i.type === "error");

  return {
    valid: !hasBlockingError,
    issues,
    calculatedTotalRequired,
  };
}
