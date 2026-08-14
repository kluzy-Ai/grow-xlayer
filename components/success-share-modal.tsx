"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { X, CheckCircle2, Share2, Copy, ExternalLink, Sparkles, Trophy } from "lucide-react";

interface SuccessShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  totalAmount: string;
  tokenSymbol: string;
  txHash?: string | null;
  recipientCount: number;
}

export const SuccessShareModal: React.FC<SuccessShareModalProps> = ({
  isOpen,
  onClose,
  campaignName,
  totalAmount,
  tokenSymbol,
  txHash,
  recipientCount,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);

  const promoImageUrl = "https://grow-xlayer.vercel.app/grow-promo-share.png";
  const campaignUrl = "https://grow-xlayer.vercel.app/claim/cmp_xlayer1";
  const proofUrl = "https://grow-xlayer.vercel.app/proof/cmp_xlayer1";

  // Crafted professional copywriter intent message featuring public proof link & anonymous crypto privacy guarantee
  const shareText = `🚀 Batch payout of ${totalAmount} ${tokenSymbol} successfully executed on @XLayerOfficial!\n\n💎 Campaign: ${campaignName}\n⚡ Powered by @GrowXLayer — AI-automated token distribution on OKX X Layer.\n\n🔍 Public Verified Payout Proof (Anonymous Web3 Wallets):\n${proofUrl}\n\nJoin our community & claim your rewards here 👇\n${campaignUrl}`;

  // Confetti explosion on open (no auto countdown timer)
  useEffect(() => {
    if (!isOpen) return;

    try {
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#1FAE52", "#F6C61A", "#7C5CFA", "#B4E23F", "#FFFFFF"],
      });
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Social Share Handlers
  const shareOnX = () => {
    const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  const shareOnTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(campaignUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
  };

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const shareOnInstagram = () => {
    navigator.clipboard.writeText(`${shareText}\n\n[Promo Banner]: ${promoImageUrl}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleCopyImageLink = () => {
    navigator.clipboard.writeText(promoImageUrl);
    setImageCopied(true);
    setTimeout(() => setImageCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#15121F]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border-4 border-[#15121F] shadow-[14px_14px_0px_0px_#15121F] max-w-lg w-full overflow-hidden space-y-5 p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        
        {/* Top Header with Status Badge & Close Button (No Countdown Timer) */}
        <div className="flex items-center justify-between border-b-3 border-[#15121F] pb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#1FAE52] text-white font-extrabold px-3 py-1 rounded-full flex items-center gap-2 border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F]">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Payout Confirmed & Broadcasted
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#F4F6F0] hover:bg-gray-200 text-[#15121F] flex items-center justify-center font-extrabold border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] cursor-pointer shrink-0 transition-transform active:translate-y-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tactile Celebratory Hero Card */}
        <div className="bg-[#1FAE52] rounded-[28px] p-6 text-white border-4 border-[#15121F] shadow-[6px_6px_0px_0px_#15121F] space-y-3 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[#F6C61A] text-[#15121F] border-3 border-[#15121F] mx-auto flex items-center justify-center font-extrabold shadow-[3px_3px_0px_0px_#15121F]">
            <Trophy className="w-8 h-8 fill-[#15121F]" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Distribution Successful! 🎉
            </h3>
            <p className="text-xs font-extrabold text-white/95 mt-1">
              Successfully paid out <span className="underline font-black">{totalAmount} {tokenSymbol}</span> across {recipientCount} wallets on X Layer.
            </p>
          </div>

          {txHash && (
            <a
              href={`https://www.oklink.com/xlayer-test/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold bg-white/20 px-3.5 py-1.5 rounded-full text-white hover:bg-white/30 transition-colors border-2 border-white/40 shadow-sm"
            >
              <span>{`${txHash.slice(0, 12)}...${txHash.slice(-6)}`}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Share Section Title */}
        <div className="text-center space-y-1 pt-1">
          <h4 className="font-display font-extrabold text-base text-[#15121F] flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F6C61A] fill-[#F6C61A]" />
            <span>Share & Celebrate with Your Community!</span>
          </h4>
          <p className="text-xs text-[#15121F]/70 font-semibold">
            Spread the word on social media & drive more engagement to your giveaway.
          </p>
        </div>

        {/* 4 Multi-Platform Tactile Social Share Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* X (Twitter) */}
          <button
            onClick={shareOnX}
            className="py-3.5 px-2 rounded-2xl bg-[#15121F] hover:bg-[#2A2438] text-white font-extrabold text-xs border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:translate-y-0.5 active:translate-y-1"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Share on X</span>
          </button>

          {/* Telegram */}
          <button
            onClick={shareOnTelegram}
            className="py-3.5 px-2 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-extrabold text-xs border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:translate-y-0.5 active:translate-y-1"
          >
            <Share2 className="w-4 h-4" />
            <span>Telegram</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={shareOnWhatsApp}
            className="py-3.5 px-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:translate-y-0.5 active:translate-y-1"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {/* Instagram */}
          <button
            onClick={shareOnInstagram}
            className="py-3.5 px-2 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-extrabold text-xs border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:translate-y-0.5 active:translate-y-1"
          >
            <Copy className="w-4 h-4" />
            <span>Instagram</span>
          </button>
        </div>

        {/* Copywriter Intent Message Box */}
        <div className="bg-[#F4F6F0] p-4 rounded-[24px] border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] space-y-2.5 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#15121F]/70">
              Copywriter Intent Message
            </span>
            <button
              onClick={handleCopyText}
              className="text-[11px] font-extrabold text-[#7C5CFA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isCopied ? "Copied!" : "Copy Text"}</span>
            </button>
          </div>
          <p className="text-xs font-semibold text-[#15121F] bg-white p-3.5 rounded-2xl border-2 border-[#15121F] whitespace-pre-line leading-relaxed font-sans shadow-sm">
            {shareText}
          </p>
        </div>

        {/* Official Promotional Banner Box */}
        <div className="bg-[#7C5CFA]/15 p-4 rounded-[24px] border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C5CFA] text-white flex items-center justify-center font-extrabold border-2 border-[#15121F] shrink-0 shadow-[2px_2px_0px_0px_#15121F]">
              🖼️
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#15121F] truncate">Official Grow Promotional Banner</p>
              <p className="text-[10px] text-[#15121F]/70 font-mono truncate">{promoImageUrl}</p>
            </div>
          </div>

          <button
            onClick={handleCopyImageLink}
            className="px-3.5 py-2 rounded-xl bg-[#15121F] hover:bg-[#7C5CFA] text-white font-extrabold text-xs transition-colors border-2 border-[#15121F] cursor-pointer shrink-0"
          >
            {imageCopied ? "Copied!" : "Copy Image"}
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-full bg-[#15121F] hover:bg-[#2A2438] text-white font-extrabold text-xs sm:text-sm border-4 border-[#B4E23F] shadow-[4px_4px_0px_0px_#1FAE52] transition-transform hover:translate-y-0.5 active:translate-y-1 cursor-pointer"
          >
            Done & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
