import { User } from '@/interface/user';
import { Startup } from '@/interface/startup';

export type ValidationError = {
  field: string;
  message: string;
};

// --- Profile Validation ---

// Kept in sync with the profiles_username_format / profiles_username_reserved
// constraints in the 20260715150000_profile_usernames.sql migration.
export const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
export const RESERVED_USERNAMES = [
  'api',
  'dashboard',
  'startups',
  'startup',
  'u',
  'admin',
  'auth',
  'login',
  'logout',
  'signup',
  'profile',
  'profiles',
  'settings',
  'docs',
  'blog',
  'about',
  'terms',
  'privacy',
  'support',
  'help',
  'orbital',
  'marketplace',
  'home',
  '404',
  '500',
];

export const validateProfile = (user: Partial<User>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (user.username && user.username.length > 0) {
    if (!USERNAME_PATTERN.test(user.username)) {
      errors.push({
        field: 'username',
        message: 'Username must be 3-30 characters: lowercase letters, numbers, and underscores only.',
      });
    } else if (RESERVED_USERNAMES.includes(user.username)) {
      errors.push({
        field: 'username',
        message: 'This username is reserved. Please pick another one.',
      });
    }
  }

  if (!user.displayName || user.displayName.length < 2 || user.displayName.length > 80) {
    errors.push({
      field: 'displayName',
      message: 'Display name must be between 2 and 80 characters.',
    });
  }

  if (!user.jobTitle || user.jobTitle.length < 2 || user.jobTitle.length > 80) {
    errors.push({
      field: 'jobTitle',
      message: 'Job title must be between 2 and 80 characters.',
    });
  }

  // Basic URL/handle validation for social
  if (user.twitterHandle && user.twitterHandle.length > 0) {
    // Simple check, can be expanded
    if (user.twitterHandle.includes(' ')) {
      errors.push({
        field: 'twitterHandle',
        message: 'Twitter handle cannot contain spaces.',
      });
    }
  }

  if (user.telegramHandle && user.telegramHandle.length > 0) {
    if (user.telegramHandle.includes(' ')) {
      errors.push({
        field: 'telegramHandle',
        message: 'Telegram handle cannot contain spaces.',
      });
    }
  }

  return errors;
};

export const isProfileMinimumComplete = (user: User): boolean => {
  return (
    user.displayName.length >= 2 &&
    user.displayName.length <= 80 &&
    user.jobTitle.length >= 2 &&
    user.jobTitle.length <= 80
  );
};

export const isProfileRecommendedComplete = (user: User): boolean => {
  return (
    isProfileMinimumComplete(user) && !!user.bio && !!user.avatar && (!!user.twitterHandle || !!user.telegramHandle)
  );
};

// --- Startup Validation ---

export const validateStartup = (startup: Partial<Startup>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!startup.name || startup.name.length < 2 || startup.name.length > 80) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 80 characters.' });
  }

  if (!startup.oneLiner || startup.oneLiner.length > 160) {
    errors.push({
      field: 'oneLiner',
      message: 'One-liner is required and must be max 160 characters.',
    });
  }

  if (!startup.city || !startup.country) {
    errors.push({ field: 'location', message: 'Location is required. Pick a city from the suggestions.' });
  }

  // Drafts may contain a short description. Verification applies the minimum length.
  if (startup.description && startup.description.length > 2000) {
    errors.push({
      field: 'description',
      message: 'Description must be no longer than 2000 characters.',
    });
  }

  if (startup.website) {
    try {
      new URL(startup.website);
    } catch {
      errors.push({ field: 'website', message: 'Must be a valid URL.' });
    }
  }

  if (startup.twitter) {
    // Simple validation for X URL or handle
    if (
      !startup.twitter.includes('x.com') &&
      !startup.twitter.includes('twitter.com') &&
      startup.twitter.startsWith('http')
    ) {
      errors.push({ field: 'twitter', message: 'Must be a valid X/Twitter URL.' });
    }
  }

  if (startup.mrr !== undefined && startup.mrr < 0) {
    errors.push({ field: 'mrr', message: 'MRR cannot be negative.' });
  }

  if (startup.teamSize !== undefined && startup.teamSize < 1) {
    errors.push({ field: 'teamSize', message: 'Team size must be at least 1.' });
  }

  if (startup.category && startup.category.length > 5) {
    errors.push({ field: 'category', message: 'Select no more than 5 categories.' });
  }

  if (startup.techStack && startup.techStack.length > 10) {
    errors.push({ field: 'techStack', message: 'Select no more than 10 technologies.' });
  }

  return errors;
};

export const canSaveStartupDraft = (startup: Partial<Startup>): boolean => {
  return !!startup.name && !!startup.oneLiner && !!startup.stage;
};

export type VerificationCheck = {
  key: string;
  label: string;
  passed: boolean;
};

// The individual requirements behind "can this startup request verification",
// in user-facing form - drives the post-creation checklist modal.
export const getVerificationChecklist = (startup: Startup, owner: User): VerificationCheck[] => [
  {
    key: 'profile',
    label: 'Complete your profile (display name and job title)',
    passed: isProfileMinimumComplete(owner),
  },
  {
    key: 'description',
    label: 'Description of at least 200 characters',
    passed: !!startup.description && startup.description.length >= 200,
  },
  { key: 'website', label: 'Website URL', passed: !!startup.website },
  { key: 'twitter', label: 'X (Twitter) profile', passed: !!startup.twitter },
  { key: 'category', label: 'At least one category', passed: !!startup.category && startup.category.length >= 1 },
  { key: 'teamSize', label: 'Team size of at least 1', passed: !!startup.teamSize && startup.teamSize >= 1 },
  { key: 'fields', label: 'All fields within limits', passed: validateStartup(startup).length === 0 },
];

export const canRequestVerification = (startup: Startup, owner: User): boolean =>
  getVerificationChecklist(startup, owner).every((check) => check.passed);

export const canPublishStartup = (startup: Startup): boolean => {
  return startup.verificationStatus === 'verified' && !!startup.name && !!startup.oneLiner;
};

export const shouldResetVerification = (previous: Startup, next: Partial<Startup>): boolean => {
  if (previous.verificationStatus !== 'verified') return false;

  // Changing website or twitter resets verification
  if (next.website && next.website !== previous.website) return true;
  if (next.twitter && next.twitter !== previous.twitter) return true;

  return false;
};
