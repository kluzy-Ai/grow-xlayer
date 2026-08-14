import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
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
      <div className="pt-6 sm:pt-8 pb-12 flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-10 h-10 border-4 border-[#15121F] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <AirdropDashboard user={user} />
        </Suspense>
      </div>
      <Footer showCtaBanner={false} />
    </main>
  );
}
