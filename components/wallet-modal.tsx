"use client";

import React, { useState } from "react";
import { X, Wallet, ExternalLink, ShieldCheck, Link2, Zap, AlertCircle, Loader2, Smartphone, Globe } from "lucide-react";
import { useConnect } from "wagmi";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connectAsync, isPending, error: wagmiError } = useConnect();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingWalletId, setPendingWalletId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWalletSelect = async (walletId: string) => {
    setErrorMessage(null);
    setPendingWalletId(walletId);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("grow_wallet_disconnected");
    }

    try {
      const injectedConn = connectors.find((c) => c.id === "injected");
      const metaMaskConn = connectors.find((c) => c.id === "metaMask" || c.id === "io.metamask");
      const coinbaseConn = connectors.find((c) => c.id === "coinbaseWallet" || c.id === "coinbaseWalletSDK");
      const walletConnectConn = connectors.find((c) => c.id === "walletConnect");

      let targetConnector = walletConnectConn || connectors[0];

      if (walletId === "metaMask" && metaMaskConn) {
        targetConnector = metaMaskConn;
      } else if (walletId === "coinbaseWallet" && coinbaseConn) {
        targetConnector = coinbaseConn;
      } else if (typeof window !== "undefined" && (window as any).ethereum && injectedConn) {
        // If user has browser extension installed for OKX, Bitget, Trust, Phantom, Rabby
        targetConnector = injectedConn;
      }

      await connectAsync({ connector: targetConnector });
      onClose();
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      if (err?.message?.includes("rejected") || err?.message?.includes("User denied")) {
        setErrorMessage("Wallet connection request was declined.");
      } else if (err?.name === "ConnectorNotFoundError" || err?.message?.includes("not found")) {
        setErrorMessage("Selected wallet extension not found. Opening WalletConnect...");
        // Fallback to WalletConnect QR/Mobile selector
        const wc = connectors.find((c) => c.id === "walletConnect");
        if (wc) {
          try {
            await connectAsync({ connector: wc });
            onClose();
          } catch (e) {}
        }
      } else {
        setErrorMessage(err?.shortMessage || err?.message || "Failed to connect wallet.");
      }
    } finally {
      setPendingWalletId(null);
    }
  };

  const walletOptions = [
    {
      id: "okx",
      title: "OKX Wallet",
      desc: "Native OKX X Layer network wallet",
      icon: <Zap className="w-5 h-5 text-[#B4E23F]" />,
      iconBg: "bg-[#15121F]",
      badge: "Native L2",
      badgeBg: "bg-[#15121F] text-white",
    },
    {
      id: "metaMask",
      title: "MetaMask",
      desc: "Popular multi-chain Web3 wallet",
      icon: <Wallet className="w-5 h-5 text-[#F7931A]" />,
      iconBg: "bg-[#F6C61A]/25",
      badge: "Popular",
      badgeBg: "bg-[#F6C61A] text-[#15121F]",
    },
    {
      id: "bitget",
      title: "Bitget Wallet (BitKeep)",
      desc: "Leading Web3 trading & crypto wallet",
      icon: <Smartphone className="w-5 h-5 text-[#1FAE52]" />,
      iconBg: "bg-[#1FAE52]/20",
      badge: "Popular",
      badgeBg: "bg-[#1FAE52] text-white",
    },
    {
      id: "trust",
      title: "Trust Wallet",
      desc: "Multi-chain crypto & EVM wallet",
      icon: <ShieldCheck className="w-5 h-5 text-[#3375BB]" />,
      iconBg: "bg-[#3375BB]/20",
      badge: "",
      badgeBg: "",
    },
    {
      id: "coinbaseWallet",
      title: "Coinbase Wallet",
      desc: "Self-custody Web3 wallet by Coinbase",
      icon: <Globe className="w-5 h-5 text-[#0052FF]" />,
      iconBg: "bg-[#0052FF]/20",
      badge: "",
      badgeBg: "",
    },
    {
      id: "phantom",
      title: "Phantom Wallet",
      desc: "EVM & multi-chain crypto wallet",
      icon: <Zap className="w-5 h-5 text-[#AB9FF2]" />,
      iconBg: "bg-[#AB9FF2]/20",
      badge: "",
      badgeBg: "",
    },
    {
      id: "rainbow",
      title: "Rainbow Wallet",
      desc: "Fun & simple Ethereum & L2 wallet",
      icon: <Wallet className="w-5 h-5 text-[#FF4E4E]" />,
      iconBg: "bg-[#FF4E4E]/20",
      badge: "",
      badgeBg: "",
    },
    {
      id: "walletConnect",
      title: "WalletConnect (300+ Wallets)",
      desc: "Scan QR code or connect any of 300+ mobile wallets",
      icon: <Link2 className="w-5 h-5 text-[#7C5CFA]" />,
      iconBg: "bg-[#7C5CFA]/20",
      badge: "300+ Wallets",
      badgeBg: "bg-[#7C5CFA] text-white",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#15121F]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] sm:rounded-[40px] border-4 border-[#15121F] shadow-[12px_12px_0px_0px_#15121F] max-w-md w-full overflow-hidden space-y-5 p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header with High-Contrast Neo-Brutalist Icon & Close Button */}
        <div className="flex items-center justify-between border-b-3 border-[#15121F] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#15121F] text-[#B4E23F] border-3 border-[#15121F] flex items-center justify-center font-bold shadow-[3px_3px_0px_0px_#F6C61A] shrink-0">
              <Wallet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#15121F] tracking-tight">
                Choose Your Wallet
              </h3>
              <p className="text-xs font-bold text-[#15121F]/70">
                Select from popular browser extensions & mobile apps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#F4F6F0] hover:bg-[#1FAE52] hover:text-white text-[#15121F] flex items-center justify-center font-extrabold border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] transition-transform active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Error Alert Box */}
        {(errorMessage || wagmiError) && (
          <div className="p-3.5 bg-red-100 border-3 border-[#15121F] rounded-2xl text-xs font-extrabold text-red-700 flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#15121F] animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 stroke-[2.5]" />
            <span>{errorMessage || wagmiError?.message}</span>
          </div>
        )}

        {/* Expanded List of Web3 Wallets */}
        <div className="space-y-3">
          {walletOptions.map((wallet) => {
            const isConnectingThis = isPending && pendingWalletId === wallet.id;

            return (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={isPending}
                className="w-full text-left p-3.5 rounded-2xl border-3 border-[#15121F] bg-white hover:bg-[#F4F6F0] shadow-[4px_4px_0px_0px_#15121F] hover:shadow-[6px_6px_0px_0px_#15121F] transition-all cursor-pointer flex items-center justify-between group active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#15121F] disabled:opacity-75"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F] flex items-center justify-center shrink-0 ${wallet.iconBg}`}>
                    {isConnectingThis ? (
                      <Loader2 className="w-5 h-5 text-[#15121F] animate-spin" />
                    ) : (
                      wallet.icon
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm sm:text-base text-[#15121F] group-hover:text-[#1FAE52] transition-colors">
                        {wallet.title}
                      </span>
                      {wallet.badge && (
                        <span className={`px-2 py-0.5 rounded-full border border-[#15121F] text-[10px] font-extrabold shadow-xs ${wallet.badgeBg}`}>
                          {wallet.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#15121F]/70 line-clamp-1">
                      {isConnectingThis ? "Connecting wallet..." : wallet.desc}
                    </p>
                  </div>
                </div>
                {isConnectingThis ? (
                  <Loader2 className="w-4 h-4 text-[#15121F] animate-spin shrink-0" />
                ) : (
                  <ExternalLink className="w-4 h-4 text-[#15121F] group-hover:translate-x-0.5 transition-transform shrink-0 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Security Notice Banner in Emerald Green */}
        <div className="p-3.5 bg-[#1FAE52]/10 rounded-2xl border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] text-xs font-bold text-[#15121F] flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#1FAE52] shrink-0 stroke-[2.5]" />
          <span>
            Connect securely on OKX X Layer (Chain ID 1952).
          </span>
        </div>
      </div>
    </div>
  );
};
