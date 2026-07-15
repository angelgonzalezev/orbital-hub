'use client';

import { autoDiscover, createClient, watchWalletStandardConnectors } from '@solana/client';
import { SolanaProvider as ReactSolanaProvider } from '@solana/react-hooks';
import { useEffect, useState, type ReactNode } from 'react';

const DEFAULT_RPC_URL = 'https://api.mainnet-beta.solana.com';
const ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_URL;

let initialClient: ReturnType<typeof createClient> | undefined;

const getInitialClient = () => {
  initialClient ??= createClient({
    endpoint: ENDPOINT,
    walletConnectors: autoDiscover(),
  });
  return initialClient;
};

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState(getInitialClient);

  useEffect(() => {
    // In-app wallet browsers often inject their provider after hydration;
    // the client's connector registry is frozen at creation, so recreate it
    // when a new Wallet Standard wallet registers.
    const stop = watchWalletStandardConnectors((connectors) => {
      setClient((current) => {
        const knownIds = new Set(current.connectors.all.map((connector) => connector.id));
        if (!connectors.some((connector) => !knownIds.has(connector.id))) return current;

        const { status } = current.store.getState().wallet;
        if (status === 'connected' || status === 'connecting') return current;

        if (current === initialClient) initialClient = undefined;
        current.destroy();
        return createClient({ endpoint: ENDPOINT, walletConnectors: connectors });
      });
    });
    return stop;
  }, []);

  return <ReactSolanaProvider client={client}>{children}</ReactSolanaProvider>;
};
