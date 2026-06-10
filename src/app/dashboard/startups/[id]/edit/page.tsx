'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { Startup } from '@/interface/startup';
import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import StartupForm from '@/components/startup/StartupForm';
import { LoadingState, ErrorState } from '@/components/shared/States';
import { useRouter } from 'next/navigation';

export default function EditStartupPage({ params }: { params: { id: string } }) {
  const { walletAddress } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (walletAddress && params.id) {
      loadStartup();
    }
  }, [walletAddress, params.id]);

  const loadStartup = async () => {
    setIsLoading(true);
    try {
      const data = await startupService.getStartupById(params.id);
      if (data && data.ownerWallet === walletAddress) {
        setStartup(data);
      }
    } catch (error) {
      console.error('Error loading startup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    router.push('/dashboard/startups');
  };

  return (
    <AuthGate>
      <DashboardShell
        title="Edit Startup"
        subtitle={startup ? `Updating ${startup.name}` : 'Manage project details.'}
      >
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
