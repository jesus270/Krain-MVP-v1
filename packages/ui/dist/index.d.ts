import { usePrivy } from '@privy-io/react-auth';
import { SessionUser } from '@krain/session';
import * as react_jsx_runtime from 'react/jsx-runtime';

type PrivyHookReturn = ReturnType<typeof usePrivy>;
type PrivyUser = PrivyHookReturn["user"];
interface UsePrivyAuthOptions {
    maxRetries?: number;
    retryDelay?: number;
}
interface UsePrivyAuthReturn {
    user: SessionUser | null;
    privyUser: PrivyUser | null;
    authenticated: boolean;
    ready: boolean;
    isLoading: boolean;
    error: string | null;
    sessionValidated: boolean;
    login: () => void;
    logout: () => Promise<void>;
    validateSession: () => Promise<void>;
    linkEmail: () => Promise<any>;
    connectWallet: (options?: any) => Promise<void>;
    unlinkEmail: (email: string) => Promise<PrivyUser>;
    unlinkWallet: (address: string) => Promise<PrivyUser>;
    linkTwitter: () => Promise<void>;
    unlinkTwitter: (accountId: string) => Promise<PrivyUser>;
    exportWallet: () => Promise<void>;
    linkGoogle: () => Promise<void>;
    unlinkGoogle: (accountId: string) => Promise<PrivyUser>;
    linkDiscord: () => Promise<void>;
    unlinkDiscord: (accountId: string) => Promise<PrivyUser>;
    linkGithub: () => Promise<void>;
    unlinkGithub: (accountId: string) => Promise<PrivyUser>;
    linkApple: () => Promise<void>;
    unlinkApple: (accountId: string) => Promise<PrivyUser>;
}
/**
 * Hook for handling Privy authentication and syncing with our database
 * Use this in your app's authentication flow
 */
declare function usePrivyAuth({ maxRetries, retryDelay, }?: UsePrivyAuthOptions): UsePrivyAuthReturn;

interface CoinbaseWalletButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}
declare function CoinbaseWalletButton({ onSuccess, onError, }: CoinbaseWalletButtonProps): react_jsx_runtime.JSX.Element;

interface BlockedPageProps {
    title?: string;
    message?: string;
    className?: string;
}
declare function BlockedPage({ title, message, className, }: BlockedPageProps): react_jsx_runtime.JSX.Element;

export { BlockedPage, CoinbaseWalletButton, usePrivyAuth };
