'use client';

import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import AccountEmailPanel from '@/components/profile/AccountEmailPanel';
import ProfileForm from '@/components/profile/ProfileForm';
import WalletPanel from '@/components/profile/WalletPanel';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { isProfileMinimumComplete } from '@/utils/validation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AtSign, ExternalLink } from 'lucide-react';
import type { User } from '@/interface/user';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasStartups } = useOnboarding();

  // Onboarding chaining: completing the profile while still startup-less
  // moves straight to step 2 (listing the first startup).
  const handleSave = (updatedUser: User) => {
    if (isProfileMinimumComplete(updatedUser) && hasStartups === false) {
      router.push('/dashboard/startups/new');
    }
  };

  return (
    <AuthGate>
      <DashboardShell
        title="My Profile"
        subtitle="Manage your professional identity and contact information."
        actions={
          user?.username ? (
            <Link
              href={`/${user.username}`}
              className="btn btn-white-dark btn-md inline-flex items-center justify-center gap-2 border-white/10">
              <ExternalLink aria-hidden="true" className="size-4" />
              View public page
            </Link>
          ) : (
            <p className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-white/15 px-5 text-sm font-medium text-white/50">
              <AtSign aria-hidden="true" className="size-4 text-primary-400" />
              Choose a username below to unlock your public page
            </p>
          )
        }>
        <div className="grid max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Account panels: above the form on mobile, right rail on desktop. */}
          <aside className="space-y-4 lg:col-start-3 lg:row-start-1">
            <AccountEmailPanel />
            <WalletPanel />
          </aside>
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1">
            <ProfileForm initialData={user} onSave={handleSave} />
          </div>
        </div>
      </DashboardShell>
    </AuthGate>
  );
}
