// src/TonWalletKitContext.tsx
import { use, createContext, useMemo, useState, useEffect } from "react";
import TonWeb2 from "tonweb";
import * as web3 from "@ywwwtseng/web3";

// src/TonConnect.tsx
import { TonConnectUI } from "@tonconnect/ui";

// src/MockTonConnectUI.tsx
import { CHAIN } from "@tonconnect/ui";

// src/utils.ts
import TonWeb from "tonweb";
var parseJSON = (src) => {
  try {
    if (typeof src !== "string") {
      return src;
    }
    return JSON.parse(src);
  } catch {
    return null;
  }
};
function toFriendlyAddress(address) {
  if (!address) {
    return void 0;
  }
  const tonweb = new TonWeb();
  return new tonweb.Address(address).toString(true, true, true, false);
}

// src/MockTonConnectUI.tsx
var MockTonConnectUI = class {
  wallet = parseJSON(
    typeof window !== "undefined" ? sessionStorage.getItem("mock-tonconnect-wallet") : void 0
  ) ?? null;
  handleStatusChange;
  openModal() {
    this.wallet = {
      aboutUrl: "https://wallet.tg/",
      account: {
        address: "0:31d4a6efd24c52b6e957e6fde4e2beb6139062ddad6fce4533e5920891060834",
        chain: CHAIN.MAINNET,
        publicKey: "",
        walletStateInit: ""
      },
      appName: "telegram-wallet",
      bridgeUrl: "https://walletbot.me/tonconnect-bridge/bridge",
      deepLink: void 0,
      device: {
        appName: "telegram-wallet",
        appVersion: "1",
        maxProtocolVersion: 2,
        platform: "iphone",
        features: []
      },
      imageUrl: "https://wallet.tg/images/logo-288.png",
      name: "Wallet",
      openMethod: "universal-link",
      platforms: [],
      provider: "http",
      tondns: void 0,
      universalLink: "https://t.me/wallet?attach=wallet"
    };
    sessionStorage.setItem(
      "mock-tonconnect-wallet",
      JSON.stringify(this.wallet)
    );
    this.handleStatusChange?.(this.wallet);
  }
  openSingleWalletModal() {
    this.openModal();
  }
  get connected() {
    return Boolean(this.wallet);
  }
  disconnect() {
    this.wallet = null;
    sessionStorage.removeItem("mock-tonconnect-wallet");
    this.handleStatusChange?.(null);
  }
  onStatusChange(callback) {
    this.handleStatusChange = callback;
  }
  async sendTransaction(transaction) {
    if (!transaction) {
      throw new Error("No transaction provided");
    }
    return await Promise.resolve({
      boc: "te6cckEBBAEAtwAB5YgAY6lN36SYpW3Sr837ycV9bCcgxbta35yKZ8skESIMEGgDm0s7c///+ItJU6gQAAABHMo904iLEVc9gZGBX7SwY+t62CXgbpUCsT32rqEqkYbKNPxawtOIEFJhyNJym68DdqLyolpmE31kRm2uegnFKAkBAgoOw8htAwIDAAAAaEIASBQKww91mpe54qVTU/7RG5n/DzrqZ1VT6XoB7/FfVcMgL68IAAAAAAAAAAAAAAAAAACWoVBb"
    });
  }
};

// src/TonConnect.tsx
var DEFAULT_TON_CONNECT_PARAMETERS = {
  TonConnectUI
};
var TonConnect = class {
  tonConnectUI = null;
  TonConnectUIClass;
  onStatusChangeCallback;
  initialized = false;
  constructor({
    TonConnectUI: TonConnectUI2,
    onStatusChange
  } = DEFAULT_TON_CONNECT_PARAMETERS) {
    this.TonConnectUIClass = TonConnectUI2;
    this.onStatusChangeCallback = onStatusChange;
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }
  initialize() {
    if (this.initialized || this.tonConnectUI !== null) {
      return;
    }
    this.tonConnectUI = new this.TonConnectUIClass({
      manifestUrl: new URL(
        "tonconnect-manifest.json",
        window.location.href
      ).toString()
    });
    if (this.onStatusChangeCallback) {
      this.tonConnectUI.onStatusChange(this.onStatusChangeCallback);
    }
    this.initialized = true;
  }
  ensureInitialized() {
    if (typeof window === "undefined") {
      throw new Error(
        "TonConnect can only be used in browser environment. localStorage is required."
      );
    }
    if (!this.initialized) {
      this.initialize();
    }
  }
  async connect() {
    this.ensureInitialized();
    if (!this.connected) {
      await this.tonConnectUI.openSingleWalletModal("telegram-wallet");
    }
  }
  async disconnect() {
    this.ensureInitialized();
    await this.tonConnectUI.disconnect();
  }
  async sendTransaction(message) {
    this.ensureInitialized();
    try {
      const result = await this.tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1e3) + 360,
        // 360 sec
        messages: [message]
      });
      return result;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }
  get wallet() {
    if (typeof window !== "undefined" && !this.initialized) {
      this.initialize();
    }
    if (!this.tonConnectUI) {
      return null;
    }
    return this.tonConnectUI.wallet;
  }
  get connected() {
    if (typeof window !== "undefined" && !this.initialized) {
      this.initialize();
    }
    if (!this.tonConnectUI) {
      return false;
    }
    return this.tonConnectUI.connected;
  }
  get address() {
    if (!this.wallet) {
      return void 0;
    }
    return toFriendlyAddress(this.wallet.account.address);
  }
};

