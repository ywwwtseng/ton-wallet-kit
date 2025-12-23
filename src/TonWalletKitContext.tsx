// https://docs.tonconsole.com/tonapi/cookbook/ton-transfer
import { use, createContext, useMemo, useState, useEffect } from 'react';
import TonWeb from 'tonweb';
import * as web3 from '@ywwwtseng/web3';
import { TonConnect } from './TonConnect';
import { MockTonConnectUI, TonConnectUI } from './TonConnect';
import { useForceUpdate } from './useForceUpdate';

export type Token = {
  id: string;
  symbol: string;
  name: string;
  network: string | null;
  token_address: string | null;
  decimals: number;
  token_program: string | null;
};

interface TonWalletKitContextType {
  connected: boolean | undefined;
  address: string | undefined;
  balance: Record<string, string>;
  getBalance: (token: Token) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: ({
    token,
    destination,
    amount,
  }: {
    token: Token;
    destination: string;
    amount: string;
  }) => Promise<string>;
}

const TonWalletKitContext = createContext<TonWalletKitContextType>({
  connected: undefined,
  address: undefined,
  balance: {},
  getBalance: () => {
    throw new Error('getBalance is not implemented');
  },
  connect: () => {
    throw new Error('connect is not implemented');
  },
  disconnect: () => {
    throw new Error('disconnect is not implemented');
  },
  sendTransaction: () => {
    throw new Error('sendTransaction is not implemented');
  },
});

export const TonWalletKitProvider = ({
  mock,
  children,
}: {
  mock: boolean;
  children: React.ReactNode;
}) => {
  const forceUpdate = useForceUpdate();
  const [balance, setBalance] = useState<Record<string, string>>({});
  const tonConnect = useMemo<TonConnect>(
    () =>
      new TonConnect({
        TonConnectUI: mock ? MockTonConnectUI : TonConnectUI,
        onStatusChange: () => {
          forceUpdate();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }),
    []
  );

  // 确保在客户端挂载后初始化 TonConnectUI（通过访问属性触发懒初始化）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 访问 connected 属性会触发自动初始化（如果尚未初始化）
      const _ = tonConnect.connected;
      forceUpdate();
    }
  }, [tonConnect, forceUpdate]);

  const getBalance = async (token: Token) => {
    if (!tonConnect.address) {
      return;
    }

    const tonweb = new TonWeb(new TonWeb.HttpProvider());

    if (token.token_address) {
      const jettonWalletAddress = await web3.utils.ton.getJettonWalletAddress({
        minterAddress: token.token_address,
        ownerAddress: tonConnect.address,
      });

      const jettonWallet = new TonWeb.token.jetton.JettonWallet(
        tonweb.provider,
        {
          address: jettonWalletAddress,
        }
      );

      const data = await jettonWallet.getData();
      setBalance({ [token.id]: data.balance.toString() });
    } else {
      const balance = await tonweb.getBalance(tonConnect.address);
      setBalance({ [token.id]: balance });
    }
  };

  const sendTransaction = async ({
    token,
    destination,
    amount,
  }: {
    token: Token;
    destination: string;
    amount: string;
  }) => {
    if (!tonConnect.address) {
      throw new Error('TonConnect address is not set');
    }

    if (token.token_address) {
      const jettonWalletAddress = await web3.utils.ton.getJettonWalletAddress({
        minterAddress: token.token_address,
        ownerAddress: tonConnect.address,
      });

      const result = await tonConnect.sendTransaction({
        address: jettonWalletAddress,
        amount: TonWeb.utils.toNano('0.05').toString(), // Gas fee for jetton transfer
        payload: web3.utils.ton
          .createTransferBody({
            tokenAmount: amount,
            toAddress: destination,
            responseAddress: destination,
          })
          .toBoc()
          .toString('base64'),
      });

      return web3.utils.ton.getMessageHash(result.boc);
    } else {
      const result = await tonConnect.sendTransaction({
        address: destination,
        amount: amount,
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

  return (
    <TonWalletKitContext.Provider
      value={{
        connected: tonConnect.connected,
        address: tonConnect.address,
        balance,
        getBalance,
        connect,
        disconnect,
        sendTransaction,
      }}
    >
      {children}
    </TonWalletKitContext.Provider>
  );
};

export const useTonWalletKit = () => {
  const context = use(TonWalletKitContext);

  if (!context) {
    throw new Error(
      'useTonWalletKit must be used within a TonWalletKitProvider'
    );
  }

  return context;
};
