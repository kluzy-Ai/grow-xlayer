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
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "8934579c855a805f6b21665a363cb642";

export const wagmiConfig = createConfig({
  chains: [xLayerTestnet, xLayerMainnet],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: "Grow",
        url: "https://grow-xlayer.vercel.app",
      },
    }),
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      qrModalOptions: {
        themeMode: "light",
        themeVariables: {
          "--w3m-z-index": "9999",
        },
      },
      metadata: {
        name: "Grow — AI Token Giveaways on X Layer",
        description: "Launch targeted token giveaways, airdrops, and AI reward distributions on X Layer",
        url: "https://grow-xlayer.vercel.app",
        icons: ["https://grow-xlayer.vercel.app/grow-logo.svg"],
      },
    }),
    coinbaseWallet({
      appName: "Grow",
    }),
  ],
  transports: {
    [xLayerTestnet.id]: http(),
    [xLayerMainnet.id]: http(),
  },
});
