export interface Campaign {
  id: string;
  slug?: string;
  name: string;
  title?: string;
  token: string;
  amountPerWallet: number;
  maxSpots: number;
  telegramLink: string;
  createdAt: string;
  status: "Active" | "Completed" | string;
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
