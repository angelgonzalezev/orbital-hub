'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { useFundWallet, useWallets } from '@privy-io/react-auth/solana';
import { useAuth } from '@/context/AuthContext';
import { isPrivyStandardWallet } from '@/lib/privy/config';
import { getSolBalanceLamports, getUsdcBalanceBaseUnits } from '@/lib/solana/usdcTransfer';
import { FEATURED_LISTING_PRICE_USDC, USDC_MINT } from '@/services/paymentService';

type WalletBalances = {
  sol: number;
  usdc: number;
};

const truncateAddress = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;

const formatSol = (sol: number) => (sol === 0 ? '0' : sol.toLocaleString(undefined, { maximumFractionDigits: 4 }));
const formatUsdc = (usdc: number) => usdc.toLocaleString(undefined, { maximumFractionDigits: 2 });

// The profile's wallet overview: every wallet on the Privy session with its
// SOL and USDC balances, plus Privy's funding flow (card onramp, exchange or
// wallet transfer) so web2 users can top up without leaving the app. Sized
// for the profile page's side rail.
const WalletPanel = () => {
  const { walletAddress } = useAuth();
  const { ready, wallets } = useWallets();
  const { fundWallet } = useFundWallet();
  const [balances, setBalances] = useState<Record<string, WalletBalances>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [fundError, setFundError] = useState<string | null>(null);

  const openFunding = (address: string) => {
    setFundError(null);
    fundWallet({
      address,
      options: { amount: String(FEATURED_LISTING_PRICE_USDC), asset: 'USDC' },
    }).catch((error) => {
      setFundError(
        /not enabled/i.test(String(error?.message))
          ? 'Funding is not enabled for this app yet — enable funding methods in the Privy dashboard.'
          : error instanceof Error
            ? error.message
            : 'Unable to open the funding flow.',
      );
    });
  };

  const refreshBalances = useCallback(async () => {
    if (wallets.length === 0) return;
    setIsLoading(true);
    try {
      const entries = await Promise.all(
        wallets.map(async (wallet) => {
          const [lamports, usdcBase] = await Promise.all([
            getSolBalanceLamports(wallet.address).catch(() => BigInt(0)),
            getUsdcBalanceBaseUnits(wallet.address, USDC_MINT).catch(() => BigInt(0)),
          ]);
          return [wallet.address, { sol: Number(lamports) / 1e9, usdc: Number(usdcBase) / 1e6 }] as const;
        }),
      );
      setBalances(Object.fromEntries(entries));
    } finally {
      setIsLoading(false);
    }
  }, [wallets]);

  useEffect(() => {
    void refreshBalances();
  }, [refreshBalances]);

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address).catch(() => undefined);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress((current) => (current === address ? null : current)), 1500);
  };

  if (!ready || wallets.length === 0) return null;

  return (
    <div className="space-y-3 rounded-3xl border border-white/5 bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Wallet</h3>
          <p className="text-xs text-white/50">Featured listings are paid in USDC.</p>
        </div>
        <button
          type="button"
          aria-label="Refresh balances"
          onClick={() => void refreshBalances()}
          disabled={isLoading}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-wait disabled:opacity-50">
          <RefreshCw aria-hidden="true" className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2.5">
        {wallets.map((wallet) => {
          const isEmbedded = isPrivyStandardWallet(wallet.standardWallet);
          const isIdentity = wallet.address === walletAddress;
          const balance = balances[wallet.address];

          return (
            <div key={wallet.address} className="space-y-2.5 rounded-2xl border border-white/10 bg-black p-3.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs text-white">{truncateAddress(wallet.address)}</span>
                <button
                  type="button"
                  aria-label="Copy wallet address"
                  onClick={() => void copyAddress(wallet.address)}
                  className="cursor-pointer text-white/40 transition hover:text-white">
                  {copiedAddress === wallet.address ? (
                    <Check aria-hidden="true" className="size-3 text-green-500" />
                  ) : (
                    <Copy aria-hidden="true" className="size-3" />
                  )}
                </button>
                <span
                  className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    isEmbedded
                      ? 'border-primary-500/20 bg-primary-500/10 text-primary-400'
                      : 'border-white/10 bg-white/5 text-white/50'
                  }`}>
                  {isEmbedded ? 'App wallet' : 'External'}
                </span>
                {isIdentity && (
                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-500">
                    Profile
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-3 text-xs">
                  <span className="text-white/80">
                    <span className="font-bold">{balance ? formatUsdc(balance.usdc) : '—'}</span>{' '}
                    <span className="text-white/40">USDC</span>
                  </span>
                  <span className="text-white/80">
                    <span className="font-bold">{balance ? formatSol(balance.sol) : '—'}</span>{' '}
                    <span className="text-white/40">SOL</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openFunding(wallet.address)}
                  className="btn btn-white-dark btn-sm shrink-0 hover:btn-primary">
                  Add funds
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {fundError && <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{fundError}</p>}
    </div>
  );
};

export default WalletPanel;
