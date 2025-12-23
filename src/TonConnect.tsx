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
  public tonConnectUI: TonConnectUI | MockTonConnectUI | null = null;
  private TonConnectUIClass: typeof TonConnectUI | typeof MockTonConnectUI;
  private onStatusChangeCallback?: (wallet?: ConnectedWallet | null) => void;
  private initialized = false;

  constructor({
    TonConnectUI,
    onStatusChange,
  }: TonConnectParameters = DEFAULT_TON_CONNECT_PARAMETERS) {
    this.TonConnectUIClass = TonConnectUI;
    this.onStatusChangeCallback = onStatusChange;
    
    // 只在浏览器环境中初始化
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.initialized || this.tonConnectUI !== null) {
      return;
    }

    this.tonConnectUI = new this.TonConnectUIClass({
      manifestUrl: new URL(
        'tonconnect-manifest.json',
        window.location.href
      ).toString() ,
    });

    if (this.onStatusChangeCallback) {
      this.tonConnectUI.onStatusChange(this.onStatusChangeCallback);
    }

    this.initialized = true;
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') {
      throw new Error(
        'TonConnect can only be used in browser environment. localStorage is required.'
      );
    }
    if (!this.initialized) {
      this.initialize();
    }
  }

  public async connect() {
    this.ensureInitialized();
    if (!this.connected) {
      await this.tonConnectUI!.openSingleWalletModal('telegram-wallet');
      // await this.tonConnectUI.openModal();
    }
  }

  public async disconnect() {
    this.ensureInitialized();
    await this.tonConnectUI!.disconnect();
  }

  public async sendTransaction(message: SendTransactionRequestMessage) {
    this.ensureInitialized();
    try {
      const result = await this.tonConnectUI!.sendTransaction({
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
    if (typeof window !== 'undefined' && !this.initialized) {
      this.initialize();
    }
    if (!this.tonConnectUI) {
      return null;
    }
    return this.tonConnectUI.wallet;
  }

  get connected() {
    if (typeof window !== 'undefined' && !this.initialized) {
      this.initialize();
    }
    if (!this.tonConnectUI) {
      return false;
    }
    return this.tonConnectUI.connected;
  }

  get address() {
    if (!this.wallet) {
      return undefined;
    }

    return toFriendlyAddress(this.wallet.account.address);
  }
}
