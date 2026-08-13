import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      <section className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 my-auto">
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border-2 border-[#15121F] shadow-lg space-y-6 text-[#15121F]">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
            Privacy Policy
          </h1>
          <div className="text-xs text-[#15121F]/60 font-mono">Last updated: August 13, 2026</div>

          <div className="space-y-4 font-medium text-sm leading-relaxed text-[#15121F]/80">
            <p>
              Your privacy is fundamental to our product. Grow collects minimal data required to deliver Bitcoin rewards and prevent sybil abuse.
            </p>
            <h3 className="font-display font-bold text-lg text-[#15121F]">1. Information We Collect</h3>
            <p>
              We collect device identifiers and public wallet addresses for payout verification. We do not sell or share your personal information with third parties.
            </p>
            <h3 className="font-display font-bold text-lg text-[#15121F]">2. Data Protection</h3>
            <p>
              All communication between your device and Grow servers is encrypted via TLS 1.3 protocol.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
