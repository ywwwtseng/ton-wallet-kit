import { type ConnectedWallet, TonConnectUI } from '@tonconnect/ui';
import { MockTonConnectUI } from './MockTonConnectUI';
import { toFriendlyAddress } from './utils';
import type { SendTransactionRequestMessage } from './types';

interface TonConnectParameters {
  TonConnectUI: typeof TonConnectUI | typeof MockTonConnectUI;
  onStatusChange?: (wallet?: ConnectedWallet | null) => void;
}

const DEFAULT_TON_CONNECT_PARAMETERS: TonConnectParameters = {
  TonConnectUI: TonConnectUI,
};

export { MockTonConnectUI, TonConnectUI };
export type { ConnectedWallet };

export class TonConnect {
  public tonConnectUI: TonConnectUI | MockTonConnectUI;

  constructor({
    TonConnectUI,
    onStatusChange,
  }: TonConnectParameters = DEFAULT_TON_CONNECT_PARAMETERS) {
    this.tonConnectUI = new TonConnectUI({
      manifestUrl: new URL(
        'tonconnect-manifest.json',
        window.location.href
      ).toString(),
    });

    if (onStatusChange) {
      this.tonConnectUI.onStatusChange(onStatusChange);
    }
  }

  public async connect() {
    if (!this.connected) {
      await this.tonConnectUI.openSingleWalletModal('telegram-wallet');
      // await this.tonConnectUI.openModal();
    }
  }

  public async disconnect() {
    await this.tonConnectUI.disconnect();
  }

  public async sendTransaction(message: SendTransactionRequestMessage) {
    try {
      const result = await this.tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360, // 360 sec
        messages: [message],
      });

      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error; // 抛出错误以便外部处理
    }
  }

  get wallet() {
    return this.tonConnectUI.wallet;
  }

  get connected() {
    return this.tonConnectUI.connected;
  }

  get address() {
    if (!this.wallet) {
      return undefined;
    }

    return toFriendlyAddress(this.wallet.account.address);
  }
}
