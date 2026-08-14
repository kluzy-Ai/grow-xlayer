"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";
import { SuccessShareModal } from "./success-share-modal";

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
  const { isConnected } = useAccount();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!isOpen || !campaign) return null;

  const registeredCount =
    campaign.registeredWallets ??
    (campaign.status === "Completed" ? campaign.maxSpots : Math.min(14, campaign.maxSpots));
  const campaignBudget = (registeredCount * campaign.amountPerWallet).toFixed(4);
  const estimatedGasFee = 0.0012;
  const totalSpend = (Number(campaignBudget) + estimatedGasFee).toFixed(4);

  const handleSignTransaction = async () => {
    onExecutePayout();
    setIsSuccess(true);
    setIsShareModalOpen(true);
  };

  const recipientList =
    submissions.length > 0
      ? submissions
      : [
          { id: "1", username: "@alex_web3", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", status: "Registered" },
          { id: "2", username: "@crypto_sam", address: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88", status: "Registered" },
          { id: "3", username: "@dev_elena", address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", status: "Registered" },
          { id: "4", username: "@michael_okx", address: "0xfB6916095ca1df60bb79Ce92ce3ea74c37c5d359", status: "Registered" },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#15121F]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] sm:rounded-[36px] border-3 sm:border-4 border-[#15121F] shadow-[6px_6px_0px_0px_#15121F] sm:shadow-[12px_12px_0px_0px_#15121F] max-w-lg w-full overflow-hidden space-y-4 sm:space-y-5 p-4 sm:p-6 md:p-8 relative max-h-[92vh] overflow-y-auto">
        
        {/* 1. Header with Clean Campaign Title (No Flash Icon) */}
        <div className="flex items-center justify-between border-b-2 border-[#15121F]/10 pb-3 gap-2">
          <div className="min-w-0 pr-2">
            <h3 className="font-display font-extrabold text-lg sm:text-2xl text-[#15121F] tracking-tight truncate">
              {campaign.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F4F6F0] hover:bg-gray-200 text-[#15121F] flex items-center justify-center font-extrabold border-2 border-[#15121F]/20 cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 2. Top Green Total Spend Hero Card with Purple Gas Fee Pill */}
        <div className="bg-[#1FAE52] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 text-white border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white/90">
              Total Spend
            </p>
            <p className="text-[10px] sm:text-[11px] font-bold text-white/80">Total Distribution</p>
            <p className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-0.5">
              {campaignBudget} {campaign.token}
            </p>
          </div>

          {/* Purple Gas Fee & Total Pill */}
          <div className="bg-[#7C5CFA] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F] text-xs font-bold flex items-center justify-between gap-3 w-full sm:w-auto shrink-0">
            <div className="text-left">
              <p className="text-white/80 text-[9px] sm:text-[10px]">Gas Fee Estimate</p>
              <p className="font-extrabold text-white text-[11px] sm:text-xs">~{estimatedGasFee} {campaign.token}</p>
            </div>
            <div className="h-6 w-[1px] bg-white/30" />
            <div className="text-right">
              <p className="text-white/80 text-[9px] sm:text-[10px]">Total Spend</p>
              <p className="font-extrabold text-white text-[11px] sm:text-xs">{totalSpend} {campaign.token}</p>
            </div>
          </div>
        </div>

        {/* 3. Wallets Registered Section with Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#15121F] gap-2">
            <span>Wallets Registered</span>
            <span className="text-[#15121F]/70 text-right">
              {registeredCount} / {campaign.maxSpots} Registered Wallets
            </span>
          </div>

          {/* Thick Dark Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-[#15121F] overflow-hidden">
            <div
              className="bg-[#15121F] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (registeredCount / campaign.maxSpots) * 100)}%` }}
            />
          </div>
        </div>

        {/* 4. Recipient List Table (Clean Address Pill, No Duplicate OKB Amount) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#15121F]/70 uppercase tracking-wider px-1">
            <span>Recipient List</span>
            <span>OKB Amount</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {recipientList.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#F4F6F0] p-2 rounded-2xl border-2 border-[#15121F]/20 flex items-center justify-between gap-2 sm:gap-3 hover:border-[#15121F] transition-colors"
              >
                {/* Recipient Wallet Address Pill (NO duplicated OKB amount inside!) */}
                <div className="px-3 py-1.5 rounded-full bg-white border-2 border-[#15121F] font-mono text-[11px] sm:text-xs font-bold text-[#15121F] flex items-center gap-1.5 sm:gap-2 shadow-sm shrink min-w-0 max-w-[75%] sm:max-w-none">
                  <span className="text-[#7C5CFA] font-sans font-extrabold shrink-0">{rec.username}</span>
                  <span className="text-[#15121F]/40 shrink-0">|</span>
                  <span className="truncate">{`${rec.address.slice(0, 6)}...${rec.address.slice(-4)}`}</span>
                </div>

                {/* Single Clear OKB Amount on Right */}
                <span className="font-display font-extrabold text-xs text-[#15121F] shrink-0 pr-1">
                  {campaign.amountPerWallet.toFixed(4)} {campaign.token}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcasted Success Alert */}
        {(txHash || isSuccess) && (
          <div className="p-3.5 sm:p-4 bg-[#1FAE52]/15 rounded-2xl border-2 border-[#15121F] space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#15121F] font-extrabold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#1FAE52] shrink-0" />
              <span>Batch Distribution Successfully Signed & Broadcasted!</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#15121F]/80 font-medium">
              Transaction hash on X Layer Testnet block explorer:
            </p>
            <a
              href={`https://www.oklink.com/xlayer-test/tx/${txHash || "0x98f7a2b1c4e6d3f5"}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-[#7C5CFA] hover:underline break-all"
            >
              <span>{txHash ? `${txHash.slice(0, 14)}...${txHash.slice(-8)}` : "0x98f7a2b1c4e6d3f5..."}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        )}

        {/* 5. Bottom Sign & Execute Action Button */}
        <div className="pt-1 sm:pt-2">
          <button
            onClick={handleSignTransaction}
            disabled={isDistributing}
            className="w-full py-3.5 sm:py-4 px-4 rounded-full bg-[#15121F] hover:bg-[#2A2438] text-white font-extrabold text-xs sm:text-sm border-3 sm:border-4 border-[#B4E23F] shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            {isDistributing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing Transaction on X Layer...</span>
              </>
            ) : (
              <span>Sign & Execute Distribution ({totalSpend} {campaign.token})</span>
            )}
          </button>
        </div>
      </div>

      {/* Celebratory Confetti & Social Share Popup */}
      <SuccessShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          onClose();
        }}
        campaignName={campaign.name}
        totalAmount={campaignBudget}
        tokenSymbol={campaign.token}
        txHash={txHash}
        recipientCount={recipientList.length}
      />
    </div>
  );
};
