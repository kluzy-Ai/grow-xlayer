"use client";

import React, { useState } from "react";
import { Rocket, ArrowRight, Zap, X } from "lucide-react";

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
  const [token, setToken] = useState("OKB");
  const [amount, setAmount] = useState("");
  const [spots, setSpots] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = "cmp_" + Math.random().toString(36).substring(2, 8);
    const newCampaign = {
      id: slug,
      title: title || "Community Giveaway",
      token,
      amountPerWallet: Number(amount) || 0.25,
      maxSpots: Number(spots) || 20,
      telegramLink: `https://t.me/GrowBot?start=${slug}`,
      createdAt: "Just now",
      status: "Active",
    };

    onCreate(newCampaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121F]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] border-4 border-[#15121F] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
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
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F6F0] text-[#15121F] font-bold border border-[#15121F]/20 hover:bg-[#15121F] hover:text-white transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
              Campaign Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none placeholder-[#15121F]/40"
              placeholder="Enter campaign title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                Token Symbol
              </label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none"
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
                onChange={(e) => setSpots(e.target.value)}
                required
                min={1}
                max={1000}
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none placeholder-[#15121F]/40"
                placeholder="e.g. 20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
              Amount Per Wallet
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none placeholder-[#15121F]/40"
              placeholder="e.g. 0.25"
            />
          </div>

          <div className="p-3 bg-[#B4E23F]/30 rounded-2xl border border-[#15121F]/10 text-xs text-[#15121F]/80 font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#15121F] shrink-0" />
            <span>Generates an instant Telegram bot link for frictionless wallet collection.</span>
          </div>

          <button
            type="submit"
            className="w-full btn-pill btn-grow-primary py-3.5 text-sm font-extrabold text-white shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            <span>Launch Campaign & Generate Link</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