// src/useForceUpdate.ts
import { useReducer } from "react";
function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}

// src/TonWalletKitContext.tsx
import { jsx } from "react/jsx-runtime";
var TonWalletKitContext = createContext({
  connected: void 0,
  address: void 0,
  balance: {},
  getBalance: () => {
    throw new Error("getBalance is not implemented");
  },
  connect: () => {
    throw new Error("connect is not implemented");
  },
  disconnect: () => {
    throw new Error("disconnect is not implemented");
  },
  sendTransaction: () => {
    throw new Error("sendTransaction is not implemented");
  }
});
var TonWalletKitProvider = ({
  mock,
  children
}) => {
  const forceUpdate = useForceUpdate();
  const [balance, setBalance] = useState({});
  const tonConnect = useMemo(
    () => new TonConnect({
      TonConnectUI: mock ? MockTonConnectUI : TonConnectUI,
      onStatusChange: () => {
        forceUpdate();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    []
  );
  useEffect(() => {
    if (typeof window !== "undefined") {
      const _ = tonConnect.connected;
      forceUpdate();
    }
  }, [tonConnect, forceUpdate]);
  const getBalance = async (token) => {
    if (!tonConnect.address) {
      return;
    }
    const tonweb = new TonWeb2(new TonWeb2.HttpProvider());
    if (token.token_address) {
      const jettonWalletAddress = await web3.utils.ton.getJettonWalletAddress({
        minterAddress: token.token_address,
        ownerAddress: tonConnect.address
      });
      const jettonWallet = new TonWeb2.token.jetton.JettonWallet(
        tonweb.provider,
        {
          address: jettonWalletAddress
        }
      );
      const data = await jettonWallet.getData();
      setBalance({ [token.id]: data.balance.toString() });
    } else {
      const balance2 = await tonweb.getBalance(tonConnect.address);
      setBalance({ [token.id]: balance2 });
    }
  };
  const sendTransaction = async ({
    token,
    destination,
    amount
  }) => {
    if (!tonConnect.address) {
      throw new Error("TonConnect address is not set");
    }
    if (token.token_address) {
      const jettonWalletAddress = await web3.utils.ton.getJettonWalletAddress({
        minterAddress: token.token_address,
        ownerAddress: tonConnect.address
      });
      const result = await tonConnect.sendTransaction({
        address: jettonWalletAddress,
        amount: TonWeb2.utils.toNano("0.05").toString(),
        // Gas fee for jetton transfer
        payload: web3.utils.ton.createTransferBody({
          tokenAmount: amount,
          toAddress: destination,
          responseAddress: destination
        }).toBoc().toString("base64")
      });
      return web3.utils.ton.getMessageHash(result.boc);
    } else {
      const result = await tonConnect.sendTransaction({
        address: destination,
        amount
      });
      return web3.utils.ton.getMessageHash(result.boc);
    }
  };
  const connect = async () => {
    await tonConnect.connect();
  };
  const disconnect = async () => {
    await tonConnect.disconnect();
    setBalance({});
  };
  return /* @__PURE__ */ jsx(
    TonWalletKitContext.Provider,
    {
      value: {
        connected: tonConnect.connected,
        address: tonConnect.address,
        balance,
        getBalance,
        connect,
        disconnect,
        sendTransaction
      },
      children
    }
  );
};
var useTonWalletKit = () => {
  const context = use(TonWalletKitContext);
  if (!context) {
    throw new Error(
      "useTonWalletKit must be used within a TonWalletKitProvider"
    );
  }
  return context;
};
export {
  TonWalletKitProvider,
  useTonWalletKit
};
