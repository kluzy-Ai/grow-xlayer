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
  LogOut,
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
  const [activeCampaignFilter, setActiveCampaignFilter] = useState<
    "liquidity" | "ai" | "batch"
  >("liquidity");

  const treasuryBalance = balanceData
    ? Number(formatEther(balanceData.value)).toFixed(2)
    : "12.50";

  const userEmail = user?.email || "creator@buildx.xyz";
  const communityName = user?.user_metadata?.community_name || "BuildX Guild";
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "0x9aBc...f34";

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* 1. TOP NAVBAR / HEADER BAR (Exact Reference Image Style) */}
      <div className="bg-white rounded-3xl p-4 border-4 border-[#15121F] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#15121F] text-white flex items-center justify-center font-extrabold text-xs">
              <Layers className="w-4 h-4 text-[#B4E23F]" />
            </div>
            <span className="font-display font-extrabold text-lg text-[#15121F]">
              Grow on OKX
            </span>
          </div>
          <span className="text-[#15121F]/30 font-bold">|</span>
          <span className="text-xs font-extrabold text-[#15121F]">
            X Layer Network
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F4F6F0] px-3 py-1.5 rounded-full border border-[#15121F]/10 text-xs font-bold text-[#15121F]">
            <User className="w-4 h-4 text-[#7C5CFA]" />
            <span>User: {displayAddress}</span>
          </div>

          {isConnected ? (
            <button
              onClick={handleDisconnectWallet}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#15121F] text-xs font-extrabold border-2 border-[#15121F] transition-all cursor-pointer"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => {
                if (connectors.length > 1) {
                  setIsWalletModalOpen(true);
                } else if (connectors[0]) {
                  connect({ connector: connectors[0] });
                }
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#15121F] text-xs font-extrabold border-2 border-[#15121F] transition-all shadow-sm cursor-pointer"
            >
              Connect Wallet
            </button>
          )}

          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold border-2 border-red-800 transition-all shadow-sm cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* 2. TOP STATS GRID: Treasury, Protocol Health, APY % (Exact Reference Image Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* X Layer Treasury Card */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#15121F]/10 pb-3">
            <h3 className="font-display font-extrabold text-xl text-[#15121F]">
              X Layer Treasury
            </h3>
            <CreditCard className="w-5 h-5 text-[#15121F]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#15121F]">
              <span>OKB Balance</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#15121F] text-white text-[10px] font-extrabold">
                Chain ID 1952
              </span>
            </div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#15121F]">
              {treasuryBalance} OKB
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsCreatorModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#15121F] hover:bg-[#2A2438] text-white text-xs font-extrabold transition-all cursor-pointer"
            >
              Deposit
            </button>
            <button
              onClick={() => setIsTelegramSimulatorOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#15121F] text-xs font-extrabold border-2 border-[#15121F] transition-all cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Protocol Health Card */}
        <div className="md:col-span-3 bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg flex flex-col justify-between space-y-2 text-center md:text-left">
          <span className="font-display font-extrabold text-sm text-[#15121F]">
            Protocol Health
          </span>
          <div className="font-display font-extrabold text-4xl sm:text-5xl text-[#15121F]">
            98%
          </div>
          <span className="text-[11px] font-bold text-[#1FAE52]">
            Optimal Performance
          </span>
        </div>

        {/* APY % Card */}
        <div className="md:col-span-3 bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg flex flex-col justify-between space-y-2 text-center md:text-left">
          <span className="font-display font-extrabold text-sm text-[#15121F]">
            APY %
          </span>
          <div className="font-display font-extrabold text-4xl sm:text-5xl text-[#15121F]">
            7.8%
          </div>
          <span className="text-[11px] font-bold text-[#7C5CFA]">
            Active OKB Rewards
          </span>
        </div>
      </div>

      {/* 3. ACTIVE CAMPAIGNS SECTION (Exact Reference Image Style) */}
      <div className="bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg space-y-4">
        <h3 className="font-display font-extrabold text-xl text-[#15121F]">
          Active Campaigns
        </h3>

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
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-[#15121F] text-white text-xs font-bold hover:bg-[#2A2438] shrink-0"
            >
              {copiedLink ? "Copied Link!" : "Copy Link"}
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

      {/* 4. LIVE TELEGRAM SUBMISSIONS FEED (Exact Reference Image Style) */}
      <div className="bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-xl text-[#15121F]">
            Live Telegram Submissions Feed
          </h3>
          <span className="text-xs bg-[#1FAE52]/10 text-[#1FAE52] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#1FAE52]/20">
            <span className="w-2 h-2 rounded-full bg-[#1FAE52] animate-pulse" />
            Live Supabase Stream
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-[#15121F] bg-[#F4F6F0] text-[#15121F] font-extrabold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 border-r-2 border-[#15121F]/20">Username</th>
                <th className="py-3.5 px-4 border-r-2 border-[#15121F]/20">Project</th>
                <th className="py-3.5 px-4 border-r-2 border-[#15121F]/20">Description</th>
                <th className="py-3.5 px-4 border-r-2 border-[#15121F]/20">Status</th>
                <th className="py-3.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#15121F]/10 font-medium text-xs sm:text-sm text-[#15121F]">
              {submissions.map((sub, index) => (
                <tr key={sub.id} className="hover:bg-[#F4F6F0]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold border-r-2 border-[#15121F]/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#7C5CFA]/10 text-[#7C5CFA] flex items-center justify-center font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span>{sub.username}</span>
                  </td>
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-semibold">
                    {index % 2 === 0 ? "Grow X Layer" : "BuildX OKB Guild"}
                  </td>
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-mono text-xs text-[#15121F]/80">
                    {sub.address}
                  </td>
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                        sub.status === "Paid"
                          ? "bg-[#1FAE52] text-white"
                          : sub.status === "Selected"
                          ? "bg-[#F6C61A] text-[#15121F]"
                          : "bg-[#15121F]/10 text-[#15121F]"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={executeDistribution}
                      className="px-3 py-1.5 rounded-xl bg-[#15121F] hover:bg-[#7C5CFA] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Pay Out
                    </button>
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
