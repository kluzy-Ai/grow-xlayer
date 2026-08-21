"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Wallet,
  ExternalLink,
  ShieldCheck,
  Link2,
  Zap,
  AlertCircle,
  Loader2,
  Smartphone,
  Globe,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useConnect, useAccount, useSwitchChain } from "wagmi";
import { xLayerTestnet } from "@/lib/wagmi";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connectAsync, isPending, error: wagmiError } = useConnect();
  const { isConnected, address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingWalletId, setPendingWalletId] = useState<string | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobile = /android|iphone|ipad|ipod|windows phone/i.test(userAgent.toLowerCase());
      setIsMobileDevice(isMobile);
    }
  }, []);

  if (!isOpen) return null;

  const handleWalletSelect = async (walletId: string) => {
    setErrorMessage(null);
    setPendingWalletId(walletId);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("grow_wallet_disconnected");
    }

    const win = typeof window !== "undefined" ? (window as any) : null;
    const currentUrl = typeof window !== "undefined" ? window.location.href : "https://grow-xlayer.vercel.app/dashboard";
    const cleanHostPath = typeof window !== "undefined" ? `${window.location.host}${window.location.pathname}` : "grow-xlayer.vercel.app/dashboard";

    // Detect if running inside a Web3 in-app browser
    const isInAppBrowser = Boolean(
      win && (win.ethereum || win.okxwallet || win.bitkeep || win.phantom || win.trustwallet)
    );

    // 1. Mobile Deep-Linking (When on regular mobile browser like Safari / Chrome without injected provider)
    if (isMobileDevice && !isInAppBrowser && walletId !== "walletConnect") {
      if (walletId === "okx") {
        const okxDeepLink = `okx://wallet/dapp/url?dappUrl=${encodeURIComponent(currentUrl)}`;
        window.location.href = okxDeepLink;
        setTimeout(() => {
          setErrorMessage("Opening OKX Wallet app... If it didn't open, use WalletConnect below.");
        }, 1500);
        return;
      }

      if (walletId === "metaMask") {
        const mmDeepLink = `https://metamask.app.link/dapp/${cleanHostPath}`;
        window.location.href = mmDeepLink;
        setTimeout(() => {
          setErrorMessage("Opening MetaMask app... If it didn't open, use WalletConnect below.");
        }, 1500);
        return;
      }

      if (walletId === "trust") {
        const trustDeepLink = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(currentUrl)}`;
        window.location.href = trustDeepLink;
        setTimeout(() => {
          setErrorMessage("Opening Trust Wallet app... If it didn't open, use WalletConnect below.");
        }, 1500);
        return;
      }

      if (walletId === "bitget") {
        const bitgetDeepLink = `https://bkcode.vip?action=dapp&url=${encodeURIComponent(currentUrl)}`;
        window.location.href = bitgetDeepLink;
        setTimeout(() => {
          setErrorMessage("Opening Bitget Wallet app... If it didn't open, use WalletConnect below.");
        }, 1500);
        return;
      }
    }

    // 2. Find matching Wagmi connector
    try {
      let targetConnector = null;

      // Find by exact wallet ID or EIP-6963 name
      if (walletId === "okx") {
        targetConnector =
          connectors.find((c) => c.id === "okxWallet" || c.id.includes("okx") || c.name.toLowerCase().includes("okx")) ||
          (win?.okxwallet ? connectors.find((c) => c.id === "injected") : null);
      } else if (walletId === "metaMask") {
        targetConnector =
          connectors.find((c) => c.id === "metaMask" || c.id.includes("metamask") || c.name.toLowerCase().includes("metamask")) ||
          connectors.find((c) => c.id === "injected");
      } else if (walletId === "bitget") {
        targetConnector =
          connectors.find((c) => c.id === "bitgetWallet" || c.id.includes("bitget") || c.id.includes("bitkeep") || c.name.toLowerCase().includes("bitget")) ||
          (win?.bitkeep || win?.bitgetWallet ? connectors.find((c) => c.id === "injected") : null);
      } else if (walletId === "phantom") {
        targetConnector =
          connectors.find((c) => c.id === "phantomWallet" || c.id.includes("phantom") || c.name.toLowerCase().includes("phantom")) ||
          (win?.phantom ? connectors.find((c) => c.id === "injected") : null);
      } else if (walletId === "coinbaseWallet") {
        targetConnector =
          connectors.find((c) => c.id === "coinbaseWallet" || c.id.includes("coinbase") || c.name.toLowerCase().includes("coinbase")) ||
          connectors.find((c) => c.id === "injected");
      } else if (walletId === "trust") {
        targetConnector =
          connectors.find((c) => c.id.includes("trust") || c.name.toLowerCase().includes("trust")) ||
          connectors.find((c) => c.id === "injected");
      } else if (walletId === "walletConnect") {
        targetConnector = connectors.find((c) => c.id === "walletConnect");
      } else {
        targetConnector = connectors.find((c) => c.id === walletId) || connectors.find((c) => c.id === "injected");
      }

      // If no specific extension connector found on desktop, fallback to walletConnect or generic injected
      if (!targetConnector) {
        targetConnector = connectors.find((c) => c.id === "walletConnect") || connectors.find((c) => c.id === "injected") || connectors[0];
      }

      if (!targetConnector) {
        throw new Error("No Web3 connector found. Please install OKX Wallet or MetaMask extension.");
      }

      const res = await connectAsync({
        connector: targetConnector,
        chainId: xLayerTestnet.id,
      });

      // Switch to X Layer Testnet if connected on another chain
      if (res?.chainId && res.chainId !== xLayerTestnet.id && switchChainAsync) {
        try {
          await switchChainAsync({ chainId: xLayerTestnet.id });
        } catch (switchErr) {
          console.warn("Chain switch note:", switchErr);
        }
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("grow_wallet_disconnected");
      }

      onClose();
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      const msg = err?.message || err?.shortMessage || "";

      if (msg.includes("rejected") || msg.includes("User denied") || msg.includes("User rejected")) {
        setErrorMessage("Connection request was canceled in your wallet.");
      } else if (msg.includes("ConnectorNotFoundError") || msg.includes("not found")) {
        setErrorMessage("Wallet extension not detected. Opening WalletConnect...");
        const wc = connectors.find((c) => c.id === "walletConnect");
        if (wc) {
          try {
            await connectAsync({ connector: wc });
            onClose();
          } catch (e) {}
        }
      } else if (msg.includes("already pending")) {
        setErrorMessage("A connection request is already pending in your wallet. Please check your wallet extension or app.");
      } else {
        setErrorMessage(err?.shortMessage || err?.message || "Failed to connect wallet.");
      }
    } finally {
      setPendingWalletId(null);
    }
  };

  const win = typeof window !== "undefined" ? (window as any) : null;
  const isOkxInstalled = Boolean(win && (win.okxwallet || connectors.some((c) => c.name.toLowerCase().includes("okx"))));
  const isMetaMaskInstalled = Boolean(win && (win.ethereum?.isMetaMask || connectors.some((c) => c.name.toLowerCase().includes("metamask"))));
  const isBitgetInstalled = Boolean(win && (win.bitkeep || win.bitgetWallet || connectors.some((c) => c.name.toLowerCase().includes("bitget"))));
  const isPhantomInstalled = Boolean(win && (win.phantom?.ethereum || connectors.some((c) => c.name.toLowerCase().includes("phantom"))));

  const walletOptions = [
    {
      id: "okx",
      title: "OKX Wallet",
      desc: isOkxInstalled ? "Installed & Ready" : isMobileDevice ? "Open in OKX App" : "Native OKX X Layer network wallet",
      icon: <Zap className="w-5 h-5 text-[#B4E23F]" />,
      iconBg: "bg-[#15121F]",
      badge: isOkxInstalled ? "Detected" : "Native L2",
      badgeBg: isOkxInstalled ? "bg-[#1FAE52] text-white" : "bg-[#15121F] text-white",
      installed: isOkxInstalled,
    },
    {
      id: "metaMask",
      title: "MetaMask",
      desc: isMetaMaskInstalled ? "Installed & Ready" : isMobileDevice ? "Open in MetaMask App" : "Popular multi-chain Web3 wallet",
      icon: <Wallet className="w-5 h-5 text-[#F7931A]" />,
      iconBg: "bg-[#F6C61A]/25",
      badge: isMetaMaskInstalled ? "Detected" : "Popular",
      badgeBg: isMetaMaskInstalled ? "bg-[#1FAE52] text-white" : "bg-[#F6C61A] text-[#15121F]",
      installed: isMetaMaskInstalled,
    },
    {
      id: "bitget",
      title: "Bitget Wallet (BitKeep)",
      desc: isBitgetInstalled ? "Installed & Ready" : isMobileDevice ? "Open in Bitget App" : "Web3 multi-chain wallet",
      icon: <Smartphone className="w-5 h-5 text-[#1FAE52]" />,
      iconBg: "bg-[#1FAE52]/20",
      badge: isBitgetInstalled ? "Detected" : "",
      badgeBg: isBitgetInstalled ? "bg-[#1FAE52] text-white" : "",
      installed: isBitgetInstalled,
    },
    {
      id: "trust",
      title: "Trust Wallet",
      desc: isMobileDevice ? "Open in Trust Wallet App" : "Multi-chain crypto & EVM wallet",
      icon: <ShieldCheck className="w-5 h-5 text-[#3375BB]" />,
      iconBg: "bg-[#3375BB]/20",
      badge: "",
      badgeBg: "",
      installed: false,
    },
    {
      id: "coinbaseWallet",
      title: "Coinbase Wallet",
      desc: "Self-custody Web3 wallet",
      icon: <Globe className="w-5 h-5 text-[#0052FF]" />,
      iconBg: "bg-[#0052FF]/20",
      badge: "",
      badgeBg: "",
      installed: false,
    },
    {
      id: "phantom",
      title: "Phantom Wallet",
      desc: isPhantomInstalled ? "Installed & Ready" : "EVM multi-chain wallet",
      icon: <Zap className="w-5 h-5 text-[#AB9FF2]" />,
      iconBg: "bg-[#AB9FF2]/20",
      badge: isPhantomInstalled ? "Detected" : "",
      badgeBg: isPhantomInstalled ? "bg-[#1FAE52] text-white" : "",
      installed: isPhantomInstalled,
    },
    {
      id: "walletConnect",
      title: "WalletConnect (300+ Wallets)",
      desc: "Universal QR code & mobile wallet connection for all devices",
      icon: <Link2 className="w-5 h-5 text-[#7C5CFA]" />,
      iconBg: "bg-[#7C5CFA]/20",
      badge: "Universal",
      badgeBg: "bg-[#7C5CFA] text-white",
      installed: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#15121F]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] sm:rounded-[40px] border-4 border-[#15121F] shadow-[12px_12px_0px_0px_#15121F] max-w-md w-full overflow-hidden space-y-4 p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-[#15121F] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#15121F] text-[#B4E23F] border-3 border-[#15121F] flex items-center justify-center font-bold shadow-[3px_3px_0px_0px_#F6C61A] shrink-0">
              <Wallet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#15121F] tracking-tight">
                Connect Wallet
              </h3>
              <p className="text-xs font-bold text-[#15121F]/70">
                {isMobileDevice ? "Mobile apps & browser extensions" : "Desktop extensions & mobile apps"}
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
          <div className="p-3 bg-red-100 border-2 border-[#15121F] rounded-2xl text-xs font-extrabold text-red-700 flex items-center gap-2 shadow-[2px_2px_0px_0px_#15121F] animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 stroke-[2.5]" />
            <span>{errorMessage || wagmiError?.message}</span>
          </div>
        )}

        {/* List of Web3 Wallets */}
        <div className="space-y-2.5">
          {walletOptions.map((wallet) => {
            const isConnectingThis = isPending && pendingWalletId === wallet.id;

            return (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={isPending}
                className="w-full text-left p-3 sm:p-3.5 rounded-2xl border-3 border-[#15121F] bg-white hover:bg-[#F4F6F0] shadow-[3px_3px_0px_0px_#15121F] hover:shadow-[5px_5px_0px_0px_#15121F] transition-all cursor-pointer flex items-center justify-between group active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#15121F] disabled:opacity-75"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-xl border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F] flex items-center justify-center shrink-0 ${wallet.iconBg}`}>
                    {isConnectingThis ? (
                      <Loader2 className="w-5 h-5 text-[#15121F] animate-spin" />
                    ) : (
                      wallet.icon
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm sm:text-base text-[#15121F] group-hover:text-[#1FAE52] transition-colors truncate">
                        {wallet.title}
                      </span>
                      {wallet.badge && (
                        <span className={`px-2 py-0.5 rounded-full border border-[#15121F] text-[10px] font-extrabold shadow-xs shrink-0 ${wallet.badgeBg}`}>
                          {wallet.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#15121F]/70 truncate">
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
        <div className="p-3 bg-[#1FAE52]/10 rounded-2xl border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F] text-xs font-bold text-[#15121F] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1FAE52] shrink-0 stroke-[2.5]" />
          <span>
            Connect securely on OKX X Layer Testnet (Chain ID 1952) & Mainnet (196).
          </span>
        </div>
      </div>
    </div>
  );
};
