export type StartupStage = 'Idea' | 'MVP' | 'Early-stage' | 'Scaling' | 'Established';

export type AcquisitionStatus = 'not_open' | 'open_to_discuss';

export type VerificationStatus = 'draft' | 'pending' | 'verified' | 'rejected';

export type ListingStatus = 'draft' | 'published' | 'archived';

export type VerificationCheckStatus = 'not_started' | 'pending' | 'verified' | 'failed';

export interface TeamMember {
  avatar?: string;
  displayName?: string;
  jobTitle?: string;
  username?: string;
  walletAddress: string;
  role: string;
}

export interface Startup {
  id: string;
  ownerWallet: string;
  name: string;
  logo: string;
  oneLiner: string;
  description: string;
  website: string;
  twitter: string;
  discord?: string;
  github?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  stage: StartupStage;
  isRaising: boolean;
  acquisitionStatus: AcquisitionStatus;
  mrr?: number;
  showMrr: boolean;
  teamSize: number;
  techStack: string[];
  category: string[];
  team: TeamMember[];
  verificationStatus: VerificationStatus;
  listingStatus: ListingStatus;
  featuredUntil?: string;
  domainVerificationStatus: VerificationCheckStatus;
  xVerificationStatus: VerificationCheckStatus;
  verificationRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
