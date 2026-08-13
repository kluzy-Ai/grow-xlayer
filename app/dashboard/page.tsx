import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { Navbar } from "@/components/navbar";
import { AirdropDashboard } from "@/components/airdrop-dashboard";
import { Footer } from "@/components/footer";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />
      <div className="pt-24 pb-12 flex-1">
        <AirdropDashboard user={user} />
      </div>
      <Footer showCtaBanner={false} />
    </main>
  );
}
