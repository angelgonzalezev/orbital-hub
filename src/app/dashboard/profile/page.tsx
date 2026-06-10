'use client';

import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import ProfileForm from '@/components/profile/ProfileForm';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AuthGate>
      <DashboardShell
        title="My Profile"
        subtitle="Manage your professional identity and contact information."
      >
        <div className="max-w-4xl">
          <ProfileForm initialData={user} />
        </div>
      </DashboardShell>
    </AuthGate>
  );
}
