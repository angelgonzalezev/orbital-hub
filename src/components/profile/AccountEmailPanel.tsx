'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useLinkAccount, usePrivy } from '@privy-io/react-auth';
import { refreshBridgeSession } from '@/lib/auth/tokenBridge';

const userCancelled = (error: unknown) => /exited|cancel|closed|abandoned/i.test(String(error));

// Email on the account: email/Google users bring one, wallet users can link
// one through Privy's OTP flow. A linked email doubles as a sign-in method
// and is mirrored server-side (user_emails) for platform notifications.
const AccountEmailPanel = () => {
  const { ready, user: privyUser } = usePrivy();
  const [error, setError] = useState<string | null>(null);

  const { linkEmail } = useLinkAccount({
    onSuccess: () => {
      setError(null);
      // Mirror the new email into the database right away.
      void refreshBridgeSession();
    },
    onError: (linkError) => {
      if (!userCancelled(linkError)) setError('Could not link the email. Please try again.');
    },
  });

  if (!ready || !privyUser) return null;

  const email = privyUser.email?.address ?? privyUser.google?.email ?? null;

  return (
    <div className="space-y-4 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="text-xl font-bold text-white">Email</h3>
          <p className="text-sm text-white/50">Used to sign in and for platform notifications.</p>
        </div>

        {email ? (
          <p className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-black px-3.5 py-2 text-sm text-white/80">
            <Mail aria-hidden="true" className="size-3.5 shrink-0 text-primary-400" />
            <span className="min-w-0 truncate">{email}</span>
          </p>
        ) : (
          <button type="button" onClick={linkEmail} className="btn btn-white-dark btn-sm hover:btn-primary sm:w-auto">
            Link an email
          </button>
        )}
      </div>

      {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    </div>
  );
};

export default AccountEmailPanel;
