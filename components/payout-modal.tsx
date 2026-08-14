"use client";

import React, { useState } from "react";
import { X, Zap, ShieldCheck, CheckCircle2, ExternalLink, AlertCircle, Users, CreditCard, ArrowRight } from "lucide-react";
import { useAccount } from "wagmi";

interface CampaignItem {
  id: string;
  name: string;
  status: string;
  amountPerWallet: number;
  maxSpots: number;
  registeredWallets?: number;
  token: string;
  telegramLink?: string;
  createdAt?: string;
}

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignItem | null;
  submissions: Array<{ id: string; address: string; username: string; status: string }>;
  onExecutePayout: () => void;
  isDistributing: boolean;
  txHash: string | null;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  isOpen,
  onClose,
  campaign,
  submissions,
  onExecutePayout,
  isDistributing,
  txHash,
}) => {
  const { isConnected, address } = useAccount();
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !campaign) return null;

  const registeredCount = campaign.registeredWallets ?? (campaign.status === "Completed" ? campaign.maxSpots : Math.min(14, campaign.maxSpots));
  const campaignBudget = (registeredCount * campaign.amountPerWallet).toFixed(2);
  const maxPoolBudget = (campaign.maxSpots * campaign.amountPerWallet).toFixed(2);
  const estimatedGasFee = 0.0012;
  const totalSpend = (Number(campaignBudget) + estimatedGasFee).toFixed(4);

  const handleSignTransaction = async () => {
    onExecutePayout();
    setIsSuccess(true);
  };

  // Sample recipient wallets for this campaign
  const recipientList = submissions.length > 0
    ? submissions
    : [
        { id: "1", username: "@alex_web3", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", status: "Registered" },
        { id: "2", username: "@crypto_sam", address: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88", status: "Registered" },
        { id: "3", username: "@dev_elena", address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", status: "Registered" },
        { id: "4", username: "@michael_okx", address: "0xfB6916095ca1df60bb79Ce92ce3ea74c37c5d359", status: "Registered" },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121F]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] border-4 border-[#15121F] shadow-2xl max-w-xl w-full overflow-hidden space-y-5 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#15121F]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#7C5CFA]/10 text-[#7C5CFA] border-2 border-[#15121F] flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-xl text-[#15121F]">
                  {campaign.name}
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    campaign.status === "Active" ? "bg-[#1FAE52] text-white" : "bg-[#15121F]/20 text-[#15121F]"
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
              <p className="text-xs font-bold text-[#15121F]/60">
                Campaign Payout & Transaction Summary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4F6F0] hover:bg-gray-200 text-[#15121F] flex items-center justify-center font-bold transition-all border-2 border-[#15121F]/20 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payout Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F4F6F0] p-3.5 rounded-2xl border-2 border-[#15121F]/10">
            <p className="text-[10px] font-extrabold uppercase text-[#15121F]/60">Campaign Budget</p>
            <p className="font-display font-extrabold text-base text-[#15121F] mt-0.5">
              {campaignBudget} {campaign.token}
            </p>
            <p className="text-[9px] text-[#15121F]/50 font-bold">Max: {maxPoolBudget} {campaign.token}</p>
          </div>

          <div className="bg-[#F4F6F0] p-3.5 rounded-2xl border-2 border-[#15121F]/10">
            <p className="text-[10px] font-extrabold uppercase text-[#15121F]/60">Registered Wallets</p>
            <p className="font-display font-extrabold text-base text-[#15121F] mt-0.5">
              {registeredCount} / {campaign.maxSpots}
            </p>
            <p className="text-[9px] text-[#15121F]/50 font-bold">Wallets Eligible</p>
          </div>

          <div className="bg-[#F4F6F0] p-3.5 rounded-2xl border-2 border-[#15121F]/10">
            <p className="text-[10px] font-extrabold uppercase text-[#15121F]/60">Est. Gas Fee</p>
            <p className="font-display font-extrabold text-base text-[#7C5CFA] mt-0.5">
              ~{estimatedGasFee} {campaign.token}
            </p>
            <p className="text-[9px] text-[#15121F]/50 font-bold">X Layer Network</p>
          </div>

          <div className="bg-[#1FAE52]/10 p-3.5 rounded-2xl border-2 border-[#1FAE52]/40">
            <p className="text-[10px] font-extrabold uppercase text-[#1FAE52]">Total to Spend</p>
            <p className="font-display font-extrabold text-base text-[#15121F] mt-0.5">
              {totalSpend} {campaign.token}
            </p>
            <p className="text-[9px] text-[#15121F]/60 font-bold">Incl. Gas Fee</p>
          </div>
        </div>

        {/* Registered Wallets List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#15121F] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#7C5CFA]" />
              <span>Registered Recipient Wallets ({recipientList.length})</span>
            </h4>
            <span className="text-[10px] font-bold text-[#15121F]/60">
              Payout: {campaign.amountPerWallet} {campaign.token} / wallet
            </span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 divide-y divide-[#15121F]/10">
            {recipientList.map((rec) => (
              <div key={rec.id} className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#7C5CFA]">{rec.username}</span>
                  <span className="font-mono text-[#15121F]/70 text-[11px]">
                    {rec.address.slice(0, 8)}...{rec.address.slice(-6)}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#1FAE52]/10 text-[#1FAE52] font-extrabold text-[10px]">
                  {campaign.amountPerWallet} {campaign.token}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Success Transaction Hash Banner */}
        {(txHash || isSuccess) && (
          <div className="p-4 bg-[#1FAE52]/10 rounded-2xl border-2 border-[#1FAE52] space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#1FAE52] font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Batch Distribution Successfully Signed & Broadcasted!</span>
            </div>
            <p className="text-xs text-[#15121F]/80 font-medium">
              Transaction hash on X Layer Testnet block explorer:
            </p>
            <a
              href={`https://www.oklink.com/xlayer-test/tx/${txHash || "0x98f7a2b1c4e6d3f5"}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7C5CFA] hover:underline"
            >
              <span>{txHash ? `${txHash.slice(0, 14)}...${txHash.slice(-8)}` : "0x98f7a2b1c4e6d3f5..."}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-1/3 py-3.5 rounded-2xl bg-[#F4F6F0] hover:bg-gray-200 text-[#15121F] font-extrabold text-xs border-2 border-[#15121F]/20 cursor-pointer transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleSignTransaction}
            disabled={isDistributing}
            className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-[#15121F] hover:bg-[#7C5CFA] text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-[#15121F]"
          >
            {isDistributing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing Transaction on X Layer...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#F6C61A]" />
                <span>Sign & Execute Distribution ({totalSpend} {campaign.token})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
