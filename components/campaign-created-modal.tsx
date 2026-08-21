"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Zap,
  Copy,
  Check,
  Share2,
  Send,
  MessageSquare,
  Camera,
  ExternalLink,
  Sparkles,
  Layers,
  Coins,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface CampaignCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    slug?: string;
    title?: string;
    name?: string;
    totalPool: string | number;
    token: string;
    amountPerWallet: number | string;
    maxSpots: number;
    telegramLink?: string;
  } | null;
}

export const CampaignCreatedModal: React.FC<CampaignCreatedModalProps> = ({
  isOpen,
  onClose,
  campaign,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [instagramToast, setInstagramToast] = useState(false);

  useEffect(() => {
    if (isOpen && campaign) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#1FAE52", "#F6C61A", "#7C5CFA", "#B4E23F", "#15121F"],
        });
      } catch (e) {
        console.error("Confetti trigger error:", e);
      }
    }
  }, [isOpen, campaign]);

  if (!isOpen || !campaign) return null;

  const campaignTitle = campaign.title || campaign.name || "Token Giveaway";
  const campaignSlug = campaign.slug || campaign.id;
  const telegramLink =
    campaign.telegramLink || `https://t.me/GrowXlayerbot?start=${campaignSlug}`;
  const totalPool = campaign.totalPool;
  const token = campaign.token || "OKB";
  const reward = campaign.amountPerWallet;
  const spots = campaign.maxSpots;

  // Multi-Platform Formatted Intent Messages
  const xShareText = `🚀 We just launched "${campaignTitle}" on OKX @XLayerOfficial!

🎁 Reward: ${reward} ${token} per wallet
👥 Max Spots: ${spots} Wallets
💰 Total Pool: ${totalPool} ${token}

⚡ Submit your wallet to claim 👇`;

  const tgShareText = `🔥 **Live Campaign Alert!**
🎁 **${campaignTitle}**
💰 **Reward:** ${reward} ${token}
👥 **Spots:** ${spots} Wallets
🌐 **Network:** OKX X Layer

Claim your spot now with @GrowXlayerbot 👇`;

  const waShareText = `🚀 *Live Giveaway:* "${campaignTitle}" on OKX X Layer!\n🎁 *Reward:* ${reward} ${token}\n👥 *Spots:* ${spots} Wallets\n💰 *Total Pool:* ${totalPool} ${token}\n\n👉 *Claim Your Spot:* ${telegramLink}`;

  const instaCaptionText = `🚀 Live Giveaway: "${campaignTitle}" on OKX X Layer!\n🎁 Reward: ${reward} ${token} per wallet\n👥 Max Wallets: ${spots}\n💰 Total Pool: ${totalPool} ${token}\n\n🔗 Link in Bio / Story to claim: ${telegramLink}`;

  // Social Share Handlers
  const handleShareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      xShareText
    )}&url=${encodeURIComponent(telegramLink)}&hashtags=XLayer,OKB,Web3,Airdrop`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      telegramLink
    )}&text=${encodeURIComponent(tgShareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      waShareText
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareInstagram = () => {
    navigator.clipboard.writeText(instaCaptionText);
    setInstagramToast(true);
    setTimeout(() => setInstagramToast(false), 3500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(telegramLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAllIntent = () => {
    navigator.clipboard.writeText(
      `${xShareText}\n\nClaim Link: ${telegramLink}`
    );
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#15121F]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border-4 border-[#15121F] shadow-[14px_14px_0px_0px_#15121F] max-w-lg w-full overflow-hidden space-y-4 p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header with Neo-Brutalist Badges */}
        <div className="flex items-center justify-between border-b-3 border-[#15121F] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#B4E23F] text-[#15121F] border-3 border-[#15121F] flex items-center justify-center font-extrabold shadow-[3px_3px_0px_0px_#15121F] shrink-0">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#15121F] tracking-tight">
                  Campaign Created!
                </h3>
              </div>
              <p className="text-xs font-bold text-[#1FAE52]">
                Active on OKX X Layer Testnet (1952)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#F4F6F0] hover:bg-[#15121F] hover:text-white text-[#15121F] flex items-center justify-center font-extrabold border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] transition-transform active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Celebratory Hero Card */}
        <div className="bg-[#F6C61A] rounded-[24px] p-4 sm:p-5 text-[#15121F] border-3 border-[#15121F] shadow-[5px_5px_0px_0px_#15121F] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display font-black text-lg sm:text-xl truncate pr-2">
              {campaignTitle}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#15121F] text-[#B4E23F] text-[10px] font-extrabold border border-[#15121F] shrink-0">
              OKX X Layer
            </span>
          </div>

          {/* 3 Parameter Pillars */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2.5 rounded-xl border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F]">
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-[#15121F]/60 uppercase">
                Total Budget
              </span>
              <span className="font-display font-extrabold text-xs sm:text-sm text-[#15121F] truncate block">
                {totalPool} {token}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F]">
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-[#15121F]/60 uppercase">
                Spots
              </span>
              <span className="font-display font-extrabold text-xs sm:text-sm text-[#15121F] truncate block">
                {spots} Wallets
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F]">
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-[#15121F]/60 uppercase">
                Per Wallet
              </span>
              <span className="font-display font-extrabold text-xs sm:text-sm text-[#15121F] truncate block">
                {reward} {token}
              </span>
            </div>
          </div>
        </div>

        {/* Telegram Direct Claim Link Container */}
        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#15121F]/70">
            Community Claim Link:
          </label>
          <div className="bg-[#15121F] p-3 rounded-2xl border-3 border-[#15121F] flex items-center justify-between gap-2 shadow-[4px_4px_0px_0px_#15121F]">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <Send className="w-4 h-4 text-[#B4E23F] shrink-0" />
              <span className="font-mono text-xs text-white truncate">
                {telegramLink}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl bg-[#B4E23F] hover:bg-[#a2d42b] text-[#15121F] text-xs font-black shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Intent Section */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#15121F]">
              <Share2 className="w-4 h-4 text-[#7C5CFA]" />
              <span>Share Intent Messages:</span>
            </div>

            <button
              onClick={handleCopyAllIntent}
              className="text-[11px] font-bold text-[#7C5CFA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedMessage ? "Copied All!" : "Copy Full Intent"}</span>
            </button>
          </div>

          {instagramToast && (
            <div className="p-2.5 rounded-xl bg-[#7C5CFA]/15 border-2 border-[#7C5CFA] text-xs font-extrabold text-[#15121F] text-center animate-in fade-in">
              ✨ Caption & Claim link copied! Open Instagram to post to Story/Feed.
            </div>
          )}

          {/* 4 Multi-Platform Social Share Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. X (Twitter) */}
            <button
              onClick={handleShareX}
              className="py-3 px-2 rounded-2xl bg-[#15121F] hover:bg-[#2A2438] text-white font-extrabold text-xs border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:translate-y-0.5 active:translate-y-1"
            >
              <span className="text-sm font-black">𝕏</span>
              <span>Share on X</span>
            </button>

            {/* 2. Telegram */}
            <button
              onClick={handleShareTelegram}
              className="py-3 px-2 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-extrabold text-xs border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:translate-y-0.5 active:translate-y-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            {/* 3. WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:translate-y-0.5 active:translate-y-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* 4. Instagram */}
            <button
              onClick={handleShareInstagram}
              className="py-3 px-2 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-extrabold text-xs border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:translate-y-0.5 active:translate-y-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </button>
          </div>
        </div>

        {/* Done / Return Action */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#15121F] hover:bg-[#2A2438] text-white font-display font-extrabold text-sm border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#1FAE52] transition-transform hover:translate-y-0.5 active:translate-y-1 cursor-pointer"
          >
            Done & View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
