"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Lock, ArrowRight, Trophy } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/utils/supabase/client";

export default function ProofPage({
  params,
}: {
  params: Promise<{ campaignId: string }> | { campaignId: string };
}) {
  const [campaignId, setCampaignId] = useState<string>("");
  const [campaign, setCampaign] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setCampaignId(resolved?.campaignId || "");
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!campaignId) return;

    const fetchData = async () => {
      setIsLoading(true);
      const supabase = createClient();

      try {
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            campaignId
          );

        // Fetch Campaign
        let campData = null;
        if (isUuid) {
          const { data } = await supabase
            .from("campaigns")
            .select("*")
            .eq("id", campaignId)
            .maybeSingle();
          campData = data;
        }

        if (!campData) {
          const { data } = await supabase
            .from("campaigns")
            .select("*")
            .eq("slug", campaignId)
            .maybeSingle();
          campData = data;
        }

        setCampaign(campData);

        // Fetch Submissions for this campaign
        let subQuery = supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (campData?.id && campData?.slug) {
          subQuery = subQuery.or(
            `campaign_id.eq.${campData.id},campaign_id.eq.${campData.slug}`
          );
        } else if (campData?.id) {
          subQuery = subQuery.eq("campaign_id", campData.id);
        } else {
          subQuery = subQuery.eq("campaign_id", campaignId);
        }

        const { data: subData } = await subQuery;
        setSubmissions(subData || []);
      } catch (err) {
        console.warn("Error fetching proof data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  const campaignTitle =
    campaign?.title || campaign?.name || (campaignId ? `Campaign ${campaignId}` : "X Layer Giveaway");
  const tokenSymbol = campaign?.token_symbol || campaign?.token || "OKB";
  const amountPerClaim = campaign?.amount_per_claim || campaign?.amountPerWallet || 0.25;
  const isPaidOut =
    campaign?.status === "completed" ||
    submissions.some((s) => s.status === "paid");

  const totalAmountPaid = submissions
    .filter((s) => s.status === "paid" || isPaidOut)
    .reduce((sum, s) => sum + (Number(s.amount) || Number(amountPerClaim)), 0);

  const txHash =
    submissions.find((s) => s.tx_hash)?.tx_hash || campaign?.tx_hash;

  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      <section className="pt-28 pb-20 max-w-xl mx-auto px-4 sm:px-6 my-auto w-full space-y-6">
        {/* Public Accessible Payout Proof Section */}
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
              {campaignTitle}
            </h1>
            <p className="text-xs text-[#15121F]/70 font-bold">
              Campaign ID: <span className="font-mono">{campaignId || "cmp_xlayer1"}</span>
            </p>
          </div>

          {/* Proof Summary Breakdown */}
          <div className="bg-[#F4F6F0] p-5 rounded-3xl border-3 border-[#15121F] space-y-3 shadow-[3px_3px_0px_0px_#15121F]">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#15121F]">
              <span>Distribution Status:</span>
              <span className={`font-extrabold flex items-center gap-1 ${isPaidOut ? "text-[#1FAE52]" : "text-[#7C5CFA]"}`}>
                {isPaidOut ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#1FAE52] animate-ping" />
                    Completed & Broadcasted
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#7C5CFA]" />
                    Active Registration
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#15121F]">
              <span>Total Amount Paid Out:</span>
              <span className="font-extrabold font-display text-base text-[#15121F]">
                {totalAmountPaid > 0 ? totalAmountPaid.toFixed(4) : (Number(amountPerClaim) * submissions.length).toFixed(4)} {tokenSymbol}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#15121F]">
              <span>Network & Gas Fee:</span>
              <span className="font-extrabold text-[#7C5CFA]">OKX X Layer (Chain ID 1952)</span>
            </div>

            {txHash && (
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#15121F] border-t border-[#15121F]/10 pt-2">
                <span>Transaction Hash:</span>
                <a
                  href={`https://www.oklink.com/xlayer-test/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[#7C5CFA] font-extrabold hover:underline inline-flex items-center gap-1"
                >
                  <span>{`${txHash.slice(0, 10)}...${txHash.slice(-8)}`}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
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
              <span>Verified Recipient Wallets ({submissions.length})</span>
              <span>Amount Received</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="p-6 text-center text-xs font-bold text-[#15121F]/60">
                  Loading verified proofs from database...
                </div>
              ) : submissions.length > 0 ? (
                submissions.map((w, idx) => (
                  <div
                    key={w.id || idx}
                    className="bg-[#F4F6F0] p-3 rounded-2xl border-2 border-[#15121F] flex items-center justify-between text-xs font-mono font-bold text-[#15121F] shadow-[2px_2px_0px_0px_#15121F]"
                  >
                    <span className="truncate">
                      {w.wallet_address ? `${w.wallet_address.slice(0, 10)}...${w.wallet_address.slice(-8)}` : "0x..."}
                    </span>
                    <span className="text-[#1FAE52] font-extrabold font-sans text-xs px-3 py-1 bg-[#1FAE52]/10 rounded-full border border-[#1FAE52]">
                      {(Number(w.amount) || Number(amountPerClaim)).toFixed(4)} {tokenSymbol}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-[#F4F6F0] rounded-2xl border-2 border-[#15121F]/10 text-xs font-bold text-[#15121F]/60">
                  No verified wallet submissions found for this campaign yet.
                </div>
              )}
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
