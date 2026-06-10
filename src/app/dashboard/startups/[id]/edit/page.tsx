'use client';

import React, { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { Startup } from '@/interface/startup';
import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import StartupForm from '@/components/startup/StartupForm';
import { LoadingState, ErrorState } from '@/components/shared/States';
import { useRouter } from 'next/navigation';

export default function EditStartupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { walletAddress } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!walletAddress || !id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await startupService.getStartupById(id);
        if (!cancelled && data && data.ownerWallet === walletAddress) {
          setStartup(data);
        }
      } catch (error) {
        console.error('Error loading startup:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [walletAddress, id]);

  const handleSave = () => {
    router.push('/dashboard/startups');
  };

  return (
    <AuthGate>
      <DashboardShell title="Edit Startup" subtitle={startup ? `Updating ${startup.name}` : 'Manage project details.'}>
        {isLoading ? (
          <LoadingState />
        ) : !startup ? (
          <ErrorState message="Startup not found or you don't have permission to edit it." />
        ) : (
          <div className="max-w-4xl">
            <StartupForm initialData={startup} isEditing onSave={handleSave} />
          </div>
        )}
      </DashboardShell>
    </AuthGate>
  );
}
