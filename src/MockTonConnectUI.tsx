import { type ConnectedWallet, CHAIN } from '@tonconnect/ui';
import { parseJSON } from './utils';

export class MockTonConnectUI {
  public wallet: ConnectedWallet | null = (parseJSON(
    typeof window !== 'undefined' ? sessionStorage.getItem('mock-tonconnect-wallet') : undefined
  ) ?? null) as ConnectedWallet | null;
  public handleStatusChange:
    | ((wallet: ConnectedWallet | null) => void)
    | undefined;

  public openModal() {
    this.wallet = {
      aboutUrl: 'https://wallet.tg/',
      account: {
        address:
          '0:31d4a6efd24c52b6e957e6fde4e2beb6139062ddad6fce4533e5920891060834',
        chain: CHAIN.MAINNET,
        publicKey: '',
        walletStateInit: '',
      },
      appName: 'telegram-wallet',
      bridgeUrl: 'https://walletbot.me/tonconnect-bridge/bridge',
      deepLink: undefined,
      device: {
        appName: 'telegram-wallet',
        appVersion: '1',
        maxProtocolVersion: 2,
        platform: 'iphone',
        features: [],
      },
      imageUrl: 'https://wallet.tg/images/logo-288.png',
      name: 'Wallet',
      openMethod: 'universal-link',
      platforms: [],
      provider: 'http',
      tondns: undefined,
      universalLink: 'https://t.me/wallet?attach=wallet',
    };

    sessionStorage.setItem(
      'mock-tonconnect-wallet',
      JSON.stringify(this.wallet)
    );

    this.handleStatusChange?.(this.wallet);
  }

  public openSingleWalletModal() {
    this.openModal();
  }

  get connected() {
    return Boolean(this.wallet);
  }

  public disconnect() {
    this.wallet = null;
    sessionStorage.removeItem('mock-tonconnect-wallet');

    this.handleStatusChange?.(null);
  }

  public onStatusChange(callback: (wallet: ConnectedWallet | null) => void) {
    this.handleStatusChange = callback;
  }

  public async sendTransaction(transaction: unknown) {
    if (!transaction) {
      throw new Error('No transaction provided');
    }

    return await Promise.resolve({
      boc: 'te6cckEBBAEAtwAB5YgAY6lN36SYpW3Sr837ycV9bCcgxbta35yKZ8skESIMEGgDm0s7c///+ItJU6gQAAABHMo904iLEVc9gZGBX7SwY+t62CXgbpUCsT32rqEqkYbKNPxawtOIEFJhyNJym68DdqLyolpmE31kRm2uegnFKAkBAgoOw8htAwIDAAAAaEIASBQKww91mpe54qVTU/7RG5n/DzrqZ1VT6XoB7/FfVcMgL68IAAAAAAAAAAAAAAAAAACWoVBb',
    });
  }
}
