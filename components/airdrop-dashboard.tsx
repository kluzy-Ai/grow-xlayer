"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  AlertTriangle,
  X,
} from "lucide-react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { formatEther } from "viem";
import { useAirdrop } from "@/hooks/use-airdrop";
import { signOutCreator } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";
import { CampaignCreatorModal } from "./campaign-creator-modal";
import { TelegramSimulatorModal } from "./telegram-simulator-modal";

interface AirdropDashboardProps {
  user?: any;
}

export const AirdropDashboard: React.FC<AirdropDashboardProps> = ({ user }) => {
  const router = useRouter();
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
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(
    "Distribute 0.25 OKB to 20 random eligible wallets"
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const treasuryBalance = balanceData
    ? Number(formatEther(balanceData.value)).toFixed(2)
    : "12.50";

  const userEmail = user?.email || "creator@buildx.xyz";
  const communityName = user?.user_metadata?.community_name || "BuildX OKB Guild";

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

  const handleDisconnectWallet = () => {
    disconnect();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("wagmi.store");
      window.localStorage.removeItem("wagmi.recentConnectorId");
      window.localStorage.removeItem("wagmi.connected");
    }
  };

  const handleConnectConnector = (connector: any) => {
    connect({ connector });
    setIsWalletModalOpen(false);
  };

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutCreator();
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
      setIsSignOutModalOpen(false);
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.replace("/login");
      }
    }
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
              Logged in as {communityName} ({userEmail})
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSignOutModalOpen(true)}
          className="btn-pill bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-lg border-2 border-red-700 transition-all shrink-0 cursor-pointer"
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
              <div className="bg-[#F4F6F0] rounded-3xl p-6 border-2 border-[#15121F]/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#7C5CFA] text-white flex items-center justify-center mx-auto shadow-md">
                  <Wallet className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-base text-[#15121F]">
                    Connect Treasury Wallet
                  </h4>
                  <p className="text-xs text-[#15121F]/60 font-medium">
                    Connect your MetaMask or OKX Wallet on X Layer Testnet to distribute tokens.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (connectors.length > 1) {
                      setIsWalletModalOpen(true);
                    } else if (connectors[0]) {
                      connect({ connector: connectors[0] });
                    }
                  }}
                  className="w-full btn-pill btn-grow-primary py-3 text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-lg"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect X Layer Wallet</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#F4F6F0] rounded-3xl p-6 border-2 border-[#15121F]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#15121F]/60 uppercase tracking-wider">
                    Connected Treasury
                  </span>
                  <button
                    onClick={handleDisconnectWallet}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
                <div className="font-mono text-sm font-bold text-[#15121F] bg-white px-3 py-2 rounded-xl border border-[#15121F]/10 truncate">
                  {address}
                </div>
                <div className="pt-2 border-t border-[#15121F]/10 flex items-center justify-between">
                  <span className="text-xs text-[#15121F]/70 font-semibold">
                    Native Balance:
                  </span>
                  <span className="font-display font-extrabold text-xl text-[#15121F]">
                    {treasuryBalance} OKB
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions Bar (Inspired by Variant 2) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => setIsCreatorModalOpen(true)}
                className="btn-pill bg-[#1FAE52] hover:bg-[#199645] text-white py-3 text-xs font-extrabold shadow-md border-2 border-[#15121F] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Campaign</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("ai-command-input");
                  if (el) el.focus();
                }}
                className="btn-pill bg-[#F6C61A] hover:bg-[#e0b216] text-[#15121F] py-3 text-xs font-extrabold shadow-md border-2 border-[#15121F] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <Bot className="w-4 h-4 stroke-[2.5]" />
                <span>AI Plan</span>
              </button>

              <button
                onClick={() => setIsTelegramSimulatorOpen(true)}
                className="btn-pill bg-[#7C5CFA] hover:bg-[#6848E4] text-white py-3 text-xs font-extrabold shadow-md border-2 border-[#15121F] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Batch Drop</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Campaign & AI Command Center */}
        <div className="lg:col-span-7 space-y-6">
          {campaign ? (
            <div className="bg-white rounded-[36px] p-6 sm:p-8 border-4 border-[#15121F] shadow-xl space-y-6">
              {/* Campaign Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#15121F]/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-2xl text-[#15121F]">
                      {campaign.name}
                    </h3>
                    <span className="bg-[#1FAE52]/10 text-[#1FAE52] text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#15121F]/60 font-medium mt-0.5">
                    Created {campaign.createdAt} • Target: {campaign.maxSpots} Wallets
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs text-[#15121F]/60 font-bold uppercase">
                    PAYOUT / WALLET
                  </div>
                  <div className="font-display font-extrabold text-xl text-[#7C5CFA]">
                    {campaign.amountPerWallet} {campaign.token}
                  </div>
                </div>
              </div>

              {/* Telegram Deep Link Box */}
              <div className="bg-[#F4F6F0] rounded-2xl p-4 border-2 border-[#15121F]/10 space-y-2">
                <label className="block text-xs font-bold text-[#15121F]/70 uppercase tracking-wider">
                  Community Telegram Claim Link:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={campaign.telegramLink}
                    className="w-full bg-white px-3 py-2 rounded-xl text-xs font-mono border border-[#15121F]/20 text-[#15121F] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn-pill bg-[#15121F] text-white hover:bg-[#2A2438] px-4 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
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

              {/* AI Distribution Command Bar */}
              <div className="bg-[#15121F] rounded-3xl p-5 text-white space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#F6C61A] text-[#15121F] flex items-center justify-center font-bold text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-white">
                    AI Distribution Command Engine
                  </h4>
                </div>

                <form onSubmit={handleAiSubmit} className="space-y-3">
                  <textarea
                    id="ai-command-input"
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-3 text-xs font-medium text-white placeholder-white/40 focus:outline-none focus:border-[#1FAE52]"
                    placeholder="e.g. Distribute 0.25 OKB to 20 random eligible wallets..."
                  />
                  <button
                    type="submit"
                    disabled={isAiGenerating}
                    className="w-full btn-pill bg-[#7C5CFA] hover:bg-[#6848E4] text-white py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isAiGenerating ? (
                      <span>Analyzing & Generating Plan...</span>
                    ) : (
                      <>
                        <span>Generate AI Distribution Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* AI Plan Preview Box */}
                {aiPlan && (
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/15 space-y-3 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#F6C61A]">
                        AI Distribution Strategy
                      </span>
                      <span className="bg-[#1FAE52] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {aiPlan.recipients.length} Wallets Selected
                      </span>
                    </div>

                    <p className="text-xs text-white/80 font-medium">
                      Optimized batch allocation targeting eligible community wallets on X Layer.
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                      <div>
                        Total Payout:{" "}
                        <strong className="text-[#F6C61A]">
                          {aiPlan.totalAmount} OKB
                        </strong>
                      </div>
                      <button
                        onClick={executeDistribution}
                        disabled={isDistributing}
                        className="btn-pill btn-grow-primary px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                      >
                        {isDistributing ? (
                          <span>Executing Drop...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Execute Batch Payout</span>
                          </>
                        )}
                      </button>
                    </div>

                    {txHash && (
                      <div className="p-2 bg-[#1FAE52]/20 rounded-xl text-[11px] text-[#1FAE52] font-mono flex items-center justify-between">
                        <span>Tx Hash: {txHash.slice(0, 14)}...</span>
                        <a
                          href={`https://www.okx.com/explorer/xlayer-test/tx/${txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-white flex items-center gap-1"
                        >
                          View Explorer <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[36px] p-8 border-4 border-[#15121F] shadow-xl text-center space-y-4">
              <h3 className="font-display font-extrabold text-xl text-[#15121F]">
                No Active Campaign Found
              </h3>
              <p className="text-sm text-[#15121F]/70 font-medium max-w-sm mx-auto">
                Create a campaign to generate your community Telegram claim bot link.
              </p>
              <button
                onClick={() => setIsCreatorModalOpen(true)}
                className="btn-pill btn-grow-primary px-6 py-3 text-sm font-bold text-white shadow-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Submissions Table */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border-4 border-[#15121F] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-xl text-[#15121F]">
              Live Community Submissions ({submissions.length})
            </h3>
            <p className="text-xs text-[#15121F]/60 font-medium">
              Realtime verified wallet submissions from Telegram claim bot.
            </p>
          </div>
          <span className="text-xs bg-[#1FAE52]/10 text-[#1FAE52] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1FAE52] animate-pulse" />
            Live Supabase Feed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-[#15121F]">
            <thead>
              <tr className="border-b-2 border-[#15121F]/10 text-[#15121F]/60 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Telegram Handle</th>
                <th className="py-3 px-4">EVM Wallet Address</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15121F]/10 font-medium">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#F4F6F0]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#7C5CFA]/10 text-[#7C5CFA] flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{sub.username}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[#15121F]/80">
                    {sub.address}
                  </td>
                  <td className="py-3.5 px-4 text-[#15121F]/60">{sub.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        sub.status === "Paid"
                          ? "bg-[#1FAE52]/10 text-[#1FAE52]"
                          : sub.status === "Selected"
                          ? "bg-[#F6C61A]/20 text-[#15121F]"
                          : "bg-gray-100 text-gray-700"
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

      {/* WALLET CONNECTOR SELECTOR MODAL */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#15121F]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] border-4 border-[#15121F] max-w-sm w-full p-6 shadow-2xl space-y-5 animate-mascot-bob">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-lg text-[#15121F]">
                Select X Layer Wallet
              </h3>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F6F0] text-[#15121F] font-bold border border-[#15121F]/20 hover:bg-[#15121F] hover:text-white transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {connectors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleConnectConnector(c)}
                  className="w-full p-3.5 bg-[#F4F6F0] hover:bg-[#15121F] hover:text-white rounded-2xl border-2 border-[#15121F]/10 flex items-center justify-between font-bold text-sm text-[#15121F] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-[#7C5CFA] group-hover:text-[#F6C61A]" />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-xs text-[#15121F]/50 group-hover:text-white/70">Connect →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* DANGER SIGN OUT CONFIRMATION MODAL */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#15121F]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] border-4 border-[#15121F] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-mascot-bob">
            {/* Header with Danger Red Icon */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 border-2 border-red-500 text-red-600 flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-[#15121F]">
                    Sign Out of Creator Portal?
                  </h3>
                  <p className="text-xs font-semibold text-red-600">
                    High Risk Session Termination
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSignOutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F6F0] text-[#15121F] font-bold border border-[#15121F]/20 hover:bg-[#15121F] hover:text-white transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Message Box */}
            <div className="p-4 bg-red-50 rounded-2xl border-2 border-red-200 space-y-2 text-xs text-red-900 font-medium">
              <p>
                You are about to sign out of your protected treasury session. Any unexecuted AI distribution plans or active claim sessions will require re-authentication.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => setIsSignOutModalOpen(false)}
                disabled={isSigningOut}
                className="w-full sm:w-1/2 btn-pill bg-[#F4F6F0] text-[#15121F] hover:bg-[#15121F]/10 py-3.5 text-sm font-bold border-2 border-[#15121F]/20"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSignOut}
                disabled={isSigningOut}
                className="w-full sm:w-1/2 btn-pill bg-red-600 hover:bg-red-700 text-white py-3.5 text-sm font-extrabold shadow-lg border-2 border-red-800 flex items-center justify-center"
              >
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
