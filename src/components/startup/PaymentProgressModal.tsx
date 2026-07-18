'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FeaturedPurchasePhase } from '@/hooks/useFeaturedPurchase';

interface PaymentProgressModalProps {
  phase: FeaturedPurchasePhase;
  error: string | null;
  startupName: string;
  onDismissError: () => void;
}

// Overlay for the featured-listing payment: a spinner while the wallet
// approval and on-chain confirmation run, the error with a clear way out when
// something fails. Success is handled by FeaturedSuccessModal; while the
// payment is in flight the modal cannot be dismissed (closing mid-payment
// would only hide, not cancel, an on-chain transfer).
const PaymentProgressModal: React.FC<PaymentProgressModalProps> = ({ phase, error, startupName, onDismissError }) => {
  const busy = phase === 'paying' || phase === 'verifying';
  const open = busy || Boolean(error);

  useEffect(() => {
    if (!open || busy) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismissError();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, onDismissError, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !busy && onDismissError()}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md space-y-6 rounded-[30px] border border-white/10 bg-[#0A0A0A] p-8 text-center shadow-2xl shadow-primary-500/10">
        {busy ? (
          <>
            <div className="mx-auto size-14 animate-spin rounded-full border-b-2 border-t-2 border-amber-400" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {phase === 'paying' ? 'Waiting for your wallet…' : 'Confirming payment…'}
              </h3>
              <p className="text-white/60">
                {phase === 'paying'
                  ? `Approve the USDC transfer in your wallet to feature ${startupName}.`
                  : 'The transfer is on chain — verifying it and activating your featured listing.'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-2xl text-red-400">
              !
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Payment not completed</h3>
              <p className="text-white/70">{error}</p>
            </div>
            <button onClick={onDismissError} className="btn btn-white-dark btn-md w-full">
              Close
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default PaymentProgressModal;
