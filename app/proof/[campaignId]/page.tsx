"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Lock, ShieldCheck, ArrowRight, Trophy } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function ProofPage({
  params,
}: {
  params: { campaignId: string };
}) {
  // Anonymous recipient wallet list for public proof (NO Telegram handles displayed to ensure crypto privacy)
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
        {/* Public Accessible Payout Proof Section (NO Claim Form!) */}
        <div className="bg-white rounded-[40px] p-6 sm:p-8 border-4 border-[#15121F] shadow-[12px_12px_0px_0px_#15121F] space-y-6">
          
          {/* Proof Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#F6C61A] border-3 border-[#15121F] text-[#15121F] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#15121F]">
              <Trophy className="w-8 h-8 fill-[#15121F]" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#1FAE52] text-white px-3 py-1 rounded-full text-xs font-extrabold border border-[#15121F] shadow-sm">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Verified On-Chain Payout Proof</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#15121F]">
              BuildX OKB Community Giveaway
            </h1>
            <p className="text-xs text-[#15121F]/70 font-bold">
              Campaign ID: <span className="font-mono">{params.campaignId || "cmp_xlayer1"}</span>
            </p>
          </div>

          {/* Proof Summary Breakdown */}
          <div className="bg-[#F4F6F0] p-5 rounded-3xl border-3 border-[#15121F] space-y-3 shadow-[3px_3px_0px_0px_#15121F]">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#15121F]">
              <span>Distribution Status:</span>
              <span className="text-[#1FAE52] font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1FAE52] animate-ping" />
                Completed & Broadcasted
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#15121F]">
              <span>Total Amount Paid Out:</span>
              <span className="font-extrabold font-display text-base text-[#15121F]">3.5000 OKB</span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#15121F]">
              <span>Network & Gas Fee:</span>
              <span className="font-extrabold text-[#7C5CFA]">OKX X Layer (~0.0012 OKB)</span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#15121F] border-t border-[#15121F]/10 pt-2">
              <span>Transaction Hash:</span>
              <a
                href="https://www.oklink.com/xlayer-test/tx/0x98f7a2b1c4e6d3f5"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[#7C5CFA] font-extrabold hover:underline inline-flex items-center gap-1"
              >
                <span>0x98f7a2b...d3f5</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Privacy Guarantee Banner */}
          <div className="p-3.5 bg-[#7C5CFA]/15 rounded-2xl border-2 border-[#15121F] text-xs text-[#15121F] font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#7C5CFA] shrink-0" />
              <span><strong>Web3 Anonymity Guarantee:</strong> Telegram usernames are hidden to protect recipient privacy.</span>
            </div>
          </div>

          {/* Anonymous Recipient Wallet Addresses List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#15121F]/70 uppercase tracking-wider px-1">
              <span>Verified Recipient Wallets ({anonymousProofWallets.length})</span>
              <span>Amount Received</span>
            </div>

            <div className="space-y-2">
              {anonymousProofWallets.map((w, idx) => (
                <div
                  key={idx}
                  className="bg-[#F4F6F0] p-3 rounded-2xl border-2 border-[#15121F] flex items-center justify-between text-xs font-mono font-bold text-[#15121F] shadow-[2px_2px_0px_0px_#15121F]"
                >
                  <span className="truncate">{w.address.slice(0, 10)}...{w.address.slice(-8)}</span>
                  <span className="text-[#1FAE52] font-extrabold font-sans text-xs px-3 py-1 bg-[#1FAE52]/10 rounded-full border border-[#1FAE52]">
                    {w.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="pt-2">
            <Link
              href="/"
              className="w-full py-4 rounded-full bg-[#15121F] hover:bg-[#2A2438] text-white font-extrabold text-sm border-3 border-[#B4E23F] shadow-[4px_4px_0px_0px_#1FAE52] transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Grow</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer showCtaBanner={false} />
    </main>
  );
}
