import React from "react";
import { Navbar } from "@/components/navbar";
import { AirdropDashboard } from "@/components/airdrop-dashboard";
import { Footer } from "@/components/footer";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />
      <div className="pt-24 pb-12 flex-1">
        <AirdropDashboard />
      </div>
      <Footer />
    </main>
  );
}
