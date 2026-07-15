// Canonical URL of a public profile: /<username> when the person has claimed
// one, falling back to the wallet-based route otherwise.
export const profilePath = (profile: { username?: string; walletAddress: string }): string =>
  profile.username ? `/${profile.username}` : `/u/${profile.walletAddress}`;
