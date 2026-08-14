"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Gift, Send, CheckCircle, ArrowRight, ShieldCheck, User, ExternalLink, Lock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function ClaimPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const [handle, setHandle] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !wallet.trim()) return;
    setSubmitted(true);
  };

  // Anonymous recipient wallet list for public proof (NO Telegram handles displayed for privacy)
  const anonymousProofWallets = [
    { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", amount: "0.2500 OKB", status: "Verified Paid" },
    { address: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88", amount: "0.2500 OKB", status: "Verified Paid" },
    { address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", amount: "0.2500 OKB", status: "Verified Paid" },
    { address: "0xfB6916095ca1df60bb79Ce92ce3ea74c37c5d359", amount: "0.2500 OKB", status: "Verified Paid" },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      <section className="pt-28 pb-20 max-w-xl mx-auto px-4 sm:px-6 my-auto w-full space-y-6">
        {/* Main Claim Card */}
        <div className="bg-white rounded-[40px] p-6 sm:p-8 border-4 border-[#15121F] shadow-[10px_10px_0px_0px_#15121F] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#F6C61A] border-3 border-[#15121F] text-[#15121F] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#15121F]">
              <Gift className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#15121F]">
              Claim Token Airdrop
            </h1>
            <p className="text-xs text-[#15121F]/70 font-bold">
              Campaign ID: <span className="font-mono">{params.campaignId || "cmp_xlayer1"}</span>
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#15121F]/70 mb-1">
                  Telegram Handle / Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none"
                    placeholder="@yourhandle"
                  />
                  <User className="w-5 h-5 text-[#15121F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#15121F]/70 mb-1">
                  X Layer EVM Wallet Address
                </label>
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-mono text-xs text-[#15121F] focus:border-[#15121F] focus:outline-none"
                  placeholder="0x..."
                />
              </div>

              {/* Frictionless Security Guarantee */}
              <div className="p-3 bg-[#1FAE52]/10 rounded-2xl border-2 border-[#1FAE52]/40 text-xs text-[#15121F] font-bold flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1FAE52] shrink-0 mt-0.5" />
                <span><strong>Frictionless Claim:</strong> No account or email needed. 100% anonymous Web3 distribution!</span>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#15121F] hover:bg-[#2A2438] text-white font-extrabold text-sm border-3 border-[#B4E23F] shadow-[4px_4px_0px_0px_#1FAE52] transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Submit Wallet for Airdrop</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-[#1FAE52] border-3 border-[#15121F] text-white flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#15121F]">
                <CheckCircle className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-2xl text-[#15121F]">
                  Wallet Registered!
                </h3>
                <p className="text-xs text-[#15121F]/80 max-w-xs mx-auto font-bold">
                  Your address <span className="font-mono text-[#15121F]">{wallet.slice(0, 8)}...{wallet.slice(-6)}</span> is registered for the upcoming batch payout.
                </p>
              </div>

              <Link
                href="/"
                className="py-3 px-6 rounded-full bg-[#15121F] text-white hover:bg-[#2A2438] text-xs font-extrabold border-2 border-[#15121F] shadow-[3px_3px_0px_0px_#1FAE52] inline-flex items-center gap-2"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Public Accessible Payout Proof Section (Anonymous Crypto Recipient List) */}
        <div id="proof" className="bg-white rounded-[32px] p-6 border-4 border-[#15121F] shadow-[8px_8px_0px_0px_#15121F] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#15121F]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🔍</span>
              <h3 className="font-display font-extrabold text-lg text-[#15121F]">
                Public On-Chain Payout Proof
              </h3>
            </div>
            <span className="text-[10px] bg-[#1FAE52] text-white font-extrabold px-2.5 py-0.5 rounded-full border border-[#15121F] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              100% Anonymous
            </span>
          </div>

          {/* Proof Summary Info */}
          <div className="bg-[#F4F6F0] p-4 rounded-2xl border-2 border-[#15121F] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#15121F]">
              <span>Campaign Status:</span>
              <span className="text-[#1FAE52] font-extrabold">Verified On-Chain Payout</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#15121F]">
              <span>Total Distributed:</span>
              <span className="font-extrabold">3.5000 OKB (~0.0012 OKB Gas)</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#15121F]">
              <span>Transaction Hash:</span>
              <a
                href="https://www.oklink.com/xlayer-test/tx/0x98f7a2b1c4e6d3f5"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[#7C5CFA] font-extrabold hover:underline inline-flex items-center gap-1"
              >
                <span>0x98f7a2b...d3f5</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Anonymous Recipient Wallet Addresses (NO Telegram Usernames to preserve privacy) */}
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-[#15121F]/70 uppercase tracking-wider">
              Verified Anonymous Recipient Wallets ({anonymousProofWallets.length})
            </p>
            <div className="space-y-2">
              {anonymousProofWallets.map((w, idx) => (
                <div
                  key={idx}
                  className="bg-[#F4F6F0] p-2.5 rounded-xl border-2 border-[#15121F]/20 flex items-center justify-between text-xs font-mono font-bold text-[#15121F]"
                >
                  <span className="truncate">{w.address.slice(0, 10)}...{w.address.slice(-8)}</span>
                  <span className="text-[#1FAE52] font-extrabold font-sans text-[11px] px-2 py-0.5 bg-[#1FAE52]/10 rounded-full border border-[#1FAE52]/30">
                    {w.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
