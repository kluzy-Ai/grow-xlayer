import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      <section className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 my-auto">
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border-2 border-[#15121F] shadow-lg space-y-6 text-[#15121F]">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
            Terms of Service
          </h1>
          <div className="text-xs text-[#15121F]/60 font-mono">Last updated: August 13, 2026</div>

          <div className="space-y-4 font-medium text-sm leading-relaxed text-[#15121F]/80">
            <p>
              Welcome to Grow. By accessing or using our mobile application or website, you agree to be bound by these Terms of Service.
            </p>
            <h3 className="font-display font-bold text-lg text-[#15121F]">1. Eligibility</h3>
            <p>
              You must be at least 18 years old or the legal age of majority in your jurisdiction to use Grow services and participate in daily Bitcoin reward programs.
            </p>
            <h3 className="font-display font-bold text-lg text-[#15121F]">2. Reward Distribution</h3>
            <p>
              Rewards are distributed in Bitcoin (BTC) based on game completion, streak milestones, and partner offer participation. Grow reserves the right to prevent automated bot activity or fraudulent abuse.
            </p>
            <h3 className="font-display font-bold text-lg text-[#15121F]">3. Wallet & Security</h3>
            <p>
              Users are solely responsible for keeping their wallet details and private credentials secure. Grow is not liable for lost access to third-party wallet providers.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
