import * as react_jsx_runtime from 'react/jsx-runtime';

type Token = {
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
    sendTransaction: ({ token, destination, amount, }: {
        token: Token;
        destination: string;
        amount: string;
    }) => Promise<string>;
}
declare const TonWalletKitProvider: ({ mock, children, }: {
    mock: boolean;
    children: React.ReactNode;
}) => react_jsx_runtime.JSX.Element;
declare const useTonWalletKit: () => TonWalletKitContextType;

export { type Token, TonWalletKitProvider, useTonWalletKit };
