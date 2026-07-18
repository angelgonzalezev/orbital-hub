'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Check, Circle } from 'lucide-react';
import { verificationService } from '@/services/verificationService';
import { getVerificationChecklist } from '@/utils/validation';
import type { Startup } from '@/interface/startup';
import type { User } from '@/interface/user';

interface VerificationChecklistModalProps {
  startup: Startup;
  owner: User;
  onClose: () => void;
  // 'created' right after creation, 'updated' after saving edits.
  context?: 'created' | 'updated';
  // When already on the edit page, replaces the "Edit startup" navigation
  // with a "Continue editing" action (usually just closing the modal).
  onEdit?: () => void;
}

// Shown every time a startup is saved: the verification requirements as a
// checklist. Everything green -> request verification on the spot; something
// missing -> jump into (or stay in) the edit form. Closing continues on.
const VerificationChecklistModal: React.FC<VerificationChecklistModalProps> = ({
  startup,
  owner,
  onClose,
  context = 'created',
  onEdit,
}) => {
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checklist = useMemo(() => getVerificationChecklist(startup, owner), [startup, owner]);
  const missing = checklist.filter((check) => !check.passed);
  const ready = missing.length === 0;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isRequesting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRequesting, onClose]);

  const requestVerification = async () => {
    setIsRequesting(true);
    setError(null);
    try {
      await verificationService.requestVerification(startup.id);
      router.push(`/dashboard/startups/${startup.id}/verification`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to request verification.');
      setIsRequesting(false);
    }
  };

  // Portal to <body> so ancestors with transforms cannot trap the fixed
  // overlay inside their own box (same pattern as FeaturedSuccessModal).
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !isRequesting && onClose()}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md space-y-6 rounded-[30px] border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl shadow-primary-500/10">
        <div className="space-y-2 text-center">
          <div
            className={`mx-auto flex size-16 items-center justify-center rounded-full border text-3xl ${
              ready
                ? 'border-green-500/30 bg-green-500/10 text-green-500'
                : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
            }`}>
            {ready ? '✓' : '!'}
          </div>
          <h3 className="text-2xl font-bold text-white">{ready ? 'Ready for verification!' : 'Almost there'}</h3>
          <p className="text-white/60">
            <span className="font-bold text-white">{startup.name}</span>{' '}
            {context === 'created' ? 'was created as a draft.' : 'was saved.'}{' '}
            {ready
              ? 'It meets every requirement — you can request verification now.'
              : 'Complete the remaining requirements to request verification.'}
          </p>
        </div>

        <ul className="space-y-2.5">
          {checklist.map((check) => (
            <li key={check.key} className="flex items-center gap-2.5 text-sm">
              {check.passed ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                  <Check aria-hidden="true" className="size-3 text-green-500" />
                </span>
              ) : (
                <Circle aria-hidden="true" className="size-5 shrink-0 text-yellow-500/70" />
              )}
              <span className={check.passed ? 'text-white/40' : 'text-white/85'}>{check.label}</span>
            </li>
          ))}
        </ul>

        {error && <p className="rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-300">{error}</p>}

        <div className="space-y-2">
          {ready ? (
            <button
              onClick={() => void requestVerification()}
              disabled={isRequesting}
              className="btn btn-primary btn-md w-full shadow-lg shadow-primary-500/20 disabled:cursor-wait disabled:opacity-60">
              {isRequesting ? 'Requesting…' : 'Request verification'}
            </button>
          ) : (
            <button
              onClick={() => (onEdit ? onEdit() : router.push(`/dashboard/startups/${startup.id}/edit`))}
              className="btn btn-primary btn-md w-full shadow-lg shadow-primary-500/20">
              {onEdit ? 'Continue editing' : 'Edit startup'}
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isRequesting}
            className="btn btn-white-dark btn-md w-full disabled:opacity-60">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default VerificationChecklistModal;
