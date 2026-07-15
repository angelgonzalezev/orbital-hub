'use client';

import React, { use, useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { startupService } from '@/services/startupService';
import { User } from '@/interface/user';
import { Startup } from '@/interface/startup';
import PublicProfileView from '@/components/profile/PublicProfileView';
import { USERNAME_PATTERN } from '@/utils/validation';

// Root-level vanity URLs (orbitalhub.dev/<username>). Static routes such as
// /startups or /dashboard always win over this dynamic segment, and the
// username rules reserve those names so the collision can never happen.
export default function UsernameProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<User | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const normalized = decodeURIComponent(username ?? '').toLowerCase();
    if (!USERNAME_PATTERN.test(normalized)) {
      setProfile(null);
      setStartups([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const user = await userService.getPublicProfileByUsername(normalized);
        const involved = user ? await startupService.listPublicStartupsByWallet(user.walletAddress) : [];
        if (!cancelled) {
          setProfile(user);
          setStartups(involved);
        }
      } catch (error) {
        console.error('Error loading public profile:', error);
        if (!cancelled) {
          setProfile(null);
          setStartups([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return <PublicProfileView profile={profile} startups={startups} isLoading={isLoading} />;
}
