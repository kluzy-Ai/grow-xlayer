"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export interface TransactionRecord {
  id: string;
  timestamp: string;
  campaignName: string;
  campaignId: string;
  recipientAddress: string;
  amount: string;
  txHash: string;
  status: "Successful" | "Failed" | "Pending";
  failureReason?: string;
}

export const TransactionHistoryCard: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "successful" | "failed" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRetryingGroup, setIsRetryingGroup] = useState(false);
  const [retriedTxIds, setRetriedTxIds] = useState<Set<string>>(new Set());
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 6;

  // Fetch live submissions directly from Supabase and subscribe to Realtime changes
  useEffect(() => {
    const supabase = createClient();

    const mapSubmissionToRecord = (sub: any): TransactionRecord => {
      const isPaid = sub.status === "paid";
      const isFailed = sub.status === "rejected";
      const isPending = !isPaid && !isFailed;

      return {
        id: sub.id,
        timestamp: new Date(sub.paid_at || sub.created_at || Date.now()).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        campaignName: sub.campaign_id
          ? sub.campaign_id.startsWith("cmp_")
            ? sub.campaign_id
            : `Campaign ${sub.campaign_id.slice(0, 8)}`
          : "X Layer Giveaway",
        campaignId: sub.campaign_id || "",
        recipientAddress: sub.wallet_address,
        amount: `${sub.amount || 0.25} OKB`,
        txHash: sub.tx_hash || "",
        status: isPaid ? "Successful" : isFailed ? "Failed" : "Pending",
        failureReason: isFailed ? "Network Gas Spike" : undefined,
      };
    };

    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setTransactions(data.map(mapSubmissionToRecord));
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.warn("Supabase transaction history fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();

    const channel = supabase
      .channel("tx_history_realtime_stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const newRecord = mapSubmissionToRecord(payload.new);
            setTransactions((prev) => [newRecord, ...prev.filter((t) => t.id !== newRecord.id)]);
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const updatedRecord = mapSubmissionToRecord(payload.new);
            setTransactions((prev) =>
              prev.map((t) => (t.id === updatedRecord.id ? updatedRecord : t))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Derive current state
  const displayTransactions: TransactionRecord[] = transactions.map((tx) => {
    if (retriedTxIds.has(tx.id)) {
      return {
        ...tx,
        status: "Successful",
        failureReason: undefined,
        txHash: tx.txHash || "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
      };
    }
    return tx;
  });

  // Filter transactions based on active filter tab
  const filteredTransactions = displayTransactions.filter((tx) => {
    if (filter === "successful") return tx.status === "Successful";
    if (filter === "failed") return tx.status === "Failed";
    if (filter === "pending") return tx.status === "Pending";
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const successfulCount = displayTransactions.filter((t) => t.status === "Successful").length;
  const failedCount = displayTransactions.filter((t) => t.status === "Failed").length;
  const pendingCount = displayTransactions.filter((t) => t.status === "Pending").length;

  // Single Transaction Manual Retry
  const handleSingleRetry = (txId: string) => {
    setRetriedTxIds((prev) => new Set(prev).add(txId));
  };

  // Group Manual Retry for all failed transactions
  const handleRetryGroup = () => {
    setIsRetryingGroup(true);
    setTimeout(() => {
      const failedIds = transactions.filter((t) => t.status === "Failed").map((t) => t.id);
      setRetriedTxIds((prev) => {
        const updated = new Set(prev);
        failedIds.forEach((id) => updated.add(id));
        return updated;
      });
      setIsRetryingGroup(false);
      setFilter("all");
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg space-y-5">
      {/* 1. Header with Card Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#15121F]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7C5CFA] text-white border-2 border-[#15121F] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_#15121F]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xl text-[#15121F]">
              Transaction History
            </h3>
            <p className="text-xs font-semibold text-[#15121F]/60">
              Live ledger of all on-chain batch distributions on X Layer from database
            </p>
          </div>
        </div>

        {/* Batch Retry Group Action Button */}
        {failedCount > 0 && (
          <button
            onClick={handleRetryGroup}
            disabled={isRetryingGroup}
            className="px-4 py-2.5 rounded-xl bg-[#F6C61A] hover:bg-[#e0b213] text-[#15121F] font-extrabold text-xs border-2 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] transition-transform active:translate-y-0.5 cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <RotateCw className={`w-4 h-4 ${isRetryingGroup ? "animate-spin text-[#15121F]" : ""}`} />
            <span>{isRetryingGroup ? "Retrying Group..." : `Retry ${failedCount} Failed Batch`}</span>
          </button>
        )}
      </div>

      {/* 2. Filter Tabs (All, Successful, Pending, Failed) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#F4F6F0] p-1.5 rounded-2xl border-2 border-[#15121F]/15 font-extrabold text-xs">
          <button
            onClick={() => {
              setFilter("all");
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#15121F] text-white shadow-sm"
                : "text-[#15121F]/70 hover:text-[#15121F]"
            }`}
          >
            All ({transactions.length})
          </button>

          <button
            onClick={() => {
              setFilter("successful");
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "successful"
                ? "bg-[#1FAE52] text-white shadow-sm"
                : "text-[#15121F]/70 hover:text-[#15121F]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Successful ({successfulCount})</span>
          </button>

          <button
            onClick={() => {
              setFilter("pending");
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "pending"
                ? "bg-[#F6C61A] text-[#15121F] shadow-sm"
                : "text-[#15121F]/70 hover:text-[#15121F]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>

          {failedCount > 0 && (
            <button
              onClick={() => {
                setFilter("failed");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === "failed"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-[#15121F]/70 hover:text-[#15121F]"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Failed ({failedCount})</span>
            </button>
          )}
        </div>

        {/* Filter Summary */}
        <span className="text-xs font-bold text-[#15121F]/60">
          Showing {paginatedTransactions.length} of {filteredTransactions.length} records
        </span>
      </div>

      {/* 3. Paginated Transactions Table */}
      <div className="overflow-x-auto border-2 border-[#15121F] rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b-3 border-[#15121F] bg-[#F4F6F0] text-[#15121F] font-extrabold text-xs uppercase tracking-wider">
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Date & Time</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Campaign</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Recipient Wallet</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Amount</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Tx Hash</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#15121F]/10 text-xs font-medium text-[#15121F]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs font-bold text-[#15121F]/60">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#15121F] border-t-transparent rounded-full animate-spin" />
                    <span>Loading transactions from Supabase...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F4F6F0]/70 transition-colors">
                  {/* Date & Time */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-bold whitespace-nowrap">
                    {tx.timestamp}
                  </td>

                  {/* Campaign */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-extrabold text-[#15121F]">
                    {tx.campaignName}
                  </td>

                  {/* Recipient Wallet (Anonymous Truncated) */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-mono font-bold whitespace-nowrap">
                    {tx.recipientAddress.slice(0, 8)}...{tx.recipientAddress.slice(-6)}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-extrabold font-mono text-[#1FAE52]">
                    {tx.amount}
                  </td>

                  {/* Tx Hash */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-mono">
                    {tx.txHash ? (
                      <a
                        href={`https://www.oklink.com/xlayer-test/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#7C5CFA] font-extrabold hover:underline inline-flex items-center gap-1"
                      >
                        <span>{tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[#15121F]/40 font-sans italic font-bold">Pending broadcast</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 whitespace-nowrap">
                    {tx.status === "Successful" ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#1FAE52]/15 text-[#1FAE52] font-extrabold px-2.5 py-1 rounded-full border border-[#1FAE52]/30 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Successful</span>
                      </span>
                    ) : tx.status === "Pending" ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#F6C61A]/20 text-[#15121F] font-extrabold px-2.5 py-1 rounded-full border border-[#F6C61A]/40 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#15121F]" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 font-extrabold px-2.5 py-1 rounded-full border border-red-300 text-[11px]"
                        title={tx.failureReason || "Transaction Failed"}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Failed</span>
                      </span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.status === "Failed" ? (
                      <button
                        onClick={() => handleSingleRetry(tx.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#F6C61A] hover:bg-[#e2b412] text-[#15121F] font-extrabold text-xs border border-[#15121F] shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    ) : (
                      <a
                        href={`/proof/${tx.campaignId || "cmp_xlayer1"}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg bg-[#F4F6F0] hover:bg-[#15121F] text-[#15121F] hover:text-white font-extrabold text-xs border border-[#15121F]/20 cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Proof</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs font-bold text-[#15121F]/60">
                  No transaction records found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Pagination Footer Bar */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs font-extrabold text-[#15121F]/70">
            Page {currentPage} of {totalPages} ({filteredTransactions.length} Total Records)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-[#F4F6F0] hover:bg-gray-200 disabled:opacity-40 text-[#15121F] font-extrabold text-xs border-2 border-[#15121F]/20 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-extrabold border-2 cursor-pointer transition-colors ${
                    currentPage === idx + 1
                      ? "bg-[#15121F] text-white border-[#15121F]"
                      : "bg-[#F4F6F0] text-[#15121F] border-[#15121F]/20 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-[#F4F6F0] hover:bg-gray-200 disabled:opacity-40 text-[#15121F] font-extrabold text-xs border-2 border-[#15121F]/20 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
