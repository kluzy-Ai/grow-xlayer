import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { injected, metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";

export const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: {
    name: "OKB",
    symbol: "OKB",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://testrpc.xlayer.tech/terigon"] },
    public: { http: ["https://testrpc.xlayer.tech/terigon"] },
  },
  blockExplorers: {
    default: {
      name: "OKLink Testnet",
      url: "https://www.oklink.com/xlayer-test",
    },
  },
  testnet: true,
});

export const xLayerMainnet = defineChain({
  id: 196,
  name: "X Layer Mainnet",
  nativeCurrency: {
    name: "OKB",
    symbol: "OKB",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.xlayer.tech"] },
    public: { http: ["https://rpc.xlayer.tech"] },
  },
  blockExplorers: {
    default: {
      name: "OKLink Mainnet",
      url: "https://www.oklink.com/xlayer",
    },
  },
  testnet: false,
});

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3fcc6bba6f1de962d911bb5b5c3dba68";

export const wagmiConfig = createConfig({
  chains: [xLayerTestnet, xLayerMainnet],
  multiInjectedProviderDiscovery: true,
  connectors: [
    // 1. Generic & EIP-6963 auto-discovery (Discovers all installed extensions & mobile in-app providers)
    injected(),

    // 2. Dedicated OKX Wallet provider target
    injected({
      target: () => ({
        id: "okxWallet",
        name: "OKX Wallet",
        provider:
          typeof window !== "undefined"
            ? (window as any).okxwallet?.ethereum || (window as any).okxwallet
            : undefined,
      }),
      shimDisconnect: true,
    }),

    // 3. Dedicated Bitget Wallet target
    injected({
      target: () => ({
        id: "bitgetWallet",
        name: "Bitget Wallet",
        provider:
          typeof window !== "undefined"
            ? (window as any).bitkeep?.ethereum || (window as any).bitgetWallet
            : undefined,
      }),
      shimDisconnect: true,
    }),

    // 4. Dedicated Phantom EVM target
    injected({
      target: () => ({
        id: "phantomWallet",
        name: "Phantom",
        provider:
          typeof window !== "undefined"
            ? (window as any).phantom?.ethereum
            : undefined,
      }),
      shimDisconnect: true,
    }),

    // 5. MetaMask connector
    metaMask({
      dappMetadata: {
        name: "Grow",
        url: "https://grow-xlayer.vercel.app",
      },
    }),

    // 6. Coinbase Wallet
    coinbaseWallet({
      appName: "Grow",
    }),

    // 7. WalletConnect (Universal QR & Mobile app connecting 300+ wallets)
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      qrModalOptions: {
        themeMode: "light",
        themeVariables: {
          "--wcm-z-index": "99999",
        },
      },
      metadata: {
        name: "Grow — AI Token Giveaways on X Layer",
        description:
          "Launch targeted token giveaways, airdrops, and AI reward distributions on X Layer",
        url: "https://grow-xlayer.vercel.app",
        icons: ["https://grow-xlayer.vercel.app/grow-logo.svg"],
      },
    }),
  ],
  transports: {
    [xLayerTestnet.id]: http(),
    [xLayerMainnet.id]: http(),
  },
});
