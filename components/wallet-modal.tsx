"use client";

import React from "react";
import { X, Wallet, ExternalLink, ShieldCheck, Link2, Zap } from "lucide-react";
import { useConnect } from "wagmi";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connect } = useConnect();

  if (!isOpen) return null;

  const handleConnectorClick = (connector: any) => {
    // If standard browser without window.ethereum and user clicks MetaMask/OKX
    const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const hasInjected = typeof window !== "undefined" && Boolean((window as any).ethereum);

    if (isMobile && !hasInjected && connector.id === "metaMask") {
      const dappUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      onClose();
      return;
    }

    if (isMobile && !hasInjected && connector.id === "injected") {
      // Deep link for OKX / Injected mobile
      const dappUrl = encodeURIComponent(window.location.href);
      window.location.href = `okx://wallet/dapp/details?dappUrl=${dappUrl}`;
      setTimeout(() => {
        // Fallback to WalletConnect if deep-link doesn't launch
        const wc = connectors.find((c) => c.id === "walletConnect");
        if (wc) connect({ connector: wc });
      }, 1500);
      onClose();
      return;
    }

    connect({ connector });
    onClose();
  };

  const getWalletDetails = (connector: any) => {
    const name = connector.name.toLowerCase();
    if (name.includes("metamask")) {
      return {
        title: "MetaMask",
        desc: "Connect to your MetaMask mobile app or browser extension",
        icon: <Wallet className="w-5 h-5 text-[#15121F]" />,
        badge: "Popular",
        badgeBg: "bg-[#F6C61A] text-[#15121F]",
      };
    }
    if (name.includes("walletconnect")) {
      return {
        title: "WalletConnect",
        desc: "Scan QR or connect OKX, Trust Wallet, Rainbow & 300+ mobile apps",
        icon: <Link2 className="w-5 h-5 text-[#7C5CFA]" />,
        badge: "Mobile Best",
        badgeBg: "bg-[#7C5CFA] text-white",
      };
    }
    if (name.includes("coinbase")) {
      return {
        title: "Coinbase Wallet",
        desc: "Connect using Coinbase Wallet mobile app or extension",
        icon: <ShieldCheck className="w-5 h-5 text-[#1FAE52]" />,
        badge: "",
        badgeBg: "",
      };
    }
    return {
      title: connector.name || "Injected Wallet",
      desc: "Connect using your installed browser or mobile Web3 wallet",
      icon: <Zap className="w-5 h-5 text-[#7C5CFA]" />,
      badge: "Injected",
      badgeBg: "bg-[#15121F] text-white",
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#15121F]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] sm:rounded-[40px] border-4 border-[#15121F] shadow-[12px_12px_0px_0px_#15121F] max-w-md w-full overflow-hidden space-y-5 p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header with Neo-Brutalist Icon & Close Button */}
        <div className="flex items-center justify-between border-b-3 border-[#15121F] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F6C61A] text-[#15121F] border-3 border-[#15121F] flex items-center justify-center font-bold shadow-[3px_3px_0px_0px_#15121F] shrink-0">
              <Wallet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#15121F] tracking-tight">
                Connect Web3 Wallet
              </h3>
              <p className="text-xs font-bold text-[#15121F]/70">
                Select your installed mobile or browser wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#F4F6F0] hover:bg-[#F6C61A] text-[#15121F] flex items-center justify-center font-extrabold border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] transition-transform active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Wallet Connector Options with Tactile Neo-Brutalist Cards */}
        <div className="space-y-3.5">
          {connectors.map((connector) => {
            const details = getWalletDetails(connector);
            return (
              <button
                key={connector.uid || connector.id}
                onClick={() => handleConnectorClick(connector)}
                className="w-full text-left p-4 rounded-2xl border-3 border-[#15121F] bg-[#F4F6F0] hover:bg-white shadow-[4px_4px_0px_0px_#15121F] hover:shadow-[6px_6px_0px_0px_#15121F] transition-all cursor-pointer flex items-center justify-between group active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#15121F]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F] flex items-center justify-center shrink-0">
                    {details.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm sm:text-base text-[#15121F] group-hover:text-[#7C5CFA] transition-colors">
                        {details.title}
                      </span>
                      {details.badge && (
                        <span className={`px-2.5 py-0.5 rounded-full border border-[#15121F] text-[10px] font-extrabold ${details.badgeBg}`}>
                          {details.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#15121F]/70 line-clamp-1">
                      {details.desc}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#15121F] group-hover:translate-x-0.5 transition-transform shrink-0 stroke-[2.5]" />
              </button>
            );
          })}
        </div>

        {/* Security Footer Banner */}
        <div className="p-3.5 bg-[#7C5CFA]/15 rounded-2xl border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] text-xs font-bold text-[#15121F] flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#7C5CFA] shrink-0 stroke-[2.5]" />
          <span>
            Connect securely on X Layer Testnet (Chain ID 1952). Never share your private keys.
          </span>
        </div>
      </div>
    </div>
  );
};
