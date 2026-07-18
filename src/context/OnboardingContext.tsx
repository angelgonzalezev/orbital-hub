'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { isProfileMinimumComplete } from '@/utils/validation';

// Shared onboarding signals: whether the signed-in user finished the two
// setup steps (complete profile, first startup). Drives the global nudge and
// the profile -> first-startup chaining; everything is derived, nothing is
// persisted server-side.
interface OnboardingContextType {
  // null while unknown (loading or signed out) - the nudge only shows on an
  // explicit false.
  hasStartups: boolean | null;
  profileComplete: boolean;
  refreshOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType>({
  hasStartups: null,
  profileComplete: false,
  refreshOnboarding: async () => undefined,
});

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, walletAddress } = useAuth();
  const [hasStartups, setHasStartups] = useState<boolean | null>(null);

  const profileComplete = user ? isProfileMinimumComplete(user) : false;

  const refreshOnboarding = useCallback(async () => {
    if (!walletAddress) {
      setHasStartups(null);
      return;
    }
    try {
      setHasStartups((await startupService.countStartupsByOwner()) > 0);
    } catch {
      // Unknown beats a wrong nudge.
      setHasStartups(null);
    }
  }, [walletAddress]);

  // On page load the session bridge may still be arming (server-hydrated
  // profiles have no token yet), so the count can be unknown at first - retry
  // a few times before giving up for this page view.
  useEffect(() => {
    if (!walletAddress) {
      setHasStartups(null);
      return undefined;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const attempt = async (remaining: number) => {
      try {
        const count = await startupService.countStartupsByOwner();
        if (!cancelled) setHasStartups(count > 0);
      } catch {
        if (cancelled) return;
        setHasStartups(null);
        if (remaining > 0) timer = setTimeout(() => void attempt(remaining - 1), 2000);
      }
    };

    void attempt(3);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [walletAddress]);

  return (
    <OnboardingContext.Provider value={{ hasStartups, profileComplete, refreshOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
