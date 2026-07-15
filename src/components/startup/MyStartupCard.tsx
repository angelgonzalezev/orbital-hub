'use client';

import React from 'react';
import { Startup } from '@/interface/startup';
import { VerificationStatusBadge, ListingStatusBadge, StartupStageBadge, FeaturedBadge } from '../shared/Badges';
import { isCurrentlyFeatured } from '@/utils/featured';
import { useAuth } from '@/context/AuthContext';
import { useFeaturedPurchase } from '@/hooks/useFeaturedPurchase';
import FeaturedSuccessModal from './FeaturedSuccessModal';
import { FEATURED_LISTING_PRICE_USDC } from '@/services/paymentService';
import Link from 'next/link';
import Image from 'next/image';
import { resolveMediaUrl } from '@/services/mediaService';

interface MyStartupCardProps {
  startup: Startup;
  onArchive?: (id: string) => void;
  onFeatured?: () => Promise<void> | void;
}

const MyStartupCard: React.FC<MyStartupCardProps> = ({ startup, onArchive, onFeatured }) => {
  const logoUrl = resolveMediaUrl(startup.logo);
  const { isWalletConnected } = useAuth();
  const { phase, error, success, buy, dismissSuccess, busy, available } = useFeaturedPurchase(startup, onFeatured);
  const featured = isCurrentlyFeatured(startup);

  const featureLabel =
    phase === 'paying'
      ? 'Waiting for wallet…'
      : phase === 'verifying'
        ? 'Confirming…'
        : featured
          ? 'Extend featured'
          : `★ Feature — $${FEATURED_LISTING_PRICE_USDC}`;

  return (
    <article className="flex flex-col items-center gap-5 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 transition-colors hover:border-white/10 sm:flex-row sm:items-start sm:p-6 lg:items-center">
      <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-black sm:size-24">
        {logoUrl ? (
          <Image src={logoUrl} alt={startup.name} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-2xl">
            {startup.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="w-full min-w-0 flex-grow space-y-3 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <h3 className="break-words text-xl font-bold text-white">{startup.name}</h3>
          <StartupStageBadge stage={startup.stage} />
        </div>
        <p className="line-clamp-2 text-white/60">{startup.oneLiner}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:justify-start">
          <VerificationStatusBadge status={startup.verificationStatus} />
          <ListingStatusBadge status={startup.listingStatus} />
          {featured && <FeaturedBadge />}
        </div>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      </div>

      <div className="flex w-full flex-col gap-2 border-t border-white/10 pt-5 sm:w-auto sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        {available && (
          <button
            onClick={buy}
            disabled={busy || !isWalletConnected}
            className="btn btn-sm w-full border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 disabled:opacity-50">
            {featureLabel}
          </button>
        )}
        <Link href={`/startups/${startup.id}`} className="btn btn-white-dark btn-sm w-full hover:btn-primary">
          View
        </Link>
        <Link
          href={`/dashboard/startups/${startup.id}/edit`}
          className="btn btn-white-dark btn-sm w-full hover:btn-primary">
          Edit
        </Link>
        <Link
          href={`/dashboard/startups/${startup.id}/verification`}
          className="btn btn-white-dark btn-sm w-full hover:btn-primary">
          Verification
        </Link>
        {startup.listingStatus !== 'archived' && (
          <button
            onClick={() => onArchive && onArchive(startup.id)}
            className="btn btn-white-dark btn-sm w-full border-red-500/10 text-red-500/60 hover:btn-red hover:text-red-500">
            Archive
          </button>
        )}
      </div>

      {success && (
        <FeaturedSuccessModal
          startupName={startup.name}
          txSignature={success.txSignature}
          featuredUntil={success.featuredUntil ?? startup.featuredUntil}
          onClose={dismissSuccess}
        />
      )}
    </article>
  );
};

export default MyStartupCard;
