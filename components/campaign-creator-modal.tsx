"use client";

import React, { useState, useEffect } from "react";
import {
  Rocket,
  ArrowRight,
  Zap,
  X,
  Check,
  Copy,
  Send,
  Share2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CampaignCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: any) => void;
}

export const CampaignCreatorModal: React.FC<CampaignCreatorModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [totalPool, setTotalPool] = useState("");
  const [token, setToken] = useState("OKB");
  const [spots, setSpots] = useState("");
  const [amountType, setAmountType] = useState<"fixed" | "random">("fixed");
  const [amount, setAmount] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  
  // Validation & Success card state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createdCampaign, setCreatedCampaign] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [instagramToast, setInstagramToast] = useState(false);

  // Auto-calculate Total Campaign Pool based on fixed amount or average random range
  useEffect(() => {
    if (spots) {
      if (amountType === "fixed" && amount) {
        setTotalPool((Number(spots) * Number(amount)).toFixed(2));
      } else if (amountType === "random" && minAmount && maxAmount) {
        const avg = (Number(minAmount) + Number(maxAmount)) / 2;
        setTotalPool((Number(spots) * avg).toFixed(2));
      }
    }
  }, [spots, amountType, amount, minAmount, maxAmount]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCreatedCampaign(null);
    setFormErrors({});
    setTitle("");
    setTotalPool("");
    setSpots("");
    setAmount("");
    setMinAmount("");
    setMaxAmount("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = "Please enter a campaign title";
    }

    if (!spots || Number(spots) <= 0) {
      errs.spots = "Please enter recipient spots";
    }

    if (amountType === "fixed") {
      if (!amount || Number(amount) <= 0) {
        errs.amount = "Please enter amount per wallet";
      }
    } else {
      if (!minAmount || Number(minAmount) <= 0) {
        errs.minAmount = "Please enter min amount";
      }
      if (!maxAmount || Number(maxAmount) <= 0) {
        errs.maxAmount = "Please enter max amount";
      }
      if (Number(minAmount) > 0 && Number(maxAmount) > 0 && Number(minAmount) >= Number(maxAmount)) {
        errs.maxAmount = "Max must be greater than min";
      }
    }

    if (!totalPool || Number(totalPool) <= 0) {
      errs.totalPool = "Please enter total campaign pool";
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return; // Stop submission if required fields are blank!
    }

    setFormErrors({});

    const slug = "cmp_" + Math.random().toString(36).substring(2, 8);
    const newCampaign = {
      id: slug,
      title: title.trim(),
      totalPool: Number(totalPool).toFixed(2),
      token,
      amountType,
      amountPerWallet: amountType === "fixed" ? `${amount} ${token}` : `${minAmount} - ${maxAmount} ${token}`,
      minAmount: amountType === "random" ? Number(minAmount) : undefined,
      maxAmount: amountType === "random" ? Number(maxAmount) : undefined,
      maxSpots: Number(spots),
      telegramLink: `https://t.me/GrowBot?start=${slug}`,
      createdAt: "Just now",
      status: "Active",
    };

    onCreate(newCampaign);
    setCreatedCampaign(newCampaign);
  };

  const handleCopyLink = () => {
    if (createdCampaign) {
      navigator.clipboard.writeText(createdCampaign.telegramLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Professional Web3 Social Share Copywriting Handlers
  const handleShareX = () => {
    if (!createdCampaign) return;
    const tweetText = `🚀 Live on X Layer Network!

We just launched "${createdCampaign.title}"!

🎁 Reward: ${createdCampaign.amountPerWallet}
💰 Pool: ${createdCampaign.totalPool} ${createdCampaign.token}
⚡ Instant Claim via Telegram:

Claim your spot now 👇`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(createdCampaign.telegramLink)}&hashtags=XLayer,OKB,Airdrop,Web3`;
    window.open(url, "_blank");
  };

  const handleShareTelegram = () => {
    if (!createdCampaign) return;
    const tgText = `🚀 Live Giveaway: "${createdCampaign.title}" on X Layer!
🎁 Reward: ${createdCampaign.amountPerWallet}
💰 Pool: ${createdCampaign.totalPool} ${createdCampaign.token}

Claim your spot now 👇`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(createdCampaign.telegramLink)}&text=${encodeURIComponent(tgText)}`;
    window.open(url, "_blank");
  };

  const handleShareWhatsApp = () => {
    if (!createdCampaign) return;
    const waText = `🚀 Live Giveaway: "${createdCampaign.title}" on X Layer!\n🎁 Reward: ${createdCampaign.amountPerWallet}\n💰 Pool: ${createdCampaign.totalPool} ${createdCampaign.token}\n\nClaim your spot now: ${createdCampaign.telegramLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    window.open(url, "_blank");
  };

  const handleShareInstagram = () => {
    if (!createdCampaign) return;
    const instaText = `🚀 Live Giveaway: "${createdCampaign.title}" on X Layer!\n🎁 Reward: ${createdCampaign.amountPerWallet}\n💰 Pool: ${createdCampaign.totalPool} ${createdCampaign.token}\n\nClaim link: ${createdCampaign.telegramLink}`;
    navigator.clipboard.writeText(instaText);
    setInstagramToast(true);
    setTimeout(() => setInstagramToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121F]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] border-4 border-[#15121F] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {createdCampaign ? (
          /* POPUP CARD: SUCCESS & SOCIAL SHARE */
          <div className="space-y-6 animate-in zoom-in-95 duration-200 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#15121F]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1FAE52] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-[#15121F]">
                    Campaign Live!
                  </h3>
                  <p className="text-xs text-[#1FAE52] font-extrabold">
                    Generated Campaign Link
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-[#F4F6F0] text-[#15121F] font-bold border border-[#15121F]/20 hover:bg-[#15121F] hover:text-white transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Campaign Summary Box */}
            <div className="bg-[#F4F6F0] rounded-2xl p-4 border-2 border-[#15121F]/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-base text-[#15121F]">
                  {createdCampaign.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1FAE52] text-white text-[10px] font-extrabold">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-white p-2 rounded-xl border border-[#15121F]/10">
                  <span className="block text-[10px] font-bold text-[#15121F]/50 uppercase">Total Pool</span>
                  <span className="font-extrabold text-xs text-[#15121F]">{createdCampaign.totalPool} {createdCampaign.token}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#15121F]/10">
                  <span className="block text-[10px] font-bold text-[#15121F]/50 uppercase">Recipient Spots</span>
                  <span className="font-extrabold text-xs text-[#15121F]">{createdCampaign.maxSpots}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#15121F]/10">
                  <span className="block text-[10px] font-bold text-[#15121F]/50 uppercase">Per Wallet</span>
                  <span className="font-extrabold text-xs text-[#15121F]">{createdCampaign.amountPerWallet}</span>
                </div>
              </div>
            </div>

            {/* Generated Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70">
                Telegram Link
              </label>
              <div className="bg-[#15121F] p-3 rounded-2xl border-2 border-[#15121F] flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Send className="w-4 h-4 text-[#B4E23F] shrink-0" />
                  <span className="font-mono text-xs text-white truncate">
                    {createdCampaign.telegramLink}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-[#B4E23F] text-[#15121F] hover:bg-[#9dcb2a] text-xs font-extrabold shrink-0 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15121F]" />
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

            {/* Social Share Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#15121F]">
                <Share2 className="w-4 h-4 text-[#7C5CFA]" />
                <span>Share Campaign Link:</span>
              </div>

              {instagramToast && (
                <div className="p-2.5 rounded-xl bg-[#7C5CFA]/10 border border-[#7C5CFA]/30 text-xs font-bold text-[#7C5CFA] text-center animate-in fade-in">
                  Link & caption copied! Open Instagram to share story/post.
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {/* X.com / Twitter */}
                <button
                  onClick={handleShareX}
                  className="p-3 bg-[#15121F] hover:bg-[#2A2438] text-white rounded-2xl border-2 border-[#15121F] flex flex-col items-center justify-center gap-1 transition-all shadow-sm group cursor-pointer"
                >
                  <span className="font-extrabold text-sm group-hover:scale-110 transition-transform">𝕏</span>
                  <span className="text-[10px] font-bold">X.com</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleShareTelegram}
                  className="p-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-2xl border-2 border-[#15121F] flex flex-col items-center justify-center gap-1 transition-all shadow-sm group cursor-pointer"
                >
                  <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Telegram</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="p-3 bg-[#25D366] hover:bg-[#1eb956] text-white rounded-2xl border-2 border-[#15121F] flex flex-col items-center justify-center gap-1 transition-all shadow-sm group cursor-pointer"
                >
                  <span className="font-extrabold text-xs group-hover:scale-110 transition-transform">💬</span>
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </button>

                {/* Instagram */}
                <button
                  onClick={handleShareInstagram}
                  className="p-3 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-2xl border-2 border-[#15121F] flex flex-col items-center justify-center gap-1 transition-all shadow-sm group cursor-pointer"
                >
                  <span className="font-extrabold text-xs group-hover:scale-110 transition-transform">📸</span>
                  <span className="text-[10px] font-bold">Instagram</span>
                </button>
              </div>
            </div>

            {/* Done Action Button */}
            <button
              onClick={handleClose}
              className="w-full btn-pill bg-[#15121F] hover:bg-[#2A2438] py-3.5 text-sm font-extrabold text-white shadow-lg cursor-pointer"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* FORM VIEW: CREATE CAMPAIGN */
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#15121F]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1FAE52] text-white flex items-center justify-center font-bold">
                  <Rocket className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-[#15121F]">
                    Create Token Campaign
                  </h3>
                  <p className="text-xs text-[#15121F]/60 font-medium">
                    X Layer Testnet (Chain ID 1952)
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-[#F4F6F0] text-[#15121F] font-bold border border-[#15121F]/20 hover:bg-[#15121F] hover:text-white transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Form with Clean Inline Validation */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
              {/* Campaign Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  className={`w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 font-bold text-[#15121F] focus:outline-none placeholder-[#15121F]/40 text-sm ${
                    formErrors.title ? "border-red-500 bg-red-50/50" : "border-[#15121F]/20 focus:border-[#15121F]"
                  }`}
                  placeholder="Enter campaign title..."
                />
                {formErrors.title && (
                  <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.title}</span>
                  </p>
                )}
              </div>

              {/* Total Campaign Pool */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                  Total Campaign Pool
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalPool}
                  onChange={(e) => {
                    setTotalPool(e.target.value);
                    if (formErrors.totalPool) setFormErrors((prev) => ({ ...prev, totalPool: "" }));
                  }}
                  className={`w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 font-bold text-[#15121F] focus:outline-none placeholder-[#15121F]/40 text-sm ${
                    formErrors.totalPool ? "border-red-500 bg-red-50/50" : "border-[#15121F]/20 focus:border-[#15121F]"
                  }`}
                  placeholder="e.g. 5.0"
                />
                {formErrors.totalPool && (
                  <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.totalPool}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                    Token Symbol
                  </label>
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none text-sm"
                  >
                    <option value="OKB">OKB (Native)</option>
                    <option value="USDT">USDT (X Layer)</option>
                    <option value="USDC">USDC (X Layer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                    Max Recipient Spots
                  </label>
                  <input
                    type="number"
                    value={spots}
                    onChange={(e) => {
                      setSpots(e.target.value);
                      if (formErrors.spots) setFormErrors((prev) => ({ ...prev, spots: "" }));
                    }}
                    min={1}
                    max={1000}
                    className={`w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 font-bold text-[#15121F] focus:outline-none placeholder-[#15121F]/40 text-sm ${
                      formErrors.spots ? "border-red-500 bg-red-50/50" : "border-[#15121F]/20 focus:border-[#15121F]"
                    }`}
                    placeholder="e.g. 20"
                  />
                  {formErrors.spots && (
                    <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formErrors.spots}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Amount Per Wallet Dropdown & Input Options */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                  Amount Per Wallet Type
                </label>
                <select
                  value={amountType}
                  onChange={(e) => setAmountType(e.target.value as "fixed" | "random")}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none mb-3 text-sm"
                >
                  <option value="fixed">Fixed</option>
                  <option value="random">Random</option>
                </select>

                {amountType === "fixed" ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                      Amount Per Wallet
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (formErrors.amount) setFormErrors((prev) => ({ ...prev, amount: "" }));
                      }}
                      className={`w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 font-bold text-[#15121F] focus:outline-none placeholder-[#15121F]/40 text-sm ${
                        formErrors.amount ? "border-red-500 bg-red-50/50" : "border-[#15121F]/20 focus:border-[#15121F]"
                      }`}
                      placeholder="e.g. 0.25"
                    />
                    {formErrors.amount && (
                      <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{formErrors.amount}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                        Min Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={minAmount}
                        onChange={(e) => {
                          setMinAmount(e.target.value);
                          if (formErrors.minAmount) setFormErrors((prev) => ({ ...prev, minAmount: "" }));
                        }}
                        className={`w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 font-bold text-[#15121F] focus:outline-none placeholder-[#15121F]/40 text-sm ${
                          formErrors.minAmount ? "border-red-500 bg-red-50/50" : "border-[#15121F]/20 focus:border-[#15121F]"
                        }`}
                        placeholder="e.g. 0.10"
                      />
                      {formErrors.minAmount && (
                        <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{formErrors.minAmount}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                        Max Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={maxAmount}
                        onChange={(e) => {
                          setMaxAmount(e.target.value);
                          if (formErrors.maxAmount) setFormErrors((prev) => ({ ...prev, maxAmount: "" }));
                        }}
                        className={`w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 font-bold text-[#15121F] focus:outline-none placeholder-[#15121F]/40 text-sm ${
                          formErrors.maxAmount ? "border-red-500 bg-red-50/50" : "border-[#15121F]/20 focus:border-[#15121F]"
                        }`}
                        placeholder="e.g. 0.50"
                      />
                      {formErrors.maxAmount && (
                        <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{formErrors.maxAmount}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#B4E23F]/30 rounded-2xl border border-[#15121F]/10 text-xs text-[#15121F]/80 font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#15121F] shrink-0" />
                <span>Generates an instant Telegram bot link for frictionless wallet collection.</span>
              </div>

              <button
                type="submit"
                className="w-full btn-pill btn-grow-primary py-3.5 text-sm font-extrabold text-white shadow-lg mt-2 flex items-center justify-center cursor-pointer"
              >
                <span>Launch Campaign & Generate Link</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
