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
  TrendingUp,
  Activity,
  Layers,
  Lightbulb,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { formatEther } from "viem";
import { useAirdrop } from "@/hooks/use-airdrop";
import { signOutCreator } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";
import { CampaignCreatorModal } from "./campaign-creator-modal";
import { TelegramSimulatorModal } from "./telegram-simulator-modal";
import { WalletModal } from "./wallet-modal";
import { PayoutModal } from "./payout-modal";
import { TransactionHistoryCard } from "./transaction-history-card";

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
  const [isCampaignsModalOpen, setIsCampaignsModalOpen] = useState(false);
  const [selectedPayoutCampaign, setSelectedPayoutCampaign] = useState<any | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(
    "Distribute 0.25 OKB to 20 random eligible wallets"
  );
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeCampaignFilter, setActiveCampaignFilter] = useState<
    "liquidity" | "ai" | "batch"
  >("liquidity");

  const handleCopyAddress = (addr: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(addr);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const treasuryBalance = isConnected && balanceData
    ? Number(formatEther(balanceData.value)).toFixed(2)
    : "0.00";

  const userEmail = user?.email || "creator@buildx.xyz";
  const communityName = user?.user_metadata?.community_name || "BuildX Guild";

  // List of creator campaigns (Active & Completed) with unique Telegram links
  const allCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    amountPerWallet: number;
    maxSpots: number;
    registeredWallets?: number;
    token: string;
    telegramLink: string;
    createdAt: string;
  }> = [
    {
      id: campaign?.id || "cmp_xlayer1",
      name: campaign?.name || "BuildX OKB Community Giveaway",
      status: campaign?.status || "Active",
      amountPerWallet: campaign?.amountPerWallet || 0.25,
      maxSpots: campaign?.maxSpots || 20,
      registeredWallets: 14,
      token: campaign?.token || "OKB",
      telegramLink: campaign?.telegramLink || "https://t.me/GrowBot?start=cmp_xlayer1",
      createdAt: campaign?.createdAt || "Aug 13, 2026",
    },
    {
      id: "cmp_xlayer_phase1",
      name: "X Layer Guild Airdrop Phase 1",
      status: "Completed",
      amountPerWallet: 0.5,
      maxSpots: 50,
      registeredWallets: 50,
      token: "OKB",
      telegramLink: "https://t.me/GrowBot?start=cmp_xlayer_phase1",
      createdAt: "Aug 10, 2026",
    },
    {
      id: "cmp_xlayer_fund",
      name: "OKB Community Growth Fund",
      status: "Active",
      amountPerWallet: 0.1,
      maxSpots: 100,
      registeredWallets: 68,
      token: "OKB",
      telegramLink: "https://t.me/GrowBot?start=cmp_xlayer_fund",
      createdAt: "Aug 05, 2026",
    },
  ];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
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
      disconnect();
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* 1. PRIMARY DASHBOARD HEADER BAR */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border-4 border-[#15121F] shadow-lg flex flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F6C61A] text-[#15121F] border-2 border-[#15121F] flex items-center justify-center font-bold shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-[#15121F]" />
            </div>
            <span className="font-display font-extrabold text-base sm:text-lg text-[#15121F]">
              Grow
            </span>
          </div>
          <span className="text-[#15121F]/30 font-bold">|</span>
          <span className="text-[11px] sm:text-xs font-extrabold text-[#15121F] whitespace-nowrap">
            X Layer Network
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {userEmail && (
            <div className="flex items-center gap-1.5 bg-[#F4F6F0] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#15121F]/10 text-[11px] sm:text-xs font-bold text-[#15121F] max-w-[200px] sm:max-w-[280px] truncate">
              <User className="w-3.5 h-3.5 text-[#7C5CFA] shrink-0" />
              <span className="truncate">User: {userEmail}</span>
            </div>
          )}

          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold border-2 border-red-800 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* 2. TOP TREASURY CARD */}
      <div className="bg-white rounded-[32px] p-7 sm:p-9 border-4 border-[#15121F] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-extrabold text-2xl text-[#15121F]">
              X Layer Treasury
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#15121F] text-white text-xs font-extrabold tracking-wide">
              Chain ID 1952
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-xs font-extrabold text-[#15121F]/60 uppercase tracking-wider">
              OKB Balance:
            </span>
            <span className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#15121F]">
              {treasuryBalance} OKB
            </span>
          </div>

          {/* Connected Wallet Address BELOW OKB Balance with Copy Icon */}
          {isConnected && address ? (
            <div className="flex items-center gap-2.5 pt-1">
              <span className="text-xs font-extrabold text-[#15121F]/60">Connected:</span>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F4F6F0] border-2 border-[#15121F]/20 text-xs font-mono font-extrabold text-[#15121F]">
                <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                <button
                  onClick={() => handleCopyAddress(address)}
                  className="p-1 hover:bg-[#15121F]/10 rounded-lg transition-colors cursor-pointer text-[#15121F]/70 hover:text-[#15121F]"
                  title="Copy wallet address"
                >
                  {copiedAddress ? (
                    <Check className="w-3.5 h-3.5 text-[#1FAE52]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {copiedAddress && (
                <span className="text-[11px] font-bold text-[#1FAE52] animate-in fade-in">
                  Copied!
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs font-bold text-[#15121F]/50 pt-0.5">
              Wallet not connected. Connect wallet to view live X Layer balance.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto pt-2 sm:pt-0">
          {isConnected ? (
            <button
              onClick={handleDisconnectWallet}
              className="px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#15121F] text-xs font-extrabold border-2 border-[#15121F] transition-all cursor-pointer shadow-sm"
            >
              Disconnect Wallet
            </button>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#15121F] text-xs font-extrabold border-2 border-[#15121F] transition-all cursor-pointer shadow-sm"
            >
              Connect Wallet
            </button>
          )}

          <button
            onClick={() => setIsCreatorModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#15121F] hover:bg-[#2A2438] text-white text-xs font-extrabold transition-all cursor-pointer shadow-md"
          >
            Create Campaign
          </button>

          <button
            onClick={() => setIsCampaignsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#1FAE52] hover:bg-[#199645] text-white text-xs font-extrabold border-2 border-[#15121F] transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Active Campaigns</span>
          </button>
        </div>
      </div>

      {/* 3. ACTIVE CAMPAIGNS SECTION */}
      <div className="bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-xl text-[#15121F]">
            Active Campaigns
          </h3>
          <button
            onClick={() => setIsCampaignsModalOpen(true)}
            className="text-xs font-extrabold text-[#7C5CFA] hover:underline"
          >
            View All Campaigns ({allCampaigns.length}) →
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Green Campaign Pill */}
          <button
            onClick={() => setActiveCampaignFilter("liquidity")}
            className={`px-5 py-3 rounded-full border-2 border-[#15121F] font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-transform hover:scale-105 cursor-pointer ${
              activeCampaignFilter === "liquidity"
                ? "bg-[#1FAE52] text-[#15121F] shadow-md"
                : "bg-[#1FAE52]/20 text-[#15121F]"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#15121F] text-white flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#1FAE52]" />
            </div>
            <span>Campaign: Liquidity Boost</span>
          </button>

          {/* Yellow Campaign Pill */}
          <button
            onClick={() => setActiveCampaignFilter("ai")}
            className={`px-5 py-3 rounded-full border-2 border-[#15121F] font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-transform hover:scale-105 cursor-pointer ${
              activeCampaignFilter === "ai"
                ? "bg-[#F6C61A] text-[#15121F] shadow-md"
                : "bg-[#F6C61A]/20 text-[#15121F]"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#15121F] text-white flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-[#F6C61A]" />
            </div>
            <span>Campaign: AI Growth Fund</span>
          </button>

          {/* Purple Campaign Pill */}
          <button
            onClick={() => setActiveCampaignFilter("batch")}
            className={`px-5 py-3 rounded-full border-2 border-[#15121F] font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-transform hover:scale-105 cursor-pointer ${
              activeCampaignFilter === "batch"
                ? "bg-[#7C5CFA] text-white shadow-md"
                : "bg-[#7C5CFA]/20 text-[#15121F]"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#15121F] text-white flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#7C5CFA]" />
            </div>
            <span>Campaign: Batch Drop Protocol</span>
          </button>
        </div>

        {/* Campaign Action & AI Prompt Quick Launcher */}
        <div className="bg-[#F4F6F0] p-4 rounded-2xl border-2 border-[#15121F]/10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="space-y-1">
            <div className="font-extrabold text-sm text-[#15121F]">
              {activeCampaignFilter === "liquidity"
                ? "BuildX OKB Community Giveaway (Liquidity Boost)"
                : activeCampaignFilter === "ai"
                ? "AI Growth Fund Allocation"
                : "Batch Drop Distribution Engine"}
            </div>
            <p className="text-xs font-medium text-[#15121F]/60">
              Community Telegram Claim Link: {campaign?.telegramLink || "https://t.me/GrowBot?start=cmp_xlayer1"}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() =>
                handleCopyText(
                  campaign?.telegramLink || "https://t.me/GrowBot?start=cmp_xlayer1",
                  "main_link"
                )
              }
              className="px-4 py-2 rounded-xl bg-[#15121F] text-white text-xs font-bold hover:bg-[#2A2438] shrink-0"
            >
              {copiedLink === "main_link" ? "Copied Link!" : "Copy Link"}
            </button>
            <button
              onClick={() => setIsTelegramSimulatorOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#7C5CFA] text-white text-xs font-bold hover:bg-[#6848E4] shrink-0"
            >
              Test Bot
            </button>
          </div>
        </div>
      </div>

      {/* 4. CAMPAIGN FEED */}
      <div className="bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-xl text-[#15121F]">
            Campaign Feed
          </h3>
          <span className="text-xs bg-[#1FAE52]/10 text-[#1FAE52] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#1FAE52]/20">
            <span className="w-2 h-2 rounded-full bg-[#1FAE52] animate-pulse" />
            Realtime X Layer Sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-[#15121F] bg-[#F4F6F0] text-[#15121F] font-extrabold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 border-r-2 border-[#15121F]/20">Campaign Name</th>
                <th className="py-3.5 px-4 border-r-2 border-[#15121F]/20">No. of Registered Wallet</th>
                <th className="py-3.5 px-4 border-r-2 border-[#15121F]/20">Status</th>
                <th className="py-3.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#15121F]/10 font-medium text-xs sm:text-sm text-[#15121F]">
              {allCampaigns.map((camp) => {
                const regCount =
                  camp.registeredWallets ??
                  (camp.status === "Completed"
                    ? camp.maxSpots
                    : Math.min(14, camp.maxSpots));
                const isEnded = camp.status === "Completed" || camp.status === "Ended";

                return (
                  <tr key={camp.id} className="hover:bg-[#F4F6F0]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold border-r-2 border-[#15121F]/10 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#7C5CFA]/10 text-[#7C5CFA] flex items-center justify-center font-bold text-xs shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-[#15121F]">{camp.name}</span>
                    </td>

                    <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-bold">
                      <span className="text-[#15121F]">
                        {regCount} / {camp.maxSpots} Wallets
                      </span>
                    </td>

                    <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                          !isEnded
                            ? "bg-[#1FAE52] text-white"
                            : "bg-[#15121F]/10 text-[#15121F]"
                        }`}
                      >
                        {!isEnded ? "Active" : "Ended"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setSelectedPayoutCampaign(camp);
                          setIsPayoutModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#15121F] hover:bg-[#7C5CFA] text-white text-xs font-extrabold transition-colors cursor-pointer shadow-sm"
                      >
                        Pay Out
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TRANSACTION HISTORY CARD (PAGINATED LEDGER WITH FILTERS & GROUP RETRY) */}
      <TransactionHistoryCard />

      {/* ALL CAMPAIGNS LIST MODAL */}
      {isCampaignsModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#15121F]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] border-4 border-[#15121F] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-mascot-bob max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#15121F]/10 pb-4">
              <div>
                <h3 className="font-display font-extrabold text-xl text-[#15121F]">
                  All Creator Campaigns ({allCampaigns.length})
                </h3>
                <p className="text-xs font-medium text-[#15121F]/60">
                  Active & completed campaigns with unique community Telegram claim links.
                </p>
              </div>
              <button
                onClick={() => setIsCampaignsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F6F0] text-[#15121F] font-bold border border-[#15121F]/20 hover:bg-[#15121F] hover:text-white transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {allCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-[#F4F6F0] rounded-2xl p-4 border-2 border-[#15121F]/10 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-base text-[#15121F]">
                          {camp.name}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            camp.status === "Active"
                              ? "bg-[#1FAE52] text-white"
                              : "bg-[#7C5CFA] text-white"
                          }`}
                        >
                          {camp.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#15121F]/60 font-medium mt-0.5">
                        Created {camp.createdAt} • Target: {camp.maxSpots} Wallets • Payout: {camp.amountPerWallet} {camp.token}
                      </p>
                    </div>
                  </div>

                  {/* Telegram Deep Link Box */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#15121F]/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Send className="w-4 h-4 text-[#7C5CFA] shrink-0" />
                      <span className="font-mono text-xs text-[#15121F] truncate">
                        {camp.telegramLink}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(camp.telegramLink, camp.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#15121F] text-white hover:bg-[#2A2438] text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      {copiedLink === camp.id ? (
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
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setIsCampaignsModalOpen(false);
                  setIsCreatorModalOpen(true);
                }}
                className="btn-pill btn-grow-primary px-6 py-3 text-xs font-extrabold text-white flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Campaign</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
      {/* Campaign Payout Details & Signing Modal */}
      <PayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        campaign={selectedPayoutCampaign}
        submissions={submissions}
        onExecutePayout={executeDistribution}
        isDistributing={isDistributing}
        txHash={txHash}
        onConnectWallet={() => setIsWalletModalOpen(true)}
      />

      {/* Wallet Selection Modal (Mobile & Desktop) */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};
