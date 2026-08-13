"use client";

import React, { useState } from "react";
import {
  Wallet,
  Zap,
  ShieldCheck,
  Send,
  Copy,
  Check,
  Bot,
  User,
  Plus,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { formatEther } from "viem";
import { useAirdrop } from "@/hooks/use-airdrop";
import { CampaignCreatorModal } from "./campaign-creator-modal";
import { TelegramSimulatorModal } from "./telegram-simulator-modal";

export const AirdropDashboard: React.FC = () => {
  const {
    campaign,
    setCampaign,
    submissions,
    addSubmission,
    aiPlan,
    isAiGenerating,
    createPlan,
    executeDistribution,
    isDistributing,
    txHash,
  } = useAirdrop();

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });

  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isTelegramSimulatorOpen, setIsTelegramSimulatorOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(
    "Distribute 0.25 OKB to 20 random eligible wallets"
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const treasuryBalance = balanceData
    ? Number(formatEther(balanceData.value)).toFixed(2)
    : "12.50";

  const handleCopyLink = () => {
    if (campaign) {
      navigator.clipboard.writeText(campaign.telegramLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    createPlan(aiPrompt);
  };

  const handleCreateCampaign = (newCamp: any) => {
    setCampaign({
      id: newCamp.id,
      name: newCamp.title,
      token: newCamp.token as "OKB" | "USDT",
      amountPerWallet: newCamp.amountPerWallet,
      maxSpots: newCamp.maxSpots,
      telegramLink: newCamp.telegramLink,
      createdAt: newCamp.createdAt,
      status: "Active",
    });
  };

  const handleTelegramSubmit = (telegramHandle: string, walletAddress: string) => {
    addSubmission({
      id: `sub_${Date.now()}`,
      address: walletAddress,
      username: telegramHandle,
      timestamp: "Just now",
      status: "Submitted",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner: Creator Security Portal */}
      <div className="bg-[#15121F] text-white rounded-[32px] p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-[#15121F]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F6C61A] text-[#15121F] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base">
                Creator Security Portal
              </span>
              <span className="text-[10px] font-bold bg-[#1FAE52] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                VERIFIED CREATOR
              </span>
            </div>
            <p className="text-xs text-white/70 font-medium">
              Logged in as BuildX OKB Guild (creator@buildx.xyz)
            </p>
          </div>
        </div>

        <button
          onClick={() => alert("Creator Session Active")}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
        >
          Sign Out Creator
        </button>
      </div>

      {/* Main Grid: Treasury & Campaign Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: X Layer Treasury & Wallet Bar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[36px] p-6 sm:p-8 border-4 border-[#15121F] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1FAE52] text-white flex items-center justify-center font-bold text-sm">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <span className="font-display font-extrabold text-lg text-[#15121F]">
                  X Layer Treasury
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F4F6F0] text-[#15121F] border border-[#15121F]/10">
                Chain ID 1952
              </span>
            </div>

            {!isConnected ? (
              <div className="bg-[#F4F6F0] rounded-3xl p-6 text-center space-y-4 border border-[#15121F]/10">
                <div className="w-12 h-12 rounded-full bg-[#7C5CFA] text-white mx-auto flex items-center justify-center">
                  <Wallet className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-lg text-[#15121F]">
                    Connect Treasury Wallet
                  </h4>
                  <p className="text-xs text-[#15121F]/70">
                    Connect your MetaMask or OKX Wallet on X Layer Testnet to distribute tokens.
                  </p>
                </div>
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="w-full btn-pill btn-grow-primary py-3 text-sm font-extrabold text-white shadow-md flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect X Layer Wallet</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#F4F6F0] rounded-3xl p-6 border border-[#15121F]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#15121F]/60 font-semibold">
                    <span>Connected Wallet</span>
                    <button
                      onClick={() => disconnect()}
                      className="text-red-600 hover:underline"
                    >
                      Disconnect
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#15121F] truncate">
                    {address}
                  </div>
                  <div className="pt-2 border-t border-[#15121F]/10 flex items-baseline justify-between">
                    <span className="text-xs text-[#15121F]/70 font-semibold">
                      Native Balance:
                    </span>
                    <span className="font-display font-extrabold text-2xl text-[#15121F]">
                      {treasuryBalance} OKB
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsCreatorModalOpen(true)}
                className="btn-pill bg-[#1FAE52] text-white hover:bg-[#199445] py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>New Campaign</span>
              </button>
              <button
                onClick={() => setIsTelegramSimulatorOpen(true)}
                className="btn-pill bg-[#7C5CFA] text-white hover:bg-[#6846E3] py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Test Telegram Bot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Campaign & AI Command Engine */}
        <div className="lg:col-span-7 space-y-6">
          {campaign && (
            <div className="bg-white rounded-[36px] p-6 sm:p-8 border-4 border-[#15121F] shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#15121F]/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-2xl text-[#15121F]">
                      {campaign.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1FAE52]/10 text-[#1FAE52] font-bold text-xs">
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#15121F]/60 font-medium">
                    Created {campaign.createdAt} • Target: {campaign.maxSpots} Wallets
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#15121F]/60 font-bold uppercase tracking-wider">
                    Payout / Wallet
                  </div>
                  <div className="font-display font-extrabold text-xl text-[#7C5CFA]">
                    {campaign.amountPerWallet} {campaign.token}
                  </div>
                </div>
              </div>

              {/* Telegram Sharing Link Box */}
              <div className="bg-[#F4F6F0] rounded-2xl p-4 border border-[#15121F]/10 space-y-2">
                <div className="text-xs font-bold text-[#15121F]/70 flex items-center justify-between">
                  <span>Community Telegram Claim Link:</span>
                  <span className="text-[#0088CC] font-semibold">Telegram Deep Link</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={campaign.telegramLink}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#15121F]/10 font-mono text-xs text-[#15121F]"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn-pill bg-[#15121F] text-white hover:bg-[#2A2438] px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1FAE52]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Command Bar */}
              <div className="bg-[#15121F] text-white rounded-3xl p-6 space-y-4 shadow-lg border-2 border-[#15121F]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#F6C61A] text-[#15121F] flex items-center justify-center font-bold text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="font-display font-extrabold text-base">
                    AI Distribution Command Engine
                  </span>
                </div>

                <form onSubmit={handleAiSubmit} className="space-y-3">
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 font-medium text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#F6C61A]"
                    placeholder="Describe distribution rules (e.g. distribute 0.25 OKB to 20 random wallets)..."
                  />

                  <button
                    type="submit"
                    disabled={isAiGenerating}
                    className="w-full btn-pill btn-grow-violet py-3 text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2"
                  >
                    {isAiGenerating ? (
                      <span>Generating Structured Plan...</span>
                    ) : (
                      <>
                        <span>Generate AI Distribution Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Render AI Plan Preview */}
                {aiPlan && (
                  <div className="bg-white/10 rounded-2xl p-4 space-y-3 border border-white/10 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-[#F6C61A]">
                      <span>AI Plan Summary</span>
                      <span>{aiPlan.recipients.length} Recipients</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/20 p-2.5 rounded-xl">
                        <div className="text-[10px] text-white/60 font-semibold">Total Payout</div>
                        <div className="font-extrabold text-white">
                          {aiPlan.totalAmount} {aiPlan.token}
                        </div>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-xl">
                        <div className="text-[10px] text-white/60 font-semibold">Treasury Sufficient</div>
                        <div className={`font-extrabold ${aiPlan.sufficientBalance ? "text-[#1FAE52]" : "text-red-400"}`}>
                          {aiPlan.sufficientBalance ? "Sufficient ✅" : "Insufficient ❌"}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={executeDistribution}
                      disabled={isDistributing || !aiPlan.sufficientBalance}
                      className="w-full btn-pill bg-[#1FAE52] hover:bg-[#199445] text-white py-3 text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
                    >
                      {isDistributing ? (
                        <span>Executing Batch Payout on X Layer...</span>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Approve & Execute Batch Payout on X Layer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Last Transaction Hash */}
                {txHash && (
                  <div className="p-3 bg-[#1FAE52]/20 rounded-2xl border border-[#1FAE52]/40 text-xs text-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#1FAE52] flex items-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Batch Drop Executed Onchain!</span>
                      </div>
                      <div className="font-mono text-[10px] text-white/70 truncate max-w-[200px] sm:max-w-[280px]">
                        Tx: {txHash}
                      </div>
                    </div>
                    <a
                      href={`https://www.oklink.com/xlayer-test/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-full bg-white text-[#15121F] font-bold text-[10px] hover:bg-[#F4F6F0] flex items-center gap-1 shrink-0"
                    >
                      <span>OKLink Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submissions Feed Table */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border-4 border-[#15121F] shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-2xl text-[#15121F]">
              Live Community Wallet Submissions
            </h3>
            <p className="text-xs text-[#15121F]/60 font-medium">
              Real-time feed of Telegram submissions saved directly to Supabase.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#1FAE52]/10 text-[#1FAE52] text-xs font-bold">
            {submissions.length} Submissions Total
          </span>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#15121F]/10 text-[#15121F]/60 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Telegram Handle</th>
                <th className="pb-3 px-3">Wallet Address</th>
                <th className="pb-3 px-3">Submitted At</th>
                <th className="pb-3 px-3 text-right">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15121F]/5 font-medium text-[#15121F]">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#F4F6F0]/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#0088CC] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#0088CC]" />
                    <span>{sub.username}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {sub.address}
                  </td>
                  <td className="py-3 px-3 text-[#15121F]/60">
                    {sub.timestamp}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        sub.status === "Paid"
                          ? "bg-[#1FAE52]/15 text-[#1FAE52]"
                          : sub.status === "Selected"
                          ? "bg-[#F6C61A]/20 text-[#15121F]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CampaignCreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        onCreate={handleCreateCampaign}
      />

      <TelegramSimulatorModal
        isOpen={isTelegramSimulatorOpen}
        onClose={() => setIsTelegramSimulatorOpen(false)}
        onSubmitWallet={handleTelegramSubmit}
      />
    </div>
  );
};
