export interface Campaign {
  id: string;
  name: string;
  token: "OKB" | "USDT";
  amountPerWallet: number;
  maxSpots: number;
  telegramLink: string;
  createdAt: string;
  status: "Active" | "Completed";
}

export interface WalletSubmission {
  id: string;
  address: string;
  username: string;
  timestamp: string;
  status: "Submitted" | "Selected" | "Paid";
  txHash?: string;
}

export interface AIDistributionPlan {
  recipients: WalletSubmission[];
  amountPerWallet: number;
  totalAmount: number;
  token: string;
  sufficientBalance: boolean;
}
