'use client';

import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { useMemo, type ReactNode } from 'react';
import { getBrowserRpcEndpoint, isPrivyConfigured, toWssEndpoint } from '@/lib/privy/config';

// A dedicated provider when configured, Privy's own proxied RPC otherwise -
// the public endpoint 403s browser calls.
const ENDPOINT = getBrowserRpcEndpoint();

const buildPrivyClientConfig = (): PrivyClientConfig => ({
  appearance: {
    accentColor: '#9945FF',
    landingHeader: 'Sign in to Orbital',
    showWalletLoginFirst: false,
    theme: 'dark',
    walletChainType: 'solana-only',
  },
  embeddedWallets: {
    ethereum: { createOnLogin: 'off' },
    // Silent signing: SIWS for the Supabase session and the USDC transfer run
    // without Privy confirmation modals - the app owns that UI.
    showWalletUIs: false,
    solana: { createOnLogin: 'users-without-wallets' },
  },
  externalWallets: {
    solana: { connectors: toSolanaWalletConnectors() },
  },
  loginMethods: ['email', 'google', 'wallet'],
  solana: {
    rpcs: {
      'solana:mainnet': {
        rpc: createSolanaRpc(ENDPOINT),
        rpcSubscriptions: createSolanaRpcSubscriptions(toWssEndpoint(ENDPOINT)),
      },
    },
  },
});

const ConfiguredPrivyProvider = ({ children }: { children: ReactNode }) => {
  const config = useMemo(buildPrivyClientConfig, []);
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || undefined}
      config={config}>
      {children}
    </PrivyProvider>
  );
};

// Without an app id the tree renders Privy-less and the auth context degrades
// to a disabled state, mirroring how the app behaves without Supabase env.
export const PrivyProviderWrapper = ({ children }: { children: ReactNode }) =>
  isPrivyConfigured() ? <ConfiguredPrivyProvider>{children}</ConfiguredPrivyProvider> : <>{children}</>;
