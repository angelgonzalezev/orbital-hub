'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSplToken } from '@solana/react-hooks';
import { Startup } from '@/interface/startup';
import {
  FEATURED_LISTING_BASE_UNITS,
  FEATURED_LISTING_SKU,
  PaymentVerificationError,
  paymentService,
  TREASURY_WALLET,
  USDC_MINT,
} from '@/services/paymentService';

export type FeaturedPurchasePhase = 'idle' | 'paying' | 'verifying' | 'done';

export type FeaturedPurchaseSuccess = {
  txSignature: string;
  featuredUntil?: string;
};

// The featured-listing purchase state machine: USDC transfer to the treasury
// signed by the connected wallet, then server-side verification through the
// verify-payment edge function. The signature is persisted before
// verification, so a refresh mid-purchase resumes (from whichever page mounts
// this hook for the startup) instead of charging twice.
export const useFeaturedPurchase = (startup: Startup, onFeatured?: () => Promise<void> | void) => {
  const { send } = useSplToken(USDC_MINT);
  const [phase, setPhase] = useState<FeaturedPurchasePhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<FeaturedPurchaseSuccess | null>(null);
  const resumeAttempted = useRef(false);

  const verify = useCallback(
    async (txSignature: string) => {
      setPhase('verifying');
      setError(null);
      try {
        const result = await paymentService.verifyPayment({
          sku: FEATURED_LISTING_SKU,
          targetId: startup.id,
          txSignature,
        });
        paymentService.clearPendingSignature(FEATURED_LISTING_SKU, startup.id);
        setPhase('done');
        setSuccess({ txSignature, featuredUntil: result.featuredUntil ?? undefined });
        await onFeatured?.();
      } catch (verifyError) {
        if (verifyError instanceof PaymentVerificationError && !verifyError.retriable) {
          paymentService.clearPendingSignature(FEATURED_LISTING_SKU, startup.id);
        }
        setPhase('idle');
        setError(verifyError instanceof Error ? verifyError.message : 'Payment verification failed.');
      }
    },
    [onFeatured, startup.id],
  );

  // Resume a purchase whose verification never completed (refresh, lost
  // connection): the transfer already happened, only the verify call is redone.
  useEffect(() => {
    if (resumeAttempted.current) return;
    resumeAttempted.current = true;
    const pending = paymentService.readPendingSignature(FEATURED_LISTING_SKU, startup.id);
    if (pending) void verify(pending);
  }, [startup.id, verify]);

  const buy = async () => {
    setError(null);
    setPhase('paying');
    try {
      const signature = await send(
        { amount: FEATURED_LISTING_BASE_UNITS, amountInBaseUnits: true, destinationOwner: TREASURY_WALLET },
        { commitment: 'confirmed' },
      );
      paymentService.savePendingSignature(FEATURED_LISTING_SKU, startup.id, String(signature));
      await verify(String(signature));
    } catch (sendError) {
      setPhase('idle');
      setError(sendError instanceof Error ? sendError.message : 'The payment was not sent.');
    }
  };

  return {
    phase,
    error,
    success,
    buy,
    dismissSuccess: () => setSuccess(null),
    busy: phase === 'paying' || phase === 'verifying',
    // The purchase is only offered for listings that are actually live.
    available:
      Boolean(TREASURY_WALLET) && startup.listingStatus === 'published' && startup.verificationStatus === 'verified',
  };
};
