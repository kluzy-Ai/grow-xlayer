"use client";

import React, { useState } from "react";
import { Send, Check, X, Bot, User } from "lucide-react";

interface TelegramSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitWallet: (telegramHandle: string, walletAddress: string) => void;
}

export const TelegramSimulatorModal: React.FC<TelegramSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSubmitWallet,
}) => {
  const [handle, setHandle] = useState("@web3_builder");
  const [wallet, setWallet] = useState("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
  const [step, setStep] = useState<"input" | "submitted">("input");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !wallet.trim()) return;

    onSubmitWallet(handle, wallet);
    setStep("submitted");
  };

  const handleReset = () => {
    setStep("input");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121F]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#15121F] text-white rounded-[36px] border-4 border-[#15121F] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Telegram Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0088CC] text-white flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-extrabold text-lg flex items-center gap-1.5">
                <span>Grow Telegram Bot</span>
                <span className="text-[10px] bg-[#0088CC] text-white px-2 py-0.2 rounded-full font-sans font-bold">
                  SIMULATOR
                </span>
              </div>
              <div className="text-xs text-[#0088CC] font-medium">bot • online</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Telegram Chat Content */}
        {step === "input" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bot Message Bubble */}
            <div className="bg-white/10 rounded-2xl p-4 space-y-2 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#F6C61A] font-bold">
                <Bot className="w-4 h-4" />
                <span>Grow Bot</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed font-medium">
                Welcome to the BuildX Guild OKB Airdrop! Please enter your Telegram handle & EVM address to register your wallet spot.
              </p>
            </div>

            {/* Input Fields */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                Your Telegram Handle
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 font-bold text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#0088CC]"
                  placeholder="@yourhandle"
                />
                <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                Your X Layer EVM Wallet Address
              </label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 font-mono text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#0088CC]"
                placeholder="0x..."
              />
            </div>

            <button
              type="submit"
              className="w-full btn-pill bg-[#0088CC] hover:bg-[#0077BB] text-white py-3.5 text-sm font-extrabold shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Wallet to Bot</span>
            </button>
          </form>
        ) : (
          /* Submission Success Screen */
          <div className="text-center space-y-4 py-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-[#1FAE52]/20 border-2 border-[#1FAE52] text-[#1FAE52] flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-extrabold text-xl text-white">
                Wallet Saved to Supabase!
              </h4>
              <p className="text-xs text-white/70 max-w-xs mx-auto font-medium">
                Your submission for <span className="font-bold text-[#F6C61A]">{handle}</span> has been sent live to the Creator Dashboard.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="btn-pill bg-white text-[#15121F] hover:bg-[#F4F6F0] px-6 py-2.5 text-xs font-extrabold shadow-md"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
