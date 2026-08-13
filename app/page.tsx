import React from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SocialProof } from "@/components/social-proof";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />
      <Hero />
      <HowItWorks />
      <SocialProof />
      <Footer />
    </main>
  );
}
